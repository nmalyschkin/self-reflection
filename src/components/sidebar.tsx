import { useEffect } from 'react';
import { Box, VStack, Button, Heading, Link } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (open) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      {open && (
        <Box position="fixed" inset={0} bg="blackAlpha.400" zIndex={900} onClick={onClose} />
      )}
      <Box
        position="fixed"
        top={0}
        left={0}
        h="100dvh"
        w="260px"
        bg="white"
        borderRightWidth="1px"
        zIndex={1000}
        transform={open ? 'translateX(0)' : 'translateX(-100%)'}
        transition="transform 0.18s ease-out"
        p={4}
      >
        <VStack align="stretch" gap={3} h="full">
          <Heading size="md">Self Reflection</Heading>
          <Box role="separator" h="1px" bg="gray.200" />
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              navigate('/');
            }}
          >
            Home
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              onClose();
              navigate('/reflect');
            }}
          >
            New reflection
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              onClose();
              navigate('/domains');
            }}
          >
            Domains
          </Button>

          <Box flex="1" />
          <VStack align="stretch" gap={2}>
            <Link href="https://forms.gle/b5BS5VPmf35L71Wx7" target="_blank" color="gray.500">
              Feedback
            </Link>
            {import.meta.env.DEV ? (
              <Link
                color="gray.500"
                onClick={() => {
                  onClose();
                  navigate('/debug/summarizer');
                }}
              >
                Summarizer (debug)
              </Link>
            ) : null}
            <Link
              color="gray.500"
              onClick={() => {
                onClose();
                navigate('/about');
              }}
            >
              About this app
            </Link>
          </VStack>
        </VStack>
      </Box>
    </>
  );
}
