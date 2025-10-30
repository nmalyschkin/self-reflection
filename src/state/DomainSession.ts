import type { LanguageModelSession } from '../global';
import type { Entry, Question } from '../types';
import { domains as domainsRecord } from '../data/domains';
import DomainIDB from './DomainIDB';
import { ReflectionSummarizer } from '../tools/ReflectionSummarizer';
import {
  languageAppendix,
  languageOptions,
  languageSelection,
} from '../language/languageSelection';
import i18n from '../i18n';

class DomainSession {
  private session: LanguageModelSession | null = null;
  private responseSchema: any = {
    question: 'string',
  };
  question: Question | null = null;
  private promptState: 'idle' | 'processing' = 'idle';
  private subscribers: ((question: Question, promptState: 'idle' | 'processing') => void)[] = [];
  summarizing: boolean = false;
  sessionId: string = crypto.randomUUID().slice(0, 8);
  private summarizerAbortController: AbortController | null = null;

  sessionInitialized: Promise<void>;

  private static createInitialPrompts(question: Question): {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[] {
    const history = question.entries.map(
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
          `You are a reflective coach helping the user explore a self reflection question.".\n` +
          `Guide the user with curiosity and care.\n` +
          `Based on the user's input, provide a single concise follow-up question. ${languageAppendix(question.language)}`,
      },
      ...history,
    ];
  }

  constructor(domainId: string, questionId: string) {
    this.sessionInitialized = new Promise((resolve) => {
      (async () => {
        const existing = await DomainIDB.getQuestion(domainId, questionId);
        const question =
          existing ||
          ((): Question => {
            const domain = domainsRecord[domainId];
            const qMeta = domain?.questions.find((q) => q.id === questionId);
            if (!qMeta) {
              throw new Error('Question not found');
            }
            const base = `${domainId}.questions.${questionId}` as const;
            const aiQuestion = i18n.t(`${base}.question`, { ns: 'domains' });
            const title = i18n.t(`${base}.shortDescription`, { ns: 'domains' });
            return {
              id: questionId,
              domainId,
              entries: [
                {
                  text: aiQuestion,
                  type: 'ai-question',
                  createdAt: new Date().toISOString(),
                },
              ],
              createdAt: new Date().toISOString(),
              finished: false,
              title: title,
              language: languageSelection.get(),
            } as Question;
          })();

        this.question = question;
        const initialPrompts = DomainSession.createInitialPrompts(question);
        this.session = await window.LanguageModel.create({
          initialPrompts,
          ...languageOptions(question?.language),
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
    if (!this.question) {
      throw new Error('Question not initialized');
    }

    this.summarizing = true;
    this.notifySubscribers();

    try {
      this.summarizerAbortController = new AbortController();
      const [summary, headline] = await Promise.all([
        ReflectionSummarizer.summarizeLong(this.question, this.summarizerAbortController),
        ReflectionSummarizer.summarizeHeadline(this.question, this.summarizerAbortController),
      ]);

      this.question = {
        ...this.question,
        summary: summary,
        headline: headline,
      } as Question;
      console.log('summarized question', summary, headline);
      await DomainIDB.setQuestion(this.question.domainId, this.question.id, this.question);
      this.notifySubscribers();
    } catch (error) {
      console.error('Error summarizing question', error);
    } finally {
      this.summarizing = false;
      this.summarizerAbortController = null;
      this.notifySubscribers();
    }
  }

  abortSummarize() {
    if (this.summarizerAbortController) {
      try {
        this.summarizerAbortController.abort('User aborted');
      } finally {
        this.summarizing = false;
        this.summarizerAbortController = null;
        this.notifySubscribers();
      }
    }
  }

  saveSummary(summary: string) {
    if (!this.question) {
      throw new Error('Question not initialized');
    }
    this.question = { ...this.question, summary } as Question;
    DomainIDB.setQuestion(this.question.domainId, this.question.id, this.question);
    this.notifySubscribers();
  }

  saveUnsubmittedText(input: string) {
    if (this.question && this.question.unsubmittedText !== input) {
      this.question = { ...this.question, unsubmittedText: input } as Question;
      DomainIDB.setQuestion(this.question.domainId, this.question.id, this.question);
    }
  }

  setFinished(finished: boolean) {
    if (!this.question) {
      throw new Error('Question not initialized');
    }
    this.question = { ...this.question, finished } as Question;
    DomainIDB.setQuestion(this.question.domainId, this.question.id, this.question);
    this.notifySubscribers();
  }

  toggleFinished() {
    if (!this.question) {
      throw new Error('Question not initialized');
    }
    this.setFinished(!this.question.finished);
  }

  userSubmit(input: string): () => void {
    if (!this.session || !this.question) {
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
    this.question.unsubmittedText = '';

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
        const { question } = parsed;

        if (!question || typeof question !== 'string' || question.trim().length === 0) {
          throw new Error('Invalid response');
        }

        const text = `*${question.trim()}*`;
        this.addEntries(
          [
            {
              text,
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
      if (!this.question) {
        throw new Error('Question not initialized');
      }
      controller.abort('User aborted');
      this.question.entries = this.question.entries.slice(0, -1);
      this.question.unsubmittedText = input;
      DomainIDB.setQuestion(this.question.domainId, this.question.id, this.question);
      this.notifySubscribers();
    };
    return abort;
  }

  private addEntries(entries: Entry[], promptState: 'idle' | 'processing' = this.promptState) {
    if (!this.question) {
      throw new Error('Question not initialized');
    }
    if (entries.length !== 0) {
      this.question = {
        ...this.question,
        entries: [...this.question.entries, ...entries],
      } as Question;
    }
    this.promptState = promptState;
    DomainIDB.setQuestion(this.question.domainId, this.question.id, this.question);
    this.notifySubscribers();
  }

  subscribeQuestionState(
    callback: (question: Question, promptState: 'idle' | 'processing') => void,
  ): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((c) => c !== callback);
    };
  }

  private notifySubscribers() {
    if (!this.question) {
      throw new Error('Question not initialized');
    }
    for (const subscriber of this.subscribers) {
      subscriber(this.question, this.promptState);
    }
  }
}

export default DomainSession;
