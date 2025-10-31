import type { LMAvailabilityStatus } from '../global';

export const mockAPI = () => {
  let status: LMAvailabilityStatus = 'downloadable';

  if (typeof window === 'undefined') return;

  // Helper exposed for debug to tweak states at runtime
  (window as any).MockAI = {
    setStatus(next: LMAvailabilityStatus) {
      status = next;
    },
  };

  // LanguageModel mock with monitor-based download simulation
  (window as any).LanguageModel = {
    availability: () => Promise.resolve(status),
    create: (options: any = {}) =>
      new Promise((resolve, reject) => {
        const { monitor, failAtPct, stepMs = 300, stepSize = 10 } = options || {};

        if (status === 'unavailable') {
          reject(new Error('Model unavailable'));
          return;
        }

        // Simulate download if currently downloadable
        if (status === 'downloadable') {
          status = 'downloading';
          const et = new EventTarget();
          if (typeof monitor === 'function') monitor(et);

          let progress = 0;
          const total = 100;
          const interval = setInterval(() => {
            // Optional failure injection for testing
            if (typeof failAtPct === 'number' && progress >= failAtPct) {
              clearInterval(interval);
              status = 'downloadable';
              reject(new Error('Download failed (mock)'));
              return;
            }

            et.dispatchEvent(new ProgressEvent('downloadprogress', { loaded: progress, total }));
            progress = Math.min(total, progress + stepSize);

            if (progress >= total) {
              clearInterval(interval);
              status = 'available';
              resolve(createLanguageModelSession(options));
            }
          }, stepMs);
          return;
        }

        // If already available, return a ready session immediately
        if (status === 'available') {
          resolve(createLanguageModelSession(options));
          return;
        }

        // Fallback
        reject(new Error(`Cannot create session in state: ${status}`));
      }),
  } as any;

  // Summarizer mock
  (window as any).Summarizer = {
    async create(_options?: any) {
      return {
        async summarize(text: string) {
          const type = _options?.type as string | undefined;
          const normalized = (text || '').trim();
          if (!normalized) return '';
          // Simple heuristics depending on type
          if (type === 'headline') {
            const first = normalized.split(/\n|\.|!/)[0]?.trim();
            return first || 'Reflection';
          }
          // key-points: split into up to 3 bullets by sentences
          const sentences = normalized
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 3);
          return sentences.map((s) => `- ${s}`).join('\n');
        },
        destroy() {},
      };
    },
  } as any;

  // Rewriter mock
  (window as any).Rewriter = {
    async create(_options?: unknown) {
      return {
        async rewrite(text: string) {
          const normalized = (text || '').trim();
          if (!normalized) return '';
          // Rewriter: collapse whitespace and ensure markdown paragraphs
          return normalized
            .split(/\n{2,}/)
            .map((p) => p.replace(/[\t ]+/g, ' ').trim())
            .join('\n\n');
        },
        destroy() {},
      };
    },
  } as any;
};

function createLanguageModelSession(options: any) {
  return {
    destroy() {},
    async prompt(input: string | { role: 'user' | 'assistant' | 'system'; content: string }[]) {
      const userText = Array.isArray(input)
        ? input
            .filter((m) => m.role === 'user')
            .map((m) => m.content)
            .join('\n')
        : String(input);

      const lastUser = (userText || '').trim();
      const title = lastUser ? lastUser.split(/\s+/).slice(0, 5).join(' ') : 'Reflection';
      const acknowledgement = lastUser
        ? 'Thanks for sharing. I understand.'
        : 'Thanks for sharing.';
      const followUp = lastUser ? `What makes you say: ${lastUser}?` : 'Can you tell me more?';

      // If the consumer expects only a question (Domain flow), return minimal JSON
      const expectsQuestionOnly =
        !!options?.responseConstraint &&
        Object.keys(options.responseConstraint).length === 1 &&
        'question' in options.responseConstraint;

      const payload = expectsQuestionOnly
        ? { question: followUp }
        : { title, acknowledgement, question: followUp };

      return JSON.stringify(payload);
    },
  } as any;
}
