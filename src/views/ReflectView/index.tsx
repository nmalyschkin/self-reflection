import type { Reflection } from '../../types';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Menu,
  Portal,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
  EditableRoot,
  EditablePreview,
  EditableInput,
} from '@chakra-ui/react';
import MDText from '../../components/MDText';
import MDRender from '../../components/MDRender';
import ReflectionSession from '../../state/ReflectionSession';
import useHint from './useHint';
import PersonaMenu from './PersonaMenu';
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
  const ref = useRef<{ input: string; reflectionSession: ReflectionSession }>({
    input: reflectionSession.reflection?.unsubmittedText || '',
    reflectionSession,
  });

  const goBack = useNavigateTo('/');

  // Save unsubmitted text when the component unmounts
  useEffect(() => {
    return () => {
      const { input, reflectionSession } = ref.current;
      if (
        reflectionSession &&
        reflectionSession.reflection &&
        (input || reflectionSession.reflection.entries.length > 0)
      ) {
        reflectionSession.saveUnsubmittedText(input);
      }
    };
  }, [ref]);

  const submitReflectionStatement = useCallback(() => {
    const { input, reflectionSession } = ref.current;
    try {
      const abort = reflectionSession.userSubmit(input);
      ref.current.input = '';
      setAbort(() => () => {
        abort();
        setAbort(() => () => {});
        ref.current.input = input;
      });
    } catch (error) {
      // console.error('Error submitting reflection statement', error);
      // TODO: show error to the user
    }
  }, [ref]);

  return (
    <VStack gap={4} align="stretch">
      <Flex align="center" justify="space-between">
        <Box flex="1" minW={0}>
          <Heading>
            <EditableRoot
              key={(reflection?.id || 'new') + (reflection?.title || '')}
              defaultValue={reflection?.title || ''}
            >
              <EditablePreview fontSize="xl" fontWeight="bold" />
              <EditableInput
                onBlur={(e) => reflectionSession?.setTitle(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
              />
            </EditableRoot>
          </Heading>
        </Box>
        <Flex align="center" gap={2}>
          <PersonaMenu
            canUpdatePersona={reflectionSession?.canUpdatePersona}
            personaId={reflection?.personaId}
            setPersonaId={(personaId) => reflectionSession?.setPersona(personaId)}
          />
          <Button variant="plain" colorScheme="blue" onClick={goBack}>
            Back
          </Button>
        </Flex>
      </Flex>

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
        value={ref.current.input}
        onChange={(md) => (ref.current.input = md)}
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
          <Button colorScheme="blue" onClick={submitReflectionStatement}>
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
