import { useEffect, useMemo, useState, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import type { LMStatus } from './types';
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

  function openReflection(id: string) {
    setCurrentId(id);
    setView('reflect');
  }

  return (
    <Box minH="100dvh" minW="100dvw" display="flex" alignItems="center" justifyContent="center">
      <Box position="relative" p={4} w="100%" maxW="2xl" mx="auto">
        {(lmStatus === 'downloadable' || lmStatus === 'downloading') && (
          <Box
            position="absolute"
            top={2}
            right={2}
            fontSize="xs"
            bg="yellow.100"
            color="yellow.900"
            borderWidth="1px"
            borderColor="yellow.200"
            rounded="md"
            px={2}
            py={1}
            boxShadow="sm"
          >
            {lmStatus === 'downloadable'
              ? 'Model ready to download…'
              : (() => {
                  const raw = downloadProgress;
                  const pct =
                    typeof raw === 'number' ? Math.round(raw <= 1 ? raw * 100 : raw) : null;
                  return `Downloading on-device model…${pct !== null ? ` ${pct}%` : ''}`;
                })()}
          </Box>
        )}

        {view === 'start' ? (
          <StartView
            lmStatus={lmStatus}
            onOpen={openReflection}
            onStartDownload={startModelDownload}
            downloadButton
          />
        ) : (
          <ReflectView
            reflectionId={currentId}
            lmStatus={lmStatus}
            onSave={() => setView('start')}
            onBack={() => setView('start')}
          />
        )}
      </Box>
    </Box>
  );
}

export default App;
