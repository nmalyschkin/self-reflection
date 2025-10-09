import { useEffect, useMemo, useState, useCallback } from 'react';
import type { LMStatus } from './types';
import './App.css';
import StartView from './views/StartView';
import ReflectView from './views/ReflectView';

function hasLanguageModel(): boolean {
  return typeof window !== 'undefined' && 'LanguageModel' in (window as any);
}

async function getLmStatus(modelOptions: any): Promise<LMStatus> {
  if (!hasLanguageModel()) return 'no-api';
  if (typeof (window as any).LanguageModel.availability !== 'function') return 'no-api';
  const availability = await (window as any).LanguageModel.availability(modelOptions);
  const status = availability as LMStatus;
  return status;
}

function App() {
  const [view, setView] = useState<'start' | 'reflect'>('start');
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [lmStatus, setLmStatus] = useState<LMStatus>('unknown');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const modelOptions = useMemo(() => ({}), []); // Keep options consistent between availability and prompt

  useEffect(() => {
    getLmStatus(modelOptions).then(setLmStatus);
    // setLmStatus('downloading');
  }, [modelOptions]);

  const startModelDownload = useCallback(async () => {
    if (lmStatus === 'downloadable') {
      await window.LanguageModel.create({
        ...modelOptions,
        monitor(m: EventTarget) {
          m.addEventListener('downloadprogress', (e: any & ProgressEvent) => {
            console.log(`Downloaded ${(e.loaded / e.total) * 100}%`);
            setDownloadProgress(Math.round((e.loaded / e.total) * 100));
          });
        },
      });
      getLmStatus(modelOptions).then(setLmStatus);
    }
  }, [modelOptions]);

  const isExisting = useMemo(() => currentId !== null, [currentId]);

  function openReflection(id: string) {
    setCurrentId(id);
    setView('reflect');
  }

  return (
    <div className="relative p-4 max-w-2xl mx-auto">
      {/* TODO: add toast */}
      {(lmStatus === 'downloadable' || lmStatus === 'downloading') && (
        <div className="absolute top-2 right-2 text-xs bg-yellow-100 text-yellow-900 border border-yellow-200 rounded px-2 py-1 shadow">
          {lmStatus === 'downloadable'
            ? 'Model ready to download…'
            : (() => {
                const raw = downloadProgress;
                const pct = typeof raw === 'number' ? Math.round(raw <= 1 ? raw * 100 : raw) : null;
                return `Downloading on-device model…${pct !== null ? ` ${pct}%` : ''}`;
              })()}
        </div>
      )}

      {view === 'start' ? (
        <StartView
          reflections={[]}
          lmStatus={lmStatus}
          onStart={() => setView('reflect')}
          onOpen={openReflection}
          onStartDownload={startModelDownload}
          downloadButton
        />
      ) : (
        <ReflectView
          reflectionId={currentId}
          lmStatus={lmStatus}
          isExisting={isExisting}
          onSave={() => setView('start')}
          onBack={() => setView('start')}
        />
      )}
    </div>
  );
}

export default App;
