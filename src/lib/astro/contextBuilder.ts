// src/lib/astro/contextBuilder.ts
//
// Builds a compact, targeted exploration context payload for Astro AI.
// Only includes the celestial body, mission landmark, timeline chapter, and resources
// relevant to what the student is currently viewing or asking about — never the entire database.

import { celestialBodies, type PlanetData } from '../../data/planets';
import {
  deepSpaceMissions,
  getChapters,
  getLandmark,
  getLandmarksForBody,
  landmarks,
  type Landmark,
} from '../../data/landmarks';
import { planetResources } from '../../data/resources';

export interface ExplorationContextInput {
  isExploring: boolean;
  selectedBodyId: string | null;
  activeLandmarkId: string | null;
  timelineProgress?: number;
  currentStreak?: number;
  totalXp?: number;
  uiLanguage?: 'en' | 'ar';
}

export interface CompactBodyContext {
  id: string;
  name: string;
  type: string;
  description: string;
  radius: string;
  distanceFromSun: string;
  orbitalSpeed: string;
  moons: number;
  atmosphere: string;
  funFact: string;
  missionsOnBody: Array<{
    id: string;
    name: string;
    agency: string;
    years: string;
    kind: string;
    status: string;
  }>;
  resources?: Array<{ title: string; type: string; source: string; description: string }>;
}

export interface CompactLandmarkContext {
  id: string;
  name: string;
  bodyId: string;
  agency: string;
  years: string;
  kind: string;
  status: string;
  coordinates: { lat: number; lon: number };
  currentChapter?: { index: number; total: number; title: string; caption: string };
  story: Landmark['story'];
}

export type QueryIntent = 'conversational' | 'general_space' | 'contextual_telemetry';

export interface StructuredAstroContext {
  intent?: QueryIntent;
  uiLanguage?: 'en' | 'ar';
  viewState: 'welcome_screen' | 'solar_system_overview' | 'planet_inspector' | 'mission_timeline';
  selectedBody: CompactBodyContext | null;
  activeLandmark: CompactLandmarkContext | null;
  referencedBodies: CompactBodyContext[];
  referencedLandmarks: CompactLandmarkContext[];
  studentProgress?: { streakDays: number; totalXp: number };
}

const ARABIC_BODY_KEYWORDS: Record<string, string[]> = {
  sun: ['الشمس', 'شمس'],
  mercury: ['عطارد'],
  venus: ['الزهرة', 'زهرة'],
  earth: ['الأرض', 'الارض', 'أرض'],
  moon: ['القمر', 'قمر'],
  mars: ['المريخ', 'مريخ'],
  jupiter: ['المشتري', 'مشتري'],
  saturn: ['زحل'],
  uranus: ['أورانوس', 'اورانوس'],
  neptune: ['نبتون'],
};

const CONVERSATIONAL_PATTERNS =
  /^(hi+|hello+|hey+|yo|hola|good\s*(morning|afternoon|evening)|how\s+are\s+you|who\s+are\s+you|what\s+are\s+you|what\s+can\s+you\s+do|help|thanks|thank\s+you|thx|ok|okay|cool|nice|great|awesome|bye|goodbye|مرحبا|أهلا|اهلا|السلام\s*عليكم|صباح\s*الخير|مساء\s*الخير|كيف\s*حالك|من\s*أنت|من\s*انت|شكرا|شكراً|تمام|حسنا)[\s!?.،؟]*$/i;

const CONTEXT_DEICTIC_PATTERNS =
  /\b(this|here|it|its|current|selected|viewing|planet|moon|star|mission|equipment|rover|lander|orbiter|probe|site|location|timeline|chapter|step|quiz|happened|sent|discover|simpler|simple|explain\s+that|more\s+about)\b|(هذا|هذه|هنا|الحالي|الكوكب|القمر|المهمة|المركبة|الروفر|المسبار|الموقع|الخط\s*الزمني|اشرح|ببساطة)/i;

/**
 * Classifies the user's question so simple greetings or general space questions
 * do not unnecessarily serialize or process heavy space telemetry data.
 */
export function classifyQueryIntent(
  userQuery: string,
  input: ExplorationContextInput
): QueryIntent {
  const trimmed = userQuery.trim();
  if (!trimmed || CONVERSATIONAL_PATTERNS.test(trimmed)) {
    return 'conversational';
  }

  const q = trimmed.toLowerCase();

  // Check if any specific body or landmark is explicitly mentioned
  for (const body of Object.values(celestialBodies)) {
    const arWords = ARABIC_BODY_KEYWORDS[body.id] ?? [];
    if (
      q.includes(body.name.toLowerCase()) ||
      q.includes(body.id) ||
      arWords.some((w) => q.includes(w))
    ) {
      return 'contextual_telemetry';
    }
  }

  const allMissions = [...landmarks, ...deepSpaceMissions];
  for (const lm of allMissions) {
    if (
      q.includes(lm.id.toLowerCase()) ||
      q.includes(lm.name.toLowerCase()) ||
      (lm.id === 'apollo11' && (q.includes('apollo') || q.includes('tranquility') || q.includes('eagle') || q.includes('أبولو') || q.includes('ابولو'))) ||
      (lm.id === 'lrv' && (q.includes('roving vehicle') || q.includes('moon buggy') || q.includes('lunar rover') || q.includes('عربة القمر'))) ||
      (lm.id === 'alsep' && (q.includes('alsep') || q.includes('ألسيب'))) ||
      (lm.id === 'surveyor' && (q.includes('surveyor') || q.includes('سيرفيور'))) ||
      (lm.id === 'sojourner' && (q.includes('sojourner') || q.includes('pathfinder') || q.includes('سوجورنر'))) ||
      (lm.id === 'viking' && (q.includes('viking') || q.includes('فايكنغ') || q.includes('فايكنج'))) ||
      (lm.id === 'phoenix_insight' && (q.includes('phoenix') || q.includes('insight') || q.includes('فينيكس') || q.includes('إنسايت'))) ||
      (lm.id === 'venera13' && (q.includes('venera') || q.includes('فينيرا'))) ||
      (lm.id === 'spirit' && q.includes('سبيريت')) ||
      (lm.id === 'opportunity' && q.includes('أوبورتيونيتي'))
    ) {
      return 'contextual_telemetry';
    }
  }

  // If the user is viewing a planet or mission and uses deictic/contextual words
  if ((input.selectedBodyId || input.activeLandmarkId) && CONTEXT_DEICTIC_PATTERNS.test(q)) {
    return 'contextual_telemetry';
  }

  return 'general_space';
}

function serializeBody(body: PlanetData, includeResources = false): CompactBodyContext {
  const bodyLandmarks = getLandmarksForBody(body.id);
  const resList = includeResources ? (planetResources[body.id] ?? []).slice(0, 3) : undefined;

  return {
    id: body.id,
    name: body.name,
    type: body.type,
    description: body.description,
    radius: body.radius,
    distanceFromSun: body.distanceFromSun,
    orbitalSpeed: body.orbitalSpeed,
    moons: body.moons,
    atmosphere: body.atmosphere,
    funFact: body.funFact,
    missionsOnBody: bodyLandmarks.map((l) => ({
      id: l.id,
      name: l.name,
      agency: l.agency,
      years: l.years,
      kind: l.kind,
      status: l.status,
    })),
    resources: resList?.map((r) => ({
      title: r.title,
      type: r.type,
      source: r.source,
      description: r.description,
    })),
  };
}

function serializeLandmark(l: Landmark, progress?: number): CompactLandmarkContext {
  const chapters = getChapters(l);
  let idx = 0;
  if (typeof progress === 'number') {
    chapters.forEach((c, i) => {
      if (progress >= c.at) idx = i;
    });
  }
  const ch = chapters[idx];

  return {
    id: l.id,
    name: l.name,
    bodyId: l.bodyId,
    agency: l.agency,
    years: l.years,
    kind: l.kind,
    status: l.status,
    coordinates: { lat: l.lat, lon: l.lon },
    currentChapter: ch
      ? { index: idx + 1, total: chapters.length, title: ch.title, caption: ch.caption }
      : undefined,
    story: l.story,
  };
}

/**
 * Builds the selective context object for the current UI state + any entities mentioned in `userQuery`.
 */
export function buildAstroContext(
  input: ExplorationContextInput,
  userQuery = ''
): StructuredAstroContext {
  const q = userQuery.toLowerCase();
  const intent = classifyQueryIntent(userQuery, input);

  const activeLandmarkObj = input.activeLandmarkId ? getLandmark(input.activeLandmarkId) : undefined;
  const effectiveBodyId = input.selectedBodyId ?? activeLandmarkObj?.bodyId ?? null;
  const selectedBodyObj = effectiveBodyId ? celestialBodies[effectiveBodyId] : undefined;

  const viewState: StructuredAstroContext['viewState'] = !input.isExploring
    ? 'welcome_screen'
    : activeLandmarkObj
      ? 'mission_timeline'
      : selectedBodyObj
        ? 'planet_inspector'
        : 'solar_system_overview';

  // Fast path: for simple conversational greetings or general space questions that don't need UI telemetry,
  // avoid serializing planet/mission telemetry records altogether.
  if (intent === 'conversational' || intent === 'general_space') {
    return {
      intent,
      uiLanguage: input.uiLanguage,
      viewState,
      selectedBody: null,
      activeLandmark: null,
      referencedBodies: [],
      referencedLandmarks: [],
    };
  }

  // Detect any additional bodies or landmarks explicitly mentioned in the student's question
  const referencedBodies: CompactBodyContext[] = [];
  for (const body of Object.values(celestialBodies)) {
    if (body.id === effectiveBodyId) continue;
    const arWords = ARABIC_BODY_KEYWORDS[body.id] ?? [];
    if (
      q.includes(body.name.toLowerCase()) ||
      q.includes(body.id) ||
      arWords.some((w) => q.includes(w))
    ) {
      referencedBodies.push(serializeBody(body, false));
    }
  }

  const referencedLandmarks: CompactLandmarkContext[] = [];
  for (const lm of [...landmarks, ...deepSpaceMissions]) {
    if (lm.id === input.activeLandmarkId) continue;
    const nameTokens = lm.name.toLowerCase();
    if (
      q.includes(lm.id.toLowerCase()) ||
      q.includes(nameTokens) ||
      (lm.id === 'apollo11' && (q.includes('apollo') || q.includes('tranquility') || q.includes('eagle') || q.includes('أبولو') || q.includes('ابولو'))) ||
      (lm.id === 'lrv' && (q.includes('roving vehicle') || q.includes('moon buggy') || q.includes('lunar rover') || q.includes('عربة القمر'))) ||
      (lm.id === 'alsep' && (q.includes('alsep') || q.includes('ألسيب'))) ||
      (lm.id === 'surveyor' && (q.includes('surveyor') || q.includes('سيرفيور'))) ||
      (lm.id === 'sojourner' && (q.includes('sojourner') || q.includes('pathfinder') || q.includes('سوجورنر'))) ||
      (lm.id === 'viking' && (q.includes('viking') || q.includes('فايكنغ') || q.includes('فايكنج'))) ||
      (lm.id === 'phoenix_insight' && (q.includes('phoenix') || q.includes('insight') || q.includes('فينيكس') || q.includes('إنسايت'))) ||
      (lm.id === 'venera13' && (q.includes('venera') || q.includes('فينيرا'))) ||
      (lm.id === 'spirit' && q.includes('سبيريت')) ||
      (lm.id === 'opportunity' && q.includes('أوبورتيونيتي'))
    ) {
      referencedLandmarks.push(serializeLandmark(lm));
    }
  }

  // Only include the currently selected body's telemetry if the user didn't specifically ask about a DIFFERENT planet/mission
  // or if they also referenced the active body/deictic context.
  const arSelectedWords = effectiveBodyId ? (ARABIC_BODY_KEYWORDS[effectiveBodyId] ?? []) : [];
  const mentionsSelectedBody =
    !!selectedBodyObj &&
    (q.includes(selectedBodyObj.name.toLowerCase()) ||
      q.includes(selectedBodyObj.id) ||
      arSelectedWords.some((w) => q.includes(w)) ||
      CONTEXT_DEICTIC_PATTERNS.test(q));

  const includeSelectedBody =
    !!selectedBodyObj &&
    (mentionsSelectedBody || (referencedBodies.length === 0 && referencedLandmarks.length === 0));

  // If the student asks a general question about rovers/landers/missions on the selected body
  if (
    !activeLandmarkObj &&
    includeSelectedBody &&
    selectedBodyObj &&
    referencedLandmarks.length === 0 &&
    (q.includes('rover') || q.includes('lander') || q.includes('mission') || q.includes('probe') || q.includes('روفر') || q.includes('مهمة'))
  ) {
    for (const lm of getLandmarksForBody(selectedBodyObj.id)) {
      referencedLandmarks.push(serializeLandmark(lm));
    }
  }

  return {
    intent,
    uiLanguage: input.uiLanguage,
    viewState,
    selectedBody: includeSelectedBody && selectedBodyObj ? serializeBody(selectedBodyObj, false) : null,
    activeLandmark: activeLandmarkObj
      ? serializeLandmark(activeLandmarkObj, input.timelineProgress)
      : null,
    referencedBodies: referencedBodies.slice(0, 2),
    referencedLandmarks: referencedLandmarks.slice(0, 2),
    studentProgress:
      typeof input.currentStreak === 'number' && typeof input.totalXp === 'number'
        ? { streakDays: input.currentStreak, totalXp: input.totalXp }
        : undefined,
  };
}

/** Formats the structured context into a concise markdown block for the model. Returns empty string when no telemetry is needed. */
export function formatContextForPrompt(ctx: StructuredAstroContext): string {
  if (
    ctx.intent === 'conversational' ||
    (!ctx.selectedBody &&
      !ctx.activeLandmark &&
      ctx.referencedBodies.length === 0 &&
      ctx.referencedLandmarks.length === 0)
  ) {
    return '';
  }

  const lines: string[] = ['[CURRENT STUDENT EXPLORATION CONTEXT]'];
  lines.push(`- Current View Mode: ${ctx.viewState}`);

  if (ctx.studentProgress) {
    lines.push(
      `- Student Progress: ${ctx.studentProgress.streakDays}-day streak, ${ctx.studentProgress.totalXp} XP`
    );
  }

  if (ctx.selectedBody) {
    const b = ctx.selectedBody;
    lines.push(
      `- Currently Selected Celestial Body: ${b.name} (${b.type})`,
      `  • Description: ${b.description}`,
      `  • Radius: ${b.radius} | Distance from Sun: ${b.distanceFromSun} | Orbital Speed: ${b.orbitalSpeed}`,
      `  • Moons: ${b.moons} | Atmosphere: ${b.atmosphere}`,
      `  • Fun Fact: ${b.funFact}`
    );
    if (b.missionsOnBody.length > 0) {
      lines.push(
        `  • Historical Missions on ${b.name}: ${b.missionsOnBody
          .map((m) => `${m.name} (${m.agency}, ${m.years} - ${m.status})`)
          .join('; ')}`
      );
    }
  }

  if (ctx.activeLandmark) {
    const l = ctx.activeLandmark;
    lines.push(
      `- Currently Viewing Mission / Equipment Timeline: ${l.name} (${l.kind} on ${l.bodyId.toUpperCase()})`,
      `  • Agency & Years: ${l.agency}, ${l.years} | Status: ${l.status}`,
      `  • Surface Coordinates: ${l.coordinates.lat}°, ${l.coordinates.lon}°`
    );
    if (l.currentChapter) {
      lines.push(
        `  • Active Timeline Chapter (${l.currentChapter.index}/${l.currentChapter.total} - "${l.currentChapter.title}"): ${l.currentChapter.caption}`
      );
    }
    lines.push(
      `  • Full Verified Mission Timeline:`,
      `    1. Mission: ${l.story.mission}`,
      `    2. Why Here: ${l.story.why}`,
      `    3. Events: ${l.story.events}`,
      `    4. Fate: ${l.story.fate}`,
      `    5. Science: ${l.story.science}`,
      `    6. Facts: ${l.story.facts.join(' | ')}`
    );
  }

  for (const rb of ctx.referencedBodies) {
    lines.push(
      `- Referenced Celestial Body (${rb.name}): ${rb.description} | Radius: ${rb.radius} | Distance: ${rb.distanceFromSun} | Orbital Speed: ${rb.orbitalSpeed} | Moons: ${rb.moons} | Atmosphere: ${rb.atmosphere} | Fun Fact: ${rb.funFact}`
    );
  }

  for (const rl of ctx.referencedLandmarks) {
    lines.push(
      `- Referenced Mission (${rl.name}, ${rl.agency}, ${rl.years} on ${rl.bodyId}):`,
      `  • Mission: ${rl.story.mission}`,
      `  • Why Here: ${rl.story.why}`,
      `  • Events: ${rl.story.events}`,
      `  • Fate: ${rl.story.fate}`,
      `  • Science: ${rl.story.science}`,
      `  • Facts: ${rl.story.facts.join(' | ')}`
    );
  }

  return lines.join('\n');
}

/** Returns context-aware starter prompts tailored to what the student is currently viewing. */
export function getContextualSuggestions(
  input: ExplorationContextInput,
  lang: 'en' | 'ar' = input.uiLanguage ?? 'en',
  localizedName?: string
): string[] {
  if (lang === 'ar') {
    if (input.activeLandmarkId) {
      const lm = getLandmark(input.activeLandmarkId);
      const lmLabel = localizedName || lm?.name || 'هذه المهمة';
      if (lm) {
        return [
          `لماذا أُرسلت مهمة ${lmLabel} إلى هذا الموقع؟`,
          `ماذا حدث لمركبة ${lmLabel} في نهاية مهمتها؟`,
          `ما أهم الاكتشافات العلمية التي حققتها ${lmLabel}؟`,
          'اشرح لي هذه المهمة الفضائية بكلمات مبسطة.',
          'ما الفرق بين مركبة الهبوط (Lander) والعربة الجوالة (Rover)؟',
        ];
      }
    }

    if (input.selectedBodyId) {
      const body = celestialBodies[input.selectedBodyId];
      const bodyMissions = getLandmarksForBody(input.selectedBodyId);
      const bodyLabel = localizedName || body?.name || 'هذا الجرم';
      if (body) {
        const base = [
          `حدثني عن ${bodyLabel} وما الذي يجعله فريداً في المجموعة الشمسية.`,
          `كيف يبدو الغلاف الجوي والسطح على ${bodyLabel}؟`,
        ];
        if (bodyMissions.length > 0) {
          base.push(`ما هي المهمات الفضائية التاريخية التي هبطت على ${bodyLabel}؟`);
          base.push(`لماذا تبقى بعض المركبات الفضائية على سطح ${bodyLabel}؟`);
        } else {
          base.push(`كيف تستكشف وكالة ناسا ${bodyLabel}؟`);
          base.push(`كيف يُقارن ${bodyLabel} بكوكب الأرض؟`);
        }
        base.push('اشرح كيف تعمل العربات الجوالة والمسابير المدارية.');
        return base;
      }
    }

    return [
      'حدثني عن كوكب المريخ.',
      'كيف تعمل العربات الفضائية الجوالة (Rovers)؟',
      'ما هي أشهر مهمة تاريخية إلى سطح القمر؟',
      'لماذا تبقى بعض المركبات الفضائية على أسطح الكواكب؟',
      'اشرح كيف تستكشف وكالة ناسا الكواكب الأخرى.',
    ];
  }

  if (input.activeLandmarkId) {
    const lm = getLandmark(input.activeLandmarkId);
    if (lm) {
      return [
        `Why was ${lm.name} sent to this location?`,
        `What happened to ${lm.name} at the end of its mission?`,
        `What did ${lm.name} discover for science?`,
        'Explain this mission in simpler words.',
        `What is the difference between a lander and a rover?`,
      ];
    }
  }

  if (input.selectedBodyId) {
    const body = celestialBodies[input.selectedBodyId];
    const bodyMissions = getLandmarksForBody(input.selectedBodyId);
    if (body) {
      const base = [
        `Tell me about ${body.name} and what makes it unique.`,
        `What is ${body.name}'s atmosphere and surface like?`,
      ];
      if (bodyMissions.length > 0) {
        base.push(`What historical missions landed on ${body.name}?`);
        base.push(`Why do some spacecraft remain on ${body.name}'s surface?`);
      } else {
        base.push(`How does NASA explore ${body.name}?`);
        base.push(`How does ${body.name} compare to Earth?`);
      }
      base.push('Explain how planetary rovers and orbiters work.');
      return base;
    }
  }

  return [
    'Tell me about Mars.',
    'How do planetary rovers work?',
    'What is the most interesting mission to the Moon?',
    'Why do some spacecraft remain on planetary surfaces?',
    'Explain how NASA explores other planets.',
  ];
}

