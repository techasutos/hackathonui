import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Language = "en" | "hi" | "kn" | "or" | "de";
const supportedLanguages: Language[] = ["en", "hi", "kn", "or", "de"];
const fallbackLang: Language = "en";

type Translations = Record<string, string>;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isReady: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Load translation file
const loadTranslations = async (lang: Language): Promise<Translations> => {
  try {
    const module = await import(`@/locales/${lang}.json`);
    return module.default;
  } catch (e) {
    const fallback = await import(`@/locales/${fallbackLang}.json`);
    return fallback.default;
  }
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(fallbackLang);
  const [translations, setTranslations] = useState<Translations>({});
  const [isReady, setIsReady] = useState(false);

  // Set language on mount (from localStorage or browser)
  useEffect(() => {
    const stored = localStorage.getItem("language") as Language | null;
    const browser = navigator.language.split("-")[0] as Language;
    const initial =
      stored && supportedLanguages.includes(stored)
        ? stored
        : supportedLanguages.includes(browser)
        ? browser
        : fallbackLang;

    setLanguage(initial);
  }, []);

  const setLanguage = (lang: Language) => {
    if (!supportedLanguages.includes(lang)) return;
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
    setLanguageState(lang);
  };

  // Load translations
  useEffect(() => {
    setIsReady(false);
    loadTranslations(language).then((res) => {
      setTranslations(res);
      setIsReady(true);
    });
  }, [language]);

  const t = (key: string, fallback?: string): string =>
    translations[key] || fallback || key;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isReady }}>
      {isReady ? children : null}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context)
    throw new Error("useI18n must be used within an I18nProvider");
  return context;
}