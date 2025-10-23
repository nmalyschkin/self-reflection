import { ActionBar, Button, Menu, Portal, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import type { Reflection } from '../../types';
import ReflectionSession from '../../state/ReflectionSession';
import DeleteReflection from '../../components/DeleteReflection';

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
  const [open, setOpen] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const openDeleteRef = useRef<() => void>(() => {});
  const openDeleteStateRef = useRef<boolean>(false);

  const clearHideTimer = () => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearHideTimer();
    setOpen(true);
  };

  const handleMouseLeave = () => {
    // Don't auto-collapse while a dialog is open
    if (openDeleteStateRef.current) {
      return;
    }
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => setOpen(false), 2000);
  };

  useEffect(() => {
    return () => clearHideTimer();
  }, []);

  return (
    <>
      {/* Collapsed mini action bar with ellipsis */}
      {!open && (
        <ActionBar.Root open>
          <Portal>
            <ActionBar.Positioner>
              <ActionBar.Content
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                w="auto"
                mx="auto"
                rounded="md"
                px={3}
                py={1}
              >
                <Text fontSize="sm" color="gray.500">
                  •••
                </Text>
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
            <ActionBar.Content onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="outline" size="sm">
                    Tools
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item
                        value="summary-of-all-entries"
                        disabled={reflection?.entries.length === 0}
                        onClick={() => {
                          reflectionSession?.summarize();
                        }}
                      >
                        Summary of all entries
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
              <Button variant="outline" onClick={onSave}>
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearHideTimer();
                  setOpen(true);
                  openDeleteRef.current();
                }}
              >
                Delete
              </Button>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
      <DeleteReflection
        reflectionId={reflection.id}
        onFinishDelete={onDelete}
        openRef={openDeleteRef}
        openStateRef={openDeleteStateRef}
      />
    </>
  );
}
