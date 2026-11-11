/**
 * 7 Habits 計算邏輯（純函式）：全部以使用者實際資料計算
 */
import type { AppData, H7Id, QuadrantTask, RenewDim } from '../types';
import { H7_STAGES, h7Habits, planDays, renewDims } from '../content/habits7';
import { lastNDays, toDateKey } from './date';

/** 取得某日期所屬週的星期一（YYYY-MM-DD），作為「本週三件要事」與每週自評的鍵 */
export function weekKey(d: Date = new Date()): string {
  const day = d.getDay(); // 0 = 週日
  const diff = day === 0 ? -6 : 1 - day;
  return toDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff));
}

/** 章節狀態 */
export function h7Status(d: AppData, id: H7Id): '未開始' | '學習中' | '已完成' {
  const p = d.h7Progress[id];
  return !p ? '未開始' : p.status === 'done' ? '已完成' : '學習中';
}

/** 三階段與整體學習進度 */
export function h7StageProgress(d: AppData) {
  const stages = H7_STAGES.map((s) => ({
    id: s.id,
    title: s.title,
    done: s.habits.filter((h) => d.h7Progress[h]?.status === 'done').length,
    learning: s.habits.filter((h) => d.h7Progress[h]?.status === 'learning').length,
    total: s.habits.length,
  }));
  const done = h7Habits.filter((h) => d.h7Progress[h.id]?.status === 'done').length;
  return { stages, done, total: h7Habits.length };
}

/** 四象限：本週（以截止日或建立日判定）各象限的任務數與完成數 */
export function quadrantDistribution(tasks: QuadrantTask[], today = new Date()) {
  const wk = weekKey(today);
  const end = new Date(wk);
  end.setDate(end.getDate() + 6);
  const endKey = toDateKey(end);
  const inWeek = (t: QuadrantTask) => {
    const k = t.due || toDateKey(new Date(t.createdAt));
    return k >= wk && k <= endKey;
  };
  return ([1, 2, 3, 4] as const).map((q) => {
    const list = tasks.filter((t) => t.quadrant === q && inWeek(t));
    return { name: `第${'一二三四'[q - 1]}象限`, 進行中: list.filter((t) => !t.done).length, 已完成: list.filter((t) => t.done).length };
  });
}

/** 四維成長雷達圖資料：最新一次與前一次自評 */
export function renewalRadar(d: AppData, labelOf: (dim: RenewDim) => string) {
  const sorted = [...d.renewalChecks].sort((a, b) => a.weekKey.localeCompare(b.weekKey) || a.createdAt.localeCompare(b.createdAt));
  const latest = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const rows = renewDims.map((x) => ({ dim: labelOf(x.id), 本次: latest?.scores[x.id] ?? 0, 上次: prev?.scores[x.id] ?? 0 }));
  return { rows, latest, prev, count: sorted.length };
}

/** 四維習慣：最近七天完成次數 */
export function renewalHabitWeek(d: AppData, today = new Date()) {
  const days = new Set(lastNDays(7, today));
  return d.renewalHabits.map((h) => ({ habit: h, count: d.renewalHabitLogs.filter((l) => l.habitId === h.id && days.has(l.date)).length }));
}

/** 21 天探索計畫進度 */
export function planProgress(d: AppData) {
  const done = planDays.filter((p) => d.h7Plan.days[String(p.day)]?.completed).length;
  const next = planDays.find((p) => !d.h7Plan.days[String(p.day)]?.completed);
  return { done, total: planDays.length, started: !!d.h7Plan.startedAt, nextDay: next?.day ?? null };
}

/** 自我評估平均（1–5） */
export function selfCheckAverage(answers: Record<string, number>) {
  const v = Object.values(answers).filter((x) => x >= 1 && x <= 5);
  return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : 0;
}
