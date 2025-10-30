import { ActionBar, Button, Menu, Portal, Text, Dialog } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import type { Reflection } from '../../types';
import ReflectionSession from '../../state/ReflectionSession';
import DeleteReflection from '../../components/DeleteReflection';
import { useTranslation } from 'react-i18next';

export default function ReflectionActionBar({
  onSave,
  onDelete,
  reflection,
  reflectionSession,
}: {
  onSave: () => void;
  onDelete: () => void;
  reflection: Reflection;
  reflectionSession: ReflectionSession;
}) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const openDeleteRef = useRef<() => void>(() => {});
  const openDeleteStateRef = useRef<boolean>(false);
  const expandedContentRef = useRef<HTMLDivElement | null>(null);
  const menuOpenRef = useRef<boolean>(false);
  const [isSummarizeDialogOpen, setSummarizeDialogOpen] = useState(false);

  const handleExpandedBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (openDeleteStateRef.current || menuOpenRef.current || isSummarizeDialogOpen) {
      return;
    }
    if (!next || (expandedContentRef.current && !expandedContentRef.current.contains(next))) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Collapsed mini action bar with ellipsis */}
      {!open && (
        <ActionBar.Root open>
          <Portal>
            <ActionBar.Positioner>
              <ActionBar.Content w="auto" mx="auto" rounded="md" px={3} py={1}>
                <Button
                  variant="ghost"
                  size="xs"
                  aria-label={t('reflection.openActions')}
                  onClick={() => setOpen(true)}
                >
                  <Text fontSize="sm" color="gray.500">
                    •••
                  </Text>
                </Button>
              </ActionBar.Content>
            </ActionBar.Positioner>
          </Portal>
        </ActionBar.Root>
      )}

      <ActionBar.Root
        open={open}
        onOpenChange={(e) => {
          // Prevent ActionBar from closing while dialog is open
          if (openDeleteStateRef.current) {
            setOpen(true);
            return;
          }
          setOpen(e.open);
        }}
      >
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content ref={expandedContentRef} onBlur={handleExpandedBlur}>
              <Menu.Root
                onOpenChange={(e) => {
                  menuOpenRef.current = e.open;
                }}
              >
                <Menu.Trigger asChild>
                  <Button variant="outline" size="sm">
                    {t('reflection.summarize')}
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item
                        value="summary-long"
                        disabled={reflection?.entries.length === 0}
                        onClick={() => {
                          setSummarizeDialogOpen(true);
                          const p = reflectionSession?.summarize('long');
                          p.finally(() => setSummarizeDialogOpen(false));
                        }}
                      >
                        {t('reflection.summarizeLong')}
                      </Menu.Item>
                      <Menu.Item
                        value="summary-key-points"
                        disabled={reflection?.entries.length === 0}
                        onClick={() => {
                          setSummarizeDialogOpen(true);
                          const p = reflectionSession?.summarize('key-points');
                          p.finally(() => setSummarizeDialogOpen(false));
                        }}
                      >
                        {t('reflection.summarizeKeyPoints')}
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
              <Button variant="outline" onClick={onSave}>
                {t('reflection.save')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(true);
                  openDeleteRef.current();
                }}
              >
                {t('reflection.delete')}
              </Button>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
      <Dialog.Root
        open={isSummarizeDialogOpen}
        onOpenChange={(e) => setSummarizeDialogOpen(e.open)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header fontSize="lg" fontWeight="bold">
              {t('question.summarizing.title')}
            </Dialog.Header>
            <Dialog.Body>{t('question.summarizing.body')}</Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={() => {
                  reflectionSession?.abortSummarize();
                  setSummarizeDialogOpen(false);
                }}
              >
                {t('question.abort')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
      <DeleteReflection
        reflectionId={reflection.id}
        onFinishDelete={onDelete}
        openRef={openDeleteRef}
        openStateRef={openDeleteStateRef}
      />
    </>
  );
}
