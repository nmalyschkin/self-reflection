import { Box, Button, Menu, Portal, Text } from '@chakra-ui/react';
import { getPersona, listPersonas } from '../../personas';
import { Flex } from '@chakra-ui/react';
import type { PersonaId } from '../../types';
import { useEffect, useState } from 'react';
import type { Persona } from '../../personas';

export default function PersonaMenu({
  canUpdatePersona,
  personaId,
  setPersonaId,
}: {
  canUpdatePersona: boolean;
  personaId: PersonaId | undefined;
  setPersonaId: (personaId: PersonaId) => void;
}) {
  const [persona, setPersona] = useState<Persona>(getPersona(personaId));
  useEffect(() => {
    setPersona(getPersona(personaId));
  }, [personaId]);
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!canUpdatePersona}
          title={!canUpdatePersona ? 'Persona is locked after reflection starts' : undefined}
        >
          {persona.avatar} {persona.name}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {listPersonas().map((p) => (
              <Menu.Item
                key={p.id}
                value={p.id}
                disabled={!canUpdatePersona}
                onClick={() => {
                  if (canUpdatePersona) {
                    setPersonaId(p.id);
                  }
                }}
              >
                <Flex align="start" gap={2}>
                  <Box fontSize="lg" lineHeight={1} mt={0.5}>
                    {p.avatar}
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">
                      {p.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {p.description}
                    </Text>
                  </Box>
                </Flex>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
