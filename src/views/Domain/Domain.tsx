import { useMemo } from 'react';
import { Box, Heading, IconButton, SimpleGrid, Text, VStack, HStack } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { domains as domainsRecord } from '../../data/domains';

export default function Domain() {
  const navigate = useNavigate();
  const { id } = useParams();
  const domainId = id ? decodeURIComponent(id) : '';
  const domain = useMemo(() => domainsRecord[domainId], [domainId]);

  if (!domain) {
    return (
      <VStack align="stretch" gap={4}>
        <IconButton aria-label="Back" variant="ghost" onClick={() => navigate('/domains')}>
          ←
        </IconButton>
        <Heading size="md">Domain not found</Heading>
        <Text color="gray.600">The requested domain does not exist.</Text>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="center" gap={2}>
        <IconButton aria-label="Back" variant="ghost" onClick={() => navigate('/domains')}>
          ←
        </IconButton>
        <Heading size="lg" flex="1" minW={0}>
          {domain.name}
        </Heading>
        <Text color="gray.700" whiteSpace="pre-wrap">
          {domain.shortDescription}
        </Text>
      </HStack>

      <Box>
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
          {domain.questions.map((q, idx) => (
            <Box
              key={q.id}
              borderWidth="1px"
              rounded="md"
              p={4}
              minH="120px"
              role="button"
              onClick={() =>
                navigate(
                  `/domains/${encodeURIComponent(domainId)}/questions/${encodeURIComponent(q.id)}`,
                )
              }
              _hover={{ boxShadow: 'sm' }}
              _active={{ transform: 'translateY(1px)' }}
              cursor="pointer"
            >
              <VStack align="stretch" gap={2} h="full">
                <Text fontSize="xs" color="gray.500">
                  # {idx + 1}
                </Text>
                {q.shortDescription ? (
                  <Text fontSize="md">{q.shortDescription}</Text>
                ) : (
                  <Text fontSize="xs">{q.question}</Text>
                )}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
