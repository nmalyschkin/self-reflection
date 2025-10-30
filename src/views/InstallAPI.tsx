import { Box, Link } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const InstallAPI = () => {
  const { t } = useTranslation('common');
  return (
    <Box minH="100dvh" minW="100dvw" display="flex" alignItems="center" justifyContent="center">
      <Box position="relative" p={4} w="100%" maxW="2xl" mx="auto">
        <Text>{t('installApi.title')}</Text>
        <Text>{t('installApi.instruction')}</Text>
        <Text fontSize="sm" color="gray.500">
          {t('installApi.flagPath')}
        </Text>
        <Link href="https://developer.chrome.com/docs/ai/built-in" target="_blank" color="blue.500">
          {t('installApi.learnMore')}
        </Link>
      </Box>
    </Box>
  );
};

export default InstallAPI;
