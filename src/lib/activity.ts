/**
 * 共用活動紀錄（Activity）：把所有模組中「實際保存的練習或紀錄」整理成一份清單。
 *
 * 資料定義（避免重複計算）：
 * 1. 每一筆保存的紀錄，以「來源＋紀錄 id」作為唯一鍵，只算一次；之後編輯同一筆紀錄不會再增加。
 * 2. 進度型資料以「項目」計算：例如一個章節標記完成算一次、一天的挑戰完成算一次。
 * 3. 只計算使用者主動完成或寫下的內容；瀏覽頁面、抽盲盒、轉轉盤本身不計入。
 * 4. 刪除紀錄後，次數會隨之減少；但已解鎖的收藏與植物保存在 unlocks 中，不會被收回。
 *
 * 這份清單用於：心智花園的成長點、成長收藏冊、儀表板「自願參與的練習」統計。
 */
import type { AppData } from '../types';
import { gardenThemes, plants, questMap } from '../content/play';
import { CHAPTER_IDS, H7_IDS } from '../store/storage';
import { challengeDays } from '../content/challenge';
import { isoToDateKey, toDateKey } from './date';

export type ActivityTheme = 'neuro' | 'daily' | 'pattern' | 'habits7' | 'play' | 'challenge' | 'journal';
export type ActivityKind = 'read' | 'quiz' | 'practice' | 'reflect' | 'quest' | 'game' | 'challenge';

export const THEME_LABEL: Record<ActivityTheme, string> = {
  neuro: '神經可塑性',
  daily: 'Daily Rewire',
  pattern: '打破慣性',
  habits7: '7 Habits',
  play: '輕鬆探索',
  challenge: '挑戰與探索計畫',
  journal: '反思日誌',
};
export const KIND_LABEL: Record<ActivityKind, string> = {
  read: '閱讀學習',
  quiz: '知識測驗',
  practice: '互動練習',
  reflect: '書寫反思',
  quest: '輕冒險',
  game: '小遊戲與收藏',
  challenge: '挑戰天數',
};

export interface ActivityEvent {
  key: string;
  date: string; // YYYY-MM-DD
  theme: ActivityTheme;
  kind: ActivityKind;
  label: string;
}

const dk = (iso?: string) => (iso ? (iso.length === 10 ? iso : isoToDateKey(iso)) : '');

/** 收集所有活動；同一個 key 只保留一筆 */
export function collectActivity(d: AppData): ActivityEvent[] {
  const out = new Map<string, ActivityEvent>();
  const add = (key: string, date: string | undefined, theme: ActivityTheme, kind: ActivityKind, label: string) => {
    const day = dk(date);
    if (!day || out.has(key)) return;
    out.set(key, { key, date: day, theme, kind, label });
  };
  // 神經可塑性：章節、測驗、工具
  for (const id of CHAPTER_IDS) {
    const c = d.chapters[id];
    if (c?.completed) add(`chapter:${id}`, c.completedAt ?? c.lastVisitedAt, 'neuro', 'read', '完成章節');
    const q = d.quizzes[id];
    if (q) add(`quiz:${id}`, q.submittedAt, 'neuro', 'quiz', '章節測驗');
  }
  const neuroTools: [keyof AppData, string][] = [['habitLogs', '習慣偵探'], ['emotionLogs', '情緒命名'], ['sleepLogs', '睡眠紀錄'], ['plans', 'If-Then 計畫'], ['rehearsals', '心智預演'], ['smallSteps', '微小行動'], ['sessions', '呼吸練習'], ['identityRewrites', '身份敘事改寫'], ['selfTalk', '自我對話轉換']];
  for (const [k, label] of neuroTools) for (const r of d[k] as { id: string; createdAt: string }[]) add(`${String(k)}:${r.id}`, r.createdAt, 'neuro', 'practice', label);
  // 筆記與日誌
  for (const n of d.notes) add(`note:${n.id}`, n.createdAt, n.tags.includes('7 Habits') ? 'habits7' : n.tags.includes('打破慣性') ? 'pattern' : 'neuro', 'reflect', n.kind === 'highlight' ? '收藏重點' : '個人反思');
  for (const j of d.journal) add(`journal:${j.id}`, j.createdAt, 'journal', 'reflect', '反思日誌');
  // Daily Rewire
  for (const l of d.dailyLogs) if (l.completedReading) add(`daily:${l.date}`, l.date, 'daily', 'practice', '每日七句練習');
  // 挑戰與計畫（每天一次）
  for (const day of challengeDays) {
    const r = d.challenge[String(day.day)];
    if (r?.completed) add(`challenge:${day.day}`, r.completedAt, 'challenge', 'challenge', '14 天練習');
  }
  for (const [hid, days] of Object.entries(d.patternChallenge.progress)) for (const [k, r] of Object.entries(days ?? {})) if (r.completed) add(`pchallenge:${hid}:${k}`, r.completedAt, 'challenge', 'challenge', '14 天打破慣性');
  for (const [k, r] of Object.entries(d.h7Plan.days)) if (r.completed) add(`h7plan:${k}`, r.completedAt, 'challenge', 'challenge', '21 天探索計畫');
  // Break the Pattern
  for (const c of d.counterChoices) add(`exp:${c.id}`, c.createdAt, 'pattern', 'practice', '行動實驗');
  for (const e of d.patternEntries) add(`ptool:${e.id}`, e.createdAt, 'pattern', 'practice', '打破慣性工具');
  for (const a of d.patternAssessments) add(`assess:${a.id}`, a.createdAt, 'pattern', 'quiz', '自我覺察評估');
  for (const w of d.workshops) add(`workshop:${w.id}`, w.createdAt, 'pattern', 'practice', '習慣改變工作坊');
  for (const l of d.commitmentLogs) if (l.status === 'done') add(`commit:${l.id}`, l.date, 'pattern', 'practice', '微承諾完成');
  // 7 Habits
  for (const id of H7_IDS) {
    const p = d.h7Progress[id];
    if (p?.status === 'done') add(`h7:${id}`, p.completedAt ?? p.startedAt, 'habits7', 'read', '完成 7 Habits 章節');
    const q = d.h7Quizzes[id];
    if (q) add(`h7quiz:${id}`, q.submittedAt, 'habits7', 'quiz', '7 Habits 測驗');
  }
  for (const c of d.h7SelfChecks) add(`h7check:${c.id}`, c.createdAt, 'habits7', 'quiz', '7 Habits 自我評估');
  const h7Tools: [keyof AppData, string][] = [['circles', '關注圈與影響圈'], ['negotiations', '雙贏協商'], ['empathyLogs', '同理溝通'], ['teamBoards', '團隊思考板'], ['renewalChecks', '四維自評'], ['restLogs', '休息紀錄']];
  for (const [k, label] of h7Tools) for (const r of d[k] as { id: string; createdAt: string }[]) add(`${String(k)}:${r.id}`, r.createdAt, 'habits7', 'practice', label);
  for (const t of d.quadrantTasks) if (t.done) add(`quad:${t.id}`, t.updatedAt, 'habits7', 'practice', '完成要事');
  for (const l of d.renewalHabitLogs) add(`rhabit:${l.id}`, l.date, 'habits7', 'practice', '四維習慣');
  if (d.lifeCompass.vision.trim()) add('vision', d.lifeCompass.updatedAt, 'habits7', 'reflect', '個人願景宣言');
  // Playful Growth
  for (const q of d.questLogs) add(`quest:${q.id}`, q.createdAt, 'play', 'quest', `輕冒險：${questMap[q.questId]?.title ?? ''}`);
  for (const c of d.savedCards) add(`card:${c.id}`, c.createdAt, 'play', 'game', '收藏小卡');
  for (const s of d.storyPlays) add(`story:${s.id}`, s.createdAt, 'play', 'game', '人際小劇場');
  for (const c of d.capsules) add(`capsule:${c.id}`, c.createdAt, 'play', 'reflect', '時光膠囊');
  return [...out.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** 成長點＝活動筆數 */
export const growthPoints = (events: ActivityEvent[]) => events.length;

/** 回傳達到第 n 筆活動的日期（找不到回傳今天） */
const nthDate = (list: { date: string }[], n: number) => list[n - 1]?.date ?? toDateKey();

/**
 * 依目前資料計算「應該解鎖」的項目（徽章、植物、景觀）。
 * 回傳的 date 為達成條件那筆紀錄的日期；之後由 GrowthWatcher 寫入 unlocks 永久保存。
 */
export function computeUnlocks(d: AppData, events = collectActivity(d)): Record<string, { date: string; evidence: string }> {
  const r: Record<string, { date: string; evidence: string }> = {};
  const pts = growthPoints(events);
  for (const p of plants) if (pts >= p.points) r[`plant:${p.id}`] = { date: p.points === 0 ? (events[0]?.date ?? toDateKey()) : nthDate(events, p.points), evidence: `累積 ${p.points} 個成長點` };
  for (const t of gardenThemes) if (pts >= t.points) r[`theme:${t.id}`] = { date: t.points === 0 ? (events[0]?.date ?? toDateKey()) : nthDate(events, t.points), evidence: `累積 ${t.points} 個成長點` };

  const badge = (id: string, date: string | undefined, evidence: string) => {
    if (date) r[`badge:${id}`] = { date: dk(date), evidence };
  };
  // 好奇探索家：三個不同的學習系統
  const firstByTheme = new Map<string, string>();
  for (const e of events) if (!firstByTheme.has(e.theme)) firstByTheme.set(e.theme, e.date);
  if (firstByTheme.size >= 3) badge('curious', [...firstByTheme.values()].sort()[2], `在 ${firstByTheme.size} 個學習系統留下紀錄`);
  // 小步實踐者：3 次輕冒險或微承諾
  const steps = events.filter((e) => e.kind === 'quest' || e.key.startsWith('commit:'));
  if (steps.length >= 3) badge('smallsteps', steps[2].date, `完成 ${steps.length} 次輕冒險或微承諾`);
  // 勇敢提問者
  const brave = d.questLogs.filter((q) => questMap[q.questId]?.category === 'brave').sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  if (brave) badge('question', brave.createdAt, `完成輕冒險「${questMap[brave.questId].title}」`);
  // 溫柔傾聽者
  const listen = [...d.empathyLogs.map((e) => e.createdAt), ...d.storyPlays.filter((s) => s.storyId === 'listen').map((s) => s.createdAt)].sort()[0];
  if (listen) badge('listener', listen, '完成一次同理溝通或傾聽練習');
  // 自我照顧者
  const care = [...d.restLogs.map((x) => x.createdAt), ...d.sessions.map((x) => x.createdAt), ...d.patternEntries.filter((e) => e.kind === 'quiet').map((e) => e.createdAt), ...d.questLogs.filter((q) => questMap[q.questId]?.category === 'relax').map((q) => q.createdAt)].sort()[0];
  if (care) badge('selfcare', care, '記錄了一次照顧自己的練習');
  // 重新開始者：微承諾中斷後又完成，或隔 7 天以上再回來練習
  let restart: string | undefined;
  for (const l of [...d.commitmentLogs].sort((a, b) => a.date.localeCompare(b.date))) {
    if (l.status === 'done' && d.commitmentLogs.some((m) => m.commitmentId === l.commitmentId && m.status === 'missed' && m.date < l.date)) { restart = l.date; break; }
  }
  if (!restart) {
    const days = [...new Set(events.map((e) => e.date))].sort();
    for (let i = 1; i < days.length; i++) if ((new Date(days[i]).getTime() - new Date(days[i - 1]).getTime()) / 86400000 >= 7) { restart = days[i]; break; }
  }
  if (restart) badge('restart', restart, '中斷之後又回來練習');
  // 創意冒險家
  const stories = new Set(d.storyPlays.map((s) => s.storyId));
  const board = [...d.teamBoards].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  if (board) badge('creative', board.createdAt, `建立思考板「${board.title}」`);
  else if (stories.size >= 3) badge('creative', [...d.storyPlays].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).filter((s, i, arr) => arr.findIndex((x) => x.storyId === s.storyId) === i)[2].createdAt, '玩過三個不同的人際小劇場');
  // 小卡收藏家
  const cards = [...d.savedCards].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (cards.length >= 3) badge('collector', cards[2].createdAt, `收藏 ${cards.length} 張小卡`);
  // 未來的信差
  const cap = [...d.capsules].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  if (cap) badge('messenger', cap.createdAt, '寫下第一個時光膠囊');
  // 知識旅人
  const read = events.find((e) => e.kind === 'read');
  if (read) badge('reader', read.date, read.label);
  return r;
}

/** 儀表板：自願參與統計（只用實際紀錄） */
export function activitySummary(events: ActivityEvent[]) {
  const byTheme: Record<string, number> = {};
  const byKind: Record<string, number> = {};
  for (const e of events) {
    byTheme[e.theme] = (byTheme[e.theme] ?? 0) + 1;
    byKind[e.kind] = (byKind[e.kind] ?? 0) + 1;
  }
  const top = (o: Record<string, number>) => Object.entries(o).sort((a, b) => b[1] - a[1])[0];
  return { total: events.length, byTheme, byKind, topTheme: top(byTheme), topKind: top(byKind), activeDays: new Set(events.map((e) => e.date)).size };
}

/** 依日期挑選「今日推薦」（同一天固定，不同天變化；不需要伺服器） */
export function dailyPick<T>(list: T[], salt = 0, date = toDateKey()): T {
  let h = salt;
  for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}
