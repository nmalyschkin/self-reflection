import {
  Box,
  IconButton,
  Flex,
  Heading,
  EditableRoot,
  EditablePreview,
  EditableInput,
} from '@chakra-ui/react';
import type { Reflection } from '../../types';
import ReflectionSession from '../../state/ReflectionSession';
import PersonaMenu from './PersonaMenu';

export default function ReflectionHeaderBar({
  reflectionSession,
  reflection,
  goBack,
}: {
  reflectionSession: ReflectionSession;
  reflection: Reflection;
  goBack: () => void;
}) {
  return (
    <Flex align="center" justify="space-between">
      <IconButton
        variant="plain"
        colorScheme="blue"
        onClick={goBack}
        aria-label="Back"
        borderRadius="full"
      >
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
          <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </IconButton>
      <Box flex="1" minW={0}>
        <Heading>
          <EditableRoot
            key={(reflection?.id || 'new') + (reflection?.title || '')}
            defaultValue={reflection?.title || ''}
          >
            <EditablePreview fontSize="xl" fontWeight="bold" />
            <EditableInput
              onBlur={(e) => reflectionSession?.setTitle(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
            />
          </EditableRoot>
        </Heading>
      </Box>
      <Flex align="center" gap={2}>
        <PersonaMenu
          canUpdatePersona={reflectionSession?.canUpdatePersona}
          personaId={reflection?.personaId}
          setPersonaId={(personaId) => reflectionSession?.setPersona(personaId)}
        />
      </Flex>
    </Flex>
  );
}
