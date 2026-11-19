// src/i18n/LanguageContext.tsx
// Centralized Language Provider & Hook for English (EN) and Arabic (AR) with RTL support,
// localStorage persistence, and on-demand dynamic loading of Arabic translation bundles.

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
import { en } from './en';
import type { Language, Translations } from './types';

type ArModule = typeof import('./ar');

const LANGUAGE_STORAGE_KEY = 'solar_atlas_lang';
const AR_FONTS_LINK_ID = 'stellarecho-ar-fonts';
const AR_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap';

let cachedArModule: ArModule | null = null;
let arModulePromise: Promise<ArModule> | null = null;

function loadArModule(): Promise<ArModule> {
  if (cachedArModule) return Promise.resolve(cachedArModule);
  if (!arModulePromise) {
    arModulePromise = import('./ar').then((mod) => {
      cachedArModule = mod;
      return mod;
    });
  }
  return arModulePromise;
}

function ensureArabicFontsLoaded(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(AR_FONTS_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = AR_FONTS_LINK_ID;
  link.rel = 'stylesheet';
  link.href = AR_FONTS_HREF;
  document.head.appendChild(link);
}

/** Lightweight synchronous lookups for Three.js / R3F components without statically bundling ar.ts */
export function getCachedArBodyName(bodyId: string): string | undefined {
  return cachedArModule?.arBodies[bodyId]?.name;
}

export function getCachedArLandmarkName(landmarkId: string): string | undefined {
  return cachedArModule?.arLandmarks[landmarkId]?.name;
}

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
  document.title = 'StellarEcho';
  if (lang === 'ar') {
    ensureArabicFontsLoaded();
  }
}

function localizeBodyData(
  body: PlanetData,
  lang: Language,
  arMod: ArModule | null
): PlanetData {
  if (lang !== 'ar' || !arMod) return body;
  const arFields = arMod.arBodies[body.id];
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

function localizeLandmarkData(
  landmark: Landmark,
  lang: Language,
  arMod: ArModule | null
): Landmark {
  if (lang !== 'ar' || !arMod) return landmark;
  const arFields = arMod.arLandmarks[landmark.id];
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

function localizeChaptersData(
  landmark: Landmark,
  lang: Language,
  arMod: ArModule | null
): Chapter[] {
  const localizedLm = localizeLandmarkData(landmark, lang, arMod);
  const baseChapters = getChapters(localizedLm);
  if (lang !== 'ar' || !arMod) return baseChapters;
  const arFields = arMod.arLandmarks[landmark.id];
  if (!arFields) return baseChapters;
  return baseChapters.map((ch, idx) => ({
    ...ch,
    title: arFields.chapterTitles[idx] ?? ch.title,
  }));
}

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  isRtl: boolean;
  arReady: boolean;
  t: Translations;
  localizeBody: (body: PlanetData) => PlanetData;
  getLocalizedBody: (id: string | null | undefined) => PlanetData | undefined;
  localizeLandmark: (landmark: Landmark) => Landmark;
  getLocalizedLandmark: (id: string | null | undefined) => Landmark | undefined;
  getLocalizedLandmarksForBody: (bodyId: string) => Landmark[];
  getLocalizedChapters: (landmark: Landmark) => Chapter[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const initial = getInitialLanguage();
    applyDocumentLanguage(initial);
    return initial;
  });
  const [arMod, setArMod] = useState<ArModule | null>(() => cachedArModule);

  useEffect(() => {
    if (lang !== 'ar' || arMod) return;
    let active = true;
    loadArModule()
      .then((mod) => {
        if (active) setArMod(mod);
      })
      .catch((err) => {
        console.warn('[i18n] Failed to load Arabic bundle:', err);
      });
    return () => {
      active = false;
    };
  }, [lang, arMod]);

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    applyDocumentLanguage(nextLang);
    if (nextLang === 'ar' && !cachedArModule) {
      loadArModule().then((mod) => setArMod(mod)).catch(() => {});
    }
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  useEffect(() => {
    applyDocumentLanguage(lang);
  }, [lang]);

  const t = lang === 'ar' && arMod ? arMod.ar : en;
  const isRtl = lang === 'ar';
  const arReady = Boolean(arMod);

  const localizeBody = useCallback(
    (body: PlanetData) => localizeBodyData(body, lang, arMod),
    [lang, arMod]
  );

  const getLocalizedBody = useCallback(
    (id: string | null | undefined) => {
      if (!id) return undefined;
      const base = celestialBodies[id];
      return base ? localizeBodyData(base, lang, arMod) : undefined;
    },
    [lang, arMod]
  );

  const localizeLandmark = useCallback(
    (landmark: Landmark) => localizeLandmarkData(landmark, lang, arMod),
    [lang, arMod]
  );

  const getLocalizedLandmark = useCallback(
    (id: string | null | undefined) => {
      if (!id) return undefined;
      const base = getLandmark(id);
      return base ? localizeLandmarkData(base, lang, arMod) : undefined;
    },
    [lang, arMod]
  );

  const getLocalizedLandmarksForBody = useCallback(
    (bodyId: string) =>
      getLandmarksForBody(bodyId).map((lm) => localizeLandmarkData(lm, lang, arMod)),
    [lang, arMod]
  );

  const getLocalizedChapters = useCallback(
    (landmark: Landmark) => localizeChaptersData(landmark, lang, arMod),
    [lang, arMod]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      isRtl,
      arReady,
      t,
      localizeBody,
      getLocalizedBody,
      localizeLandmark,
      getLocalizedLandmark,
      getLocalizedLandmarksForBody,
      getLocalizedChapters,
    }),
    [
      lang,
      setLang,
      isRtl,
      arReady,
      t,
      localizeBody,
      getLocalizedBody,
      localizeLandmark,
      getLocalizedLandmark,
      getLocalizedLandmarksForBody,
      getLocalizedChapters,
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
