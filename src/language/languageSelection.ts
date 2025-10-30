export type LanguageCode = 'en' | 'es';

class LanguageSelection {
  private static instance: LanguageSelection | null = null;
  private readonly storageKey = 'userLanguage';
  private current: LanguageCode;

  private constructor() {
    const stored = this.readFromStorage();
    this.current = stored ?? this.detectDefault();
  }

  static getInstance(): LanguageSelection {
    if (!LanguageSelection.instance) {
      LanguageSelection.instance = new LanguageSelection();
    }
    return LanguageSelection.instance;
  }

  get(): LanguageCode {
    return this.current;
  }

  set(language: LanguageCode): void {
    this.current = language;
    this.writeToStorage(language);
  }

  private readFromStorage(): LanguageCode | null {
    if (typeof window === 'undefined') return null;
    try {
      const value = window.localStorage.getItem(this.storageKey);
      return value ? (value as LanguageCode) : null;
    } catch {
      return null;
    }
  }

  private writeToStorage(language: LanguageCode): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(this.storageKey, language);
    } catch {
      // Ignore storage errors (e.g., privacy mode)
    }
  }

  private detectDefault(): LanguageCode {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const primary = navigator.language.split('-')[0];
      if (!['en', 'es'].includes(primary)) {
        return 'en';
      }
      return primary as LanguageCode;
    }
    return 'en';
  }
}

export const languageSelection = LanguageSelection.getInstance();

export const languageOptions = (language: LanguageCode = languageSelection.get()) => ({
  expectedInputs: [{ type: 'text', languages: ['en', language] }],
  expectedOutputs: [{ type: 'text', languages: [language] }],
});

export const languageOptionsRewriter = (language: LanguageCode = languageSelection.get()) => ({
  expectedInputLanguages: ['en', 'ja', 'es'],
  expectedContextLanguages: ['en', 'ja', 'es'],
  outputLanguage: language,
});

export const getUserLanguage = (): LanguageCode => languageSelection.get();
export const setUserLanguage = (language: LanguageCode): void => languageSelection.set(language);
