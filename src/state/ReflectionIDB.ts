import { openDB } from 'idb';
import type { Reflection } from '../types';
import { DEFAULT_PERSONA_ID } from '../data/personas';
import { languageSelection } from '../language/languageSelection';
import { formatTimestampForFilename } from './utils/format';

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
        id: reflectionId || crypto.randomUUID().slice(0, 8),
        entries: [],
        createdAt: new Date().toISOString(),
        personaId: DEFAULT_PERSONA_ID,
        language: languageSelection.get(),
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
    return (await db.getAll('reflections')) as Reflection[];
  }

  static async deleteReflection(reflectionId: string) {
    return await db.delete('reflections', reflectionId);
  }

  static async clearAll() {
    return await db.clear('reflections');
  }

  static async exportData(): Promise<{ filename: string; data: Reflection[] }> {
    const reflections = await this.getReflections();
    const filename = formatTimestampForFilename('reflections');
    return { filename, data: reflections };
  }

  static validateImport(input: unknown): { ok: true } | { ok: false; error: string } {
    if (!Array.isArray(input)) {
      return { ok: false, error: 'Expected an array of reflections' };
    }
    for (const [index, r] of input.entries()) {
      if (typeof r !== 'object' || r === null)
        return { ok: false, error: `Item ${index} is not an object` };
      if (typeof (r as any).id !== 'string')
        return { ok: false, error: `Item ${index} missing string id` };
      if (typeof (r as any).createdAt !== 'string')
        return { ok: false, error: `Item ${index} missing string createdAt` };
      if (!Array.isArray((r as any).entries))
        return { ok: false, error: `Item ${index} entries must be an array` };
      for (const [eIdx, e] of ((r as any).entries as any[]).entries()) {
        if (typeof e !== 'object' || e === null)
          return { ok: false, error: `Item ${index} entry ${eIdx} is not an object` };
        if (typeof (e as any).text !== 'string')
          return { ok: false, error: `Item ${index} entry ${eIdx} missing text` };
        if (typeof (e as any).createdAt !== 'string')
          return { ok: false, error: `Item ${index} entry ${eIdx} missing createdAt` };
        if (!['user', 'ai-answer', 'ai-question'].includes((e as any).type)) {
          return { ok: false, error: `Item ${index} entry ${eIdx} has invalid type` };
        }
      }
    }
    return { ok: true };
  }

  static async importData(
    input: unknown,
    strategy: 'replace' | 'append' | 'merge',
  ): Promise<{ imported: number; skipped: number; replaced: number }> {
    const validation = this.validateImport(input);
    if (!validation.ok) {
      throw new Error(validation.error);
    }
    const reflections = input as Reflection[];

    if (strategy === 'replace') {
      await this.clearAll();
      let imported = 0;
      for (const r of reflections) {
        await db.put('reflections', r, r.id);
        imported += 1;
      }
      return { imported, skipped: 0, replaced: imported };
    }

    // For append/merge, fetch existing keys
    const existing = await this.getReflections();
    const existingIds = new Set(existing.map((r) => r.id));
    let imported = 0;
    let skipped = 0;
    let replaced = 0;
    for (const r of reflections) {
      if (!existingIds.has(r.id)) {
        await db.put('reflections', r, r.id);
        imported += 1;
      } else if (strategy === 'merge') {
        await db.put('reflections', r, r.id);
        replaced += 1;
      } else {
        skipped += 1;
      }
    }
    return { imported, skipped, replaced };
  }
}

window.ReflectionIDB = ReflectionIDB;

declare global {
  interface Window {
    ReflectionIDB: typeof ReflectionIDB;
  }
}

export default ReflectionIDB;
