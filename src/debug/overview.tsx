import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Code,
  SimpleGrid,
  Card,
  Separator,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import DomainIDB from '../state/DomainIDB';
import ReflectionIDB from '../state/ReflectionIDB';
import { domains as domainsRecord } from '../data/domains';

type DomainProgress = Record<string, number>;

export default function DebugOverview() {
  const [domainProgress, setDomainProgress] = useState<DomainProgress | null>(null);
  const [reflectionsCount, setReflectionsCount] = useState<number>(0);
  const [busy, setBusy] = useState<boolean>(false);

  const domains = useMemo(() => Object.entries(domainsRecord), []);

  useEffect(() => {
    (async () => {
      try {
        const [progress, reflections] = await Promise.all([
          DomainIDB.getAllDomainProgress(),
          ReflectionIDB.getReflections(),
        ]);
        setDomainProgress(progress);
        setReflectionsCount(reflections.length);
      } catch (e) {
        console.error('Failed to load debug data', e);
      }
    })();
  }, []);

  async function clearDb(dbName: string) {
    setBusy(true);
    try {
      await new Promise<void>((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase(dbName);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
        deleteRequest.onblocked = () => resolve();
      });
      // refresh stats
      const [progress, reflections] = await Promise.all([
        DomainIDB.getAllDomainProgress().catch(() => null),
        ReflectionIDB.getReflections().catch(() => []),
      ]);
      setDomainProgress(progress);
      setReflectionsCount(reflections.length);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box p={6} maxW="960px" mx="auto" w="100%">
      <Heading size="lg" mb={2}>
        Debug Tools
      </Heading>
      <Text color="fg.muted" mb={6}>
        Dev-only utilities to inspect and reset local data.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Card.Root>
          <Card.Header>
            <Heading size="md">Storage</Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap={3}>
              <Button variant="solid" onClick={() => clearDb('reflections')} disabled={busy}>
                Clear reflections DB
              </Button>
              <Button variant="solid" onClick={() => clearDb('domains')} disabled={busy}>
                Clear domains DB
              </Button>
              <Separator />
              <Text>
                <b>Reflections</b>: {reflectionsCount}
              </Text>
              <Text>
                <b>Domains DB version</b>: 2
              </Text>
              <Text>
                <b>Reflections DB version</b>: 1
              </Text>
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">Navigation</Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap={3}>
              <Button asChild variant="outline">
                <Link to="/">Go to Start</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/domains">All Domains</Link>
              </Button>
              <Text fontSize="sm" color="fg.muted">
                Use the menu to access reflection views.
              </Text>
            </Stack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Card.Root mt={4}>
        <Card.Header>
          <Heading size="md">Domain Progress</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap={2}>
            {domainProgress ? (
              domains.map(([domainId, meta]) => (
                <Box key={domainId} display="flex" justifyContent="space-between">
                  <Text>{meta.name}</Text>
                  <Code>
                    {typeof domainProgress[domainId] === 'number'
                      ? `${domainProgress[domainId]}%`
                      : '—'}
                  </Code>
                </Box>
              ))
            ) : (
              <Text color="fg.muted">Loading…</Text>
            )}
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root mt={4}>
        <Card.Header>
          <Heading size="md">Env</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap={1} fontSize="sm">
            <Text>
              <b>MODE</b>: <Code>{import.meta.env.MODE}</Code>
            </Text>
            <Text>
              <b>DEV</b>: <Code>{String(import.meta.env.DEV)}</Code>
            </Text>
            <Text>
              <b>PROD</b>: <Code>{String(import.meta.env.PROD)}</Code>
            </Text>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
