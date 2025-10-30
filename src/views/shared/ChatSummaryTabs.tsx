import { Box, Tabs, VStack } from '@chakra-ui/react';
import MDText from '../../components/markdown/MDText';
import { useTranslation } from 'react-i18next';

export default function ChatSummaryTabs({
  activeTab,
  onActiveTabChange,
  chatContent,
  chatInput,
  summaryValue,
  onSummaryBlur,
}: {
  activeTab: 'chat' | 'summary';
  onActiveTabChange: (tab: 'chat' | 'summary') => void;
  chatContent: React.ReactNode;
  chatInput: React.ReactNode;
  summaryValue: string;
  onSummaryBlur: (summary: string) => void;
}) {
  const { t } = useTranslation('common');
  return (
    <VStack gap={3} align="stretch" flex="1" overflow="hidden">
      <Tabs.Root
        value={activeTab}
        onValueChange={(details) => onActiveTabChange(details.value as 'chat' | 'summary')}
        display="flex"
        flexDirection="column"
        flex="1"
        overflow="hidden"
      >
        <Tabs.List>
          <Tabs.Trigger value="chat">{t('question.tabs.chat')}</Tabs.Trigger>
          <Tabs.Trigger value="summary">{t('question.tabs.summary')}</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="chat" display="flex" flexDirection="column" flex="1" minH={0}>
          <Box flex="0 1 auto" overflowY="auto">
            {chatContent}
          </Box>
          {chatInput}
        </Tabs.Content>
        <Tabs.Content value="summary" display="flex" flexDirection="column" flex="1" minH={0}>
          <Box flex="1 1 auto" overflowY="auto">
            <MDText value={summaryValue} onBlur={onSummaryBlur} />
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </VStack>
  );
}
