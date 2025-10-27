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
  Tabs,
} from '@chakra-ui/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import useNavigateTo from '../../hooks/useNavigateTo';
import { useParams } from 'react-router-dom';
import DomainSession from '../../state/DomainSession';
import type { Question as QuestionType } from '../../types';
import MDText from '../../components/markdown/MDText';
import MDHint from '../ReflectView/MDHint';
import ReflectionChatEntries from '../ReflectView/ReflectionChatEntries';

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
          Initializing session...
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
  const inputRef = useRef<string>(domainSession.question?.unsubmittedText || '');
  const [isInputEmpty, setIsInputEmpty] = useState<boolean>(
    !(inputRef.current && inputRef.current.trim().length > 0),
  );
  const [abort, setAbort] = useState<() => void>(() => {});
  const skippedSaveOnUnmountRef = useRef<boolean>(false);

  const displayTabs = question.summary || domainSession.summarizing;
  const [activeTab, setActiveTab] = useState<'chat' | 'summary'>('chat');

  useEffect(() => {
    return () => {
      if (skippedSaveOnUnmountRef.current) {
        return;
      }
      const input = inputRef.current;
      if (
        domainSession &&
        domainSession.question &&
        (input || domainSession.question.entries.length > 1)
      ) {
        domainSession.saveUnsubmittedText(input);
      }
    };
  }, []);

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
      await domainSession.summarize();
      domainSession.setFinished(true);
      setActiveTab('summary');
    } catch {}
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
            Thinking...
          </Text>
          <Button onClick={abort}>Abort</Button>
        </Flex>
      ) : (
        <Flex align="center" justify="space-between">
          <Button colorScheme="blue" onClick={submit} disabled={isInputEmpty || isBusy}>
            Go deeper (⌘+↵)
          </Button>
          <Button variant="outline" onClick={finishAndSummarize} disabled={isBusy || !hasUserEntry}>
            Finish & summarize
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
        <IconButton aria-label="Back" variant="ghost" onClick={toDomain}>
          ←
        </IconButton>
        <Heading size="lg" lineClamp={1}>
          {question.title || ''}
        </Heading>
      </HStack>

      {displayTabs ? (
        <VStack gap={3} align="stretch" flex="1" overflow="hidden">
          <Tabs.Root
            value={activeTab}
            onValueChange={(details) => setActiveTab(details.value as 'chat' | 'summary')}
            display="flex"
            flexDirection="column"
            flex="1"
            overflow="hidden"
          >
            <Tabs.List>
              <Tabs.Trigger value="chat">Chat</Tabs.Trigger>
              <Tabs.Trigger value="summary">Summary</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="chat" display="flex" flexDirection="column" flex="1" minH={0}>
              <Box flex="0 1 auto" overflowY="auto">
                {chatContent}
              </Box>
              {chatInput}
            </Tabs.Content>
            <Tabs.Content value="summary" display="flex" flexDirection="column" flex="1" minH={0}>
              <Box flex="1 1 auto" overflowY="auto">
                <MDText
                  value={question.summary || ''}
                  onBlur={(summary) => {
                    domainSession.saveSummary(summary);
                  }}
                />
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </VStack>
      ) : (
        <VStack gap={3} align="stretch" flex="1" overflow="hidden">
          <Box flex="0 1 auto" overflowY="auto">
            {chatContent}
          </Box>
          {chatInput}
        </VStack>
      )}
    </VStack>
  );
}
