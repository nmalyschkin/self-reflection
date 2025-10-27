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
}

window.DomainIDB = DomainIDB;

declare global {
  interface Window {
    DomainIDB: typeof DomainIDB;
  }
}

export default DomainIDB;
