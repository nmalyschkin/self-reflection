import type { LMStatus, Reflection } from '../types';
import { useCallback, useEffect, useState } from 'react';
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
import MDText from '../components/MDText';
import MDRender from '../components/MDRender';
import ReflectionSession from '../state/ReflectionSession';
import { getPersona, listPersonas } from '../personas';

type Props = {
  reflectionId: string | null;
  lmStatus: LMStatus;
  onSave: () => void;
  onBack: () => void;
};

export default function ReflectView({ reflectionId, lmStatus, onBack }: Props) {
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [reflectionSession, setReflectionSession] = useState<ReflectionSession | null>(null);
  const [input, setInput] = useState('');
  const [promptState, setPromptState] = useState<'idle' | 'processing' | 'initializing'>(
    'initializing',
  );
  const [abort, setAbort] = useState<() => void>(() => {});
  const [showMdHint, setShowMdHint] = useState(false);

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
      setInput(reflectionSession.reflection?.unsubmittedText || '');
    });
    return () => {
      reflectionSession.destroy();
    };
  }, [reflectionId]);

  useEffect(() => {
    try {
      const dismissed =
        typeof window !== 'undefined' &&
        window.localStorage.getItem('md_hint_dismissed') === 'true';
      setShowMdHint(!dismissed);
    } catch {
      setShowMdHint(true);
    }
  }, []);

  const dismissMdHint = useCallback(() => {
    try {
      window.localStorage.setItem('md_hint_dismissed', 'true');
    } catch {}
    setShowMdHint(false);
  }, []);

  // useEffect(() => {
  //   return () => {
  //     if (
  //       reflectionSession &&
  //       reflectionSession.reflection &&
  //       (input || reflectionSession.reflection.entries.length > 0)
  //     ) {
  //       reflectionSession.saveUnsubmittedText(input);
  //     }
  //   };
  // }, []);

  const saveUnsubmittedText = useCallback(() => {
    if (
      reflectionSession &&
      reflectionSession.reflection &&
      (input || reflectionSession.reflection.entries.length > 0)
    ) {
      reflectionSession.saveUnsubmittedText(input);
    }
    onBack();
  }, [reflectionSession, input]);

  const submitReflectionStatement = useCallback(() => {
    if (!reflectionSession) return;
    try {
      const abort = reflectionSession.userSubmit(input);
      setInput('');
      setAbort(() => () => {
        abort();
        setAbort(() => () => {});
        setInput(input);
      });
    } catch (error) {
      // console.error('Error submitting reflection statement', error);
      // TODO: show error to the user
    }
  }, [reflectionSession, input]);

  if (promptState === 'initializing') {
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
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!reflectionSession?.canUpdatePersona}
                title={
                  !reflectionSession?.canUpdatePersona
                    ? 'Persona is locked after reflection starts'
                    : undefined
                }
              >
                {getPersona(reflection?.personaId).avatar} {getPersona(reflection?.personaId).name}
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  {listPersonas().map((p) => (
                    <Menu.Item
                      key={p.id}
                      value={p.id}
                      disabled={!reflectionSession?.canUpdatePersona}
                      onClick={() => {
                        if (reflectionSession?.canUpdatePersona) {
                          reflectionSession.setPersona(p.id);
                        }
                      }}
                    >
                      <Flex align="start" gap={2}>
                        <Box fontSize="lg" lineHeight={1} mt={0.5}>
                          {p.avatar}
                        </Box>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">
                            {p.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {p.description}
                          </Text>
                        </Box>
                      </Flex>
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
          <Button variant="plain" colorScheme="blue" onClick={saveUnsubmittedText}>
            Back
          </Button>
        </Flex>
      </Flex>

      <VStack gap={3} align="stretch">
        {reflection?.entries.map((e, i) => (
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
        value={input}
        onChange={(md) => setInput(md)}
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
          <Button
            colorScheme="blue"
            onClick={submitReflectionStatement}
            disabled={lmStatus !== 'available'}
          >
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
          <Button variant="outline" onClick={saveUnsubmittedText}>
            Save
          </Button>
        </Flex>
      )}
    </VStack>
  );
}
