import type { Reflection } from '../../types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Flex, Spinner, Text, VStack, Box } from '@chakra-ui/react';
import MDText from '../../components/markdown/MDText';
import ReflectionSession from '../../state/ReflectionSession';
import ReflectionHeaderBar from './reflectionHeaderBar';
import useNavigateTo from '../../hooks/useNavigateTo';
import ReflectionActionBar from './ReflectionActionBar';
import MDHint from './MDHint';
import ReflectionChatEntries from './ReflectionChatEntries';
import { useTranslation } from 'react-i18next';
import { getSubmitShortcut } from '../../tools/Oshelper';
import ChatSummaryTabs from '../shared/ChatSummaryTabs';
import { useSaveOnUnmount } from '../shared/useSaveOnUnmount';

type Props = {
  reflectionId: string | null;
};

export default function ReflectionSessionLoader({ reflectionId }: Props) {
  const { t } = useTranslation('common');
  const [reflectionSession, setReflectionSession] = useState<ReflectionSession | null>(null);
  const [promptState, setPromptState] = useState<'idle' | 'processing' | 'initializing'>(
    'initializing',
  );
  const [reflection, setReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    let cancelled = false;
    const session = new ReflectionSession(reflectionId);
    const unsubscribe = session.subscribeReflectionState((reflection, promptState) => {
      if (cancelled) return;
      setReflection(reflection);
      setPromptState(promptState);
    });
    session.sessionInitialized.then(() => {
      if (cancelled) {
        session.destroy();
        return;
      }
      setReflection(session.reflection);
      setReflectionSession(session);
      setPromptState('idle');
    });
    return () => {
      cancelled = true;
      try {
        unsubscribe?.();
      } finally {
        session.destroy();
      }
    };
  }, [reflectionId]);

  if (promptState === 'initializing' || !reflectionSession || !reflection) {
    return (
      <Flex gap={2}>
        <Text fontSize="sm" color="gray.500">
          {t('reflection.initializing')}
        </Text>
        <Spinner />
      </Flex>
    );
  }

  return (
    <ReflectView
      reflectionSession={reflectionSession}
      reflection={reflection}
      promptState={promptState}
    />
  );
}

function ReflectView({
  reflectionSession,
  reflection,
  promptState,
}: {
  reflectionSession: ReflectionSession;
  reflection: Reflection;
  promptState: 'idle' | 'processing';
}) {
  const { t } = useTranslation('common');
  const [abort, setAbort] = useState<() => void>(() => {});
  const inputRef = useRef<string>(reflectionSession.reflection?.unsubmittedText || '');
  const skippedSaveOnUnmountRef = useRef<boolean>(false);
  const [isInputEmpty, setIsInputEmpty] = useState<boolean>(
    !(inputRef.current && inputRef.current.trim().length > 0),
  );

  const displayTabs = reflection.summary || reflectionSession.summarizing;
  const [activeTab, setActiveTab] = useState<'chat' | 'summary'>(
    reflection.summary ? 'summary' : 'chat',
  );

  const goBack = useNavigateTo('/');

  // Save unsubmitted text when the component unmounts
  useSaveOnUnmount(
    skippedSaveOnUnmountRef,
    () => inputRef.current,
    () => !!reflectionSession?.reflection && reflectionSession.reflection.entries.length > 0,
    (text) => reflectionSession.saveUnsubmittedText(text),
  );

  const submitReflectionStatement = useCallback(async () => {
    const input = inputRef.current;
    try {
      const abort = await reflectionSession.userSubmit(input);
      inputRef.current = '';
      setIsInputEmpty(true);
      setAbort(() => () => {
        abort();
        setAbort(() => () => {});
        inputRef.current = input;
        setIsInputEmpty(input.trim().length === 0);
      });
    } catch (error) {
      // console.error('Error submitting reflection statement', error);
      // TODO: show error to the user
    }
  }, [inputRef]);

  // Scrollable chat content (messages + hint)
  const chatContent = (
    <VStack gap={4} align="stretch">
      <ReflectionChatEntries entries={reflection.entries} />
      <MDHint />
    </VStack>
  );

  // Persistent input/footer area
  const chatInput = (
    <VStack gap={3} align="stretch" pt={2} pb={6}>
      <MDText
        placeholder={t('reflection.placeholder')}
        value={inputRef.current}
        onChange={(md) => {
          inputRef.current = md;
          setIsInputEmpty(md.trim().length === 0);
        }}
        onSubmit={submitReflectionStatement}
        minH="120px"
      />
      {promptState === 'processing' ? (
        <Flex gap={2}>
          <Text fontSize="sm" color="gray.500">
            {t('question.thinking')}
          </Text>
          <Button onClick={abort}>{t('question.abort')}</Button>
        </Flex>
      ) : (
        <Flex align="center" justify="space-between">
          <Button colorScheme="blue" onClick={submitReflectionStatement} disabled={isInputEmpty}>
            {t('reflection.deeper')} ({getSubmitShortcut()})
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
      <ReflectionHeaderBar
        reflectionSession={reflectionSession}
        reflection={reflection}
        goBack={goBack}
      />
      {displayTabs ? (
        <ChatSummaryTabs
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          chatContent={chatContent}
          chatInput={chatInput}
          summaryValue={reflection.summary || ''}
          onSummaryBlur={(summary) => {
            reflectionSession.saveSummary(summary);
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
      <ReflectionActionBar
        onSave={goBack}
        onDelete={() => {
          skippedSaveOnUnmountRef.current = true;
          goBack();
        }}
        reflection={reflection}
        reflectionSession={reflectionSession}
      />
    </VStack>
  );
}
