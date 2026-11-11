/**
 * 統計計算：所有數字皆由使用者實際儲存的資料計算，沒有資料就回傳 0 或空陣列，
 * 絕不產生假的成績或紀錄。
 */
import type { AppData } from '../types';
import { isoToDateKey, lastNDays } from './date';
import { CHAPTER_IDS } from '../store/storage';

export function chapterStats(d: AppData) {
  const completed = CHAPTER_IDS.filter((id) => d.chapters[id]?.completed).length;
  const quizzes = CHAPTER_IDS.map((id) => d.quizzes[id]).filter(Boolean);
  const avg = quizzes.length ? Math.round((quizzes.reduce((s, q) => s + q!.score / q!.total, 0) / quizzes.length) * 100) : 0;
  return { completed, total: CHAPTER_IDS.length, quizDone: quizzes.length, quizAvg: avg };
}

export function challengeStats(d: AppData) {
  const done = Object.values(d.challenge).filter((c) => c.completed).length;
  return { done, total: 14 };
}

/** 每日心智練習統計 */
export function dailyStats(d: AppData, today = new Date()) {
  const completedLogs = d.dailyLogs.filter((l) => l.completedReading);
  const days = new Set(completedLogs.map((l) => l.date));
  const week = lastNDays(7, today).map((date) => ({ date, done: days.has(date) }));
  // 最常選擇的語句（依 favoriteId 次數）
  const counts: Record<number, number> = {};
  for (const l of d.dailyLogs) if (l.favoriteId) counts[l.favoriteId] = (counts[l.favoriteId] ?? 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const latest = [...d.dailyLogs].filter((l) => l.why || l.action).sort((a, b) => b.date.localeCompare(a.date))[0];
  return {
    totalDays: days.size,
    totalSessions: completedLogs.length,
    week,
    topId: top ? Number(top[0]) : 0,
    topCount: top ? top[1] : 0,
    counts,
    latest,
  };
}

/** 最近 n 天各類練習次數（習慣練習頻率圖） */
export function practiceFrequency(d: AppData, n = 14, today = new Date()) {
  const days = lastNDays(n, today);
  const empty = () => ({ 習慣紀錄: 0, 情緒命名: 0, 呼吸練習: 0, 每日語句: 0, 挑戰: 0, 打破慣性: 0, '7 習慣': 0 });
  // 「打破慣性」欄位統計 Break the Pattern 的所有實際練習：行動實驗、微承諾完成、互動工具紀錄
  const map: Record<string, ReturnType<typeof empty>> = Object.fromEntries(days.map((k) => [k, empty()]));
  const add = (iso: string | undefined, key: keyof ReturnType<typeof empty>) => {
    if (!iso) return;
    const k = iso.length === 10 ? iso : isoToDateKey(iso);
    if (map[k]) map[k][key] += 1;
  };
  d.habitLogs.forEach((h) => add(h.createdAt, '習慣紀錄'));
  d.emotionLogs.forEach((h) => add(h.createdAt, '情緒命名'));
  d.sessions.forEach((h) => add(h.createdAt, '呼吸練習'));
  d.dailyLogs.filter((l) => l.completedReading).forEach((l) => add(l.date, '每日語句'));
  Object.values(d.challenge).forEach((c) => c.completed && add(c.completedAt, '挑戰'));
  d.counterChoices.forEach((c) => add(c.date, '打破慣性'));
  d.commitmentLogs.filter((l) => l.status === 'done').forEach((l) => add(l.date, '打破慣性'));
  d.patternEntries.forEach((e) => add(e.createdAt, '打破慣性'));
  // 7 Habits：四象限完成、四維習慣、休息、同理練習、21 天計畫
  d.quadrantTasks.filter((t) => t.done).forEach((t) => add(t.updatedAt, '7 習慣'));
  d.renewalHabitLogs.forEach((l) => add(l.date, '7 習慣'));
  d.restLogs.forEach((r) => add(r.date, '7 習慣'));
  d.empathyLogs.forEach((l) => add(l.createdAt, '7 習慣'));
  Object.values(d.h7Plan.days).forEach((p) => p.completed && add(p.completedAt, '7 習慣'));
  const rows = days.map((k) => ({ date: k, ...map[k] }));
  const total = rows.reduce((s, r) => s + r.習慣紀錄 + r.情緒命名 + r.呼吸練習 + r.每日語句 + r.挑戰 + r.打破慣性 + r['7 習慣'], 0);
  return { rows, total };
}

/** 情緒趨勢：合併反思日誌與每日練習的心情分數（1–5），以及情緒命名強度 */
export function moodTrend(d: AppData, n = 14, today = new Date()) {
  const days = lastNDays(n, today);
  const rows = days.map((date) => {
    const moods = [...d.journal.filter((j) => j.date === date && j.mood > 0).map((j) => j.mood), ...d.dailyLogs.filter((l) => l.date === date && l.mood > 0).map((l) => l.mood)];
    const intens = d.emotionLogs.filter((e) => isoToDateKey(e.createdAt) === date).map((e) => e.intensity);
    return {
      date,
      心情: moods.length ? Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10 : null,
      情緒強度: intens.length ? Math.round((intens.reduce((a, b) => a + b, 0) / intens.length) * 10) / 10 : null,
    };
  });
  const hasData = rows.some((r) => r.心情 !== null || r.情緒強度 !== null);
  return { rows, hasData };
}

export interface Milestone {
  id: string;
  label: string;
  desc: string;
  achieved: boolean;
}

/** 學習里程碑：依實際資料判斷是否達成 */
export function milestones(d: AppData): Milestone[] {
  const c = chapterStats(d);
  const ch = challengeStats(d);
  const ds = dailyStats(d);
  return [
    { id: 'm1', label: '踏出第一步', desc: '完成第一個章節', achieved: c.completed >= 1 },
    { id: 'm2', label: '知識探索者', desc: '完成 5 個章節', achieved: c.completed >= 5 },
    { id: 'm3', label: '全書導讀完成', desc: '完成全部 9 個章節', achieved: c.completed >= 9 },
    { id: 'm4', label: '小試身手', desc: '完成第一份測驗', achieved: c.quizDone >= 1 },
    { id: 'm5', label: '挑戰啟程', desc: '完成 14 天挑戰的任 1 天', achieved: ch.done >= 1 },
    { id: 'm6', label: '一週的陪伴', desc: '完成 14 天挑戰的任 7 天', achieved: ch.done >= 7 },
    { id: 'm7', label: '14 天完成', desc: '完成全部 14 天挑戰', achieved: ch.done >= 14 },
    { id: 'm8', label: '每日心智練習', desc: '完成第一次 Daily Rewire', achieved: ds.totalDays >= 1 },
    { id: 'm9', label: '七天的練習', desc: '累計 7 天完成 Daily Rewire', achieved: ds.totalDays >= 7 },
    { id: 'm10', label: '行動設計師', desc: '建立第一份 If-Then 計畫', achieved: d.plans.length >= 1 },
    { id: 'm11', label: '自我覺察', desc: '寫下第一篇反思日誌', achieved: d.journal.length >= 1 },
    { id: 'm12', label: '習慣偵探', desc: '留下第一筆習慣紀錄', achieved: d.habitLogs.length >= 1 },
    { id: 'm13', label: '看見自己的模式', desc: '完成第一次七大習慣自我覺察評估', achieved: d.patternAssessments.length >= 1 || d.habitAudits.length >= 1 },
    { id: 'm14', label: '一步一步來', desc: '累積 10 次行動實驗或打破慣性', achieved: d.counterChoices.length >= 10 },
    { id: 'm15', label: '說到做到', desc: '微承諾累積完成 7 次', achieved: d.commitmentLogs.filter((l) => l.status === 'done').length >= 7 },
    { id: 'm17', label: '個人成功', desc: '完成習慣一至三（7 Habits）', achieved: (['proactive', 'end', 'first'] as const).every((id) => d.h7Progress[id]?.status === 'done') },
    { id: 'm18', label: '寫下願景', desc: '建立個人願景宣言', achieved: !!d.lifeCompass.vision.trim() },
    { id: 'm19', label: '21 天探索', desc: '完成 21 天七習慣探索計畫', achieved: Object.values(d.h7Plan.days).filter((p) => p.completed).length >= 21 },
    { id: 'm16', label: '打破慣性', desc: '完成任一習慣的 14 天打破慣性挑戰', achieved: Object.values(d.patternChallenge.progress).some((days) => Object.values(days ?? {}).filter((r) => r.completed).length >= 14) },
  ];
}
