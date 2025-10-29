// Minimal types to recognize the experimental Chrome Prompt API on window

export type LMAvailabilityStatus = 'available' | 'unavailable' | 'downloadable' | 'downloading';

export interface LanguageModelSession {
  destroy(): void;
  prompt(
    input: string | { role: 'user' | 'assistant' | 'system'; content: string }[],
    options?: unknown,
  ): Promise<string>;
  // Optionally add streaming/cancel later as needed
}

interface LanguageModelStatic {
  availability(options?: unknown): Promise<LMAvailabilityStatus>;
  create(options?: unknown): Promise<LanguageModelSession>;
}

interface Summarizer {
  create(options?: unknown): Promise<SummarizerSession>;
}

interface SummarizerSession {
  summarize(text: string, options?: unknown): Promise<string>;
  destroy(): void;
}

declare global {
  interface Window {
    LanguageModel: LanguageModelStatic;
    Summarizer: Summarizer;
  }
}

export {};
