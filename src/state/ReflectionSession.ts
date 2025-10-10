import type { LanguageModelSession } from '../global';
import type { Entry } from '../types';
import type { Reflection } from '../types';
import ReflectionIDB from './ReflectionIDB';

class ReflectionSession {
  private session: LanguageModelSession | null = null;
  private responseSchema: any = {
    // summary: 'string',
    question: 'string',
  };
  reflection: Reflection | null = null;
  private promptState: 'idle' | 'processing' = 'idle';
  private subscribers: ((reflection: Reflection, promptState: 'idle' | 'processing') => void)[] =
    [];

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
    return [
      {
        role: 'system',
        content:
          'You are a helpful psycho therapist, helping the user to reflect on their life.' +
          'Your responses should be compassionate and open-ended. Relate to the users input and follow up with a question that guides the user to deeper reflection.' +
          'Try to follow the CBT (Cognitive Behavioral Therapy) principles. Help the user unfold the situation, the thoughts, the emotions, the behaviors, the consequences, and the alternatives.' +
          "Once the user has reflected on the situation in it's entirety, ask them to think about imidiate actions they can take to improve a future situation. Try to focus on actions that are within their control." +
          'If the user is feeling stuck, ask them to change their perspective if this had happened to someone else and they were asking for advice.' +
          'Focus on one step at a time. Do not overwhelm the user with too many thoughts and topics. Only ask one question at a time or a follow up question if needed.',
      },
      ...history,
    ];
  }

  constructor(reflectionId: string | null) {
    this.sessionInitialized = new Promise((resolve) => {
      (async () => {
        const reflection = await ReflectionIDB.getReflection(reflectionId);
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
    }
  }

  /**
   * User submits a new entry
   * @param input - The user's input
   * @returns A function to abort the prompt
   */
  userSubmit(input: string): () => void {
    if (!this.session) {
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

    const controller = new AbortController();
    this.session
      .prompt(input, {
        responseConstraint: this.responseSchema,
        signal: controller.signal,
      })
      .then((response) => {
        const { question } = JSON.parse(response);
        this.addEntries(
          [
            {
              text: question,
              createdAt: new Date().toISOString(),
              type: 'ai-question',
            },
          ],
          'idle',
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
      controller.abort();
      // remove last user entry
      this.reflection.entries = this.reflection.entries.slice(0, -1);
      ReflectionIDB.setReflection(this.reflection.id, this.reflection);
      this.notifySubscribers();
    };
    return abort;
  }

  private addEntries(entries: Entry[], promptState: 'idle' | 'processing' = this.promptState) {
    if (!this.reflection) {
      throw new Error('Reflection not initialized');
    }
    if (entries.length !== 0) {
      this.reflection = { ...this.reflection, entries: [...this.reflection.entries, ...entries] };
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
}

export default ReflectionSession;
