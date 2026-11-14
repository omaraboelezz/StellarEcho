// src/i18n/LanguageContext.tsx
// Centralized Language Provider & Hook for English (EN) and Arabic (AR) with RTL support and localStorage persistence.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { celestialBodies, type PlanetData } from '../data/planets';
import {
  getChapters,
  getLandmark,
  getLandmarksForBody,
  type Chapter,
  type Landmark,
} from '../data/landmarks';
import { getQuizForLandmark, type LandmarkQuiz } from '../data/quizzes';
import { planetResources, type PlanetResource } from '../data/resources';
import { en } from './en';
import { ar, arBodies, arLandmarks } from './ar';
import { arQuizzes, arResourcesByTitle } from './arQuizzesAndResources';
import type { Language, Translations } from './types';

const LANGUAGE_STORAGE_KEY = 'solar_atlas_lang';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

function applyDocumentLanguage(lang: Language): void {
  if (typeof document === 'undefined') return;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

function localizeBodyData(body: PlanetData, lang: Language): PlanetData {
  if (lang !== 'ar') return body;
  const arFields = arBodies[body.id];
  if (!arFields) return body;
  return {
    ...body,
    name: arFields.name,
    description: arFields.description,
    radius: arFields.radius,
    distanceFromSun: arFields.distanceFromSun,
    orbitalSpeed: arFields.orbitalSpeed,
    atmosphere: arFields.atmosphere,
    funFact: arFields.funFact,
  };
}

function localizeLandmarkData(landmark: Landmark, lang: Language): Landmark {
  if (lang !== 'ar') return landmark;
  const arFields = arLandmarks[landmark.id];
  if (!arFields) return landmark;
  return {
    ...landmark,
    name: arFields.name,
    missionName: arFields.missionName,
    agency: arFields.agency,
    years: arFields.years,
    landingDate: arFields.landingDate,
    landingSite: arFields.landingSite,
    shortDescription: arFields.shortDescription,
    status: arFields.status,
    story: arFields.story,
  };
}

function localizeChaptersData(landmark: Landmark, lang: Language): Chapter[] {
  const localizedLm = localizeLandmarkData(landmark, lang);
  const baseChapters = getChapters(localizedLm);
  if (lang !== 'ar') return baseChapters;
  const arFields = arLandmarks[landmark.id];
  if (!arFields) return baseChapters;
  return baseChapters.map((ch, idx) => ({
    ...ch,
    title: arFields.chapterTitles[idx] ?? ch.title,
  }));
}

function localizeQuizData(
  landmarkId: string,
  lang: Language
): LandmarkQuiz | undefined {
  const baseQuiz = getQuizForLandmark(landmarkId);
  if (!baseQuiz) return undefined;
  if (lang !== 'ar') return baseQuiz;
  const arOverlay = arQuizzes[landmarkId];
  if (!arOverlay) return baseQuiz;

  return {
    ...baseQuiz,
    title: arOverlay.title,
    description: arOverlay.description,
    questions: baseQuiz.questions.map((q, idx) => {
      const arQ = arOverlay.questions[idx];
      if (!arQ) return q;
      return {
        ...q,
        question: arQ.prompt,
        options: arQ.options,
        explanation: arQ.explanation,
      };
    }),
  };
}

function localizeResourcesData(
  bodyId: string,
  lang: Language
): PlanetResource[] {
  const list = planetResources[bodyId] ?? [];
  if (lang !== 'ar') return list;
  return list.map((res) => {
    const arRes = arResourcesByTitle[res.title];
    if (!arRes) return res;
    return {
      ...res,
      title: arRes.title,
      description: arRes.description,
    };
  });
}

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  isRtl: boolean;
  t: Translations;
  localizeBody: (body: PlanetData) => PlanetData;
  getLocalizedBody: (id: string | null | undefined) => PlanetData | undefined;
  localizeLandmark: (landmark: Landmark) => Landmark;
  getLocalizedLandmark: (id: string | null | undefined) => Landmark | undefined;
  getLocalizedLandmarksForBody: (bodyId: string) => Landmark[];
  getLocalizedChapters: (landmark: Landmark) => Chapter[];
  getLocalizedQuiz: (landmarkId: string) => LandmarkQuiz | undefined;
  getLocalizedResources: (bodyId: string) => PlanetResource[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const initial = getInitialLanguage();
    applyDocumentLanguage(initial);
    return initial;
  });

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    applyDocumentLanguage(nextLang);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  useEffect(() => {
    applyDocumentLanguage(lang);
  }, [lang]);

  const t = lang === 'ar' ? ar : en;
  const isRtl = lang === 'ar';

  const localizeBody = useCallback(
    (body: PlanetData) => localizeBodyData(body, lang),
    [lang]
  );

  const getLocalizedBody = useCallback(
    (id: string | null | undefined) => {
      if (!id) return undefined;
      const base = celestialBodies[id];
      return base ? localizeBodyData(base, lang) : undefined;
    },
    [lang]
  );

  const localizeLandmark = useCallback(
    (landmark: Landmark) => localizeLandmarkData(landmark, lang),
    [lang]
  );

  const getLocalizedLandmark = useCallback(
    (id: string | null | undefined) => {
      if (!id) return undefined;
      const base = getLandmark(id);
      return base ? localizeLandmarkData(base, lang) : undefined;
    },
    [lang]
  );

  const getLocalizedLandmarksForBody = useCallback(
    (bodyId: string) =>
      getLandmarksForBody(bodyId).map((lm) => localizeLandmarkData(lm, lang)),
    [lang]
  );

  const getLocalizedChapters = useCallback(
    (landmark: Landmark) => localizeChaptersData(landmark, lang),
    [lang]
  );

  const getLocalizedQuiz = useCallback(
    (landmarkId: string) => localizeQuizData(landmarkId, lang),
    [lang]
  );

  const getLocalizedResources = useCallback(
    (bodyId: string) => localizeResourcesData(bodyId, lang),
    [lang]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      isRtl,
      t,
      localizeBody,
      getLocalizedBody,
      localizeLandmark,
      getLocalizedLandmark,
      getLocalizedLandmarksForBody,
      getLocalizedChapters,
      getLocalizedQuiz,
      getLocalizedResources,
    }),
    [
      lang,
      setLang,
      isRtl,
      t,
      localizeBody,
      getLocalizedBody,
      localizeLandmark,
      getLocalizedLandmark,
      getLocalizedLandmarksForBody,
      getLocalizedChapters,
      getLocalizedQuiz,
      getLocalizedResources,
    ]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

