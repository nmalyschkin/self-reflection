import { Box, VStack } from '@chakra-ui/react';
import MDRender from '../../components/MDRender';
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
        >
          <MDRender markdown={e.text} />
        </Box>
      ))}
    </VStack>
  );
}
