import { useCallback, useEffect, useRef, useState } from 'react';
import type { LMStatus, Reflection } from '../types';
import { Box, Button, Heading, Text, VStack, IconButton } from '@chakra-ui/react';
import ReflectionIDB from '../state/ReflectionIDB';
import { useNavigate } from 'react-router-dom';
import DeleteReflection from '../components/DeleteReflection';
import { useTranslation } from 'react-i18next';

type Props = {
  lmStatus: LMStatus;
  onStartDownload?: () => void;
  downloadButton?: boolean;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    month: '2-digit',
    day: 'numeric',
    year: '2-digit',
    localeMatcher: 'best fit',
  });
}

export default function StartView({ lmStatus, onStartDownload, downloadButton }: Props) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const { t } = useTranslation();

  const updateReflections = useCallback(() => {
    (async () => {
      const reflections = await ReflectionIDB.getReflections();
      setReflections(
        reflections.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    })();
  }, []);
  useEffect(() => {
    updateReflections();
  }, [updateReflections]);

  const openDeleteRef = useRef<(reflectionId?: string) => void>(() => {});

  const navigate = useNavigate();
  function openReflection(id: string) {
    const targetId = id && id.length > 0 ? id : crypto.randomUUID().slice(0, 8);
    navigate(`/reflect/${encodeURIComponent(targetId)}`);
  }

  return (
    <VStack align="stretch" gap={4}>
      <Heading size="lg">{t('app.title')}</Heading>
      <Button colorScheme="blue" onClick={() => openReflection('')}>
        {t('start.startReflecting')}
      </Button>
      {downloadButton && lmStatus === 'downloadable' && (
        <Button colorScheme="blue" onClick={onStartDownload}>
          {t('start.downloadModel')}
        </Button>
      )}

      <Box mt={6}>
        <Heading size="md" mb={2}>
          {' '}
          {t('start.history')}{' '}
        </Heading>
        {reflections.length === 0 ? (
          <Text fontSize="sm" color="gray.500">
            {t('start.emptyHistory')}
          </Text>
        ) : (
          <VStack align="stretch" gap={0}>
            {reflections.map((r) => {
              const firstLine = r.entries[0]?.text?.split('\n')[0] ?? '';
              return (
                <Box
                  key={r.id}
                  py={2}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  w="full"
                  className="group"
                >
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={() => openReflection(r.id)}
                    flex="1"
                    minW={0}
                  >
                    <Box textAlign="left" w="full">
                      <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                        {r.title || firstLine || t('start.draft')}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(r.createdAt)}
                      </Text>
                    </Box>
                  </Button>
                  <IconButton
                    aria-label={t('start.delete')}
                    variant="ghost"
                    colorScheme="red"
                    size="sm"
                    opacity={0}
                    pointerEvents="none"
                    transition="opacity 0.12s ease-in-out"
                    _groupHover={{ opacity: 1, pointerEvents: 'auto' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDeleteRef.current(r.id);
                    }}
                  >
                    x
                  </IconButton>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      <DeleteReflection openRef={openDeleteRef} onFinishDelete={updateReflections} />
    </VStack>
  );
}
