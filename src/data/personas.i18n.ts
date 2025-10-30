import type { TFunction } from 'i18next';
import { PERSONAS, type Persona } from './personas';

export type LocalizedPersona = Omit<Persona, 'name' | 'description' | 'systemPreamble'> & {
  name: string;
  description: string;
  systemPreamble: string;
};

export function getLocalizedPersona(id: Persona['id'], t: TFunction<'personas'>): LocalizedPersona {
  const base = `${id}` as const;
  const p = PERSONAS[id];
  return {
    id: p.id,
    avatar: p.avatar,
    name: t(`${base}.name`, { ns: 'personas' }),
    description: t(`${base}.description`, { ns: 'personas' }),
    systemPreamble: t(`${base}.systemPreamble`, { ns: 'personas' }),
  };
}

export function listLocalizedPersonas(t: TFunction<'personas'>): LocalizedPersona[] {
  return Object.values(PERSONAS).map((p) => getLocalizedPersona(p.id, t));
}
