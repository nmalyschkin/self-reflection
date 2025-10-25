import { useEffect, useMemo, useState } from 'react';
import { Box, Heading, SimpleGrid, Text, VStack, HStack, Progress } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { domains as domainsRecord } from '../../data/domains';
import DomainIDB from '../../state/DomainIDB';

export default function Domains() {
  const navigate = useNavigate();
  const domains = useMemo(() => Object.values(domainsRecord), []);
  const [progresses, setProgresses] = useState<Record<string, number>>(
    Object.fromEntries(Object.keys(domainsRecord).map((domainId) => [domainId, 0])),
  );
  useEffect(() => {
    DomainIDB.getAllDomainProgress().then((progresses) => {
      setProgresses(progresses);
    });
  }, []);

  return (
    <VStack align="stretch" gap={4} w="full">
      {/* <Heading size="lg">Domains</Heading>
      <Text color="gray.600" fontSize="sm">
        Explore reflection domains. Tap a card to dive in. Progress is a placeholder for now.
      </Text> */}

      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
        {domains.map((d) => {
          const pct = progresses[d.id] || 0;
          return (
            <Box
              key={d.id}
              role="button"
              onClick={() => navigate(`/domains/${encodeURIComponent(d.id)}`)}
              borderWidth="1px"
              rounded="md"
              p={4}
              transition="box-shadow 0.12s ease, transform 0.06s ease"
              _hover={{ boxShadow: 'sm' }}
              _active={{ transform: 'translateY(1px)' }}
              cursor="pointer"
              display="flex"
              flexDirection="column"
              minH="180px"
            >
              <VStack align="stretch" gap={2} h="full">
                <HStack justify="space-between" align="center">
                  <Heading size="sm" lineClamp={1}>
                    {d.name}
                  </Heading>
                  {/* <Badge colorPalette="blue" variant="solid">
                    {answered}/{total}
                  </Badge> */}
                </HStack>
                <Text fontSize="sm" color="gray.600" lineClamp={3}>
                  {d.shortDescription}
                </Text>
                <Box mt="auto">
                  <Progress.Root value={pct} max={100} size="xs">
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                  <Text mt={1} fontSize="xs" color="gray.500">
                    {pct}% complete
                  </Text>
                </Box>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
}
