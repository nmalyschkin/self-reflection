export type Entry = {
  text: string;
  createdAt: string;
  type: 'user' | 'ai-answer' | 'ai-question';
};

export interface Reflection {
  id: string;
  entries: Entry[];
  createdAt: string;
  title?: string;
}

export type Reflections = Reflection[];

// Shared Language Model availability status for UI logic
export type LMStatus =
  | 'unknown'
  | 'no-api'
  | 'unavailable'
  | 'downloadable'
  | 'downloading'
  | 'available';
