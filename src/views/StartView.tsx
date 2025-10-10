import { useEffect, useRef, useState } from 'react';
import type { LMStatus, Reflection } from '../types';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  IconButton,
  useDisclosure,
  Dialog,
} from '@chakra-ui/react';
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
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const {
    open: isDeleteOpen,
    onOpen: openDelete,
    onClose: closeDelete,
    setOpen: setDeleteOpen,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    (async () => {
      const reflections = await ReflectionIDB.getReflections();
      setReflections(reflections);
    })();
  }, []);

  async function confirmDelete() {
    if (!toDeleteId) return;
    await ReflectionIDB.deleteReflection(toDeleteId);
    setReflections((prev) => prev.filter((r) => r.id !== toDeleteId));
    setToDeleteId(null);
    closeDelete();
  }
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
                <Box
                  key={r.id}
                  py={2}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  w="full"
                  className="group"
                >
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={() => onOpen(r.id)}
                    flex="1"
                    minW={0}
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
                  <IconButton
                    aria-label="Delete reflection"
                    variant="ghost"
                    colorScheme="red"
                    size="sm"
                    opacity={0}
                    pointerEvents="none"
                    transition="opacity 0.12s ease-in-out"
                    _groupHover={{ opacity: 1, pointerEvents: 'auto' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setToDeleteId(r.id);
                      openDelete();
                    }}
                  >
                    x
                  </IconButton>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      <Dialog.Root open={isDeleteOpen} onOpenChange={(e) => setDeleteOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header fontSize="lg" fontWeight="bold">
              Delete reflection
            </Dialog.Header>
            <Dialog.Body>Are you sure? This action cannot be undone.</Dialog.Body>
            <Dialog.Footer>
              <Button ref={cancelRef} onClick={closeDelete}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </VStack>
  );
}
