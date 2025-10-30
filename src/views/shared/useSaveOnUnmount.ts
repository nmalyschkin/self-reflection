import { useEffect } from 'react';

export function useSaveOnUnmount(
  shouldSkipRef: React.MutableRefObject<boolean | undefined>,
  getCurrentText: () => string,
  hasAnyEntries: () => boolean,
  save: (text: string) => void,
) {
  useEffect(() => {
    return () => {
      if (shouldSkipRef.current) return;
      const text = getCurrentText();
      if (text || hasAnyEntries()) {
        save(text);
      }
    };
  }, []);
}
