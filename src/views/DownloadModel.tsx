import { Box, Button, Heading, Text, Progress } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { LMStatus } from '../types';

type Props = {
  lmStatus: LMStatus;
  onStartDownload: () => void;
  progress: number | null;
};

export default function DownloadModel({ lmStatus, onStartDownload, progress }: Props) {
  const { t } = useTranslation('common');

  const percent =
    typeof progress === 'number'
      ? Math.max(0, Math.min(100, Math.round(progress <= 1 ? progress * 100 : progress)))
      : null;

  const isDownloading = lmStatus === 'downloading';
  const isDownloadable = lmStatus === 'downloadable';

  return (
    <Box minH="100dvh" minW="100dvw" display="flex" alignItems="center" justifyContent="center">
      <Box position="relative" p={4} w="100%" maxW="2xl" mx="auto">
        {isDownloadable && (
          <>
            <Heading size="lg" mb={4}>
              {t('app.modelReady')}
            </Heading>
            <Button
              onClick={onStartDownload}
              bg="black"
              color="white"
              _hover={{ bg: 'gray.900' }}
              _active={{ bg: 'gray.800' }}
            >
              {t('start.downloadModel')}
            </Button>
          </>
        )}

        {isDownloading && (
          <>
            <Heading size="lg" mb={3}>
              {percent !== null
                ? t('app.downloading', { pct: percent })
                : t('app.downloading', { pct: '' })}
            </Heading>
            <Progress.Root
              value={typeof percent === 'number' ? percent : undefined}
              size="lg"
              shape="rounded"
            >
              <Progress.Track bg="gray.200">
                <Progress.Range bg="black" />
              </Progress.Track>
            </Progress.Root>
            {percent !== null && (
              <Text mt={2} fontSize="sm" color="gray.600">
                {percent}%
              </Text>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
