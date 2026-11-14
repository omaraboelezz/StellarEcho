// src/lib/streak.ts
//
// Persistent Space Exploration Streak, Daily Objectives, and Milestones engine.
// Supports both English ('en') and Arabic ('ar').

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  category: 'planet' | 'landmark' | 'vehicle' | 'fact' | 'multi_planet';
  targetCount: number;
  xp: number;
  actionBodyId?: string;
  actionLandmarkId?: string;
}

export interface MilestoneBadge {
  id: string;
  days: number;
  title: string;
  subtitle: string;
  rewardText: string;
}

export interface QuizRecord {
  bestCorrect: number;
  total: number;
  bestPercentage: number;
  xpAwarded: number;
  attempts: number;
}

export interface ExplorationState {
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null;
  completedDates: string[];
  totalXp: number;
  visitedBodies: string[];
  visitedLandmarks: string[];
  discoveredFacts: string[];
  completedQuizzes: Record<string, QuizRecord>;
  dailyDate: string;
  dailyBodies: string[];
  dailyLandmarks: string[];
  dailyVehicles: string[];
  dailyFacts: string[];
  completedMissionIds: string[];
}

export interface CelebrationEvent {
  id: string;
  kind: 'streak' | 'mission' | 'milestone';
  title: string;
  subtitle: string;
  streakCount?: number;
}

const STORAGE_KEY = 'solar_atlas_streak_v1';

function detectActiveLang(): 'en' | 'ar' {
  if (typeof document !== 'undefined' && document.documentElement.lang === 'ar') {
    return 'ar';
  }
  return 'en';
}

export const STREAK_MILESTONES: MilestoneBadge[] = [
  {
    id: 'streak-3',
    days: 3,
    title: 'Orbital Cadet',
    subtitle: '3-Day Exploration Streak',
    rewardText: 'Ignited your recurring flight routine across the inner Solar System.',
  },
  {
    id: 'streak-7',
    days: 7,
    title: 'Deep Space Navigator',
    subtitle: '7-Day Exploration Streak',
    rewardText: 'One full Earth week of continuous planetary reconnaissance.',
  },
  {
    id: 'streak-14',
    days: 14,
    title: 'Lunar Cycle Explorer',
    subtitle: '14-Day Exploration Streak',
    rewardText: 'Half a lunar synodic month of dedicated scientific discovery.',
  },
  {
    id: 'streak-30',
    days: 30,
    title: 'Vanguard Astrophysicist',
    subtitle: '30-Day Exploration Streak',
    rewardText: 'A full month of mission operations across worlds and moons.',
  },
  {
    id: 'streak-100',
    days: 100,
    title: 'Voyager Eternal',
    subtitle: '100-Day Exploration Streak',
    rewardText: 'Elite interstellar dedication — 100 consecutive days of space exploration.',
  },
];

export const STREAK_MILESTONES_AR: MilestoneBadge[] = [
  {
    id: 'streak-3',
    days: 3,
    title: 'مرشح طيران مداري',
    subtitle: 'سلسلة استكشاف لمدة 3 أيام',
    rewardText: 'أطلقت روتينك العلمي المستمر عبر كواكب النظام الشمسي الداخلي.',
  },
  {
    id: 'streak-7',
    days: 7,
    title: 'ملّاح الفضاء العميق',
    subtitle: 'سلسلة استكشاف لمدة 7 أيام',
    rewardText: 'أسبوع أرضي كامل من الاستطلاع الكوكبي المتواصل.',
  },
  {
    id: 'streak-14',
    days: 14,
    title: 'مستكشف الدورة القمرية',
    subtitle: 'سلسلة استكشاف لمدة 14 يوماً',
    rewardText: 'نصف شهر قمري من الاكتشافات العلمية المتفانية.',
  },
  {
    id: 'streak-30',
    days: 30,
    title: 'عالم فيزياء فلكية رائد',
    subtitle: 'سلسلة استكشاف لمدة 30 يوماً',
    rewardText: 'شهر كامل من العمليات المدارية عبر الكواكب والأقمار.',
  },
  {
    id: 'streak-100',
    days: 100,
    title: 'رحّالة الفضاء الأبدي',
    subtitle: 'سلسلة استكشاف لمدة 100 يوم',
    rewardText: 'التزام كوني نخبوي — 100 يوم متتالي من استكشاف الفضاء.',
  },
];

export function getStreakMilestones(lang: 'en' | 'ar' = detectActiveLang()): MilestoneBadge[] {
  return lang === 'ar' ? STREAK_MILESTONES_AR : STREAK_MILESTONES;
}

/** Formats a Date as local YYYY-MM-DD */
export function toDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses YYYY-MM-DD into local midnight timestamp */
function parseDateKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0).getTime();
}

/** Whole calendar days between two YYYY-MM-DD keys (b - a) */
export function daysBetween(aKey: string, bKey: string): number {
  const msPerDay = 86400000;
  return Math.round((parseDateKey(bKey) - parseDateKey(aKey)) / msPerDay);
}

/** Deterministic daily mission set based on the calendar day so every day feels fresh */
export function getDailyMissions(
  dateKey = toDateKey(),
  lang: 'en' | 'ar' = detectActiveLang()
): DailyMission[] {
  const seed = dateKey.split('-').reduce((acc, n) => acc * 31 + Number(n), 7);

  const planetTargets: Array<{ id: string; nameEn: string; nameAr: string }> = [
    { id: 'mars', nameEn: 'Mars', nameAr: 'المريخ' },
    { id: 'jupiter', nameEn: 'Jupiter', nameAr: 'المشتري' },
    { id: 'saturn', nameEn: 'Saturn', nameAr: 'زحل' },
    { id: 'earth', nameEn: 'Earth', nameAr: 'الأرض' },
    { id: 'venus', nameEn: 'Venus', nameAr: 'الزهرة' },
    { id: 'mercury', nameEn: 'Mercury', nameAr: 'عطارد' },
    { id: 'uranus', nameEn: 'Uranus', nameAr: 'أورانوس' },
    { id: 'neptune', nameEn: 'Neptune', nameAr: 'نبتون' },
  ];
  const featuredPlanet = planetTargets[seed % planetTargets.length];
  const pName = lang === 'ar' ? featuredPlanet.nameAr : featuredPlanet.nameEn;

  const landmarkTargets: Array<{
    id: string;
    bodyId: string;
    labelEn: string;
    labelAr: string;
  }> = [
    {
      id: 'apollo11',
      bodyId: 'moon',
      labelEn: 'Visit the Apollo Lunar Modules (Apollo 11 Eagle) on the Moon',
      labelAr: 'قم بزيارة مركبات الهبوط القمرية أبولو (أبولو 11) على سطح القمر',
    },
    {
      id: 'lrv',
      bodyId: 'moon',
      labelEn: 'Inspect the Lunar Roving Vehicles (LRVs) on the Moon',
      labelAr: 'افحص العربات القمرية الجوالة (LRVs) على سطح القمر',
    },
    {
      id: 'sojourner',
      bodyId: 'mars',
      labelEn: 'Explore the Sojourner Rover site in Ares Vallis on Mars',
      labelAr: 'استكشف موقع العربة الجوالة سوجورنر في وادي آريس فاليس على المريخ',
    },
    {
      id: 'spirit',
      bodyId: 'mars',
      labelEn: 'Inspect the Spirit Rover site on Mars',
      labelAr: 'افحص موقع العربة الجوالة سبيريت على المريخ',
    },
    {
      id: 'opportunity',
      bodyId: 'mars',
      labelEn: 'Visit the Opportunity Rover site on Mars',
      labelAr: 'قم بزيارة موقع العربة الجوالة أوبورتيونيتي على المريخ',
    },
    {
      id: 'venera13',
      bodyId: 'venus',
      labelEn: 'Explore the Venera 13 lander site on Venus',
      labelAr: 'استكشف موقع هبوط مركبة فينيرا 13 على كوكب الزهرة',
    },
    {
      id: 'cassini',
      bodyId: 'saturn',
      labelEn: 'Inspect the Cassini–Huygens orbiter at Saturn',
      labelAr: 'افحص مسبار كاسيني-هويغنز المداري عند كوكب زحل',
    },
  ];
  const featuredLandmark = landmarkTargets[(seed >> 2) % landmarkTargets.length];

  return [
    {
      id: `daily-planets-${dateKey}`,
      title:
        lang === 'ar'
          ? `استطلاع كوكبي: ${pName}`
          : `Planetary Reconnaissance: ${pName}`,
      description:
        lang === 'ar'
          ? `استكشف كوكب ${pName} أو قم بزيارة جرمين سماويين مختلفين اليوم.`
          : `Explore ${pName} or visit 2 different celestial bodies today.`,
      category: 'multi_planet',
      targetCount: 2,
      xp: 50,
      actionBodyId: featuredPlanet.id,
    },
    {
      id: `daily-landmark-${dateKey}`,
      title: lang === 'ar' ? 'مهمة فضائية تاريخية' : 'Historical Space Mission',
      description:
        lang === 'ar' ? featuredLandmark.labelAr : featuredLandmark.labelEn,
      category: 'landmark',
      targetCount: 1,
      xp: 75,
      actionBodyId: featuredLandmark.bodyId,
      actionLandmarkId: featuredLandmark.id,
    },
    {
      id: `daily-fact-${dateKey}`,
      title: lang === 'ar' ? 'اكتشاف فلكي موثق' : 'Astronomical Discovery',
      description:
        lang === 'ar'
          ? 'سجّل معلومة علمية من قسم "هل تعلم؟" أو استكشف مصدراً في مركز المعرفة.'
          : 'Log an astronomical "Did you know?" fact or explore a Knowledge Center resource.',
      category: 'fact',
      targetCount: 1,
      xp: 40,
      actionBodyId: featuredPlanet.id,
    },
  ];
}

export function getMissionProgress(state: ExplorationState, mission: DailyMission): number {
  switch (mission.category) {
    case 'planet':
    case 'multi_planet':
      return Math.min(mission.targetCount, state.dailyBodies.length);
    case 'landmark':
      return Math.min(mission.targetCount, state.dailyLandmarks.length);
    case 'vehicle':
      return Math.min(mission.targetCount, state.dailyVehicles.length);
    case 'fact':
      return Math.min(mission.targetCount, state.dailyFacts.length);
  }
}

function defaultState(today = toDateKey()): ExplorationState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastStreakDate: null,
    completedDates: [],
    totalXp: 0,
    visitedBodies: [],
    visitedLandmarks: [],
    discoveredFacts: [],
    completedQuizzes: {},
    dailyDate: today,
    dailyBodies: [],
    dailyLandmarks: [],
    dailyVehicles: [],
    dailyFacts: [],
    completedMissionIds: [],
  };
}

/** Normalizes saved state when a new calendar day starts */
export function normalizeForToday(raw: ExplorationState, today = toDateKey()): ExplorationState {
  const next = { ...raw };

  if (next.lastStreakDate) {
    const diff = daysBetween(next.lastStreakDate, today);
    if (diff > 1) {
      next.currentStreak = 0;
    }
  }

  if (next.dailyDate !== today) {
    next.dailyDate = today;
    next.dailyBodies = [];
    next.dailyLandmarks = [];
    next.dailyVehicles = [];
    next.dailyFacts = [];
    next.completedMissionIds = [];
  }

  return next;
}

export function loadExplorationState(): ExplorationState {
  const today = toDateKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState(today);
    const parsed = JSON.parse(raw) as Partial<ExplorationState>;
    const merged: ExplorationState = {
      ...defaultState(today),
      ...parsed,
    };
    const normalized = normalizeForToday(merged, today);
    saveExplorationState(normalized);
    return normalized;
  } catch {
    return defaultState(today);
  }
}

export function saveExplorationState(state: ExplorationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

/**
 * Applies a meaningful exploration activity, updates streak (at most once per calendar day),
 * evaluates daily missions and milestones, persists state, and returns any celebration events.
 */
export function recordActivity(
  prev: ExplorationState,
  activity:
    | { type: 'planet'; bodyId: string }
    | { type: 'landmark'; landmarkId: string; bodyId: string; kind: string }
    | { type: 'fact'; key: string }
    | {
        type: 'quiz';
        landmarkId: string;
        bodyId: string;
        correct: number;
        total: number;
        maxXp: number;
      }
): { state: ExplorationState; celebrations: CelebrationEvent[]; xpEarnedNow: number } {
  const today = toDateKey();
  const lang = detectActiveLang();
  const base = normalizeForToday(prev, today);
  const celebrations: CelebrationEvent[] = [];
  let xpEarnedNow = 0;

  const next: ExplorationState = {
    ...base,
    completedDates: [...base.completedDates],
    visitedBodies: [...base.visitedBodies],
    visitedLandmarks: [...base.visitedLandmarks],
    discoveredFacts: [...base.discoveredFacts],
    completedQuizzes: { ...(base.completedQuizzes ?? {}) },
    dailyBodies: [...base.dailyBodies],
    dailyLandmarks: [...base.dailyLandmarks],
    dailyVehicles: [...base.dailyVehicles],
    dailyFacts: [...base.dailyFacts],
    completedMissionIds: [...base.completedMissionIds],
  };

  if (activity.type === 'planet') {
    if (!next.visitedBodies.includes(activity.bodyId)) {
      next.visitedBodies.push(activity.bodyId);
    }
    if (!next.dailyBodies.includes(activity.bodyId)) {
      next.dailyBodies.push(activity.bodyId);
    }
  } else if (activity.type === 'landmark') {
    if (!next.visitedBodies.includes(activity.bodyId)) {
      next.visitedBodies.push(activity.bodyId);
    }
    if (!next.dailyBodies.includes(activity.bodyId)) {
      next.dailyBodies.push(activity.bodyId);
    }
    if (!next.visitedLandmarks.includes(activity.landmarkId)) {
      next.visitedLandmarks.push(activity.landmarkId);
    }
    if (!next.dailyLandmarks.includes(activity.landmarkId)) {
      next.dailyLandmarks.push(activity.landmarkId);
    }
    if (!next.dailyVehicles.includes(activity.kind)) {
      next.dailyVehicles.push(activity.kind);
    }
  } else if (activity.type === 'fact') {
    if (!next.discoveredFacts.includes(activity.key)) {
      next.discoveredFacts.push(activity.key);
    }
    if (!next.dailyFacts.includes(activity.key)) {
      next.dailyFacts.push(activity.key);
    }
  } else if (activity.type === 'quiz') {
    const pct = activity.total > 0 ? Math.round((activity.correct / activity.total) * 100) : 0;
    const earnedForAttempt = Math.round(
      (activity.correct / Math.max(1, activity.total)) * activity.maxXp
    );
    const existing = next.completedQuizzes[activity.landmarkId];
    const prevAwarded = existing?.xpAwarded ?? 0;
    const deltaXp = Math.max(0, earnedForAttempt - prevAwarded);

    xpEarnedNow = deltaXp;
    next.totalXp += deltaXp;
    next.completedQuizzes[activity.landmarkId] = {
      bestCorrect: Math.max(existing?.bestCorrect ?? 0, activity.correct),
      total: activity.total,
      bestPercentage: Math.max(existing?.bestPercentage ?? 0, pct),
      xpAwarded: Math.max(prevAwarded, earnedForAttempt),
      attempts: (existing?.attempts ?? 0) + 1,
    };

    const factKey = `quiz-${activity.landmarkId}`;
    if (!next.discoveredFacts.includes(factKey)) {
      next.discoveredFacts.push(factKey);
    }
    if (!next.dailyFacts.includes(factKey)) {
      next.dailyFacts.push(factKey);
    }
    if (!next.dailyLandmarks.includes(activity.landmarkId)) {
      next.dailyLandmarks.push(activity.landmarkId);
    }

    if (deltaXp > 0) {
      celebrations.push({
        id: `quiz-xp-${activity.landmarkId}-${Date.now()}`,
        kind: 'mission',
        title:
          lang === 'ar'
            ? `اكتمل اختبار المهمة! (+${deltaXp} XP)`
            : `Mission Quiz Complete! (+${deltaXp} XP)`,
        subtitle:
          lang === 'ar'
            ? `النتيجة: ${activity.correct}/${activity.total} (${pct}%)`
            : `Scored ${activity.correct}/${activity.total} (${pct}%)`,
      });
    }
  }

  // 2. Extend daily streak (strictly once per calendar day)
  if (next.lastStreakDate !== today) {
    const diff = next.lastStreakDate ? daysBetween(next.lastStreakDate, today) : -1;
    const newStreak = diff === 1 ? next.currentStreak + 1 : 1;
    next.currentStreak = newStreak;
    next.longestStreak = Math.max(next.longestStreak, newStreak);
    next.lastStreakDate = today;
    if (!next.completedDates.includes(today)) {
      next.completedDates.push(today);
    }
    next.totalXp += 25;

    const milestones = getStreakMilestones(lang);
    const milestone = milestones.find((m) => m.days === newStreak);
    if (milestone) {
      celebrations.push({
        id: `milestone-${milestone.id}-${today}`,
        kind: 'milestone',
        title:
          lang === 'ar'
            ? `إنجاز جديد: ${milestone.title}!`
            : `Milestone Unlocked: ${milestone.title}!`,
        subtitle:
          lang === 'ar'
            ? `سلسلة ${newStreak} أيام • ${milestone.rewardText}`
            : `${newStreak}-Day Exploration Streak • ${milestone.rewardText}`,
        streakCount: newStreak,
      });
    } else {
      celebrations.push({
        id: `streak-${today}`,
        kind: 'streak',
        title:
          lang === 'ar'
            ? newStreak === 1
              ? 'بدأت سلسلة الاستكشاف اليومية!'
              : `استمرت السلسلة لـ ${newStreak} أيام!`
            : newStreak === 1
              ? 'Daily Exploration Streak Ignited!'
              : `${newStreak}-Day Streak Extended!`,
        subtitle:
          lang === 'ar'
            ? 'واصل استكشاف المجموعة الشمسية يومياً لتعزيز سلسلتك.'
            : 'Keep exploring the Solar System each day to build your streak.',
        streakCount: newStreak,
      });
    }
  }

  // 3. Check Daily Missions completion
  const missions = getDailyMissions(today, lang);
  for (const m of missions) {
    if (!next.completedMissionIds.includes(m.id)) {
      const prog = getMissionProgress(next, m);
      if (prog >= m.targetCount) {
        next.completedMissionIds.push(m.id);
        next.totalXp += m.xp;
        celebrations.push({
          id: `mission-${m.id}`,
          kind: 'mission',
          title:
            lang === 'ar'
              ? `اكتملت المهمة اليومية! (+${m.xp} XP)`
              : `Daily Objective Complete! (+${m.xp} XP)`,
          subtitle: m.title,
        });
      }
    }
  }

  saveExplorationState(next);
  return { state: next, celebrations, xpEarnedNow };
}

/** Builds a 7-day window ending today for the weekly streak calendar */
export function getLastSevenDays(
  completedDates: string[],
  today = toDateKey(),
  lang: 'en' | 'ar' = detectActiveLang()
) {
  const completedSet = new Set(completedDates);
  const baseMs = parseDateKey(today);
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayNames = lang === 'ar' ? dayNamesAr : dayNamesEn;

  return Array.from({ length: 7 }, (_, i) => {
    const offset = i - 6;
    const d = new Date(baseMs + offset * 86400000);
    const key = toDateKey(d);
    return {
      key,
      label: dayNames[d.getDay()],
      dayNum: d.getDate(),
      completed: completedSet.has(key),
      isToday: offset === 0,
    };
  });
}

export function getMotivationalMessage(
  streak: number,
  completedToday: boolean,
  lang: 'en' | 'ar' = detectActiveLang()
): string {
  if (lang === 'ar') {
    if (!completedToday) {
      return streak > 0
        ? `لديك سلسلة نشطة لمدة ${streak} أيام! استكشف كوكباً أو مهمة اليوم للحفاظ على شعلتك.`
        : 'اختر أي كوكب أو مهمة سطحية اليوم لإشعال اليوم الأول في سلسلة استكشافك!';
    }
    if (streak >= 30) {
      return 'التزام مذهل أيها القائد! سجلك في استكشاف الفضاء العميق من بين الأفضل في الأسطول.';
    }
    if (streak >= 7) {
      return `${streak} أيام متتالية من الاكتشاف العلمي! عد غداً للانطلاق أبعد في النظام الخارجي.`;
    }
    if (streak >= 3) {
      return `سلسلة ${streak} أيام نشطة! لقد وصلت إلى السرعة المدارية — واصل العودة يومياً لفتح وسام ملّاح الفضاء العميق.`;
    }
    return 'تم تسجيل استكشافك اليوم! عد غداً لتمديد سلسلتك نحو وسام مرشح الطيران المداري (3 أيام).';
  }

  if (!completedToday) {
    return streak > 0
      ? `You're on a ${streak}-day streak! Explore a planet or mission today to keep your flame burning.`
      : 'Select any planet or surface mission today to ignite your Day 1 exploration streak!';
  }
  if (streak >= 30) {
    return 'Incredible dedication, Commander. Your deep-space telemetry log is among the finest in the fleet.';
  }
  if (streak >= 7) {
    return `${streak} consecutive days of discovery! Return tomorrow to push further into the outer system.`;
  }
  if (streak >= 3) {
    return `${streak}-day streak active! You've reached orbital velocity — keep returning daily to unlock Deep Space Navigator.`;
  }
  return 'Today’s exploration is logged! Come back tomorrow to extend your streak toward the 3-day Orbital Cadet badge.';
}
