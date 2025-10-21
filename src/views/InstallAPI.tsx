import { Box, Link } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';

const InstallAPI = () => {
  return (
    <Box minH="100dvh" minW="100dvw" display="flex" alignItems="center" justifyContent="center">
      <Box position="relative" p={4} w="100%" maxW="2xl" mx="auto">
        <Text>This app is built with the experimental Chrome Prompt API</Text>
        <Text>Please activate the Prompt API in Chrome Flag:</Text>
        <Text fontSize="sm" color="gray.500">
          chrome://flags/#prompt-api-for-gemini-nano-multimodal-input
        </Text>
        <Link href="https://developer.chrome.com/docs/ai/built-in" target="_blank" color="blue.500">
          Learn more
        </Link>
      </Box>
    </Box>
  );
};

export default InstallAPI;
