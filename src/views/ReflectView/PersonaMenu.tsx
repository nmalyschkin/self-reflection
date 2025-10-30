import { Box, Button, Menu, Portal, Text } from '@chakra-ui/react';
import { getPersona } from '../../data/personas';
import { Flex } from '@chakra-ui/react';
import type { PersonaId } from '../../types';
import { useEffect, useState } from 'react';
import type { Persona } from '../../data/personas';
import { listLocalizedPersonas, getLocalizedPersona } from '../../data/personas.i18n';
import { useTranslation } from 'react-i18next';

export default function PersonaMenu({
  canUpdatePersona,
  personaId,
  setPersonaId,
}: {
  canUpdatePersona: boolean;
  personaId: PersonaId | undefined;
  setPersonaId: (personaId: PersonaId) => void;
}) {
  const { t } = useTranslation('common');
  const [persona, setPersona] = useState<Persona | ReturnType<typeof getLocalizedPersona>>(
    getPersona(personaId),
  );
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
          title={!canUpdatePersona ? t('persona.locked') : undefined}
        >
          {persona.avatar} {getLocalizedPersona(persona.id, t as any).name}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {listLocalizedPersonas(t as any).map((p) => (
              <Menu.Item
                key={p.id}
                value={p.id}
                disabled={!canUpdatePersona}
                onClick={() => {
                  if (canUpdatePersona) {
                    setPersonaId(p.id as PersonaId);
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
