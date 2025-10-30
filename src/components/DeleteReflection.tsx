import { Button, Dialog, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('common');
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
            {t('delete.title', { defaultValue: 'Delete reflection' })}
          </Dialog.Header>
          <Dialog.Body>
            {t('delete.body', { defaultValue: 'Are you sure? This action cannot be undone.' })}
          </Dialog.Body>
          <Dialog.Footer>
            <Button ref={cancelRef} onClick={closeDelete}>
              {t('delete.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
              {t('delete.confirm', { defaultValue: 'Delete' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
