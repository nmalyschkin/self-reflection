import {
  Box,
  VStack,
  Heading,
  HStack,
  IconButton,
  Flex,
  Button,
  Spinner,
  Text,
  Dialog,
} from '@chakra-ui/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import useNavigateTo from '../../hooks/useNavigateTo';
import { useParams } from 'react-router-dom';
import DomainSession from '../../state/DomainSession';
import type { Question as QuestionType } from '../../types';
import MDText from '../../components/markdown/MDText';
import MDHint from '../ReflectView/MDHint';
import ReflectionChatEntries from '../ReflectView/ReflectionChatEntries';
import { useTranslation } from 'react-i18next';
import { getSubmitShortcut } from '../../tools/Oshelper';
import ChatSummaryTabs from '../shared/ChatSummaryTabs';
import { useSaveOnUnmount } from '../shared/useSaveOnUnmount';

export default function Question({}: {}) {
  const { domainId, questionId } = useParams<{ domainId: string; questionId: string }>();

  if (!domainId || !questionId) {
    return null;
  }

  // keep for potential future use
  // const domain = useMemo(() => domains[domainId], [domainId]);

  const toDomain = useNavigateTo(`/domains/${encodeURIComponent(domainId)}`);

  return <QuestionSessionLoader domainId={domainId} questionId={questionId} toDomain={toDomain} />;
}

function QuestionSessionLoader({
  domainId,
  questionId,
  toDomain,
}: {
  domainId: string;
  questionId: string;
  toDomain: () => void;
}) {
  const { t } = useTranslation('common');
  const [domainSession, setDomainSession] = useState<DomainSession | null>(null);
  const [promptState, setPromptState] = useState<'idle' | 'processing' | 'initializing'>(
    'initializing',
  );
  const [question, setQuestion] = useState<QuestionType | null>(null);

  useEffect(() => {
    const session = new DomainSession(domainId, questionId);
    session.subscribeQuestionState((q, p) => {
      setQuestion(q);
      setPromptState(p);
    });
    session.sessionInitialized.then(() => {
      setQuestion(session.question);
      setDomainSession(session);
      setPromptState('idle');
    });
    return () => {
      session.destroy();
    };
  }, [domainId, questionId]);

  if (promptState === 'initializing' || !domainSession || !question) {
    return (
      <Flex gap={2} align="center">
        <Text fontSize="sm" color="gray.500">
          {t('question.initializing')}
        </Text>
        <Spinner />
      </Flex>
    );
  }

  return (
    <QuestionView
      domainSession={domainSession}
      question={question}
      promptState={promptState}
      toDomain={toDomain}
    />
  );
}

function QuestionView({
  domainSession,
  question,
  promptState,
  toDomain,
}: {
  domainSession: DomainSession;
  question: QuestionType;
  promptState: 'idle' | 'processing';
  toDomain: () => void;
}) {
  const { t } = useTranslation('common');
  const inputRef = useRef<string>(domainSession.question?.unsubmittedText || '');
  const [isInputEmpty, setIsInputEmpty] = useState<boolean>(
    !(inputRef.current && inputRef.current.trim().length > 0),
  );
  const [abort, setAbort] = useState<() => void>(() => {});
  const skippedSaveOnUnmountRef = useRef<boolean>(false);
  const [isSummarizeDialogOpen, setSummarizeDialogOpen] = useState(false);

  const displayTabs = question.summary || domainSession.summarizing;
  const [activeTab, setActiveTab] = useState<'chat' | 'summary'>('chat');

  useSaveOnUnmount(
    skippedSaveOnUnmountRef,
    () => inputRef.current,
    () => !!domainSession?.question && domainSession.question.entries.length > 1,
    (text) => domainSession.saveUnsubmittedText(text),
  );

  const submit = useCallback(() => {
    const input = inputRef.current;
    try {
      const doAbort = domainSession.userSubmit(input);
      inputRef.current = '';
      setIsInputEmpty(true);
      setAbort(() => () => {
        doAbort();
        setAbort(() => () => {});
        inputRef.current = input;
        setIsInputEmpty(input.trim().length === 0);
      });
    } catch {}
  }, [domainSession]);

  const finishAndSummarize = useCallback(async () => {
    try {
      setSummarizeDialogOpen(true);
      await domainSession.summarize();
      domainSession.setFinished(true);
      setActiveTab('summary');
    } catch {
    } finally {
      setSummarizeDialogOpen(false);
    }
  }, [domainSession]);

  const chatContent = (
    <VStack gap={4} align="stretch">
      <ReflectionChatEntries entries={question.entries} />
      <MDHint />
    </VStack>
  );

  const isBusy = promptState === 'processing' || domainSession.summarizing;
  const hasUserEntry = question.entries.some((e) => e.type === 'user');

  const chatInput = (
    <VStack gap={3} align="stretch" pt={2} pb={6}>
      <MDText
        placeholder="Write your thoughts..."
        value={inputRef.current}
        onChange={(md) => {
          inputRef.current = md;
          setIsInputEmpty(md.trim().length === 0);
        }}
        onSubmit={submit}
        minH="120px"
      />
      {promptState === 'processing' ? (
        <Flex gap={2} align="center">
          <Text fontSize="sm" color="gray.500">
            {t('question.thinking')}
          </Text>
          <Button onClick={abort}>{t('question.abort')}</Button>
        </Flex>
      ) : (
        <Flex align="center" justify="space-between">
          <Button colorScheme="blue" onClick={submit} disabled={isInputEmpty || isBusy}>
            {t('question.goDeeper')} ({getSubmitShortcut()})
          </Button>
          <Button variant="outline" onClick={finishAndSummarize} disabled={isBusy || !hasUserEntry}>
            {t('question.finishAndSummarize')}
          </Button>
        </Flex>
      )}
    </VStack>
  );

  return (
    <VStack
      gap={4}
      align="stretch"
      h="calc(100dvh - 32px)"
      maxH="calc(100dvh - 32px)"
      overflow="hidden"
    >
      <HStack align="center" gap={2}>
        <IconButton aria-label={t('nav.back')} variant="ghost" onClick={toDomain}>
          ←
        </IconButton>
        <Heading size="lg" lineClamp={1}>
          {question.title || ''}
        </Heading>
      </HStack>

      {displayTabs ? (
        <ChatSummaryTabs
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          chatContent={chatContent}
          chatInput={chatInput}
          summaryValue={question.summary || ''}
          onSummaryBlur={(summary) => {
            domainSession.saveSummary(summary);
          }}
        />
      ) : (
        <VStack gap={3} align="stretch" flex="1" overflow="hidden">
          <Box flex="0 1 auto" overflowY="auto">
            {chatContent}
          </Box>
          {chatInput}
        </VStack>
      )}
      <Dialog.Root
        open={isSummarizeDialogOpen}
        onOpenChange={(e) => setSummarizeDialogOpen(e.open)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header fontSize="lg" fontWeight="bold">
              {t('question.summarizing.title')}
            </Dialog.Header>
            <Dialog.Body>{t('question.summarizing.body')}</Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={() => {
                  domainSession.abortSummarize();
                  setSummarizeDialogOpen(false);
                }}
              >
                {t('question.abort')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </VStack>
  );
}
