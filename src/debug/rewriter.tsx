import { useCallback, useState } from 'react';
import type React from 'react';
import {
  Box,
  Button,
  Card,
  Field,
  Heading,
  Input,
  NativeSelect,
  Spinner,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import MDText from '../components/markdown/MDText';
import MDRender from '../components/markdown/MDRender';

type RewriterTone = 'more-formal' | 'as-is' | 'more-casual';
type RewriterFormat = 'markdown' | 'plain-text' | 'as-is';
type RewriterLength = 'shorter' | 'as-is' | 'longer';

export default function RewriterDebug() {
  const [sharedContext, setSharedContext] = useState<string>(
    'This is the user input from a self reflection dialogue. Rewrite it into a coherent self-reflection without loosing any orignal thoughts. Try to retain the wording used by the user.',
  );
  const [tone, setTone] = useState<RewriterTone>('as-is');
  const [format, setFormat] = useState<RewriterFormat>('markdown');
  const [length, setLength] = useState<RewriterLength>('shorter');
  const [markdownInput, setMarkdownInput] = useState<string>(
    '## Example\n\nRewrite this markdown to a different tone or length.',
  );
  const [additionalContext, setAdditionalContext] = useState<string>(
    'Audience: general. Keep meaning intact.',
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const onRun = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setResult('');
    try {
      const api: any = (window as any).Rewriter;
      if (!api) {
        throw new Error('Rewriter API not available in this browser.');
      }

      const options: any = {
        sharedContext,
        tone,
        format,
        length,
        expectedInputLanguages: ['en'],
        expectedContextLanguages: ['en'],
        outputLanguage: 'en',
      };

      // Availability check and potential download monitoring
      const availability = await api.availability();
      let rewriter: any;
      if (availability === 'available') {
        rewriter = await api.create(options);
      } else if (availability === 'after-download') {
        rewriter = await api.create(options);
        rewriter.addEventListener('downloadprogress', (e: any) => {
          // optionally reflect progress in UI/devtools
          console.debug('Rewriter download progress', e?.loaded, e?.total);
        });
      } else {
        throw new Error('Rewriter API is unavailable. Ensure flags and origin trial are enabled.');
      }

      const output: string = await rewriter.rewrite(markdownInput, {
        context: additionalContext,
      });
      setResult(output || '');
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setIsRunning(false);
    }
  }, [sharedContext, tone, format, length, markdownInput, additionalContext]);

  return (
    <Box p={6} maxW="960px" mx="auto" w="100%">
      <Heading size="lg" mb={2}>
        Rewriter (Built-in AI)
      </Heading>

      <Card.Root>
        <Card.Header>
          <Heading size="md">Options</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap={4}>
            <Field.Root w="100%">
              <Field.Label>Shared context</Field.Label>
              <Input
                value={sharedContext}
                onChange={(e) => setSharedContext(e.target.value)}
                placeholder="Shared context for all requests"
                w="100%"
              />
            </Field.Root>

            <Stack direction={{ base: 'column', md: 'row' }} gap={4}>
              <Field.Root flex="1" minW={0}>
                <Field.Label>Tone</Field.Label>
                <NativeSelect.Root w="100%">
                  <NativeSelect.Field
                    value={tone}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setTone(e.target.value as RewriterTone)
                    }
                  >
                    <option value="more-formal">more-formal</option>
                    <option value="as-is">as-is</option>
                    <option value="more-casual">more-casual</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>

              <Field.Root flex="1" minW={0}>
                <Field.Label>Format</Field.Label>
                <NativeSelect.Root w="100%">
                  <NativeSelect.Field
                    value={format}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormat(e.target.value as RewriterFormat)
                    }
                  >
                    <option value="markdown">markdown</option>
                    <option value="plain-text">plain-text</option>
                    <option value="as-is">as-is</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>

              <Field.Root flex="1" minW={0}>
                <Field.Label>Length</Field.Label>
                <NativeSelect.Root w="100%">
                  <NativeSelect.Field
                    value={length}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setLength(e.target.value as RewriterLength)
                    }
                  >
                    <option value="shorter">shorter</option>
                    <option value="as-is">as-is</option>
                    <option value="longer">longer</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
            </Stack>

            {/* All languages are statically set to English (en). */}
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root mt={4}>
        <Card.Header>
          <Heading size="md">Input</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap={4}>
            <Field.Root w="100%">
              <Field.Label>Markdown</Field.Label>
              <MDText value={markdownInput} onChange={setMarkdownInput} minH={220} />
            </Field.Root>
            <Field.Root w="100%">
              <Field.Label>Additional context (optional)</Field.Label>
              <Textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Audience, style, constraints, etc."
                rows={4}
                w="100%"
              />
            </Field.Root>
            <Box>
              <Button onClick={onRun} disabled={isRunning} colorScheme="blue">
                {isRunning ? 'Running…' : 'Run'}
              </Button>
              {isRunning && <Spinner size="sm" ml={3} />}
            </Box>
            {error && (
              <Text color="red.600" fontSize="sm">
                {error}
              </Text>
            )}
          </Stack>
        </Card.Body>
      </Card.Root>

      {result && (
        <Card.Root mt={4}>
          <Card.Header>
            <Heading size="md">Result</Heading>
          </Card.Header>
          <Card.Body>
            {format === 'markdown' ? (
              <MDRender markdown={result} minH={120} />
            ) : (
              <Box borderWidth="1px" rounded="md" p={3} whiteSpace="pre-wrap">
                {result}
              </Box>
            )}
          </Card.Body>
        </Card.Root>
      )}
    </Box>
  );
}
