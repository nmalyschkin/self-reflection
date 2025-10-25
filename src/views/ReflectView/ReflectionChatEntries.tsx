import { Box, VStack } from '@chakra-ui/react';
import MDRender from '../../components/markdown/MDRender';
import type { Entry } from '../../types';

type Props = {
  entries: Entry[];
};

export default function ReflectionChatEntries({ entries }: Props) {
  return (
    <VStack gap={3} align="stretch">
      {entries.map((e, i) => (
        <Box
          key={e.createdAt + i}
          rounded="md"
          p={3}
          bg={e.type === 'user' ? 'blue.50' : 'green.50'}
          marginLeft={e.type === 'user' ? '48px' : '0'}
          marginRight={e.type === 'user' ? '0' : '48px'}
        >
          <MDRender markdown={e.text} />
        </Box>
      ))}
    </VStack>
  );
}
