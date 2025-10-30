import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation('common');
  return (
    <Box>
      <VStack align="start" gap={3}>
        <Heading size="lg">{t('about.title')}</Heading>
        <Text>{t('about.body1')}</Text>
      </VStack>
      <VStack align="start" gap={3} mt={8}>
        <Heading size="lg">{t('about.mobile.title')}</Heading>
        <Text>{t('about.mobile.body')}</Text>
      </VStack>
    </Box>
  );
}
