import { openDB } from 'idb';
import type { Question } from '../types';
import { domains as domainsRecord } from '../data/domains';

const db = await openDB('domains', 2, {
  upgrade(db) {
    db.createObjectStore('domains', { keyPath: 'id' });
    const questions = db.createObjectStore('questions', {
      keyPath: ['domainId', 'questionId'],
    });
    questions.createIndex('by-domain', 'domainId');
  },
});

class DomainIDB {
  static async getQuestion(domainId: string, questionId: string): Promise<Question | null> {
    return await db.get('questions', [domainId, questionId]);
  }

  static async setQuestion(domainId: string, questionId: string, question: Question) {
    return await db.put('questions', { ...question, domainId, questionId });
  }

  static async getQuestions(domainId: string): Promise<Question[]> {
    return await db.getAllFromIndex('questions', 'by-domain', domainId);
  }

  static async deleteQuestion(domainId: string, questionId: string) {
    return await db.delete('questions', [domainId, questionId]);
  }

  static async getDomainProgress(domainId: string): Promise<number> {
    return await db
      .getAllFromIndex('questions', 'by-domain', domainId)
      .then((questions) =>
        Math.round(
          (questions.filter((q) => q.finished).length / domainsRecord[domainId].questions.length) *
            100,
        ),
      );
  }

  static async getAllDomainProgress(): Promise<Record<string, number>> {
    return Promise.all(
      Object.keys(domainsRecord).map((domainId) => this.getDomainProgress(domainId)),
    ).then((progresses) =>
      Object.fromEntries(
        progresses.map((progress, index) => [Object.keys(domainsRecord)[index], progress]),
      ),
    );
  }

  static async clearAll() {
    await db.clear('questions');
    try {
      await db.clear('domains');
    } catch (_) {
      // ignore if store is empty or unused
    }
  }

  static async exportData(): Promise<{ filename: string; data: any[] }> {
    const questions = (await db.getAll('questions')) as any[];
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .replace('Z', 'Z');
    const filename = `domains-${timestamp}.json`;
    return { filename, data: questions };
  }

  static validateImport(input: unknown): { ok: true } | { ok: false; error: string } {
    if (!Array.isArray(input)) {
      return { ok: false, error: 'Expected an array of domain questions' };
    }
    for (const [index, q] of input.entries()) {
      if (typeof q !== 'object' || q === null)
        return { ok: false, error: `Item ${index} is not an object` };
      const qi = q as any;
      if (typeof qi.domainId !== 'string')
        return { ok: false, error: `Item ${index} missing domainId` };
      if (typeof qi.questionId !== 'string')
        return { ok: false, error: `Item ${index} missing questionId` };
      if (typeof qi.id !== 'string') return { ok: false, error: `Item ${index} missing id` };
      if (typeof qi.createdAt !== 'string')
        return { ok: false, error: `Item ${index} missing createdAt` };
      if (typeof qi.finished !== 'boolean')
        return { ok: false, error: `Item ${index} missing finished boolean` };
      if (!Array.isArray(qi.entries))
        return { ok: false, error: `Item ${index} entries must be an array` };
      for (const [eIdx, e] of (qi.entries as any[]).entries()) {
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
    const questions = input as any[];

    if (strategy === 'replace') {
      await this.clearAll();
      let imported = 0;
      for (const q of questions) {
        await db.put('questions', q);
        imported += 1;
      }
      return { imported, skipped: 0, replaced: imported };
    }

    // For append/merge, fetch existing
    const existing = (await db.getAll('questions')) as any[];
    const existingKeySet = new Set(existing.map((q) => `${q.domainId}::${q.questionId}`));
    let imported = 0;
    let skipped = 0;
    let replaced = 0;
    for (const q of questions) {
      const key = `${q.domainId}::${q.questionId}`;
      if (!existingKeySet.has(key)) {
        await db.put('questions', q);
        imported += 1;
      } else if (strategy === 'merge') {
        await db.put('questions', q);
        replaced += 1;
      } else {
        skipped += 1;
      }
    }
    return { imported, skipped, replaced };
  }
}

window.DomainIDB = DomainIDB;

declare global {
  interface Window {
    DomainIDB: typeof DomainIDB;
  }
}

export default DomainIDB;
