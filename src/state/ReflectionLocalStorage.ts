import type { Reflection } from '../types';

export class ReflectionLocalStorage {
  static getReflection(reflectionId: string | null): Reflection {
    const reflection = reflectionId ? localStorage.getItem(reflectionId) : null;
    if (!reflection) {
      // create a new reflection
      const newReflection = {
        id: reflectionId || `reflection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        entries: [],
        createdAt: new Date().toISOString(),
      };
      //   this.setReflection(newReflection.id, newReflection);
      return newReflection;
    }
    return JSON.parse(reflection);
  }

  static getReflections(): Reflection[] {
    const reflectionIds = Object.keys(localStorage).filter((key) => key.startsWith('reflection-'));
    return reflectionIds.map((reflectionId) => this.getReflection(reflectionId));
  }

  static setReflection(reflectionId: string, reflection: Reflection) {
    localStorage.setItem(reflectionId, JSON.stringify(reflection));
  }
}
