import { openDB } from 'idb';
import type { Reflection } from '../types';
import { DEFAULT_PERSONA_ID } from '../personas';

const db = await openDB('reflections', 1, {
  upgrade(db) {
    db.createObjectStore('reflections');
  },
});

class ReflectionIDB {
  static async getReflection(reflectionId: string | null) {
    const reflection = reflectionId ? await db.get('reflections', reflectionId) : null;
    if (!reflection) {
      // create a new reflection
      const newReflection: Reflection = {
        id: reflectionId || `reflection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        entries: [],
        createdAt: new Date().toISOString(),
        personaId: DEFAULT_PERSONA_ID,
      };
      //   this.setReflection(newReflection.id, newReflection);
      return newReflection;
    }
    return reflection;
  }

  static async setReflection(reflectionId: string, reflection: Reflection) {
    return await db.put('reflections', reflection, reflectionId);
  }

  static async getReflections() {
    return await db.getAll('reflections');
  }

  static async deleteReflection(reflectionId: string) {
    return await db.delete('reflections', reflectionId);
  }
}

window.ReflectionIDB = ReflectionIDB;

declare global {
  interface Window {
    ReflectionIDB: typeof ReflectionIDB;
  }
}

export default ReflectionIDB;
