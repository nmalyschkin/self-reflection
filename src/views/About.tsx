import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function About() {
  return (
    <Box>
      <VStack align="start" gap={3}>
        <Heading size="lg">About this app</Heading>
        <Text>
          This app uses browser technologies to run completely locally and offline. We don't collect
          or store any data and all your AI interactions are run locally in your browser.
        </Text>
      </VStack>
      <VStack align="start" gap={3}>
        <Heading size="lg">Mobile compatibility</Heading>
        <Text>
          Since there is no mobile support for browser AI APIs, this app is not yet fully compatible
          with mobile devices.
        </Text>
      </VStack>
    </Box>
  );
}
