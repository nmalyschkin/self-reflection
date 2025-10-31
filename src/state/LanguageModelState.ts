import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LMStatus } from '../types';

export function hasLanguageModel(): boolean {
  return typeof window !== 'undefined' && 'LanguageModel' in (window as any);
}

function hasAllAiApis(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.LanguageModel && w.Summarizer && w.Rewriter);
}

async function getAvailability(api: any, options: any): Promise<LMStatus | null> {
  try {
    if (api && typeof api.availability === 'function') {
      const status = await api.availability(options);
      return status as LMStatus;
    }
  } catch {}
  return null;
}

export async function getLmStatus(modelOptions: any): Promise<LMStatus> {
  if (!hasAllAiApis()) return 'no-api';
  const w = window as any;
  const [lm, sum, rew] = [w.LanguageModel, w.Summarizer, w.Rewriter];
  const [lmS, sumS, rewS] = await Promise.all([
    getAvailability(lm, modelOptions),
    getAvailability(sum, modelOptions),
    getAvailability(rew, modelOptions),
  ]);

  const statuses = [lmS, sumS, rewS].filter((s): s is LMStatus => s !== null);
  if (statuses.includes('downloadable')) return 'downloadable';
  if (statuses.includes('downloading')) return 'downloading';
  if (statuses.length === 0) {
    // No availability APIs exposed; assume unknown rather than no-api since APIs exist
    return 'unknown';
  }
  if (statuses.every((s) => s === 'available')) return 'available';
  if (statuses.includes('unavailable')) return 'unavailable';
  return 'unknown';
}

export function useLanguageModel(modelOptionsInit?: any) {
  const modelOptions = useMemo(() => modelOptionsInit ?? {}, [modelOptionsInit]);
  const [lmStatus, setLmStatus] = useState<LMStatus>('unknown');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [, setProgressByApi] = useState<{ lm?: number; sum?: number; rew?: number }>({});

  useEffect(() => {
    getLmStatus(modelOptions).then(setLmStatus);
  }, [modelOptions]);

  const startModelDownload = useCallback(async () => {
    if (lmStatus !== 'downloadable') return;
    const w = window as any;
    if (w.LanguageModel && typeof w.LanguageModel.create === 'function') {
      w.LanguageModel.create({
        ...modelOptions,
        monitor(m: EventTarget) {
          m.addEventListener('downloadprogress', (e: any & ProgressEvent) => {
            const pct = Math.round(((e.loaded as number) / (e.total as number)) * 100);
            setProgressByApi((prev) => {
              const next = { ...prev, lm: pct };
              const values = Object.values(next).filter((v) => typeof v === 'number') as number[];
              setDownloadProgress(
                values.length
                  ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
                  : null,
              );
              return next;
            });
          });
        },
      })
        .then(() => {
          setProgressByApi((prev) => {
            const next = { ...prev, lm: 100 };
            const values = Object.values(next).filter((v) => typeof v === 'number') as number[];
            setDownloadProgress(
              values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null,
            );
            return next;
          });
          getLmStatus(modelOptions).then(setLmStatus);
        })
        .catch(() => {
          getLmStatus(modelOptions).then(setLmStatus);
        });
    }
    // Fire off potential downloads for other APIs if they expose create()
    try {
      if (w.Summarizer && typeof w.Summarizer.availability === 'function') {
        const st = await w.Summarizer.availability(modelOptions);
        if (st === 'downloadable' && typeof w.Summarizer.create === 'function') {
          void w.Summarizer.create({
            ...modelOptions,
            monitor(m: EventTarget) {
              m.addEventListener('downloadprogress', (e: any & ProgressEvent) => {
                const pct = Math.round(((e.loaded as number) / (e.total as number)) * 100);
                setProgressByApi((prev) => {
                  const next = { ...prev, sum: pct };
                  const values = Object.values(next).filter(
                    (v) => typeof v === 'number',
                  ) as number[];
                  setDownloadProgress(
                    values.length
                      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
                      : null,
                  );
                  return next;
                });
              });
            },
          }).then(() => {
            setProgressByApi((prev) => {
              const next = { ...prev, sum: 100 };
              const values = Object.values(next).filter((v) => typeof v === 'number') as number[];
              setDownloadProgress(
                values.length
                  ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
                  : null,
              );
              return next;
            });
            getLmStatus(modelOptions).then(setLmStatus);
          });
        }
      }
    } catch {}
    try {
      if (w.Rewriter && typeof w.Rewriter.availability === 'function') {
        const st = await w.Rewriter.availability(modelOptions);
        if (st === 'downloadable' && typeof w.Rewriter.create === 'function') {
          void w.Rewriter.create({
            ...modelOptions,
            monitor(m: EventTarget) {
              m.addEventListener('downloadprogress', (e: any & ProgressEvent) => {
                const pct = Math.round(((e.loaded as number) / (e.total as number)) * 100);
                setProgressByApi((prev) => {
                  const next = { ...prev, rew: pct };
                  const values = Object.values(next).filter(
                    (v) => typeof v === 'number',
                  ) as number[];
                  setDownloadProgress(
                    values.length
                      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
                      : null,
                  );
                  return next;
                });
              });
            },
          }).then(() => {
            setProgressByApi((prev) => {
              const next = { ...prev, rew: 100 };
              const values = Object.values(next).filter((v) => typeof v === 'number') as number[];
              setDownloadProgress(
                values.length
                  ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
                  : null,
              );
              return next;
            });
            getLmStatus(modelOptions).then(setLmStatus);
          });
        }
      }
    } catch {}
  }, [modelOptions, lmStatus]);

  // Intentionally do not auto-start downloads; they begin only on explicit user action

  const refreshStatus = useCallback(
    () => getLmStatus(modelOptions).then(setLmStatus),
    [modelOptions],
  );

  return {
    lmStatus,
    progress: downloadProgress,
    startModelDownload,
    refreshStatus,
  };
}
