import { useEffect, useState } from 'react';
import type { LMStatus, Reflection } from '../types';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import ReflectionIDB from '../state/ReflectionIDB';

type Props = {
  lmStatus: LMStatus;
  onOpen: (id: string) => void;
  onStartDownload?: () => void;
  downloadButton?: boolean;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function StartView({ lmStatus, onOpen, onStartDownload, downloadButton }: Props) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  useEffect(() => {
    (async () => {
      const reflections = await ReflectionIDB.getReflections();
      setReflections(reflections);
    })();
  }, []);
  return (
    <VStack align="stretch" gap={4}>
      <Heading size="lg">Self Reflection</Heading>
      <Button colorScheme="blue" onClick={() => onOpen('')}>
        Start reflecting
      </Button>
      {downloadButton && lmStatus === 'downloadable' && (
        <Button colorScheme="blue" onClick={onStartDownload}>
          Download model
        </Button>
      )}

      <Box mt={6}>
        <Heading size="md" mb={2}>
          History
        </Heading>
        {reflections.length === 0 ? (
          <Text fontSize="sm" color="gray.500">
            No reflections yet.
          </Text>
        ) : (
          <VStack align="stretch" gap={0}>
            {reflections.map((r) => {
              const firstLine = r.entries[0]?.text?.split('\n')[0] ?? '';
              return (
                <Box key={r.id} py={2}>
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    w="full"
                    onClick={() => onOpen(r.id)}
                  >
                    <Box textAlign="left" w="full">
                      <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                        {firstLine || '(no text)'}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(r.createdAt)}
                      </Text>
                    </Box>
                  </Button>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
