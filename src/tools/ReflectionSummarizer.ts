import { getPersona } from '../personas';
import type { Reflection } from '../types';

const options = {
  sharedContext:
    "This is a self-reflection entry, please write the summary from the user's perspective",
  type: 'key-points',
  format: 'markdown',
  length: 'long',
};

export class ReflectionSummarizer {
  static async summarize(reflection: Reflection) {
    const text = reflection.entries
      .filter((entry) => entry.type === 'user')
      .map((entry) => entry.text)
      .join('\n');

    const summarizer = await window.Summarizer.create({
      options,
    });

    return await summarizer.summarize(text, {
      context: `This self reflection was made with the following persona: ${getPersona(reflection.personaId).description}`,
    });
  }
}
