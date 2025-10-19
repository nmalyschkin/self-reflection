import type { LMAvailabilityStatus } from '../global';

export const mockAPI = () => {
  let status: LMAvailabilityStatus = 'downloadable';
  if (typeof window !== 'undefined') {
    window.LanguageModel = {
      availability: () => Promise.resolve(status),
      create: ({ monitor }: { monitor: (m: EventTarget) => void }) =>
        new Promise((resolve) => {
          console.log('downloading in mock');
          status = 'downloading';
          const et = new EventTarget();
          let progress = 0;
          monitor(et);
          const interval = setInterval(() => {
            et.dispatchEvent(
              new ProgressEvent('downloadprogress', { loaded: progress, total: 100 }),
            );
            progress += 10;
            if (progress >= 100) {
              status = 'available';
              resolve({
                destroy: () => {},
                prompt: () => Promise.resolve(''),
              });
              clearInterval(interval);
            }
          }, 1000);
        }),
    };
  }
};
