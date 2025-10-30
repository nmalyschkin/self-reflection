import type { TFunction } from 'i18next';
import { domains as domainsStructure } from './domains';

export interface DomainI18n {
  name: string;
  description: string;
  shortDescription: string;
  id: string;
  questions: {
    id: string;
    question: string;
    shortDescription?: string;
  }[];
}

export function getLocalizedDomains(t: TFunction<'domains'>): DomainI18n[] {
  return Object.values(domainsStructure).map((d) => hydrateDomain(d.id, t));
}

export function getLocalizedDomain(
  domainId: string,
  t: TFunction<'domains'>,
): DomainI18n | undefined {
  if (!domainsStructure[domainId]) return undefined;
  return hydrateDomain(domainId, t);
}

function hydrateDomain(domainId: string, t: TFunction<'domains'>): DomainI18n {
  const d = domainsStructure[domainId];
  const base = `${domainId}` as const;
  return {
    id: domainId,
    name: t(`${base}.name`, { ns: 'domains' }),
    shortDescription: t(`${base}.shortDescription`, { ns: 'domains' }),
    description: t(`${base}.description`, { ns: 'domains' }),
    questions: d.questions.map((q) => ({
      id: q.id,
      shortDescription: t(`${base}.questions.${q.id}.shortDescription`, { ns: 'domains' }),
      question: t(`${base}.questions.${q.id}.question`, { ns: 'domains' }),
    })),
  } as DomainI18n;
}
