import { Box, VStack } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import MDRender from '../../components/markdown/MDRender';
import type { Entry } from '../../types';

type Props = {
  entries: Entry[];
};

export default function ReflectionChatEntries({ entries }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [entries.length]);

  return (
    <VStack gap={3} align="stretch">
      {entries.map((e, i) => (
        <Box
          key={e.createdAt + i}
          rounded="md"
          p={3}
          bg={e.type === 'user' ? 'blue.50' : 'green.50'}
          marginLeft={e.type === 'user' ? '12' : '0'}
          marginRight={e.type === 'user' ? '0' : '12'}
        >
          <MDRender markdown={e.text} />
        </Box>
      ))}
      <Box ref={bottomRef} />
    </VStack>
  );
}
