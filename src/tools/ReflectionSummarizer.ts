import type { Reflection, Question } from '../types';

const options = {
  sharedContext:
    'This is the user input from a self reflection dialogue. Rewrite it into a coherent self-reflection without loosing any orignal thoughts. Try to retain the wording used by the user.',
  format: 'markdown',
  length: 'shorter',
};

export class ReflectionSummarizer {
  static async summarize(
    reflection: Reflection | Question,
    controller?: AbortController,
  ): Promise<string> {
    const text = reflection.entries
      .filter((entry) => entry.type === 'user')
      .map((entry) => entry.text)
      .join('\n');

    const summarizer = await window.Rewriter.create({
      options,
      signal: controller?.signal,
    });

    const summary = summarizer.rewrite(text, { signal: controller?.signal });
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
