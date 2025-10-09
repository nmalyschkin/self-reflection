import type { Reflections } from './types';

const STORAGE_KEY = 'self.reflections.v1';

export function readReflectionsFromStorage(): Reflections {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Reflections) : [];
  } catch {
    return [];
  }
}

export function writeReflectionsToStorage(reflections: Reflections): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reflections));
  } catch {
    // Intentionally ignore storage write errors to keep UI responsive
  }
}
