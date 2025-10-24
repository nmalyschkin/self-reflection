import { Button, Dialog, useDisclosure } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import ReflectionIDB from '../state/ReflectionIDB';

export default function DeleteReflection({
  reflectionId,
  onFinishDelete,
  openRef,
  openStateRef,
}: {
  reflectionId?: string;
  onFinishDelete: () => void;
  openRef: React.RefObject<() => void>;
  openStateRef?: React.RefObject<boolean>;
}) {
  const [reflectionIdOverride, setReflectionIdOverride] = useState<string | null>(null);
  const {
    open: isDeleteOpen,
    onOpen: openDelete,
    onClose: closeDelete,
    setOpen: setDeleteOpen,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    openRef.current = (reflectionId?: string) => {
      if (reflectionId) {
        setReflectionIdOverride(reflectionId);
      }
      openDelete();
    };
  }, [openRef, openDelete]);

  useEffect(() => {
    if (openStateRef) {
      openStateRef.current = isDeleteOpen;
    }
  }, [isDeleteOpen, openStateRef]);

  async function confirmDelete() {
    try {
      if (!(reflectionIdOverride || reflectionId)) {
        throw new Error('No reflection ID provided');
      }
      await ReflectionIDB.deleteReflection(reflectionIdOverride || reflectionId!);
    } finally {
      closeDelete();
      onFinishDelete();
    }
  }
  return (
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
  );
}
