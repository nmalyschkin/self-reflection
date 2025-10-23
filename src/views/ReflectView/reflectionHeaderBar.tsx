import {
  Box,
  Button,
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
        <Button variant="plain" colorScheme="blue" onClick={goBack}>
          Back
        </Button>
      </Flex>
    </Flex>
  );
}
