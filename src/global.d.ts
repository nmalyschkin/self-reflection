// Minimal types to recognize the experimental Chrome Prompt API on window

type LMAvailabilityStatus = 'available' | 'unavailable' | 'downloadable' | 'downloading';

interface LMAvailability {
  status: LMAvailabilityStatus;
  progress?: number; // 0..1 or percentage depending on implementation
}

export interface LanguageModelSession {
  destroy(): void;
  prompt(input: string, options?: unknown): Promise<string>;
  // Optionally add streaming/cancel later as needed
}

interface LanguageModelStatic {
  availability(options?: unknown): Promise<LMAvailability>;
  create(options?: unknown): Promise<LanguageModelSession>;
}

declare global {
  interface Window {
    LanguageModel: LanguageModelStatic;
  }
}

export {};
