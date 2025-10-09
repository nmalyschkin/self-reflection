import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Reflections, Reflection, Entry } from '../types';
import { readReflectionsFromStorage, writeReflectionsToStorage } from '../storage';

export function useReflections() {
  const [reflections, setReflections] = useState<Reflections>([]);

  useEffect(() => {
    setReflections(readReflectionsFromStorage());
  }, []);

  useEffect(() => {
    writeReflectionsToStorage(reflections);
  }, [reflections]);

  const addReflection = useCallback((reflection: Reflection) => {
    setReflections((prev) => [reflection, ...prev]);
  }, []);

  const getById = useCallback(
    (id: string) => reflections.find((r) => r.id === id) ?? null,
    [reflections],
  );

  const api = useMemo(
    () => ({ reflections, addReflection, setReflections, getById }),
    [reflections, addReflection, getById],
  );

  return api;
}

export function createReflection(entries: Entry[] = []): Reflection {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    entries,
    createdAt: new Date().toISOString(),
  };
}
