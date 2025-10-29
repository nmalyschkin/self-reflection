import { useEffect, useState } from 'react';
import { Box, Button, Heading, Stack, Text, Code, Card, Separator } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import DomainIDB from '../state/DomainIDB';
import ReflectionIDB from '../state/ReflectionIDB';

export default function DebugOverview() {
  const [reflectionsCount, setReflectionsCount] = useState<number>(0);
  const [busy, setBusy] = useState<boolean>(false);
  const [reflectionsFile, setReflectionsFile] = useState<File | null>(null);
  const [domainsFile, setDomainsFile] = useState<File | null>(null);
  const [reflectionsStrategy, setReflectionsStrategy] = useState<'replace' | 'append' | 'merge'>(
    'append',
  );
  const [domainsStrategy, setDomainsStrategy] = useState<'replace' | 'append' | 'merge'>('append');

  useEffect(() => {
    refreshStats();
  }, []);

  async function refreshStats() {
    try {
      const reflections = await ReflectionIDB.getReflections().catch(() => []);
      setReflectionsCount(reflections.length);
    } catch (e) {
      console.error('Failed to load debug data', e);
    }
  }

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
      const reflections = await ReflectionIDB.getReflections().catch(() => []);
      setReflectionsCount(reflections.length);
    } finally {
      setBusy(false);
    }
  }

  async function handleExportReflections() {
    setBusy(true);
    try {
      const { filename, data } = await ReflectionIDB.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export reflections');
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleExportDomains() {
    setBusy(true);
    try {
      const { filename, data } = await DomainIDB.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export domains');
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function readJsonFile(file: File): Promise<unknown> {
    const text = await file.text();
    return JSON.parse(text);
  }

  async function handleImportReflections() {
    if (!reflectionsFile) {
      alert('Please choose a reflections JSON file');
      return;
    }
    setBusy(true);
    try {
      const json = await readJsonFile(reflectionsFile);
      const result = await ReflectionIDB.importData(json, reflectionsStrategy);
      await refreshStats();
      alert(
        `Reflections import completed. Imported: ${result.imported}, Replaced: ${result.replaced}, Skipped: ${result.skipped}`,
      );
      setReflectionsFile(null);
    } catch (e: any) {
      alert(`Failed to import reflections: ${e?.message || 'Unknown error'}`);
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleImportDomains() {
    if (!domainsFile) {
      alert('Please choose a domains JSON file');
      return;
    }
    setBusy(true);
    try {
      const json = await readJsonFile(domainsFile);
      const result = await DomainIDB.importData(json, domainsStrategy);
      await refreshStats();
      alert(
        `Domains import completed. Imported: ${result.imported}, Replaced: ${result.replaced}, Skipped: ${result.skipped}`,
      );
      setDomainsFile(null);
    } catch (e: any) {
      alert(`Failed to import domains: ${e?.message || 'Unknown error'}`);
      console.error(e);
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

      <Stack gap={4}>
        <Card.Root>
          <Card.Header>
            <Heading size="md">Debug Tools</Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap={3}>
              <Button asChild variant="outline">
                <Link to="/debug/persona">Persona Debug</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/debug/summarizer">Summarizer Debug</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/debug/rewriter">Rewriter Debug</Link>
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>

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
              <Heading size="sm">Export</Heading>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                gap={2}
                align="flex-start"
                flexWrap="wrap"
              >
                <Button variant="outline" onClick={handleExportReflections} disabled={busy}>
                  Export Reflections JSON
                </Button>
                <Button variant="outline" onClick={handleExportDomains} disabled={busy}>
                  Export Domains JSON
                </Button>
              </Stack>
              <Separator />
              <Heading size="sm">Import</Heading>
              <Stack gap={3}>
                <Box>
                  <Text mb={1}>
                    <b>Reflections</b>
                  </Text>
                  <Stack
                    direction={{ base: 'column', md: 'row' }}
                    gap={2}
                    align="flex-start"
                    flexWrap="wrap"
                  >
                    <input
                      type="file"
                      accept="application/json"
                      onChange={(e) =>
                        setReflectionsFile(
                          e.target.files && e.target.files[0] ? e.target.files[0] : null,
                        )
                      }
                      disabled={busy}
                    />
                    <select
                      value={reflectionsStrategy}
                      onChange={(e) =>
                        setReflectionsStrategy(e.target.value as 'replace' | 'append' | 'merge')
                      }
                      disabled={busy}
                    >
                      <option value="replace">Import & Replace</option>
                      <option value="append">Import & Append</option>
                      <option value="merge">Import & Merge</option>
                    </select>
                    <Button variant="solid" onClick={handleImportReflections} disabled={busy}>
                      Import Reflections
                    </Button>
                  </Stack>
                </Box>
                <Box>
                  <Text mb={1}>
                    <b>Domains</b>
                  </Text>
                  <Stack
                    direction={{ base: 'column', md: 'row' }}
                    gap={2}
                    align="flex-start"
                    flexWrap="wrap"
                  >
                    <input
                      type="file"
                      accept="application/json"
                      onChange={(e) =>
                        setDomainsFile(
                          e.target.files && e.target.files[0] ? e.target.files[0] : null,
                        )
                      }
                      disabled={busy}
                    />
                    <select
                      value={domainsStrategy}
                      onChange={(e) =>
                        setDomainsStrategy(e.target.value as 'replace' | 'append' | 'merge')
                      }
                      disabled={busy}
                    >
                      <option value="replace">Import & Replace</option>
                      <option value="append">Import & Append</option>
                      <option value="merge">Import & Merge</option>
                    </select>
                    <Button variant="solid" onClick={handleImportDomains} disabled={busy}>
                      Import Domains
                    </Button>
                  </Stack>
                </Box>
              </Stack>
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
      </Stack>

      <Card.Root mt={4}>
        <Card.Header>
          <Heading size="md">Env</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap={0} fontSize="sm">
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
