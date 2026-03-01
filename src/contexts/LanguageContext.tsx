import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Language = "en" | "es" | "de" | "zh" | "fr" | "tr";

export const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "zh", label: "Chinese", nativeLabel: "中文" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe" },
];

interface TranslationCache {
  [key: string]: {
    [lang: string]: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string, targetLang?: Language) => Promise<string>;
  translateBatch: (texts: string[], targetLang?: Language) => Promise<string[]>;
  isTranslating: boolean;
  getLanguageLabel: (code: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("solvia-language");
    return (saved as Language) || "en";
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [cache] = useState<TranslationCache>({});

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("solvia-language", lang);
  }, []);

  const getLanguageLabel = useCallback((code: Language) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    return lang?.nativeLabel || lang?.label || code;
  }, []);

  const translate = useCallback(
    async (text: string, targetLang?: Language): Promise<string> => {
      const target = targetLang || language;
      
      // Skip translation if already English or target is English and source appears to be English
      if (target === "en") return text;
      
      // Check cache
      const cacheKey = text.slice(0, 100); // Use first 100 chars as key
      if (cache[cacheKey]?.[target]) {
        return cache[cacheKey][target];
      }

      setIsTranslating(true);
      try {
        const { data, error } = await supabase.functions.invoke("translate", {
          body: { text, targetLanguage: target },
        });

        if (error) throw error;

        const translated = data?.translatedText || text;
        
        // Cache the result
        if (!cache[cacheKey]) cache[cacheKey] = {};
        cache[cacheKey][target] = translated;

        return translated;
      } catch (err) {
        console.error("Translation error:", err);
        return text; // Return original on error
      } finally {
        setIsTranslating(false);
      }
    },
    [language, cache]
  );

  const translateBatch = useCallback(
    async (texts: string[], targetLang?: Language): Promise<string[]> => {
      const target = targetLang || language;
      
      if (target === "en") return texts;

      setIsTranslating(true);
      try {
        const { data, error } = await supabase.functions.invoke("translate", {
          body: { texts, targetLanguage: target },
        });

        if (error) throw error;

        return data?.translatedTexts || texts;
      } catch (err) {
        console.error("Batch translation error:", err);
        return texts;
      } finally {
        setIsTranslating(false);
      }
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        translate,
        translateBatch,
        isTranslating,
        getLanguageLabel,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
