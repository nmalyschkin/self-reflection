import { useEffect, lazy, Suspense } from 'react';
import { Box, IconButton, useDisclosure } from '@chakra-ui/react';
import StartView from './views/StartView';
import About from './views/About';
import ReflectView from './views/ReflectView';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './components/sidebar';
import InstallAPI from './views/InstallAPI';
import DownloadModel from './views/DownloadModel';
import Domains from './views/Domain/DomainOverview';
import Domain from './views/Domain/Domain';
import Question from './views/Domain/Question';
import { useTranslation } from 'react-i18next';
import { useLanguageModel } from './state/LanguageModelState';
const isDebugBuild = import.meta.env.DEV || import.meta.env.MODE === 'development';
const DebugOverview = isDebugBuild ? lazy(() => import('./debug/overview')) : undefined;
const DebugSummarizer = isDebugBuild ? lazy(() => import('./debug/summarizer')) : undefined;
const DebugRewriter = isDebugBuild ? lazy(() => import('./debug/rewriter')) : undefined;
const DebugPersona = isDebugBuild ? lazy(() => import('./debug/persona')) : undefined;

function App() {
  const { lmStatus, progress: downloadProgress, startModelDownload } = useLanguageModel({});
  const { open: isSidebarOpen, onOpen: openSidebar, onClose: closeSidebar } = useDisclosure();
  const { t } = useTranslation('common');

  if (lmStatus === 'no-api') {
    return <InstallAPI />;
  }

  // when downloadable or downloading show DownloadModel
  if (lmStatus === 'downloadable' || lmStatus === 'downloading') {
    return (
      <DownloadModel
        lmStatus={lmStatus}
        onStartDownload={startModelDownload}
        progress={downloadProgress}
      />
    );
  }

  return (
    <Box minH="100dvh" minW="100dvw" display="flex" alignItems="center" justifyContent="center">
      {/* Sidebar toggle button */}
      <IconButton
        aria-label={t('app.menuAria')}
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
        <Routes>
          <Route
            path="/"
            element={
              <StartView lmStatus={lmStatus} onStartDownload={startModelDownload} downloadButton />
            }
          />
          <Route path="/reflect" element={<ReflectRoute />} />
          <Route path="/reflect/:id" element={<ReflectRoute />} />
          <Route path="/about" element={<About />} />
          <Route path="/domains" element={<Domains />} />
          <Route path="/domains/:id" element={<Domain />} />
          <Route path="/domains/:domainId/questions/:questionId" element={<Question />} />
          {isDebugBuild && DebugOverview ? (
            <Route
              path="/debug"
              element={
                <Suspense fallback={<div />}>
                  <DebugOverview />
                </Suspense>
              }
            />
          ) : null}
          {isDebugBuild && DebugSummarizer ? (
            <Route
              path="/debug/summarizer"
              element={
                <Suspense fallback={<div />}>
                  <DebugSummarizer />
                </Suspense>
              }
            />
          ) : null}
          {isDebugBuild && DebugRewriter ? (
            <Route
              path="/debug/rewriter"
              element={
                <Suspense fallback={<div />}>
                  <DebugRewriter />
                </Suspense>
              }
            />
          ) : null}
          {isDebugBuild && DebugPersona ? (
            <Route
              path="/debug/persona"
              element={
                <Suspense fallback={<div />}>
                  <DebugPersona />
                </Suspense>
              }
            />
          ) : null}
        </Routes>
      </Box>

      <Sidebar open={isSidebarOpen} onClose={closeSidebar} />
    </Box>
  );
}

export default App;

function ReflectRoute() {
  const navigate = useNavigate();
  const params = useParams();
  const reflectionId = params.id ? decodeURIComponent(params.id) : null;
  // Generate an id and redirect if none provided
  useEffect(() => {
    if (!params.id) {
      const newId = crypto.randomUUID().slice(0, 8);
      navigate(`/reflect/${encodeURIComponent(newId)}`, { replace: true });
    }
  }, [params.id, navigate]);
  if (!reflectionId) return null;
  return <ReflectView reflectionId={reflectionId} />;
}
