// server/astroHandler.ts
//
// Secure server-side Gemini API handler for Astro AI.
// Uses the official @google/genai SDK and keeps GEMINI_API_KEY strictly on the server.

import { GoogleGenAI } from '@google/genai';
import {
  ASTRO_COMPACT_SYSTEM_INSTRUCTION,
  ASTRO_SYSTEM_INSTRUCTION,
} from '../src/lib/astro/systemInstruction';
import {
  formatContextForPrompt,
  type StructuredAstroContext,
} from '../src/lib/astro/contextBuilder';
import { celestialBodies } from '../src/data/planets';
import { deepSpaceMissions, getLandmarksForBody, landmarks } from '../src/data/landmarks';

export interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

export interface AstroChatRequest {
  message: string;
  history?: ChatHistoryTurn[];
  context?: StructuredAstroContext;
  stream?: boolean;
}

export interface AstroChatResponse {
  reply: string;
  model: string;
  mode: 'gemini' | 'local_kb';
  notice?: string;
  error?: string;
}

export type AstroStreamChunk =
  | { type: 'delta'; text: string }
  | { type: 'done'; model: string; mode: 'gemini' | 'local_kb'; notice?: string }
  | { type: 'error'; error: string };

const MAX_HISTORY_TURNS = 8;
const MAX_MESSAGE_CHARS = 1500;
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 36;
const PER_MODEL_TIMEOUT_MS = 5_500;

const FAST_GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-4-hydrogen',
  'gemini-3.6-flash',
];

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(clientKey: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(clientKey);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(clientKey, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  bucket.count += 1;
  return true;
}

function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Instantaneous (<2ms) reply for pure conversational greetings, thanks, or assistant identity questions
 * so the user never waits on an external API call or telemetry analysis for "Hi" / "Who are you?".
 */
function tryInstantConversationalReply(
  message: string,
  ctx?: StructuredAstroContext
): string | null {
  const trimmed = message.trim();
  const q = trimmed.toLowerCase();
  const arabic = isArabicText(trimmed);

  if (arabic) {
    if (/^(مرحبا|أهلا|اهلا|السلام\s*عليكم|صباح\s*الخير|مساء\s*الخير|هاي|هلا)[\s!?.،؟]*$/i.test(trimmed)) {
      const bodyName = ctx?.selectedBody?.name;
      return bodyName
        ? `أهلاً بك يا مستكشف الفضاء! 👋 أنا **Astro AI**. أرى أنك تستكشف **${bodyName}** الآن—هل تحب أن نتعرف على خصائصه أو المهمات التاريخية المتعلقة به؟`
        : `أهلاً بك يا مستكشف الفضاء! 👋 أنا **Astro AI**، مساعدك الذكي لاستكشاف المجموعة الشمسية والمهمات الفضائية. أي كوكب أو مهمة تود أن نستكشفها معاً اليوم؟`;
    }
    if (/^(من\s*أنت|من\s*انت|ما\s*هو\s*دورك|ماذا\s*تفعل)[\s!?.،؟]*$/i.test(trimmed)) {
      return `أنا **Astro AI** 🚀، معلمك ومساعدك الذكي لاستكشاف الفضاء في منصة **Solar System Atlas**. أساعدك في فهم الكواكب، الأقمار، المركبات الفضائية، والخطوط الزمنية للمهمات التاريخية بلغة علمية مبسطة ودقيقة.`;
    }
    if (/^(شكرا|شكراً|شكرا\s*لك|ممتاز|رائع|تمام)[\s!?.،؟]*$/i.test(trimmed)) {
      return `على الرحب والسعة يا مستكشف الفضاء! 🌟 أخبرني في أي وقت إذا كان لديك أي سؤال آخر حول الكواكب أو المركبات الفضائية.`;
    }
    return null;
  }

  if (/^(hi+|hello+|hey+|yo|hola|good\s*(morning|afternoon|evening)|howdy)[\s!?.]*$/i.test(q)) {
    const activeLm = ctx?.activeLandmark?.name;
    const activeBody = ctx?.selectedBody?.name;
    if (activeLm) {
      return `Hey there, Explorer! 👋 I’m **Astro AI**. I see you’re inspecting **${activeLm}**—ask me anything about its mission, instruments, or discoveries!`;
    }
    if (activeBody) {
      return `Hey there, Explorer! 👋 I’m **Astro AI**. You currently have **${activeBody}** selected—what would you like to know about it?`;
    }
    return `Hey there, Explorer! 👋 I’m **Astro AI**, your space exploration assistant. Ask me anything about the planets, moons, rovers, or historical NASA & Soviet missions!`;
  }

  if (/^(how\s+are\s+you|how's\s+it\s+going|how\s+are\s+things)[\s!?.]*$/i.test(q)) {
    return `All systems nominal and ready for launch! 🚀 What corner of the Solar System would you like to explore today?`;
  }

  if (/^(who\s+are\s+you|what\s+are\s+you|what\s+can\s+you\s+do|help)[\s!?.]*$/i.test(q)) {
    return [
      `I’m **Astro AI** 🚀, your interactive space science teacher built into **Solar System Atlas**.`,
      '',
      `- **Planets & Moons:** Ask about any world’s atmosphere, orbit, temperature, or geology.`,
      `- **Moon Equipment:** Explore **Apollo Lunar Modules (Apollo 11 Eagle)**, **Lunar Roving Vehicles (LRVs)**, **ALSEP Scientific Packages**, and **Surveyor Landers**.`,
      `- **Mars Equipment:** Explore **Sojourner**, **Spirit & Opportunity**, **Viking 1 & 2**, **Phoenix & InSight**, and the **Ingenuity Helicopter**.`,
      `- **Deep-Space & Planetary Missions:** Ask about **Venera 13**, **MESSENGER**, **Cassini–Huygens**, **Hubble**, **Dawn**, **NEAR Shoemaker**, **Pioneer 10 & 11**, and **Kepler**!`,
    ].join('\n');
  }

  if (/^(thanks|thank\s+you|thx|ty|cool|nice|great|awesome|ok|okay)[\s!?.]*$/i.test(q)) {
    return `You’re very welcome, Explorer! 🌟 Let me know whenever you’re ready for the next cosmic question.`;
  }

  return null;
}

/**
 * Resolves any planet or mission mentioned directly in `message` from the local verified dataset
 * even when the client opted not to attach full UI telemetry.
 */
function resolveEntitiesFromDataset(message: string, ctx?: StructuredAstroContext) {
  const q = message.toLowerCase();
  let lm = ctx?.activeLandmark ?? ctx?.referencedLandmarks?.[0] ?? null;
  let body = ctx?.selectedBody ?? ctx?.referencedBodies?.[0] ?? null;

  if (!lm) {
    const matchedLm = [...landmarks, ...deepSpaceMissions].find(
      (l) =>
        q.includes(l.id.toLowerCase()) ||
        q.includes(l.name.toLowerCase()) ||
        (l.id === 'apollo11' && (q.includes('apollo') || q.includes('tranquility') || q.includes('eagle') || q.includes('أبولو'))) ||
        (l.id === 'lrv' && (q.includes('roving vehicle') || q.includes('moon buggy') || q.includes('lunar rover') || q.includes('عربة القمر'))) ||
        (l.id === 'alsep' && (q.includes('alsep') || q.includes('ألسيب'))) ||
        (l.id === 'surveyor' && (q.includes('surveyor') || q.includes('سيرفيور'))) ||
        (l.id === 'sojourner' && (q.includes('sojourner') || q.includes('pathfinder') || q.includes('سوجورنر'))) ||
        (l.id === 'viking' && (q.includes('viking') || q.includes('فايكنغ') || q.includes('فايكنج'))) ||
        (l.id === 'phoenix_insight' && (q.includes('phoenix') || q.includes('insight') || q.includes('فينيكس') || q.includes('إنسايت'))) ||
        (l.id === 'venera13' && (q.includes('venera') || q.includes('فينيرا')))
    );
    if (matchedLm) {
      lm = {
        id: matchedLm.id,
        name: matchedLm.name,
        bodyId: matchedLm.bodyId,
        agency: matchedLm.agency,
        years: matchedLm.years,
        kind: matchedLm.kind,
        status: matchedLm.status,
        coordinates: { lat: matchedLm.lat, lon: matchedLm.lon },
        story: matchedLm.story,
      };
    }
  }

  if (!body) {
    const arabicBodyMap: Record<string, string[]> = {
      sun: ['الشمس', 'شمس'],
      mercury: ['عطارد'],
      venus: ['الزهرة', 'زهرة'],
      earth: ['الأرض', 'الارض'],
      moon: ['القمر', 'قمر'],
      mars: ['المريخ', 'مريخ'],
      jupiter: ['المشتري', 'مشتري'],
      saturn: ['زحل'],
      uranus: ['أورانوس', 'اورانوس'],
      neptune: ['نبتون'],
    };
    const matchedBody = Object.values(celestialBodies).find(
      (b) =>
        q.includes(b.name.toLowerCase()) ||
        q.includes(b.id) ||
        (arabicBodyMap[b.id] ?? []).some((w) => q.includes(w))
    );
    if (matchedBody) {
      body = {
        id: matchedBody.id,
        name: matchedBody.name,
        type: matchedBody.type,
        description: matchedBody.description,
        radius: matchedBody.radius,
        distanceFromSun: matchedBody.distanceFromSun,
        orbitalSpeed: matchedBody.orbitalSpeed,
        moons: matchedBody.moons,
        atmosphere: matchedBody.atmosphere,
        funFact: matchedBody.funFact,
        missionsOnBody: getLandmarksForBody(matchedBody.id).map((m) => ({
          id: m.id,
          name: m.name,
          agency: m.agency,
          years: m.years,
          kind: m.kind,
          status: m.status,
        })),
      };
    }
  }

  return { lm, body };
}

/**
 * Grounded knowledge-base response strictly derived from the verified platform context,
 * used when GEMINI_API_KEY is unconfigured or when upstream Gemini services experience temporary network outages.
 */
function buildVerifiedFallbackReply(
  message: string,
  history: ChatHistoryTurn[],
  ctx?: StructuredAstroContext
): string {
  const instant = tryInstantConversationalReply(message, ctx);
  if (instant) return instant;

  const arabic =
    isArabicText(message) ||
    (ctx?.uiLanguage === 'ar' && !/[a-zA-Z]{3,}/.test(message));
  const q = message.toLowerCase();
  const { lm, body } = resolveEntitiesFromDataset(message, ctx);

  if (arabic) {
    if (lm) {
      return [
        `أهلاً بك يا مستكشف الفضاء! 🌟 نحن نستكشف الآن مهمة **${lm.name}** (${lm.agency}، ${lm.years ?? ''}) على سطح **${(lm.bodyId ?? '').toUpperCase()}**.`,
        '',
        `- **المهمة:** ${lm.story.mission}`,
        `- **لماذا هذا الموقع؟** ${lm.story.why}`,
        `- **أهم الأحداث:** ${lm.story.events}`,
        `- **مصير المركبة:** ${lm.story.fate}`,
        `- **الإنجاز العلمي:** ${lm.story.science}`,
        `- **معلومة إضافية:** ${lm.story.facts[0] ?? ''}`,
        '',
        `هل تحب أن نكمل الخط الزمني للمهمة ثم نخوض اختبار المعلومات؟`,
      ].join('\n');
    }
    if (body) {
      const missionsLine =
        body.missionsOnBody.length > 0
          ? `\n- **المهمات التاريخية على السطح:** ${body.missionsOnBody.map((m) => `${m.name} (${m.years})`).join('، ')}`
          : '';
      return [
        `أهلاً بك! لنلقي نظرة علمية على **${body.name}**:`,
        '',
        `- **نظرة عامة:** ${body.description}`,
        `- **نصف القطر:** ${body.radius}`,
        `- **المسافة من الشمس:** ${body.distanceFromSun}`,
        `- **السرعة المدارية:** ${body.orbitalSpeed}`,
        `- **الغلاف الجوي:** ${body.atmosphere}${missionsLine}`,
        `- **هل تعلم؟** ${body.funFact}`,
      ].join('\n');
    }
    return [
      'أهلاً بك يا مستكشف الفضاء! 👋 أنا **Astro AI**، مساعدك التعليمي لاستكشاف المجموعة الشمسية.',
      '',
      'يمكنك اختيار أي كوكب أو قمر من المشهد ثلاثي الأبعاد، أو النقر على مواقع المهمات التاريخية على **المريخ** و**القمر** و**الزهرة** و**عطارد** وسأشرح لك كل تفاصيلها العلمية بدقة!',
    ].join('\n');
  }

  // Simplify request ("explain this in simpler words")
  if (q.includes('simpler') || q.includes('simple') || q.includes('eli5')) {
    const lastModel = [...history].reverse().find((h) => h.role === 'model');
    if (lm) {
      return [
        `Here is the story of **${lm.name}** in simple words:`,
        '',
        `- **What it was:** A robotic ${lm.kind} built by ${lm.agency} (${lm.years ?? ''}).`,
        `- **Its goal:** ${lm.story.mission}`,
        `- **What happened:** ${lm.story.events}`,
        `- **How it ended:** ${lm.story.fate}`,
        `- **Big discovery:** ${lm.story.science}`,
      ].join('\n');
    }
    if (body) {
      return [
        `In simple terms, here is what makes **${body.name}** special:`,
        '',
        `- ${body.description}`,
        `- It orbits at **${body.distanceFromSun}** from the Sun at **${body.orbitalSpeed}**.`,
        `- **Atmosphere:** ${body.atmosphere}.`,
        `- **Fun fact:** ${body.funFact}`,
      ].join('\n');
    }
    if (lastModel) {
      return `In short: space agencies use robotic spacecraft—orbiters to map a world from above, landers to study one spot on the ground, and rovers with wheels to drive around and test rocks—before ever risking human astronauts.`;
    }
  }

  // Active or referenced landmark questions
  if (lm) {
    const bodyLabel = lm.bodyId ? lm.bodyId.charAt(0).toUpperCase() + lm.bodyId.slice(1) : 'the surface';
    if (q.includes('why') && (q.includes('here') || q.includes('location') || q.includes('site') || q.includes('sent'))) {
      return [
        `**Why ${lm.name} was sent to ${bodyLabel}:**`,
        '',
        `- **Mission Purpose:** ${lm.story.mission}`,
        `- **Why This Landing Site:** ${lm.story.why}`,
        '',
        `Would you like to know what happened after it arrived, or what scientific discoveries it made?`,
      ].join('\n');
    }
    if (q.includes('after that') || q.includes('happen') || q.includes('end') || q.includes('fate') || q.includes('lost') || q.includes('abandon')) {
      return [
        `Here is what happened during and at the end of **${lm.name}** (${lm.agency}, ${lm.years ?? ''}):`,
        '',
        `- **During the Mission:** ${lm.story.events}`,
        `- **How It Ended:** ${lm.story.fate}`,
        `- **What It Taught Us:** ${lm.story.science}`,
      ].join('\n');
    }
    return [
      `Here is the verified mission briefing for **${lm.name}** (${lm.agency}, ${lm.years ?? ''}) on **${(lm.bodyId ?? '').toUpperCase()}**:`,
      '',
      `- **The Mission:** ${lm.story.mission}`,
      `- **Why This Site:** ${lm.story.why}`,
      `- **What Happened:** ${lm.story.events}`,
      `- **Final Fate:** ${lm.story.fate}`,
      `- **Scientific Legacy:** ${lm.story.science}`,
      `- **Did You Know?** ${lm.story.facts[0] ?? ''}`,
      '',
      `Once you finish the 6 timeline chapters, you can click **Start Quiz** to test your mission knowledge and earn XP!`,
    ].join('\n');
  }

  // General rover / lander / exploration questions
  if (q.includes('difference') && q.includes('lander') && q.includes('rover')) {
    return [
      'Great question! Both **landers** and **rovers** touch down on a planet or moon, but they explore differently:',
      '',
      '- **Lander (Stationary Science Lab):** Stays in the exact spot where it touched down. Examples in our atlas include **Apollo 11’s Eagle** on the Moon, **Venera 13** on Venus, and **Beagle 2** on Mars.',
      '- **Rover (Mobile Robot Geologist):** Has wheels so it can drive across the surface to inspect different rocks, craters, and hills. Examples in our atlas include **Spirit** and **Opportunity** on Mars, and **Lunokhod 1** on the Moon.',
      '',
      'Would you like to visit one of these rovers or landers on Mars or the Moon right now?',
    ].join('\n');
  }

  if (q.includes('rover') && (q.includes('how') || q.includes('what is') || q.includes('work'))) {
    return [
      'A **planetary rover** is a wheeled robotic spacecraft built to drive across the surface of another planet or moon like a field geologist.',
      '',
      '- **Power:** Many rovers (like **Spirit** and **Opportunity** on Mars) use solar panels to turn sunlight into electricity, while **Lunokhod 1** on the Moon also used a radioactive heater to survive the freezing two-week lunar night.',
      '- **Navigation & Instruments:** Rovers carry panoramic cameras, robotic arms, and spectrometers to inspect rocks and soil.',
      '- **Communication:** Because radio signals take minutes to travel between planets (and over a second even to the Moon), rovers receive commands from human teams on Earth and transmit back images and data.',
      '',
      'Try selecting **Mars** or the **Moon** to explore Spirit, Opportunity, or Lunokhod 1 on the 3D globe!',
    ].join('\n');
  }

  if (q.includes('remain') || q.includes('left behind') || q.includes('abandon')) {
    return [
      'Spacecraft remain on planetary surfaces for a few key scientific and engineering reasons:',
      '',
      '- **Weight & Fuel Limits (Apollo 11):** Launching weight off a moon or planet requires enormous fuel. The Apollo 11 astronauts left the lower half of the **Eagle** lander, tools, and a laser reflector behind so they could lift off with 21 kg of lunar rock.',
      '- **Extreme Environments:** On Venus, **Venera 13** faced 460 °C heat and 90× Earth’s atmospheric pressure, surviving 127 minutes. On Mars, **Opportunity** lost sunlight during a 2018 global dust storm, and **Spirit** became trapped in soft sand at Troy.',
      '- **End of Orbital Fuel (MESSENGER):** Orbiters like **MESSENGER** around Mercury eventually run out of propellant and impact the surface.',
      '',
      'Click on **Mars**, the **Moon**, **Venus**, or **Mercury** to inspect these historic sites directly!',
    ].join('\n');
  }

  if (body) {
    const missionsText =
      body.missionsOnBody.length > 0
        ? `\n- **Surface Missions to Explore Here:** ${body.missionsOnBody
            .map((m) => `**${m.name}** (${m.agency}, ${m.years})`)
            .join(', ')}`
        : '';

    return [
      `Here is what we know about **${body.name}** (${body.type}):`,
      '',
      `- **Overview:** ${body.description}`,
      `- **Radius:** ${body.radius}`,
      `- **Distance from Sun:** ${body.distanceFromSun}`,
      `- **Orbital Speed:** ${body.orbitalSpeed}`,
      `- **Moons:** ${body.moons} | **Atmosphere:** ${body.atmosphere}${missionsText}`,
      `- **Did You Know?** ${body.funFact}`,
      '',
      body.missionsOnBody.length > 0
        ? `Click on one of the glowing markers on **${body.name}** to launch its 3D mission timeline!`
        : `What aspect of **${body.name}** would you like to explore further?`,
    ].join('\n');
  }

  return [
    'Great question, Explorer! Here is how NASA and international space agencies explore the Solar System:',
    '',
    '1. **Orbiters (Global Mapping):** Spacecraft like **MESSENGER** at Mercury or **Mars Express** orbit from above to map terrain, minerals, and magnetic fields.',
    '2. **Landers (Surface Touchdown):** Craft like **Venera 13** on Venus, **Beagle 2** on Mars, and **Apollo 11’s Eagle** on the Moon land at carefully chosen flat basins.',
    '3. **Rovers (Mobile Exploration):** Robotic geologists like **Spirit**, **Opportunity**, and **Lunokhod 1** drive across craters and plains to analyze rocks and search for signs of ancient water.',
    '',
    'Select any planet in the 3D Solar System—or ask me about **Mars**, the **Moon**, **Venus**, or **Mercury**—and we’ll dive right in!',
  ].join('\n');
}

function buildOrderedCandidateModels(preferredModel: string): string[] {
  const cleanPreferred = preferredModel.trim();
  const isDeprecated25 = cleanPreferred.startsWith('gemini-2.5-');
  const isFastLite = cleanPreferred.includes('flash-lite');

  // Always prioritize gemini-3.5-flash-lite first unless another flash-lite model is explicitly configured,
  // because non-lite 3.x models frequently experience 15-30s upstream queue stalls.
  return Array.from(
    new Set([
      ...(isFastLite && !isDeprecated25 ? [cleanPreferred] : []),
      ...FAST_GEMINI_MODELS,
      ...(!isDeprecated25 && cleanPreferred ? [cleanPreferred] : []),
    ])
  );
}

function preparePromptAndConfig(
  message: string,
  history: ChatHistoryTurn[],
  context?: StructuredAstroContext
) {
  const contextBlock = context ? formatContextForPrompt(context) : '';
  const hasTelemetry = contextBlock.length > 0;
  const isShortSimpleQuery = !hasTelemetry && message.length < 140;
  const preferArabic =
    isArabicText(message) ||
    (context?.uiLanguage === 'ar' && !/[a-zA-Z]{4,}/.test(message));
  const langDirective = preferArabic
    ? '\n[LANGUAGE DIRECTIVE: Please respond in clear, natural Arabic (العربية).]'
    : '';

  const contents = [
    ...history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text.slice(0, MAX_MESSAGE_CHARS) }],
    })),
    {
      role: 'user' as const,
      parts: [
        {
          text: hasTelemetry
            ? `${contextBlock}${langDirective}\n\n[STUDENT QUESTION]\n${message}`
            : `${message}${langDirective}`,
        },
      ],
    },
  ];

  const systemInstruction = hasTelemetry
    ? ASTRO_SYSTEM_INSTRUCTION
    : ASTRO_COMPACT_SYSTEM_INSTRUCTION;
  const maxOutputTokens = isShortSimpleQuery ? 420 : 750;

  return { contents, systemInstruction, maxOutputTokens };
}

/**
 * Streams NDJSON chunks (`{ type: 'delta', text }`, `{ type: 'done', model, mode }`)
 * so the frontend renders words immediately (<1s) instead of waiting for the full generation.
 */
export async function streamAstroChatResponse(
  body: AstroChatRequest,
  env: { GEMINI_API_KEY?: string; GEMINI_MODEL?: string },
  clientIp: string,
  writeChunk: (chunk: AstroStreamChunk) => void
): Promise<void> {
  if (!checkRateLimit(clientIp)) {
    writeChunk({
      type: 'error',
      error: 'Astro AI is receiving too many messages right now. Please wait a few seconds and try again.',
    });
    return;
  }

  const rawMessage = (body?.message ?? '').trim();
  if (!rawMessage) {
    writeChunk({
      type: 'error',
      error: 'Please enter a question for Astro AI.',
    });
    return;
  }

  const message = rawMessage.slice(0, MAX_MESSAGE_CHARS);
  const history = Array.isArray(body.history)
    ? body.history
        .filter((h) => h && (h.role === 'user' || h.role === 'model') && typeof h.text === 'string')
        .slice(-MAX_HISTORY_TURNS)
    : [];

  // 1. Instant conversational fast-path (<2ms) — no network wait or telemetry needed
  const instantReply = tryInstantConversationalReply(message, body.context);
  if (instantReply) {
    writeChunk({ type: 'delta', text: instantReply });
    writeChunk({ type: 'done', model: 'astro-instant', mode: 'gemini' });
    return;
  }

  const apiKey = (env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? '').trim();
  const modelName =
    (env.GEMINI_MODEL ?? process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite').trim() ||
    'gemini-3.5-flash-lite';

  const hasValidKey =
    apiKey.length > 10 && apiKey !== 'your_secret_key' && !apiKey.startsWith('YOUR_');

  if (!hasValidKey) {
    const fallbackReply = buildVerifiedFallbackReply(message, history, body.context);
    writeChunk({ type: 'delta', text: fallbackReply });
    writeChunk({
      type: 'done',
      model: modelName,
      mode: 'local_kb',
      notice:
        'Running on verified local Atlas dataset. Add GEMINI_API_KEY in .env to enable live Gemini AI generation.',
    });
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const { contents, systemInstruction, maxOutputTokens } = preparePromptAndConfig(
    message,
    history,
    body.context
  );
  const candidates = buildOrderedCandidateModels(modelName);

  for (const candidateModel of candidates) {
    let emittedAnyText = false;
    try {
      const stream = await ai.models.generateContentStream({
        model: candidateModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.45,
          maxOutputTokens,
          abortSignal: AbortSignal.timeout(PER_MODEL_TIMEOUT_MS),
        },
      });

      for await (const chunk of stream) {
        const piece = chunk.text;
        if (piece) {
          emittedAnyText = true;
          writeChunk({ type: 'delta', text: piece });
        }
      }

      if (emittedAnyText) {
        writeChunk({ type: 'done', model: candidateModel, mode: 'gemini' });
        return;
      }
    } catch (err: any) {
      // If chunks were already streamed to the user, finish cleanly rather than duplicating text
      if (emittedAnyText) {
        writeChunk({ type: 'done', model: candidateModel, mode: 'gemini' });
        return;
      }

      const status = Number(err?.status || err?.statusCode || 500);
      const rawMsg = String(err?.message || '').toLowerCase();

      // If API key itself is invalid, fail fast and notify
      if (status === 401 || status === 403 || rawMsg.includes('api key not valid')) {
        writeChunk({
          type: 'error',
          error:
            'Gemini API key could not be authenticated. Please check GEMINI_API_KEY in your server .env file.',
        });
        return;
      }
      // Otherwise try the next fast model candidate immediately
      continue;
    }
  }

  // Seamless resilience fallback: if all upstream Gemini models are temporarily overloaded or unreachable,
  // answer immediately from the verified Solar System Atlas dataset so the user's conversation is never interrupted.
  const fallbackReply = buildVerifiedFallbackReply(message, history, body.context);
  writeChunk({ type: 'delta', text: fallbackReply });
  writeChunk({
    type: 'done',
    model: 'atlas-verified-kb',
    mode: 'local_kb',
  });
}

export async function handleAstroChatRequest(
  body: AstroChatRequest,
  env: { GEMINI_API_KEY?: string; GEMINI_MODEL?: string },
  clientIp = 'local'
): Promise<{ status: number; data: AstroChatResponse }> {
  if (!checkRateLimit(clientIp)) {
    return {
      status: 429,
      data: {
        reply: '',
        model: env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        mode: 'gemini',
        error:
          'Astro AI is receiving too many messages right now. Please wait a few seconds and try again.',
      },
    };
  }

  const rawMessage = (body?.message ?? '').trim();
  if (!rawMessage) {
    return {
      status: 400,
      data: {
        reply: '',
        model: env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        mode: 'gemini',
        error: 'Please enter a question for Astro AI.',
      },
    };
  }

  const message = rawMessage.slice(0, MAX_MESSAGE_CHARS);
  const history = Array.isArray(body.history)
    ? body.history
        .filter((h) => h && (h.role === 'user' || h.role === 'model') && typeof h.text === 'string')
        .slice(-MAX_HISTORY_TURNS)
    : [];

  // Instant conversational fast-path (<2ms)
  const instantReply = tryInstantConversationalReply(message, body.context);
  if (instantReply) {
    return {
      status: 200,
      data: {
        reply: instantReply,
        model: 'astro-instant',
        mode: 'gemini',
      },
    };
  }

  const apiKey = (env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? '').trim();
  const modelName =
    (env.GEMINI_MODEL ?? process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite').trim() ||
    'gemini-3.5-flash-lite';

  const hasValidKey =
    apiKey.length > 10 &&
    apiKey !== 'your_secret_key' &&
    !apiKey.startsWith('YOUR_');

  if (!hasValidKey) {
    const fallbackReply = buildVerifiedFallbackReply(message, history, body.context);
    return {
      status: 200,
      data: {
        reply: fallbackReply,
        model: modelName,
        mode: 'local_kb',
        notice:
          'Running on verified local Atlas dataset. Add GEMINI_API_KEY in .env to enable live Gemini AI generation.',
      },
    };
  }

  try {
    const result = await handleAstroChatWithModels(
      apiKey,
      modelName,
      message,
      history,
      body.context
    );
    return result;
  } catch (err: any) {
    const status = Number(err?.status || err?.statusCode || 500);
    const rawMsg = String(err?.message || '').toLowerCase();

    if (status === 401 || status === 403 || rawMsg.includes('api key not valid')) {
      return {
        status: 401,
        data: {
          reply: '',
          model: modelName,
          mode: 'gemini',
          error:
            'Gemini API key could not be authenticated. Please check GEMINI_API_KEY in your server .env file.',
        },
      };
    }

    // Seamless fallback on temporary upstream timeout / 503 overload so the conversation isn't interrupted
    const fallbackReply = buildVerifiedFallbackReply(message, history, body.context);
    return {
      status: 200,
      data: {
        reply: fallbackReply,
        model: 'atlas-verified-kb',
        mode: 'local_kb',
      },
    };
  }
}

async function handleAstroChatWithModels(
  apiKey: string,
  preferredModel: string,
  message: string,
  history: ChatHistoryTurn[],
  context?: StructuredAstroContext
): Promise<{ status: number; data: AstroChatResponse }> {
  const ai = new GoogleGenAI({ apiKey });
  const { contents, systemInstruction, maxOutputTokens } = preparePromptAndConfig(
    message,
    history,
    context
  );

  const candidates = buildOrderedCandidateModels(preferredModel);
  let lastError: any = null;

  for (const candidateModel of candidates) {
    try {
      const response = await ai.models.generateContent({
        model: candidateModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.45,
          maxOutputTokens,
          abortSignal: AbortSignal.timeout(PER_MODEL_TIMEOUT_MS),
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        throw new Error('Empty response from Gemini model.');
      }

      return {
        status: 200,
        data: {
          reply: replyText,
          model: candidateModel,
          mode: 'gemini',
        },
      };
    } catch (err: any) {
      lastError = err;
      const status = Number(err?.status || err?.statusCode || 500);
      const isAbort = err?.name === 'AbortError' || err?.name === 'TimeoutError';
      if (isAbort || status === 404 || status === 429 || status === 503 || status === 500) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All Gemini models failed.');
}

