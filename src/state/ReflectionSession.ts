import type { LanguageModelSession } from '../global';
import type { Entry } from '../types';
import type { Reflection } from '../types';
import type { PersonaId } from '../types';
import { DEFAULT_PERSONA_ID, getPersona } from '../data/personas';
import ReflectionIDB from './ReflectionIDB';
import { ReflectionSummarizer } from '../tools/ReflectionSummarizer';

class ReflectionSession {
  private session: LanguageModelSession | null = null;
  private responseSchema: any = {
    title: 'string',
    acknowledgement: 'string',
    question: 'string',
  };
  reflection: Reflection | null = null;
  private promptState: 'idle' | 'processing' = 'idle';
  private subscribers: ((reflection: Reflection, promptState: 'idle' | 'processing') => void)[] =
    [];
  summarizing: boolean = false;
  sessionId: string = crypto.randomUUID().slice(0, 8);

  sessionInitialized: Promise<void>;
  static createInitialPrompts(
    reflection: Reflection,
  ): { role: 'system' | 'user' | 'assistant'; content: string }[] {
    const history = reflection.entries.map(
      (entry: Entry) =>
        ({
          role: entry.type === 'user' ? 'user' : 'assistant',
          content: entry.text,
        }) as { role: 'user' | 'assistant'; content: string },
    );
    const persona = getPersona(reflection.personaId);
    return [
      {
        role: 'system',
        content:
          `[Persona: ${persona.name}] ${persona.systemPreamble} \n` +
          "Provide a concise title for the reflection based on the user's input once. ",
      },
      ...history,
    ];
  }

  constructor(reflectionId: string | null) {
    this.sessionInitialized = new Promise((resolve) => {
      (async () => {
        const reflection = await ReflectionIDB.getReflection(reflectionId);
        // Ensure a persona is always set
        if (!reflection.personaId) {
          reflection.personaId = DEFAULT_PERSONA_ID;
          // await ReflectionIDB.setReflection(reflection.id, reflection);
        }
        this.reflection = reflection;
        const initialPrompts = ReflectionSession.createInitialPrompts(reflection);
        this.session = await window.LanguageModel.create({
          initialPrompts: initialPrompts,
        });
        resolve();
      })();
    });
  }

  destroy() {
    if (this.session) {
      this.session.destroy();
      this.subscribers = [];
    }
  }

  async summarize() {
    if (!this.session) {
      throw new Error('Session not initialized');
    }
    if (this.promptState === 'processing') {
      throw new Error('Prompt is already processing');
    }
    if (!this.reflection) {
      throw new Error('Reflection not initialized');
    }

    this.summarizing = true;

    try {
      const summary = await ReflectionSummarizer.summarize(this.reflection);
      this.saveSummary(summary);
      this.reflection = { ...this.reflection, summary: summary as string };
      ReflectionIDB.setReflection(this.reflection.id, this.reflection);
      this.notifySubscribers();
    } catch (error) {
      console.error('Error summarizing reflection', error);
    } finally {
      this.summarizing = false;
    }
  }

  saveSummary(summary: string) {
    if (!this.reflection) {
      throw new Error('Reflection not initialized');
    }
    this.reflection = { ...this.reflection, summary };
    ReflectionIDB.setReflection(this.reflection.id, this.reflection);
    this.notifySubscribers();
  }

  saveUnsubmittedText(input: string) {
    if (this.reflection && this.reflection.unsubmittedText !== input) {
      this.reflection = { ...this.reflection, unsubmittedText: input };
      ReflectionIDB.setReflection(this.reflection.id, this.reflection);
    }
  }

  get canUpdatePersona() {
    return this.reflection?.entries.length === 0;
  }

  /**
   * Update the persona and rebuild the underlying LM session
   */
  public async setPersona(personaId: PersonaId) {
    if (!this.reflection) {
      throw new Error('Reflection not initialized');
    }

    if (!this.canUpdatePersona) {
      throw new Error('Cannot change persona after entries have been added');
    }
    this.reflection = { ...this.reflection, personaId };
    this.notifySubscribers();
  }

  /**
   * User submits a new entry
   * @param input - The user's input
   * @returns A function to abort the prompt
   */
  userSubmit(input: string): () => void {
    if (!this.session || !this.reflection) {
      throw new Error('Session not initialized');
    }
    if (this.promptState === 'processing') {
      throw new Error('Prompt is already processing');
    }

    this.addEntries(
      [
        {
          text: input,
          createdAt: new Date().toISOString(),
          type: 'user',
        },
      ],
      'processing',
    );
    this.reflection.unsubmittedText = '';

    const controller = new AbortController();
    this.session
      .prompt(input, {
        responseConstraint: this.responseSchema,
        signal: controller.signal,
      })
      .then((response) => {
        let parsed = JSON.parse(response);
        if (Array.isArray(parsed)) {
          parsed = parsed[0];
        }
        const { question, title, acknowledgement } = parsed;

        if (!question || !acknowledgement) {
          throw new Error('Invalid response');
        }

        const text = `${acknowledgement}

*${question.trim()}*`;
        this.addEntries(
          [
            {
              text,
              createdAt: new Date().toISOString(),
              type: 'ai-question',
            },
          ],
          'idle',
          title,
        );
      })
      .finally(() => {
        if (this.promptState === 'processing') {
          this.addEntries([], 'idle');
        }
      });
    const abort = () => {
      if (!this.reflection) {
        throw new Error('Reflection not initialized');
      }
      controller.abort('User aborted');
      // remove last user entry
      this.reflection.entries = this.reflection.entries.slice(0, -1);
      this.reflection.unsubmittedText = input;
      ReflectionIDB.setReflection(this.reflection.id, this.reflection);
      this.notifySubscribers();
    };
    return abort;
  }

  private addEntries(
    entries: Entry[],
    promptState: 'idle' | 'processing' = this.promptState,
    title?: string,
  ) {
    if (!this.reflection) {
      throw new Error('Reflection not initialized');
    }
    if (entries.length !== 0) {
      this.reflection = { ...this.reflection, entries: [...this.reflection.entries, ...entries] };
    }
    if (title && !this.reflection.title) {
      this.reflection = { ...this.reflection, title };
    }
    this.promptState = promptState;
    ReflectionIDB.setReflection(this.reflection.id, this.reflection);
    this.notifySubscribers();
  }

  /**
   * Subscribe to the reflection state
   * @param callback - The callback to call when the reflection state changes
   * @returns A function to unsubscribe
   */
  subscribeReflectioState(
    callback: (reflection: Reflection, promptState: 'idle' | 'processing') => void,
  ): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((c) => c !== callback);
    };
  }

  private notifySubscribers() {
    if (!this.reflection) {
      throw new Error('Reflection not initialized');
    }
    for (const subscriber of this.subscribers) {
      subscriber(this.reflection, this.promptState);
    }
  }

  /**
   * Update the reflection title and persist it
   */
  public setTitle(title: string) {
    if (!this.reflection) {
      throw new Error('Reflection not initialized');
    }
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      // remove title if empty
      const { title: _ignored, ...rest } = this.reflection as Required<Reflection>;
      this.reflection = { ...rest } as Reflection;
    } else {
      this.reflection = { ...this.reflection, title: trimmed };
    }
    ReflectionIDB.setReflection(this.reflection.id, this.reflection);
    this.notifySubscribers();
  }
}

export default ReflectionSession;
