import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Field,
  Heading,
  Spinner,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import type { LanguageModelSession } from '../global';
import type { Entry } from '../types';
import MDText from '../components/markdown/MDText';
import MDRender from '../components/markdown/MDRender';
import { languageOptions } from '../language/languageSelection';

export default function PersonaDebug() {
  const [systemPreamble, setSystemPreamble] = useState<string>(
    'You are a helpful reflective coach. Ask one thoughtful follow-up question at a time. Be concise and compassionate.',
  );
  const [session, setSession] = useState<LanguageModelSession | null>(null);
  const sessionRef = useRef<LanguageModelSession | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [input, setInput] = useState<string>('');

  const responseConstraint = useMemo(() => ({ acknowledgement: 'string', question: 'string' }), []);

  const canStart = !!systemPreamble.trim() && !session && !isInitializing;
  const canSend = !!session && !isProcessing && !!input.trim();

  const destroySession = useCallback(() => {
    try {
      abortControllerRef.current?.abort();
    } catch {}
    abortControllerRef.current = null;
    try {
      sessionRef.current?.destroy?.();
    } catch {}
    sessionRef.current = null;
    setSession(null);
  }, []);

  useEffect(() => {
    return () => {
      destroySession();
    };
    // unmount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    setEntries([]);
    try {
      const initialPrompts = [
        {
          role: 'system' as const,
          content:
            `[Persona: Custom Debug] ${systemPreamble}\n` +
            'Respond with a JSON object: { "acknowledgement": string, "question": string }.',
          // 'The acknowledgement should reflect empathy and briefly reflect the user input. The question should be one concise follow-up question.',
        },
      ];
      const s = await window.LanguageModel.create({ initialPrompts, ...languageOptions() });
      sessionRef.current = s;
      setSession(s);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setIsInitializing(false);
    }
  }, [systemPreamble]);

  const send = useCallback(async () => {
    if (!session) return;
    const text = input;
    if (!text.trim()) return;
    setIsProcessing(true);
    setError(null);
    const createdAt = new Date().toISOString();
    setEntries((prev) => [...prev, { text, createdAt, type: 'user' }]);
    setInput('');

    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const response = await session.prompt(text, {
        responseConstraint,
        signal: controller.signal,
      } as any);
      let parsed: any = {};
      try {
        parsed = JSON.parse(response);
        if (Array.isArray(parsed)) parsed = parsed[0];
      } catch {
        parsed = { acknowledgement: '', question: response };
      }
      const ack = typeof parsed?.acknowledgement === 'string' ? parsed.acknowledgement : '';
      const question = typeof parsed?.question === 'string' ? parsed.question : String(response);
      const aiText = `${ack ? `${ack}\n\n` : ''}*${question.trim()}*`;
      setEntries((prev) => [
        ...prev,
        { text: aiText, createdAt: new Date().toISOString(), type: 'ai-question' },
      ]);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError(e?.message || String(e));
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [session, responseConstraint, input]);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort('User aborted');
  }, []);

  const reset = useCallback(() => {
    destroySession();
    setEntries([]);
    setError(null);
  }, [destroySession]);

  return (
    <Box p={6} maxW="960px" mx="auto" w="100%">
      <Heading size="lg" mb={2}>
        Persona (debug)
      </Heading>

      <Card.Root>
        <Card.Header>
          <Heading size="md">Configure persona</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap={4}>
            <Field.Root w="100%">
              <Field.Label>System preamble</Field.Label>
              <Textarea
                value={systemPreamble}
                onChange={(e) => setSystemPreamble(e.target.value)}
                rows={6}
                w="100%"
                placeholder="Describe how the assistant should behave..."
                disabled={!!session}
              />
            </Field.Root>
            <Stack direction="row" gap={3}>
              <Button onClick={startSession} disabled={!canStart} colorScheme="blue">
                {isInitializing ? 'Starting…' : 'Start testing persona'}
              </Button>
              {session && (
                <Button variant="outline" onClick={reset}>
                  Reset session
                </Button>
              )}
              {isInitializing && <Spinner size="sm" />}
            </Stack>
            {error && (
              <Text color="red.600" fontSize="sm">
                {error}
              </Text>
            )}
          </Stack>
        </Card.Body>
      </Card.Root>

      {session && (
        <Card.Root mt={4}>
          <Card.Header>
            <Heading size="md">Chat</Heading>
          </Card.Header>
          <Card.Body>
            <VStack align="stretch" gap={4}>
              <Box>
                <Field.Root>
                  <Field.Label>System preamble (for copy)</Field.Label>
                  <Box borderWidth="1px" rounded="md" p={3} bg="gray.50" whiteSpace="pre-wrap">
                    {systemPreamble}
                  </Box>
                </Field.Root>
              </Box>
              <VStack gap={3} align="stretch">
                {entries.map((e, i) => (
                  <Box
                    key={e.createdAt + i}
                    rounded="md"
                    p={3}
                    bg={e.type === 'user' ? 'blue.50' : 'green.50'}
                    marginLeft={e.type === 'user' ? '12' : '0'}
                    marginRight={e.type === 'user' ? '0' : '12'}
                  >
                    <MDRender markdown={e.text} />
                  </Box>
                ))}
              </VStack>
              <VStack gap={3} align="stretch">
                <MDText
                  placeholder="Say something to try this persona…"
                  value={input}
                  onChange={setInput}
                  onSubmit={send}
                  minH="120px"
                />
                {isProcessing ? (
                  <Stack direction="row" align="center" gap={2}>
                    <Text fontSize="sm" color="gray.500">
                      Thinking…
                    </Text>
                    <Button onClick={abort}>Abort</Button>
                  </Stack>
                ) : (
                  <Box>
                    <Button colorScheme="blue" onClick={send} disabled={!canSend}>
                      Send (⌘+↵)
                    </Button>
                  </Box>
                )}
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}
    </Box>
  );
}
