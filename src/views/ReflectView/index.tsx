import type { Reflection } from '../../types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Menu, Portal, Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import MDText from '../../components/MDText';
import MDRender from '../../components/MDRender';
import ReflectionSession from '../../state/ReflectionSession';
import useHint from './useHint';
import ReflectionHeaderBar from './reflectionHeaderBar';
import useNavigateTo from '../../hooks/useNavigateTo';

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
  const { showMdHint, dismissMdHint } = useHint();
  const inputRef = useRef<string>(reflectionSession.reflection?.unsubmittedText || '');
  const [isInputEmpty, setIsInputEmpty] = useState<boolean>(
    !(inputRef.current && inputRef.current.trim().length > 0),
  );

  const goBack = useNavigateTo('/');

  // Save unsubmitted text when the component unmounts
  useEffect(() => {
    return () => {
      const input = inputRef.current;
      if (
        reflectionSession &&
        reflectionSession.reflection &&
        (input || reflectionSession.reflection.entries.length > 0)
      ) {
        reflectionSession.saveUnsubmittedText(input);
      }
    };
  }, [inputRef]);

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

  return (
    <VStack gap={4} align="stretch">
      <ReflectionHeaderBar
        reflectionSession={reflectionSession}
        reflection={reflection}
        goBack={goBack}
      />

      <VStack gap={3} align="stretch">
        {reflection.entries.map((e, i) => (
          <Box
            key={e.createdAt + i}
            rounded="md"
            p={3}
            bg={e.type === 'user' ? 'blue.50' : 'green.50'}
          >
            <MDRender markdown={e.text} />
          </Box>
        ))}
      </VStack>

      {showMdHint && (
        <Flex
          align="center"
          justify="space-between"
          gap={2}
          p={2}
          borderWidth="1px"
          borderColor="yellow.200"
          bg="yellow.50"
          rounded="md"
        >
          <Text fontSize="xs" color="yellow.900">
            We support Markdown
          </Text>
          <Button size="xs" variant="ghost" onClick={dismissMdHint}>
            Dismiss
          </Button>
        </Flex>
      )}

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
        <Flex gap={2}>
          <Button colorScheme="blue" onClick={submitReflectionStatement} disabled={isInputEmpty}>
            Deeper reflection (⌘+↵)
          </Button>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="outline" size="sm">
                Tools
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item
                    value="summary-of-all-entries"
                    disabled={reflection?.entries.length === 0}
                    onClick={() => {
                      console.log('summarizing reflection', reflection);
                      reflectionSession?.summarize();
                    }}
                  >
                    Summary of all entries
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
          <Button variant="outline" onClick={goBack}>
            Save
          </Button>
        </Flex>
      )}
    </VStack>
  );
}
