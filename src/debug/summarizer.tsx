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
import { languageOptionsRewriter } from '../language/languageSelection';

type SummaryType = 'key-points' | 'tldr' | 'teaser' | 'headline';
type SummaryFormat = 'markdown' | 'plain-text';
type SummaryLength = 'short' | 'medium' | 'long';

export default function SummarizerDebug() {
  const [sharedContext, setSharedContext] = useState<string>('This is a demo context.');
  const [summaryType, setSummaryType] = useState<SummaryType>('key-points');
  const [summaryFormat, setSummaryFormat] = useState<SummaryFormat>('markdown');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [markdownInput, setMarkdownInput] = useState<string>(
    '## Example\n\nAdd your markdown here.',
  );
  const [additionalContext, setAdditionalContext] = useState<string>(
    'This summary is for a tech-savvy audience.',
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const onRun = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setResult('');
    try {
      const api: any = (window as any).Summarizer;
      if (!api) {
        throw new Error('Summarizer API not available in this browser.');
      }

      const options: any = {
        sharedContext,
        type: summaryType,
        format: summaryFormat,
        length: summaryLength,
        ...languageOptionsRewriter(),
      };

      // Button click provides user activation
      if (!navigator.userActivation?.isActive) {
        // In rare cases, ensure we still proceed on click handlers
      }

      const summarizer = await api.create(options);
      const output: string = await summarizer.summarize(markdownInput, {
        context: additionalContext,
      });
      setResult(output || '');
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setIsRunning(false);
    }
  }, [sharedContext, summaryType, summaryFormat, summaryLength, markdownInput, additionalContext]);

  return (
    <Box p={6} maxW="960px" mx="auto" w="100%">
      <Heading size="lg" mb={2}>
        Summarizer (Built-in AI)
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
                <Field.Label>Type</Field.Label>
                <NativeSelect.Root w="100%">
                  <NativeSelect.Field
                    value={summaryType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSummaryType(e.target.value as SummaryType)
                    }
                  >
                    <option value="key-points">key-points</option>
                    <option value="tldr">tldr</option>
                    <option value="teaser">teaser</option>
                    <option value="headline">headline</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root flex="1" minW={0}>
                <Field.Label>Format</Field.Label>
                <NativeSelect.Root w="100%">
                  <NativeSelect.Field
                    value={summaryFormat}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSummaryFormat(e.target.value as SummaryFormat)
                    }
                  >
                    <option value="markdown">markdown</option>
                    <option value="plain-text">plain-text</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root flex="1" minW={0}>
                <Field.Label>Length</Field.Label>
                <NativeSelect.Root w="100%">
                  <NativeSelect.Field
                    value={summaryLength}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSummaryLength(e.target.value as SummaryLength)
                    }
                  >
                    <option value="short">short</option>
                    <option value="medium">medium</option>
                    <option value="long">long</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
            </Stack>
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
            {summaryFormat === 'markdown' ? (
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
