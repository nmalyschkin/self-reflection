import type { LMAvailabilityStatus } from '../global';

export const mockAPI = () => {
  let lmStatus: LMAvailabilityStatus = 'downloadable';
  let summarizerStatus: LMAvailabilityStatus = 'downloadable';
  let rewriterStatus: LMAvailabilityStatus = 'downloadable';

  if (typeof window === 'undefined') return;

  // Helper exposed for debug to tweak states at runtime
  (window as any).MockAI = {
    setStatus(next: LMAvailabilityStatus) {
      lmStatus = next;
    },
    setLMStatus(next: LMAvailabilityStatus) {
      lmStatus = next;
    },
    setSummarizerStatus(next: LMAvailabilityStatus) {
      summarizerStatus = next;
    },
    setRewriterStatus(next: LMAvailabilityStatus) {
      rewriterStatus = next;
    },
  };

  // LanguageModel mock with monitor-based download simulation
  (window as any).LanguageModel = {
    availability: () => Promise.resolve(lmStatus),
    create: (options: any = {}) =>
      new Promise((resolve, reject) => {
        const { monitor, failAtPct, stepMs = 300, stepSize = 1 } = options || {};

        if (lmStatus === 'unavailable') {
          reject(new Error('Model unavailable'));
          return;
        }

        if (lmStatus === 'downloadable') {
          lmStatus = 'downloading';
          const et = new EventTarget();
          if (typeof monitor === 'function') monitor(et);

          let progress = 0;
          const total = 100;
          const interval = setInterval(() => {
            if (typeof failAtPct === 'number' && progress >= failAtPct) {
              clearInterval(interval);
              lmStatus = 'downloadable';
              reject(new Error('Download failed (mock)'));
              return;
            }

            et.dispatchEvent(new ProgressEvent('downloadprogress', { loaded: progress, total }));
            progress = Math.min(total, progress + stepSize);

            if (progress >= total) {
              clearInterval(interval);
              lmStatus = 'available';
              resolve(createLanguageModelSession(options));
            }
          }, stepMs);
          return;
        }

        if (lmStatus === 'available') {
          resolve(createLanguageModelSession(options));
          return;
        }

        reject(new Error(`Cannot create session in state: ${lmStatus}`));
      }),
  } as any;

  // Summarizer mock
  (window as any).Summarizer = {
    availability: () => Promise.resolve(summarizerStatus),
    async create(options?: any) {
      if (summarizerStatus === 'unavailable') throw new Error('Summarizer unavailable');
      const { monitor, failAtPct, stepMs = 300, stepSize = 1 } = options || {};
      if (summarizerStatus === 'downloadable') {
        summarizerStatus = 'downloading';
        const et = new EventTarget();
        if (typeof monitor === 'function') monitor(et);
        let progress = 0;
        const total = 100;
        await new Promise<void>((resolve, reject) => {
          const interval = setInterval(() => {
            if (typeof failAtPct === 'number' && progress >= failAtPct) {
              clearInterval(interval);
              summarizerStatus = 'downloadable';
              reject(new Error('Download failed (mock)'));
              return;
            }
            et.dispatchEvent(new ProgressEvent('downloadprogress', { loaded: progress, total }));
            progress = Math.min(total, progress + stepSize);
            if (progress >= total) {
              clearInterval(interval);
              summarizerStatus = 'available';
              resolve();
            }
          }, stepMs);
        });
      }
      return createSummarizerSession(options);
    },
  } as any;

  // Rewriter mock
  (window as any).Rewriter = {
    availability: () => Promise.resolve(rewriterStatus),
    async create(options?: unknown) {
      if (rewriterStatus === 'unavailable') throw new Error('Rewriter unavailable');
      const { monitor, failAtPct, stepMs = 300, stepSize = 1 } = (options as any) || {};
      if (rewriterStatus === 'downloadable') {
        rewriterStatus = 'downloading';
        const et = new EventTarget();
        if (typeof monitor === 'function') monitor(et);
        let progress = 0;
        const total = 100;
        await new Promise<void>((resolve, reject) => {
          const interval = setInterval(() => {
            if (typeof failAtPct === 'number' && progress >= failAtPct) {
              clearInterval(interval);
              rewriterStatus = 'downloadable';
              reject(new Error('Download failed (mock)'));
              return;
            }
            et.dispatchEvent(new ProgressEvent('downloadprogress', { loaded: progress, total }));
            progress = Math.min(total, progress + stepSize);
            if (progress >= total) {
              clearInterval(interval);
              rewriterStatus = 'available';
              resolve();
            }
          }, stepMs);
        });
      }
      return createRewriterSession(options);
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

function createSummarizerSession(_options?: any) {
  return {
    async summarize(text: string) {
      const type = _options?.type as string | undefined;
      const normalized = (text || '').trim();
      if (!normalized) return '';
      if (type === 'headline') {
        const first = normalized.split(/\n|\.|!/)[0]?.trim();
        return first || 'Reflection';
      }
      const sentences = normalized
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
      return sentences.map((s) => `- ${s}`).join('\n');
    },
    destroy() {},
  } as any;
}

function createRewriterSession(_options?: unknown) {
  return {
    async rewrite(text: string) {
      const normalized = (text || '').trim();
      if (!normalized) return '';
      return normalized
        .split(/\n{2,}/)
        .map((p) => p.replace(/[\t ]+/g, ' ').trim())
        .join('\n\n');
    },
    destroy() {},
  } as any;
}
