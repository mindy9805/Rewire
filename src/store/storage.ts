/**
 * LocalStorage 資料層
 * - 所有個人資料存於單一鍵 STORAGE_KEY，並帶有 version 以便未來升級資料格式。
 * - 讀取時一律經過 normalize()：缺少的欄位自動補上預設值、型別不符的欄位會被捨棄，
 *   避免舊資料或手動修改造成網站當機。
 * - 匯入備份時使用 validateBackup()，格式錯誤會回傳清楚的中文錯誤訊息。
 */
import type { AppData, ChapterId, CollectionKey, H7Id, H7Plan, LifeCompass, PatternChallengeState, PatternHabitId, RenewalSettings, RenewDim, Settings } from '../types';

export const STORAGE_KEY = 'rewire:v1';

export const CHAPTER_IDS: ChapterId[] = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9'];

export const COLLECTION_KEYS: CollectionKey[] = [
  'notes',
  'journal',
  'habitLogs',
  'emotionLogs',
  'sleepLogs',
  'plans',
  'rehearsals',
  'smallSteps',
  'sessions',
  'identityRewrites',
  'selfTalk',
  'dailyLogs',
  'habitAudits',
  'counterChoices',
  'patternAssessments',
  'patternEntries',
  'microCommitments',
  'commitmentLogs',
  'workshops',
  'h7SelfChecks',
  'circles',
  'quadrantTasks',
  'big3Weeks',
  'negotiations',
  'empathyLogs',
  'teamBoards',
  'renewalChecks',
  'renewalHabits',
  'renewalHabitLogs',
  'restLogs',
  'questLogs',
  'savedCards',
  'storyPlays',
  'capsules',
];

/**
 * 資料結構修訂紀錄（version 仍為 1，代表備份格式相容）：
 * - revision 1：初版（章節、筆記、14 天挑戰、工具）
 * - revision 2：Daily Rewire、Break the Pattern
 * - revision 3：7 Habits｜高效能生活實踐
 * - revision 4：Playful Growth（輕冒險、盲盒、小劇場、收藏、花園、時光膠囊）與首頁自訂
 * 讀取任何舊修訂的資料都會由 normalize() 補齊新欄位，不會刪除既有紀錄。
 */
export const CURRENT_REVISION = 4;

export const H7_IDS: H7Id[] = ['proactive', 'end', 'first', 'winwin', 'understand', 'synergize', 'renew'];
export const RENEW_DIMS: RenewDim[] = ['physical', 'mental', 'spiritual', 'social'];

export const emptyCompass = (): LifeCompass => ({ areas: {}, vision: '', keyword: '', goals: [], updatedAt: '' });
export const emptyRenewalSettings = (): RenewalSettings => ({
  weights: { physical: 3, mental: 3, spiritual: 3, social: 3 },
  goals: { physical: '', mental: '', spiritual: '', social: '' },
  spiritualLabel: '價值與意義',
});
export const emptyH7Plan = (): H7Plan => ({ startedAt: '', days: {}, finalReview: '' });

export const PATTERN_IDS: PatternHabitId[] = ['approval', 'convenience', 'impress', 'solitude', 'promises', 'environment', 'shortterm'];

export const emptyPatternChallenge = (): PatternChallengeState => ({ activeHabitId: '', status: 'none', level: 'standard', progress: {} });

/** 心智花園格子數（6 × 4） */
export const GARDEN_CELLS = 24;

export const defaultHomeSections: Settings['homeSections'] = {
  buddy: true,
  garden: true,
  today: true,
  collection: true,
  explore: true,
  // 既有的完整內容區塊預設收起，可在「自訂首頁」重新開啟
  daily: false,
  pattern: false,
  habits7: false,
  chapters: false,
};

export const defaultSettings: Settings = {
  theme: 'system',
  fontScale: 'md',
  rightPanelOpen: true,
  storageNoticeDismissed: false,
  buddyVisible: true,
  homeSections: { ...defaultHomeSections },
  hiddenStats: [],
};

/** 建立一份全新的空白資料（不含任何假資料） */
export function createEmptyData(): AppData {
  return {
    version: 1,
    settings: { ...defaultSettings },
    chapters: {},
    quizzes: {},
    notes: [],
    journal: [],
    habitLogs: [],
    emotionLogs: [],
    sleepLogs: [],
    plans: [],
    rehearsals: [],
    smallSteps: [],
    sessions: [],
    identityRewrites: [],
    selfTalk: [],
    challenge: {},
    dailyLogs: [],
    dailyFavorites: [],
    habitAudits: [],
    counterChoices: [],
    patternFocus: [],
    patternAssessments: [],
    patternEntries: [],
    microCommitments: [],
    commitmentLogs: [],
    workshops: [],
    patternChallenge: emptyPatternChallenge(),
    h7Progress: {},
    h7Quizzes: {},
    h7SelfChecks: [],
    circles: [],
    lifeCompass: emptyCompass(),
    quadrantTasks: [],
    big3Weeks: [],
    negotiations: [],
    empathyLogs: [],
    empathyFavorites: [],
    teamBoards: [],
    renewalSettings: emptyRenewalSettings(),
    renewalChecks: [],
    renewalHabits: [],
    renewalHabitLogs: [],
    restLogs: [],
    h7Plan: emptyH7Plan(),
    questLogs: [],
    savedCards: [],
    storyPlays: [],
    capsules: [],
    wheelExcluded: [],
    garden: { theme: 'spring', plants: [] },
    unlocks: {},
    revision: CURRENT_REVISION,
    neuralReps: 0,
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** 陣列中只保留「物件且有字串 id」的項目 */
function cleanArray(v: unknown): Record<string, unknown>[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => isObj(x) && typeof x.id === 'string') as Record<string, unknown>[];
}

/** 將任意輸入整理成合法的 AppData（容錯讀取） */
export function normalize(input: unknown): AppData {
  const base = createEmptyData();
  if (!isObj(input)) return base;

  const s = isObj(input.settings) ? input.settings : {};
  base.settings = {
    theme: s.theme === 'light' || s.theme === 'dark' || s.theme === 'system' ? s.theme : defaultSettings.theme,
    fontScale: ['sm', 'md', 'lg', 'xl'].includes(s.fontScale as string)
      ? (s.fontScale as Settings['fontScale'])
      : defaultSettings.fontScale,
    rightPanelOpen: typeof s.rightPanelOpen === 'boolean' ? s.rightPanelOpen : true,
    storageNoticeDismissed: s.storageNoticeDismissed === true,
    buddyVisible: s.buddyVisible !== false,
    homeSections: { ...defaultHomeSections, ...(isObj(s.homeSections) ? Object.fromEntries(Object.entries(s.homeSections).filter(([k, v]) => k in defaultHomeSections && typeof v === 'boolean')) : {}) },
    hiddenStats: Array.isArray(s.hiddenStats) ? s.hiddenStats.filter((x): x is string => typeof x === 'string') : [],
  };

  if (isObj(input.chapters)) {
    for (const id of CHAPTER_IDS) {
      const c = input.chapters[id];
      if (isObj(c)) base.chapters[id] = { ...c, completed: c.completed === true } as AppData['chapters'][ChapterId];
    }
  }
  if (isObj(input.quizzes)) {
    for (const id of CHAPTER_IDS) {
      const q = input.quizzes[id];
      if (isObj(q) && typeof q.score === 'number' && typeof q.total === 'number' && isObj(q.answers)) {
        base.quizzes[id] = q as unknown as AppData['quizzes'][ChapterId];
      }
    }
  }
  for (const key of COLLECTION_KEYS) {
    (base as unknown as Record<string, unknown>)[key] = cleanArray(input[key]);
  }
  // 標籤欄位一律確保為字串陣列
  base.notes = base.notes.map((n) => ({ ...n, tags: Array.isArray(n.tags) ? n.tags.filter((t) => typeof t === 'string') : [] }));
  base.habitAudits = base.habitAudits.map((a) => ({ ...a, ratings: isObj(a.ratings) ? a.ratings : {}, focusId: typeof a.focusId === 'string' ? a.focusId : '' }));
  base.dailyLogs = base.dailyLogs.map((l) => ({ ...l, practiceId: Number.isInteger(l.practiceId) && l.practiceId! >= 0 && l.practiceId! <= 7 ? l.practiceId : 0 }));
  base.journal = base.journal.map((n) => ({ ...n, tags: Array.isArray(n.tags) ? n.tags.filter((t) => typeof t === 'string') : [] }));

  if (isObj(input.challenge)) {
    for (const [k, v] of Object.entries(input.challenge)) {
      const day = Number(k);
      if (Number.isInteger(day) && day >= 1 && day <= 14 && isObj(v)) {
        base.challenge[k] = {
          completed: v.completed === true,
          completedAt: typeof v.completedAt === 'string' ? v.completedAt : undefined,
          note: typeof v.note === 'string' ? v.note : '',
          affirmationReflection: typeof v.affirmationReflection === 'string' ? v.affirmationReflection : '',
          microActionDone: v.microActionDone === true,
          feeling: typeof v.feeling === 'string' ? v.feeling : '',
          updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : undefined,
        };
      }
    }
  }
  if (Array.isArray(input.dailyFavorites)) {
    base.dailyFavorites = [...new Set(input.dailyFavorites.filter((n) => Number.isInteger(n) && n >= 1 && n <= 7))] as number[];
  }
  // Break the Pattern：焦點習慣與 14 天打破慣性挑戰
  if (Array.isArray(input.patternFocus)) {
    base.patternFocus = [...new Set(input.patternFocus.filter((x): x is PatternHabitId => PATTERN_IDS.includes(x as PatternHabitId)))].slice(0, 3);
  }
  base.patternEntries = base.patternEntries.filter((e) => ['validation', 'comfort', 'spending', 'quiet', 'environment', 'choice'].includes((e as { kind?: string }).kind ?? ''));
  if (isObj(input.patternChallenge)) {
    const pc = input.patternChallenge;
    const progress: PatternChallengeState['progress'] = {};
    if (isObj(pc.progress)) {
      for (const id of PATTERN_IDS) {
        const days = pc.progress[id];
        if (!isObj(days)) continue;
        const clean: Record<string, NonNullable<PatternChallengeState['progress'][PatternHabitId]>[string]> = {};
        for (const [k, v] of Object.entries(days)) {
          const n = Number(k);
          if (!Number.isInteger(n) || n < 1 || n > 14 || !isObj(v)) continue;
          clean[k] = {
            completed: v.completed === true,
            completedAt: typeof v.completedAt === 'string' ? v.completedAt : undefined,
            note: typeof v.note === 'string' ? v.note : '',
            reflection: typeof v.reflection === 'string' ? v.reflection : '',
            oldPattern: ['none', 'once', 'many'].includes(v.oldPattern as string) ? (v.oldPattern as 'none' | 'once' | 'many') : '',
            usedAlternative: v.usedAlternative === true,
            updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : undefined,
          };
        }
        progress[id] = clean;
      }
    }
    base.patternChallenge = {
      activeHabitId: PATTERN_IDS.includes(pc.activeHabitId as PatternHabitId) ? (pc.activeHabitId as PatternHabitId) : '',
      status: pc.status === 'active' || pc.status === 'paused' ? pc.status : 'none',
      level: pc.level === 'gentle' ? 'gentle' : 'standard',
      progress,
    };
  }
  // ===== 7 Habits =====
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  if (isObj(input.h7Progress)) {
    for (const id of H7_IDS) {
      const p = input.h7Progress[id];
      if (isObj(p) && (p.status === 'learning' || p.status === 'done')) {
        base.h7Progress[id] = { status: p.status, startedAt: str(p.startedAt), completedAt: typeof p.completedAt === 'string' ? p.completedAt : undefined };
      }
    }
  }
  if (isObj(input.h7Quizzes)) {
    for (const id of H7_IDS) {
      const q = input.h7Quizzes[id];
      if (isObj(q) && typeof q.score === 'number' && typeof q.total === 'number' && isObj(q.answers)) base.h7Quizzes[id] = q as unknown as AppData['h7Quizzes'][H7Id];
    }
  }
  if (isObj(input.lifeCompass)) {
    const c = input.lifeCompass;
    const areas: LifeCompass['areas'] = {};
    if (isObj(c.areas)) for (const [k, v] of Object.entries(c.areas)) if (isObj(v)) areas[k] = { values: str(v.values), why: str(v.why), oneYear: str(v.oneYear), adjust: str(v.adjust), next: str(v.next) };
    base.lifeCompass = {
      areas,
      vision: str(c.vision),
      keyword: str(c.keyword),
      goals: Array.isArray(c.goals) ? c.goals.filter(isObj).map((g) => ({ id: str(g.id) || Math.random().toString(36).slice(2), text: str(g.text), plan: str(g.plan), done: g.done === true })) : [],
      updatedAt: str(c.updatedAt),
    };
  }
  if (Array.isArray(input.empathyFavorites)) base.empathyFavorites = [...new Set(input.empathyFavorites.filter((x): x is string => typeof x === 'string'))];
  if (isObj(input.renewalSettings)) {
    const r = input.renewalSettings;
    const def = emptyRenewalSettings();
    const weights = { ...def.weights };
    const goals = { ...def.goals };
    for (const d of RENEW_DIMS) {
      const w = isObj(r.weights) ? r.weights[d] : undefined;
      if (typeof w === 'number' && w >= 1 && w <= 5) weights[d] = Math.round(w);
      if (isObj(r.goals)) goals[d] = str(r.goals[d]);
    }
    base.renewalSettings = { weights, goals, spiritualLabel: str(r.spiritualLabel) || def.spiritualLabel } as RenewalSettings;
  }
  base.renewalChecks = base.renewalChecks.map((c) => ({ ...c, scores: { physical: 0, mental: 0, spiritual: 0, social: 0, ...(isObj(c.scores) ? c.scores : {}) } as Record<RenewDim, number> }));
  if (isObj(input.h7Plan)) {
    const p = input.h7Plan;
    const days: H7Plan['days'] = {};
    if (isObj(p.days)) {
      for (const [k, v] of Object.entries(p.days)) {
        const n = Number(k);
        if (Number.isInteger(n) && n >= 1 && n <= 21 && isObj(v)) days[k] = { completed: v.completed === true, completedAt: typeof v.completedAt === 'string' ? v.completedAt : undefined, reflection: str(v.reflection), actionPlan: str(v.actionPlan), updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : undefined };
      }
    }
    base.h7Plan = { startedAt: str(p.startedAt), days, finalReview: str(p.finalReview) };
  }
  // ===== Playful Growth =====
  if (Array.isArray(input.wheelExcluded)) base.wheelExcluded = input.wheelExcluded.filter((x): x is string => typeof x === 'string');
  if (isObj(input.garden)) {
    const g = input.garden;
    base.garden = {
      theme: str(g.theme) || 'spring',
      plants: Array.isArray(g.plants)
        ? g.plants.filter(isObj).filter((p) => typeof p.kind === 'string' && Number.isInteger(p.cell) && (p.cell as number) >= 0 && (p.cell as number) < GARDEN_CELLS).map((p) => ({ id: str(p.id) || Math.random().toString(36).slice(2), kind: p.kind as string, cell: p.cell as number, placedAt: str(p.placedAt) }))
        : [],
    };
  }
  if (isObj(input.unlocks)) {
    for (const [k, v] of Object.entries(input.unlocks)) if (isObj(v)) base.unlocks[k] = { date: str(v.date), evidence: str(v.evidence) };
  }
  base.revision = CURRENT_REVISION;
  if (typeof input.neuralReps === 'number' && input.neuralReps >= 0) base.neuralReps = Math.floor(input.neuralReps);
  return base;
}

/** 從 LocalStorage 讀取；無資料或無法讀取時回傳空白資料 */
export function loadData(storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): AppData {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : createEmptyData();
  } catch {
    return createEmptyData();
  }
}

/** 寫入 LocalStorage；失敗（例如容量已滿或無痕模式限制）時回傳 false */
export function saveData(data: AppData, storage: Pick<Storage, 'setItem'> | undefined = safeStorage()): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(data));
    return !!storage;
  } catch {
    return false;
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : undefined;
  } catch {
    return undefined;
  }
}

/** 匯出備份檔的外層格式 */
export interface BackupFile {
  app: 'rewire';
  exportedAt: string;
  data: AppData;
}

export function createBackup(data: AppData): BackupFile {
  return { app: 'rewire', exportedAt: new Date().toISOString(), data };
}

export type ValidationResult = { ok: true; data: AppData; summary: string } | { ok: false; error: string };

/**
 * 驗證匯入的備份 JSON。
 * 規則：必須是本網站匯出的格式（app: 'rewire'、data.version === 1），且主要集合必須是陣列。
 */
export function validateBackup(text: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: '檔案不是有效的 JSON 格式，請確認選擇的是 Rewire 匯出的備份檔。' };
  }
  if (!isObj(parsed) || parsed.app !== 'rewire' || !isObj(parsed.data)) {
    return { ok: false, error: '找不到 Rewire 備份標記（app: "rewire"），這可能不是本網站的備份檔。' };
  }
  const d = parsed.data;
  if (d.version !== 1) {
    return { ok: false, error: `不支援的資料版本：${String(d.version)}。目前僅支援版本 1。` };
  }
  for (const key of COLLECTION_KEYS) {
    if (d[key] !== undefined && !Array.isArray(d[key])) {
      return { ok: false, error: `欄位「${key}」格式錯誤（應為清單）。` };
    }
  }
  const data = normalize(d);
  const count = COLLECTION_KEYS.reduce((sum, k) => sum + (data[k] as unknown[]).length, 0);
  const done = Object.values(data.challenge).filter((c) => c.completed).length;
  return { ok: true, data, summary: `共 ${count} 筆紀錄、14 天挑戰完成 ${done} 天。` };
}
