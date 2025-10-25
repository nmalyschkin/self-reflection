import type { Reflection } from '../../types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Flex, Spinner, Text, VStack, Tabs, Box } from '@chakra-ui/react';
import MDText from '../../components/markdown/MDText';
import ReflectionSession from '../../state/ReflectionSession';
import ReflectionHeaderBar from './reflectionHeaderBar';
import useNavigateTo from '../../hooks/useNavigateTo';
import ReflectionActionBar from './ReflectionActionBar';
import MDHint from './MDHint';
import ReflectionChatEntries from './ReflectionChatEntries';

type Props = {
  reflectionId: string | null;
};

export default function ReflectionSessionLoader({ reflectionId }: Props) {
  const [reflectionSession, setReflectionSession] = useState<ReflectionSession | null>(null);
  const [promptState, setPromptState] = useState<'idle' | 'processing' | 'initializing'>(
    'initializing',
  );
  const [reflection, setReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    const reflectionSession = new ReflectionSession(reflectionId);
    reflectionSession.subscribeReflectioState((reflection, promptState) => {
      setReflection(reflection);
      setPromptState(promptState);
    });
    reflectionSession.sessionInitialized.then(() => {
      setReflection(reflectionSession.reflection);
      // window.debug = reflectionSession;
      setReflectionSession(reflectionSession);
      setPromptState('idle');
    });
    return () => {
      reflectionSession.destroy();
    };
  }, [reflectionId]);

  if (promptState === 'initializing' || !reflectionSession || !reflection) {
    return (
      <Flex gap={2}>
        <Text fontSize="sm" color="gray.500">
          Initializing AI session...
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
  const [abort, setAbort] = useState<() => void>(() => {});
  const inputRef = useRef<string>(reflectionSession.reflection?.unsubmittedText || '');
  const skippedSaveOnUnmountRef = useRef<boolean>(false);
  const [isInputEmpty, setIsInputEmpty] = useState<boolean>(
    !(inputRef.current && inputRef.current.trim().length > 0),
  );

  const displayTabs = reflection.summary || reflectionSession.summarizing;
  const [activeTab, setActiveTab] = useState<'chat' | 'summary'>('summary');

  const goBack = useNavigateTo('/');

  // Save unsubmitted text when the component unmounts
  useEffect(() => {
    return () => {
      if (skippedSaveOnUnmountRef.current) {
        return;
      }
      const input = inputRef.current;
      if (
        reflectionSession &&
        reflectionSession.reflection &&
        (input || reflectionSession.reflection.entries.length > 0)
      ) {
        reflectionSession.saveUnsubmittedText(input);
      }
    };
  }, []);

  const submitReflectionStatement = useCallback(() => {
    const input = inputRef.current;
    try {
      const abort = reflectionSession.userSubmit(input);
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
        placeholder="Write a reflection..."
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
            Thinking...
          </Text>
          <Button onClick={abort}>Abort</Button>
        </Flex>
      ) : (
        <Flex align="center" justify="space-between">
          <Button colorScheme="blue" onClick={submitReflectionStatement} disabled={isInputEmpty}>
            Deeper reflection (⌘+↵)
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
            {/* Chat tab: content grows with messages; scrolls only when needed; input sits just below */}
            <Tabs.Content value="chat" display="flex" flexDirection="column" flex="1" minH={0}>
              <Box flex="0 1 auto" overflowY="auto">
                {chatContent}
              </Box>
              {chatInput}
            </Tabs.Content>
            {/* Summary tab: make content scrollable if long */}
            <Tabs.Content value="summary" display="flex" flexDirection="column" flex="1" minH={0}>
              <Box flex="1 1 auto" overflowY="auto">
                <MDText
                  value={reflection.summary || ''}
                  onBlur={(summary) => {
                    reflectionSession.saveSummary(summary);
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
