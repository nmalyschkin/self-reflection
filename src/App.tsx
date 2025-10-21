import { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Link, Text, IconButton, useDisclosure } from '@chakra-ui/react';
import type { LMStatus } from './types';
import StartView from './views/StartView';
import About from './views/About';
import ReflectView from './views/ReflectView';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './components/sidebar';

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
  const navigate = useNavigate();

  const [lmStatus, setLmStatus] = useState<LMStatus>('unknown');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const modelOptions = useMemo(() => ({}), []); // Keep options consistent between availability and prompt
  const { open: isSidebarOpen, onOpen: openSidebar, onClose: closeSidebar } = useDisclosure();

  useEffect(() => {
    getLmStatus(modelOptions).then(setLmStatus);
    // setLmStatus('downloading');
  }, [modelOptions]);

  const startModelDownload = useCallback(async () => {
    if (lmStatus === 'downloadable') {
      window.LanguageModel.create({
        ...modelOptions,
        monitor(m: EventTarget) {
          m.addEventListener('downloadprogress', (e: any & ProgressEvent) => {
            console.log(`Downloaded ${(e.loaded / e.total) * 100}%`);
            setDownloadProgress(Math.round((e.loaded / e.total) * 100));
          });
        },
      }).then(() => {
        getLmStatus(modelOptions).then(setLmStatus);
      });
      getLmStatus(modelOptions).then(setLmStatus);
    }
  }, [modelOptions, lmStatus]);

  function openReflection(id: string) {
    const targetId = id && id.length > 0 ? id : crypto.randomUUID().slice(0, 8);
    navigate(`/reflect/${encodeURIComponent(targetId)}`);
  }

  if (lmStatus === 'no-api') {
    return (
      <Box minH="100dvh" minW="100dvw" display="flex" alignItems="center" justifyContent="center">
        <Box position="relative" p={4} w="100%" maxW="2xl" mx="auto">
          <Text>This app is built with the experimental Chrome Prompt API</Text>
          <Text>Please activate the Prompt API in Chrome Flag:</Text>
          <Text fontSize="sm" color="gray.500">
            chrome://flags/#prompt-api-for-gemini-nano-multimodal-input
          </Text>
          <Link
            href="https://developer.chrome.com/docs/ai/built-in"
            target="_blank"
            color="blue.500"
          >
            Learn more
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100dvh" minW="100dvw" display="flex" alignItems="center" justifyContent="center">
      {/* Sidebar toggle button */}
      <IconButton
        aria-label="Open menu"
        position="fixed"
        top={2}
        left={2}
        zIndex={1000}
        variant="ghost"
        onClick={openSidebar}
      >
        ☰
      </IconButton>

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

        <Routes>
          <Route
            path="/"
            element={
              <StartView
                lmStatus={lmStatus}
                onOpen={openReflection}
                onStartDownload={startModelDownload}
                downloadButton
              />
            }
          />
          <Route path="/reflect/:id" element={<ReflectRoute lmStatus={lmStatus} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Box>

      <Sidebar
        open={isSidebarOpen}
        onClose={closeSidebar}
        onHome={() => navigate('/')}
        onNewReflection={() => openReflection('')}
        onAbout={() => navigate('/about')}
      />
    </Box>
  );
}

export default App;

function ReflectRoute({ lmStatus }: { lmStatus: LMStatus }) {
  const navigate = useNavigate();
  const params = useParams();
  const reflectionId = params.id ? decodeURIComponent(params.id) : null;
  return (
    <ReflectView
      reflectionId={reflectionId}
      lmStatus={lmStatus}
      onSave={() => navigate('/')}
      onBack={() => navigate('/')}
    />
  );
}
