import { VStack, Heading, HStack, IconButton } from '@chakra-ui/react';
import { domains } from '../../data/domains';
import { useMemo } from 'react';
import useNavigateTo from '../../hooks/useNavigateTo';
import { useParams } from 'react-router-dom';

export default function Question({}: {}) {
  const { domainId, questionId } = useParams<{ domainId: string; questionId: string }>();

  if (!domainId || !questionId) {
    return null;
  }

  const domain = useMemo(() => domains[domainId], [domainId]);
  const question = useMemo(
    () => domain.questions.find((q) => q.id === questionId),
    [domain, questionId],
  );

  const toDomain = useNavigateTo(`/domains/${encodeURIComponent(domainId)}`);

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="center" gap={2}>
        <IconButton aria-label="Back" variant="ghost" onClick={toDomain}>
          ←
        </IconButton>

        <Heading size="lg">{question?.shortDescription ?? question?.question}</Heading>
      </HStack>
    </VStack>
  );
}
