import { useCallback, useEffect, useState } from 'react';

export default function useHint() {
  const [showMdHint, setShowMdHint] = useState(false);

  useEffect(() => {
    try {
      const dismissed =
        typeof window !== 'undefined' &&
        window.localStorage.getItem('md_hint_dismissed') === 'true';
      setShowMdHint(!dismissed);
    } catch {
      setShowMdHint(true);
    }
  }, []);

  const dismissMdHint = useCallback(() => {
    try {
      window.localStorage.setItem('md_hint_dismissed', 'true');
    } catch {}
    setShowMdHint(false);
  }, []);

  return { showMdHint, dismissMdHint };
}
