import { openDB } from 'idb';
import type { Reflection } from '../types';

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
      const newReflection = {
        id: reflectionId || `reflection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        entries: [],
        createdAt: new Date().toISOString(),
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

export default ReflectionIDB;
