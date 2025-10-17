
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { languages, type Language } from '@/locales/languages';
import enMessages from '@/locales/en.json';
import esMessages from '@/locales/es.json';
import frMessages from '@/locales/fr.json';
import deMessages from '@/locales/de.json';
import hiMessages from '@/locales/hi.json';
import mrMessages from '@/locales/mr.json';
import zhMessages from '@/locales/zh.json';
import jaMessages from '@/locales/ja.json';
import arMessages from '@/locales/ar.json';
import ptMessages from '@/locales/pt.json';
import ruMessages from '@/locales/ru.json';
import bnMessages from '@/locales/bn.json';
import idMessages from '@/locales/id.json';
import urMessages from '@/locales/ur.json';
import swMessages from '@/locales/sw.json';
import koMessages from '@/locales/ko.json';
import itMessages from '@/locales/it.json';
import nlMessages from '@/locales/nl.json';
import trMessages from '@/locales/tr.json';
import viMessages from '@/locales/vi.json';
import plMessages from '@/locales/pl.json';
import thMessages from '@/locales/th.json';
import ukMessages from '@/locales/uk.json';
import roMessages from '@/locales/ro.json';
import elMessages from '@/locales/el.json';
import taMessages from '@/locales/ta.json';
import teMessages from '@/locales/te.json';
import knMessages from '@/locales/kn.json';
import guMessages from '@/locales/gu.json';
import paMessages from '@/locales/pa.json';
import mlMessages from '@/locales/ml.json';

type Messages = Record<string, any>;
const messages: Record<string, Messages> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  de: deMessages,
  hi: hiMessages,
  mr: mrMessages,
  zh: zhMessages,
  ja: jaMessages,
  ar: arMessages,
  pt: ptMessages,
  ru: ruMessages,
  bn: bnMessages,
  id: idMessages,
  ur: urMessages,
  sw: swMessages,
  ko: koMessages,
  it: itMessages,
  nl: nlMessages,
  tr: trMessages,
  vi: viMessages,
  pl: plMessages,
  th: thMessages,
  uk: ukMessages,
  ro: roMessages,
  el: elMessages,
  ta: taMessages,
  te: teMessages,
  kn: knMessages,
  gu: guMessages,
  pa: paMessages,
  ml: mlMessages,
};

export type TFunction = (key: string, values?: Record<string, string | number>) => string;

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: TFunction;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [currentMessages, setCurrentMessages] = useState<Messages>(enMessages);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && messages[savedLanguage]) {
      setLanguageState(savedLanguage);
      setCurrentMessages(messages[savedLanguage] || enMessages);
    }
  }, []);

  const setLanguage = (langCode: string) => {
    localStorage.setItem('language', langCode);
    setLanguageState(langCode);
    setCurrentMessages(messages[langCode] || enMessages);
  };
  
  const t: TFunction = useCallback((key, values) => {
    const keys = key.split('.');
    let text = keys.reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : null, currentMessages) as string | null;

    if (text === null) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    
    if (values) {
        Object.keys(values).forEach(k => {
            text = text!.replace(`{${k}}`, String(values[k]));
        });
    }

    return text;
  }, [currentMessages]);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
