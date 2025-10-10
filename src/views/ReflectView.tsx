import type { LMStatus, Reflection } from '../types';
import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Spinner, Text, Textarea, VStack } from '@chakra-ui/react';
import ReflectionSession from '../state/ReflectionSession';

type Props = {
  reflectionId: string | null;
  lmStatus: LMStatus;
  onSave: () => void;
  onBack: () => void;
};

export default function ReflectView({ reflectionId, lmStatus, onSave, onBack }: Props) {
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [reflectionSession, setReflectionSession] = useState<ReflectionSession | null>(null);
  const [input, setInput] = useState('');
  const [promptState, setPromptState] = useState<'idle' | 'processing' | 'initializing'>(
    'initializing',
  );
  const [abort, setAbort] = useState<() => void>(() => {});

  useEffect(() => {
    const reflectionSession = new ReflectionSession(reflectionId);
    reflectionSession.subscribeReflectioState((reflection, promptState) => {
      setReflection(reflection);
      setPromptState(promptState);
    });
    reflectionSession.sessionInitialized.then(() => {
      setReflection(reflectionSession.reflection);
      setReflectionSession(reflectionSession);
      setPromptState('idle');
    });
    return () => {
      reflectionSession.destroy();
    };
  }, [reflectionId]);

  const submitReflectionStatement = useCallback(() => {
    if (!reflectionSession) return;
    const abort = reflectionSession.userSubmit(input);
    setInput('');
    setAbort(() => () => {
      abort();
      setAbort(() => () => {});
      setInput(input);
    });
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
        <Heading size="lg">{reflection?.title || 'Reflection'}</Heading>
        <Button variant="plain" colorScheme="blue" onClick={onBack}>
          Back
        </Button>
      </Flex>

      <VStack gap={3} align="stretch">
        {reflection?.entries.map((e, i) => (
          <Box
            key={e.createdAt + i}
            rounded="md"
            p={3}
            fontSize="sm"
            bg={e.type === 'user' ? 'blue.50' : 'green.50'}
          >
            {e.text}
          </Box>
        ))}
      </VStack>

      <Textarea
        placeholder="Write a reflection..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            e.preventDefault();
            submitReflectionStatement();
          }
        }}
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
          <Button variant="outline" onClick={onSave}>
            Save
          </Button>
        </Flex>
      )}
    </VStack>
  );
}
