// src/i18n/types.ts
// Strongly-typed bilingual (English & Arabic) dictionary and data localization interfaces.

import type { Landmark } from '../data/landmarks';

export type Language = 'en' | 'ar';

export interface LocalizedBodyFields {
  name: string;
  typeLabel: string;
  regionLabel: string;
  description: string;
  radius: string;
  distanceFromSun: string;
  orbitalSpeed: string;
  atmosphere: string;
  funFact: string;
}

export interface LocalizedLandmarkFields {
  name: string;
  missionName: string;
  agency: string;
  years: string;
  landingDate: string;
  landingSite: string;
  shortDescription: string;
  status: string;
  kindLabel: string;
  chapterTitles: [string, string, string, string, string, string];
  story: Landmark['story'];
}

export interface LocalizedQuizQuestionFields {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  explanation: string;
}

export interface LocalizedResourceFields {
  title: string;
  description: string;
}

export interface Translations {
  langCode: Language;
  langLabelShort: string;
  dir: 'ltr' | 'rtl';

  // Language Switcher
  languageSwitcher: {
    ariaLabel: string;
    title: string;
    english: string;
    arabic: string;
    activeBadge: string;
  };

  // Hero / Welcome Screen
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleGradient: string;
    subtitle: string;
    beginTour: string;
    metricBodiesValue: string;
    metricBodiesLabel: string;
    metricOrbitsValue: string;
    metricOrbitsLabel: string;
    metricScaleValue: string;
    metricScaleLabel: string;
    hintDragRotate: string;
    hintScrollZoom: string;
    hintClickInspect: string;
  };

  // Topbar HUD
  topbar: {
    brandTitle: string;
    brandSubOverview: string;
    brandSubInspecting: (name: string) => string;
    solarOverviewBtn: string;
  };

  // Planet Inspector Drawer
  inspector: {
    closeAria: string;
    typeBadges: {
      star: string;
      planet: string;
      moon: string;
      dwarfPlanet: string;
    };
    telemetryTitle: string;
    meanRadius: string;
    distanceFromSun: string;
    orbitalVelocity: string;
    knownMoons: string;
    none: string;
    atmosphereSection: string;
    didYouKnow: string;
    factLoggedXp: string;
    logDiscoveryXp: string;
    missionsSectionTitle: (bodyName: string) => string;
    missionsCountBadge: (count: number) => string;
    missionsHint: string;
    activeStatus: string;
    hologramAction: string;
    storyAction: string;
    kindBadges: Record<Landmark['kind'], string>;
  };

  // Planet Navigator Popup & Bottom Dock
  navigator: {
    systemOverviewChip: string;
    bodiesCountBadge: string;
    exploreSolarSystemTitle: string;
    BodiesCountMeta: (count: number) => string;
    panelSubtitle: string;
    closeAria: string;
    filters: {
      all: string;
      inner: string;
      outer: string;
      companions: string;
    };
    regions: {
      star: string;
      inner: string;
      outer: string;
      moon: string;
    };
    activeBadge: string;
    moonsCount: (count: number) => string;
    footerHint: string;
    resetToOverview: string;
    openAria: string;
    closeNavAria: string;
  };

  // Holographic Equipment Display & Telemetry Panel
  hologram: {
    stageControlsAria: string;
    exitHologram: string;
    backToPlanet: (bodyName: string) => string;
    rescan: string;
    rescanTitle: string;
    modeHologram: string;
    modeWireframe: string;
    modePhysical: string;
    dragToRotateHint: string;
    headerStatusPrefix: string;
    closeAria: string;
    telemetryAgency: string;
    telemetryLandingDate: string;
    telemetryLandingSite: string;
    telemetryCoordinates: string;
    tabs: {
      overview: string;
      science: string;
      facts: string;
    };
    missionSummaryTitle: string;
    landingSiteRationaleTitle: string;
    surfaceOperationsTitle: string;
    scientificDiscoveriesTitle: string;
    missionOutcomeTitle: string;
    verifiedFactsTitle: (name: string) => string;
    otherEquipmentOnBody: (bodyName: string) => string;
    launch3DStory: string;
    missionQuizBtn: (xp: number) => string;
  };

  // Cinematic Timeline Overlay
  cinematic: {
    chapterCounter: (current: number, total: number) => string;
    CompletedQuizPrompt: (name: string) => string;
    startQuizBtn: string;
    restartStoryTitle: string;
    previousChapterTitle: string;
    playTitle: string;
    pauseTitle: string;
    nextChapterTitle: string;
    muteNarrationTitle: string;
    enableNarrationTitle: string;
    takeMissionQuizTitle: string;
    quizLabel: string;
    exitStoryLabel: string;
  };

  // Mission Quiz Modal
  quiz: {
    badgeComplete: string;
    badgeChallenge: (current: number, total: number) => string;
    closeAria: string;
    questionProgressAria: string;
    answerOptionsAria: string;
    verifiedInsight: string;
    missionDebrief: string;
    nextQuestion: string;
    viewMissionResults: string;
    scoreRatings: {
      perfectTitle: string;
      perfectSub: string;
      greatTitle: string;
      greatSub: string;
      goodTitle: string;
      goodSub: string;
      retryTitle: string;
      retrySub: string;
    };
    correctAnswersStat: string;
    accuracyScoreStat: string;
    xpRewardStat: string;
    previousBestNote: (bestScore: number, total: number, xpEarned: number) => string;
    retryQuizBtn: string;
    continueExploringBtn: string;
  };

  // Streak System & Daily Missions
  streak: {
    triggerAria: (streak: number) => string;
    triggerTitle: string;
    daySingular: string;
    dayPlural: string;
    toastDismissAria: string;
    modalBadge: string;
    modalTitle: string;
    closeAria: string;
    currentStreakLabel: string;
    bestStreakLabel: string;
    BestStreakSub: (days: number) => string;
    totalXpLabel: string;
    RankSub: (rank: string) => string;
    worldsVisitedLabel: string;
    MissionsDoneSub: (count: number) => string;
    last7DaysTitle: string;
    activeTodayBadge: string;
    completeActionBadge: string;
    dailyMissionsTitle: string;
    completedCount: (done: number, total: number) => string;
    doneBtn: string;
    goBtn: string;
    milestonesTitle: string;
    unlockedCount: (unlocked: number, total: number) => string;
    daysTarget: (days: number) => string;
    ranks: {
      cosmicLegend: string;
      deepSpaceCommander: string;
      missionSpecialist: string;
      orbitalNavigator: string;
      flightCadet: string;
    };
    motivational: {
      start: string;
      day1: string;
      day2to3: (days: number) => string;
      day4to6: (days: number) => string;
      day7to13: (days: number) => string;
      day14Plus: (days: number) => string;
    };
    dailyMissionTemplates: Record<string, { title: string; description: string }>;
    milestones: Record<string, { title: string; subtitle: string; badge: string }>;
    celebrations: {
      streakStartedTitle: string;
      streakDayTitle: (days: number) => string;
      streakContinuedSub: string;
      missionCompleteTitle: (title: string) => string;
      allDailyCompleteTitle: string;
      allDailyCompleteSub: string;
      quizCompleteTitle: (correct: number, total: number) => string;
      quizFirstTrySub: (xp: number) => string;
      quizImprovedSub: (xp: number) => string;
      quizReviewedSub: string;
    };
  };

  // Knowledge Center / Resources Section
  resources: {
    sectionTitle: string;
    sectionHeading: (bodyName: string) => string;
    sectionSubtitle: (bodyName: string) => string;
    countBadge: (count: number) => string;
    resourcesLabel: string;
    verifiedBadge: string;
    searchPlaceholder: (bodyName: string) => string;
    clearSearchAria: string;
    filterAll: string;
    types: {
      scientificArticles: string;
      spaceMissions: string;
      researchDiscoveries: string;
      imagesMedia: string;
      educationalMaterials: string;
      interactive3D: string;
    };
    exploreResourceBtn: string;
    learnMoreBtn: string;
    emptyTitle: string;
    emptySubtitle: string;
    noMatchText: (query: string) => string;
    resetFiltersBtn: string;
  };

  // Astro AI Assistant
  astro: {
    headerSubtitle: string;
    clearChatTitle: string;
    clearChatAria: string;
    minimizeTitle: string;
    minimizeAria: string;
    welcomeBadge: string;
    welcomeTitle: string;
    welcomeBody: string;
    suggestedQuestionsLabel: string;
    youLabel: string;
    astroLabel: string;
    copied: string;
    copy: string;
    explainSimpler: string;
    explainSimplerPrompt: string;
    thinkingStatus: string;
    retryQuestion: string;
    followUpSuggestionsAria: string;
    inputPlaceholder: (contextLabel: string) => string;
    sendAria: string;
    fabAria: string;
    fabTitle: string;
    fabSubtitle: string;
    contextBadge: {
      missionPrefix: string;
      exploringPrefix: string;
      solarSystemOverview: string;
      solarSystemAtlas: string;
    };
  };
}

