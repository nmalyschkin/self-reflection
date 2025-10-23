import { Button } from '@chakra-ui/react';
import { Flex, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

function useHint() {
  const [showMdHint, setShowMdHint] = useState(false);

  useEffect(() => {
    try {
      const dismissed =
        typeof window !== 'undefined' &&
        window.localStorage.getItem('md_hint_dismissed') === 'true';
      setShowMdHint(!dismissed);
    } catch {
      setShowMdHint(true);
    }
  }, []);

  const dismissMdHint = useCallback(() => {
    try {
      window.localStorage.setItem('md_hint_dismissed', 'true');
    } catch {}
    setShowMdHint(false);
  }, []);

  return { showMdHint, dismissMdHint };
}

export default function MDHint() {
  const { showMdHint, dismissMdHint } = useHint();

  if (!showMdHint) return null;
  return (
    <Flex
      align="center"
      justify="space-between"
      gap={2}
      p={2}
      borderWidth="1px"
      borderColor="yellow.200"
      bg="yellow.50"
      rounded="md"
    >
      <Text fontSize="xs" color="yellow.900">
        We support Markdown
      </Text>
      <Button size="xs" variant="ghost" onClick={dismissMdHint}>
        Dismiss
      </Button>
    </Flex>
  );
}
