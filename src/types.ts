/**
 * 全站共用型別定義
 * - 「內容型別」：章節、測驗、研究來源等靜態學習內容（存放於 src/content）。
 * - 「使用者資料型別」：所有存在 LocalStorage 的個人紀錄（由 src/store 管理）。
 */

/* ========== 內容型別 ========== */

/** 章節編號 */
export type ChapterId = 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5' | 'ch6' | 'ch7' | 'ch8' | 'ch9';

/** 章節內嵌的互動元件種類（對應 components/interactive 與 tools） */
export type InteractiveKind =
  | 'neural-path'
  | 'cognitive-filter'
  | 'identity-rewriter'
  | 'self-talk'
  | 'habit-detective'
  | 'habit-curve'
  | 'tools'
  | 'if-then'
  | 'evidence';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** 正確選項索引（從 0 開始） */
  answer: number;
  /** 作答後顯示的解析 */
  explanation: string;
}

export interface ChapterSection {
  id: string;
  heading: string;
  paragraphs: string[];
  /** 選填：額外提醒或比喻框 */
  callout?: { label: string; text: string };
}

export interface Chapter {
  id: ChapterId;
  number: number;
  title: string;
  enTitle: string;
  subtitle: string;
  /** 預估閱讀分鐘數 */
  minutes: number;
  objectives: string[];
  coreConcepts: { term: string; definition: string }[];
  sections: ChapterSection[];
  cases: { title: string; story: string; insight: string }[];
  /** 示意圖說明文字（圖本身由 diagrams 元件繪製） */
  diagramCaption: string;
  applications: string[];
  reflection: string;
  quiz: QuizQuestion[];
  summary: string[];
  referenceIds: string[];
  interactive: InteractiveKind;
  /** 對應的每日心智語句編號（1–7） */
  affirmationIds: number[];
}

export interface Reference {
  id: string;
  authors: string;
  year: string;
  title: string;
  source: string;
  doi?: string;
  url?: string;
  /** 資料是否已核對（無法完整確認者標示「待查證」） */
  verified: boolean;
  note?: string;
  /** 若有科學證據檢視卡內容 */
  evidence?: EvidenceCard;
}

export interface EvidenceCard {
  topic: string;
  design: string;
  findings: string;
  sampleLimits: string;
  reasonable: string;
  oversimplified: string;
}

export interface Affirmation {
  id: number;
  theme: string;
  text: string;
  meaning: string;
  reflection: string;
  action: string;
  note?: string;
  /** 對應學習主題說明 */
  topics: string;
  chapterIds: ChapterId[];
}

export interface ChallengeDay {
  day: number;
  theme: string;
  knowledge: string;
  action: string;
  reflection: string;
  affirmationId: number;
  /** 相關章節，提供「延伸閱讀」入口 */
  chapterId: ChapterId;
}

/* ========== 使用者資料型別 ========== */

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontScale = 'sm' | 'md' | 'lg' | 'xl';

export interface Settings {
  theme: ThemeMode;
  fontScale: FontScale;
  rightPanelOpen: boolean;
  /** 是否已關閉首次本地儲存提示 */
  storageNoticeDismissed: boolean;
  /** 是否顯示成長夥伴 Rewire Buddy */
  buddyVisible: boolean;
  /** 首頁要顯示的區塊（使用者可自訂） */
  homeSections: Record<HomeSectionId, boolean>;
  /** 儀表板中使用者選擇隱藏的統計區塊 */
  hiddenStats: string[];
}

export type HomeSectionId = 'buddy' | 'garden' | 'today' | 'collection' | 'explore' | 'daily' | 'pattern' | 'habits7' | 'chapters';

export interface ChapterProgress {
  completed: boolean;
  completedAt?: string;
  lastVisitedAt?: string;
}

export interface QuizResult {
  answers: Record<string, number>;
  score: number;
  total: number;
  submittedAt: string;
}

/** 章節筆記：收藏重點或個人反思 */
export interface Note {
  id: string;
  chapterId: ChapterId | 'general';
  kind: 'highlight' | 'reflection';
  /** 收藏重點的來源段落標題 */
  source?: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  /** 情緒分數 1（很低落）～5（很好） */
  mood: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  behavior: string;
  time: string;
  place: string;
  emotion: string;
  cue: string;
  need: string;
  reward: string;
  cost: string;
  alternative: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmotionLog {
  id: string;
  core: string;
  word: string;
  intensity: number; // 1–10
  note: string;
  createdAt: string;
}

export interface SleepLog {
  id: string;
  date: string;
  bedtime: string; // HH:mm
  waketime: string; // HH:mm
  hours: number;
  quality: number; // 1–5
  note: string;
  createdAt: string;
}

export interface IfThenPlan {
  id: string;
  goal: string;
  situation: string;
  action: string;
  obstacle: string;
  backup: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rehearsal {
  id: string;
  scenario: string;
  ideal: string;
  obstacles: string;
  strategy: string;
  firstAction: string;
  createdAt: string;
}

export interface SmallStepPlan {
  id: string;
  goal: string;
  steps: { id: string; text: string; done: boolean }[];
  createdAt: string;
}

export interface PracticeSession {
  id: string;
  tool: 'sigh';
  seconds: number;
  createdAt: string;
}

export interface IdentityRewrite {
  id: string;
  original: string;
  rewritten: string;
  createdAt: string;
}

export interface SelfTalkRecord {
  id: string;
  thought: string;
  absolutes: string;
  evidenceFor: string;
  evidenceAgainst: string;
  balanced: string;
  nextStep: string;
  createdAt: string;
}

export interface ChallengeDayRecord {
  completed: boolean;
  completedAt?: string;
  note: string;
  /** 今日心智語句的反思（與 Daily Rewire 紀錄分開儲存） */
  affirmationReflection: string;
  microActionDone: boolean;
  feeling: string;
  updatedAt?: string;
}

/** 每日心智練習（Daily Rewire）一天一筆 */
export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  completedReading: boolean;
  /** 今天最有感觸的語句編號（1–7），0 代表尚未選擇 */
  favoriteId: number;
  why: string;
  action: string;
  mood: number; // 1–5，0 代表未填
  moodWords: string;
  /** 使用者自行選擇「今天想練習的句子」（1–7），0 代表未選 */
  practiceId?: number;
  createdAt: string;
  updatedAt: string;
}

/** 削弱習慣自我檢視：每次檢視的頻率評分（0 從不 ～ 3 幾乎每天） */
export interface HabitAudit {
  id: string;
  date: string; // YYYY-MM-DD
  ratings: Record<string, number>;
  focusId: string; // 本週想調整的習慣 id，'' 代表未選
  note: string;
  createdAt: string;
}

/* ========== Break the Pattern｜打破慣性 ========== */

/** 七個習慣的 id（沿用先前版本的 id，舊資料可直接相容） */
export type PatternHabitId = 'approval' | 'convenience' | 'impress' | 'solitude' | 'promises' | 'environment' | 'shortterm';

/** 21 題自我覺察評估（1 幾乎沒有 ～ 5 幾乎總是） */
export interface PatternAssessment {
  id: string;
  date: string;
  answers: Record<string, number>;
  /** 使用者優先希望改善的習慣（1–3 項） */
  priorityIds: PatternHabitId[];
  createdAt: string;
}

/** 七個互動工具的紀錄（以 kind 區分的聯合型別） */
interface PatternEntryBase {
  id: string;
  habitId: PatternHabitId;
  createdAt: string;
  updatedAt: string;
}
export interface ValidationEntry extends PatternEntryBase {
  kind: 'validation';
  decision: string;
  wanted: string;
  worry: string;
  values: string;
  without: string;
  balance: string;
}
export interface ComfortMapEntry extends PatternEntryBase {
  kind: 'comfort';
  task: string;
  steps: { id: string; text: string; level: 1 | 2 | 3; done: boolean }[];
}
export interface SpendingEntry extends PatternEntryBase {
  kind: 'spending';
  item: string;
  price: number;
  reasons: string[];
  reasonNote: string;
  usesPerMonth: number;
  budget: 'yes' | 'no' | 'unsure';
  alternative: string;
  coolingDays: number;
  coolUntil: string; // YYYY-MM-DD，冷靜期結束日
  decision: 'pending' | 'bought' | 'skipped' | 'postponed';
}
export interface QuietEntry extends PatternEntryBase {
  kind: 'quiet';
  seconds: number;
  thoughts: string;
  feelings: string;
  need: string;
  organize: string;
}
export interface EnvironmentEntry extends PatternEntryBase {
  kind: 'environment';
  label: string;
  ratings: Record<string, number>;
  note: string;
}
export interface ChoiceSimEntry extends PatternEntryBase {
  kind: 'choice';
  want: string;
  benefit: string;
  cost: string;
  goal: string;
  compromise: string;
  next: string;
}
export type PatternEntry = ValidationEntry | ComfortMapEntry | SpendingEntry | QuietEntry | EnvironmentEntry | ChoiceSimEntry;

/** 微承諾 */
export interface MicroCommitment {
  id: string;
  habitId: PatternHabitId | 'general';
  text: string;
  situation: string;
  level: 1 | 2 | 3; // 1 輕鬆、2 適中、3 標準
  backup: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
/** 微承諾每日紀錄（同一承諾同一天一筆） */
export interface CommitmentLog {
  id: string;
  commitmentId: string;
  date: string;
  status: 'done' | 'missed';
  reason: string;
  createdAt: string;
}

/** 習慣改變工作坊（七個步驟） */
export interface Workshop {
  id: string;
  habitId: PatternHabitId;
  step: number; // 目前停留的步驟 1–7
  pattern: string;
  time: string;
  emotion: string;
  cue: string;
  shortGain: string;
  longCost: string;
  alternative: string;
  ifSituation: string;
  ifAction: string;
  ifBackup: string;
  planId: string;
  dailyNote: string;
  reviewNote: string;
  adjustments: string[];
  reviewedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** 14 天打破慣性挑戰：每日紀錄 */
export interface PatternDayRecord {
  completed: boolean;
  completedAt?: string;
  note: string;
  reflection: string;
  /** 今天舊模式出現的情況 */
  oldPattern: '' | 'none' | 'once' | 'many';
  usedAlternative: boolean;
  updatedAt?: string;
}
export interface PatternChallengeState {
  activeHabitId: PatternHabitId | '';
  status: 'none' | 'active' | 'paused';
  level: 'gentle' | 'standard';
  /** 每個習慣各自保存進度，切換挑戰不會遺失 */
  progress: Partial<Record<PatternHabitId, Record<string, PatternDayRecord>>>;
}

/* ========== 7 Habits｜高效能生活實踐 ========== */

export type H7Id = 'proactive' | 'end' | 'first' | 'winwin' | 'understand' | 'synergize' | 'renew';

/** 章節學習狀態：未記錄代表「未開始」 */
export interface H7Progress {
  status: 'learning' | 'done';
  startedAt: string;
  completedAt?: string;
}

/** 每個習慣的三題自我評估（1–5） */
export interface H7SelfCheck {
  id: string;
  habitId: H7Id;
  date: string;
  answers: Record<string, number>;
  createdAt: string;
}

/** 工具 1：關注圈與影響圈 */
export type CircleZone = 'control' | 'influence' | 'outside';
export interface CircleEntry {
  id: string;
  problem: string;
  items: { id: string; text: string; zone: CircleZone }[];
  actionItemId: string;
  commitmentId: string;
  createdAt: string;
  updatedAt: string;
}

/** 工具 2：人生羅盤（單一物件） */
export interface CompassArea {
  values: string;
  why: string;
  oneYear: string;
  adjust: string;
  next: string;
}
export interface LifeCompass {
  areas: Record<string, CompassArea>;
  vision: string;
  keyword: string;
  goals: { id: string; text: string; plan: string; done: boolean }[];
  updatedAt: string;
}

/** 工具 3：四象限任務與本週三件要事 */
export interface QuadrantTask {
  id: string;
  title: string;
  quadrant: 1 | 2 | 3 | 4;
  due: string;
  done: boolean;
  note: string;
  createdAt: string;
  updatedAt: string;
}
export interface Big3Week {
  /** id 為該週星期一的日期（YYYY-MM-DD） */
  id: string;
  items: { id: string; text: string; when: string; done: boolean }[];
  updatedAt: string;
}

/** 工具 4：雙贏協商工作坊 */
export interface Negotiation {
  id: string;
  situation: string;
  myNeeds: string;
  theirNeeds: string;
  commonGoal: string;
  boundaries: string;
  flexible: string;
  options: { id: string; text: string; mine: number; theirs: number; feasible: number }[];
  note: string;
  createdAt: string;
  updatedAt: string;
}

/** 工具 5：同理溝通模擬器的練習紀錄 */
export interface EmpathyLog {
  id: string;
  scenarioId: string;
  choice: number;
  createdAt: string;
}

/** 工具 6：團隊合作思考板 */
export type BoardZone = 'problem' | 'goal' | 'stakeholders' | 'views' | 'resources' | 'conflicts' | 'solutions' | 'next';
export interface TeamBoard {
  id: string;
  title: string;
  cards: { id: string; zone: BoardZone; text: string }[];
  createdAt: string;
  updatedAt: string;
}

/** 工具 7：四維成長儀表板 */
export type RenewDim = 'physical' | 'mental' | 'spiritual' | 'social';
export interface RenewalSettings {
  /** 使用者自訂的重視程度（1–5），不強制相同權重 */
  weights: Record<RenewDim, number>;
  goals: Record<RenewDim, string>;
  /** 價值與靈性面向可依個人信仰或非宗教價值觀自訂名稱 */
  spiritualLabel: string;
}
export interface RenewalCheck {
  id: string;
  weekKey: string;
  scores: Record<RenewDim, number>; // 1–10 自評
  reflection: string;
  adjustment: string;
  createdAt: string;
  updatedAt: string;
}
export interface RenewalHabit {
  id: string;
  dim: RenewDim;
  text: string;
  active: boolean;
  createdAt: string;
}
export interface RenewalHabitLog {
  id: string;
  habitId: string;
  date: string;
}
export interface RestLog {
  id: string;
  date: string;
  kind: string;
  minutes: number;
  note: string;
  createdAt: string;
}

/** 21 天七習慣探索計畫 */
export interface H7PlanDay {
  completed: boolean;
  completedAt?: string;
  reflection: string;
  actionPlan: string;
  updatedAt?: string;
}
export interface H7Plan {
  startedAt: string;
  days: Record<string, H7PlanDay>;
  finalReview: string;
}

/* ========== Playful Growth｜輕遊戲化 ========== */

/** 今日輕冒險完成紀錄 */
export interface QuestLog {
  id: string;
  questId: string;
  depth: 'short' | 'medium' | 'long'; // 30 秒／2 分鐘／5 分鐘
  date: string;
  note: string;
  createdAt: string;
}
/** 心情盲盒收藏卡 */
export interface SavedCard {
  id: string;
  cardId: string;
  createdAt: string;
}
/** 人際情境小劇場的一次遊玩 */
export interface StoryPlay {
  id: string;
  storyId: string;
  choice: number;
  createdAt: string;
}
/** 時光膠囊 */
export interface TimeCapsule {
  id: string;
  message: string;
  openOn: string; // YYYY-MM-DD
  sealed: boolean;
  openedAt: string;
  createdAt: string;
  updatedAt: string;
}
/** 心智花園：使用者自由擺放的植物 */
export interface GardenState {
  theme: string;
  plants: { id: string; kind: string; cell: number; placedAt: string }[];
}

/** 反向選擇紀錄：一次「選自律、選進步、選自由」的具體小選擇 */
export interface CounterChoice {
  id: string;
  date: string; // YYYY-MM-DD
  habitId: string;
  choice: string;
  createdAt: string;
}

export interface AppData {
  version: 1;
  settings: Settings;
  chapters: Partial<Record<ChapterId, ChapterProgress>>;
  quizzes: Partial<Record<ChapterId, QuizResult>>;
  notes: Note[];
  journal: JournalEntry[];
  habitLogs: HabitLog[];
  emotionLogs: EmotionLog[];
  sleepLogs: SleepLog[];
  plans: IfThenPlan[];
  rehearsals: Rehearsal[];
  smallSteps: SmallStepPlan[];
  sessions: PracticeSession[];
  identityRewrites: IdentityRewrite[];
  selfTalk: SelfTalkRecord[];
  challenge: Record<string, ChallengeDayRecord>;
  dailyLogs: DailyLog[];
  dailyFavorites: number[];
  habitAudits: HabitAudit[];
  /** 行動實驗／反向選擇紀錄 */
  counterChoices: CounterChoice[];
  /** 使用者目前最想調整的習慣（1–3 項） */
  patternFocus: PatternHabitId[];
  patternAssessments: PatternAssessment[];
  patternEntries: PatternEntry[];
  microCommitments: MicroCommitment[];
  commitmentLogs: CommitmentLog[];
  workshops: Workshop[];
  patternChallenge: PatternChallengeState;
  /* 7 Habits */
  h7Progress: Partial<Record<H7Id, H7Progress>>;
  h7Quizzes: Partial<Record<H7Id, QuizResult>>;
  h7SelfChecks: H7SelfCheck[];
  circles: CircleEntry[];
  lifeCompass: LifeCompass;
  quadrantTasks: QuadrantTask[];
  big3Weeks: Big3Week[];
  negotiations: Negotiation[];
  empathyLogs: EmpathyLog[];
  empathyFavorites: string[];
  teamBoards: TeamBoard[];
  renewalSettings: RenewalSettings;
  renewalChecks: RenewalCheck[];
  renewalHabits: RenewalHabit[];
  renewalHabitLogs: RenewalHabitLog[];
  restLogs: RestLog[];
  h7Plan: H7Plan;
  /* Playful Growth｜輕遊戲化成長體驗 */
  questLogs: QuestLog[];
  savedCards: SavedCard[];
  storyPlays: StoryPlay[];
  capsules: TimeCapsule[];
  wheelExcluded: string[];
  garden: GardenState;
  /** 已解鎖的收藏與植物：一旦解鎖就永久保留（不因中斷、刪除紀錄而收回） */
  unlocks: Record<string, { date: string; evidence: string }>;
  /** 資料結構修訂號：新增模組時遞增，讀取舊資料時自動補齊預設值 */
  revision: number;
  /** 神經道路模擬器累積次數（概念示意） */
  neuralReps: number;
}

/** 所有「陣列型」集合的鍵，供通用新增／更新／刪除使用 */
export type CollectionKey =
  | 'notes'
  | 'journal'
  | 'habitLogs'
  | 'emotionLogs'
  | 'sleepLogs'
  | 'plans'
  | 'rehearsals'
  | 'smallSteps'
  | 'sessions'
  | 'identityRewrites'
  | 'selfTalk'
  | 'dailyLogs'
  | 'habitAudits'
  | 'counterChoices'
  | 'patternAssessments'
  | 'patternEntries'
  | 'microCommitments'
  | 'commitmentLogs'
  | 'workshops'
  | 'h7SelfChecks'
  | 'circles'
  | 'quadrantTasks'
  | 'big3Weeks'
  | 'negotiations'
  | 'empathyLogs'
  | 'teamBoards'
  | 'renewalChecks'
  | 'renewalHabits'
  | 'renewalHabitLogs'
  | 'restLogs'
  | 'questLogs'
  | 'savedCards'
  | 'storyPlays'
  | 'capsules';
