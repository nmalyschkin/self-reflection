import type { Reflection, Question } from '../types';

export class ReflectionSummarizer {
  static async summarizeLong(
    reflection: Reflection | Question,
    controller?: AbortController,
  ): Promise<string> {
    const text = reflection.entries
      .filter((entry) => entry.type === 'user')
      .map((entry) => entry.text)
      .join('\n');

    const summarizer = await window.Rewriter.create({
      sharedContext:
        'This is the user input from a self reflection dialogue. Rewrite it into a coherent self-reflection without loosing any orignal thoughts. Try to retain the wording used by the user.',
      format: 'markdown',
      length: 'shorter',
      signal: controller?.signal,
    });

    const summary = summarizer.rewrite(text, { signal: controller?.signal });
    summary.finally(() => {
      summarizer.destroy();
    });

    return summary;
  }

  static async summarizeKeyPoints(
    reflection: Reflection | Question,
    controller?: AbortController,
  ): Promise<string> {
    const text = reflection.entries
      .filter((entry) => entry.type === 'user')
      .map((entry) => entry.text)
      .join('\n');

    const summarizer = await window.Summarizer.create({
      sharedContext: 'Summarize the key points of the following text.', // TODO: add shared context
      type: 'key-points',
      format: 'markdown',
      length: 'medium',
      signal: controller?.signal,
    });

    const summary = summarizer.summarize(text, { signal: controller?.signal });
    summary.finally(() => {
      summarizer.destroy();
    });

    return summary;
  }

  static async summarizeHeadline(
    reflection: Reflection | Question,
    controller?: AbortController,
  ): Promise<string> {
    const text = reflection.entries
      .filter((entry) => entry.type === 'user')
      .map((entry) => entry.text)
      .join('\n');

    const summarizer = await window.Summarizer.create({
      sharedContext: 'Summarize the headline of the following text.', // TODO: add shared context
      type: 'headline',
      format: 'markdown',
      length: 'short',
      signal: controller?.signal,
    });

    const summary = summarizer.summarize(text, { signal: controller?.signal });
    summary.finally(() => {
      summarizer.destroy();
    });

    return summary;
  }
}

interface Rewriter {
  create(options: unknown): Promise<RewriterSession>;
}

interface RewriterSession {
  rewrite(text: string, options?: unknown): Promise<string>;
  destroy(): void;
}

declare global {
  interface Window {
    Rewriter: Rewriter;
  }
}
