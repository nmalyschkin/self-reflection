import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function About() {
  return (
    <Box>
      <VStack align="start" gap={3}>
        <Heading size="lg">About this app</Heading>
        <Text>
          This app helps you capture reflections and insights, organized by session. It uses a
          simple, distraction-free interface so you can focus on your thoughts.
        </Text>
      </VStack>
    </Box>
  );
}
