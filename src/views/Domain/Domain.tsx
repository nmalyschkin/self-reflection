import { useEffect, useMemo, useState } from 'react';
import { Box, Heading, IconButton, SimpleGrid, Text, VStack, HStack } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { domains as domainsRecord } from '../../data/domains';
import DomainIDB from '../../state/DomainIDB';

type DomainType = (typeof domainsRecord)[keyof typeof domainsRecord];
type QuestionMeta = DomainType['questions'][number];

export default function Domain() {
  const navigate = useNavigate();
  const { id } = useParams();
  const domainId = id ? decodeURIComponent(id) : '';
  const domain = useMemo(() => domainsRecord[domainId], [domainId]);
  const [finishedById, setFinishedById] = useState<Record<string, boolean>>({});
  const [headlineById, setHeadlineById] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (!domainId) return;
    DomainIDB.getQuestions(domainId).then((questions) => {
      const finishedMap: Record<string, boolean> = {};
      const headlineMap: Record<string, string | undefined> = {};
      for (const q of questions) {
        finishedMap[q.id] = !!q.finished;
        if (q.headline && q.headline.trim().length > 0) {
          headlineMap[q.id] = q.headline;
        }
      }
      setFinishedById(finishedMap);
      setHeadlineById(headlineMap);
    });
  }, [domainId]);

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

  const nextUnfinished: QuestionMeta | undefined = useMemo(() => {
    if (!domain) return undefined;
    return domain.questions.find((q) => !finishedById[q.id]);
  }, [domain, finishedById]);

  const visibleQuestions: QuestionMeta[] = useMemo(() => {
    if (!domain) return [] as QuestionMeta[];
    // Show all finished questions, plus only the next unfinished question
    return domain.questions.filter((q) => finishedById[q.id] || q.id === nextUnfinished?.id);
  }, [domain, finishedById, nextUnfinished]);

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
          {visibleQuestions.map((q: QuestionMeta, idx: number) => {
            const isFinished = !!finishedById[q.id];
            const headline = headlineById[q.id];
            const showHeadlineOnly = isFinished && !!headline;
            return (
              <Box
                key={q.id}
                borderWidth="1px"
                borderColor={finishedById[q.id] ? 'green.300' : undefined}
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
                  <HStack justify="space-between" align="center">
                    {!showHeadlineOnly ? (
                      <Text fontSize="xs" color="gray.500">
                        # {idx + 1}
                      </Text>
                    ) : (
                      <span />
                    )}
                  </HStack>
                  {showHeadlineOnly ? (
                    <Text fontSize="md">{headline}</Text>
                  ) : q.shortDescription ? (
                    <Text fontSize="md">{q.shortDescription}</Text>
                  ) : (
                    <Text fontSize="xs">{q.question}</Text>
                  )}
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
