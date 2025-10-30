import { languageOptionsRewriter } from '../language/languageSelection';
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
      ...languageOptionsRewriter(reflection?.language),
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
      sharedContext:
        'Analyze the text to identify the main conclusions, decisions, or action items. Focus on outcomes rather than just descriptions.',
      type: 'key-points',
      format: 'markdown',
      length: 'medium',
      signal: controller?.signal,
      ...languageOptionsRewriter(reflection?.language),
    });

    const summary = summarizer.summarize(text, {
      signal: controller?.signal,
      context: `A key-point should look like this:
- I want to ...
- I feel that ... 
Make it as if the author of the reflection wrote the key points themselves.
`,
    });
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
      type: 'headline',
      length: 'short',
      format: 'plain-text',
      signal: controller?.signal,
      ...languageOptionsRewriter(reflection?.language),
    });

    const summary = summarizer.summarize(text, {
      signal: controller?.signal,
      context: `This is a user reflection about: ${reflection.title}
The user gives a specific example to illustrate an underlying principle.
Distil *only the underlying principle* into one sentence, formatted as a general belief.
Do not summarize the example itself.
Here are some examples:
- I value happiness over material things
- Social recognition is important to me
- Emotional wellbeing is important`,
    });
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
