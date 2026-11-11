/**
 * 「我的計畫」與「繼續上次」的共用邏輯：只讀取既有資料，不新增或搬移任何紀錄。
 * 三個計畫仍各自保存（challenge／patternChallenge／h7Plan），這裡只負責整理成一致的摘要。
 */
import type { AppData } from '../types';
import { challengeDays } from '../content/challenge';
import { patternMap } from '../content/breakPattern';
import { chapters } from '../content/chapters';
import { h7Map } from '../content/habits7';
import { planProgress } from './habits7';

export type PlanId = 'neuro' | 'pattern' | 'habits7';
export type PlanStatus = 'none' | 'active' | 'paused' | 'done';

export interface PlanSummary {
  id: PlanId;
  title: string;
  desc: string;
  total: number;
  done: number;
  status: PlanStatus;
  /** 下一個未完成的天數（全部完成時為 null） */
  nextDay: number | null;
  /** 最後一次有紀錄的時間（ISO），用來判斷哪個計畫是「目前進行中」 */
  lastAt: string;
  /** 繼續（或開始）這個計畫的連結 */
  to: string;
  /** 補充說明，例如目前挑戰的是哪一個習慣 */
  note?: string;
}

/** 從一組紀錄中找出最新的時間 */
const latest = (recs: ({ completedAt?: string; updatedAt?: string } | undefined)[], fallback = '') =>
  recs.reduce((m, r) => [r?.updatedAt, r?.completedAt, m].filter(Boolean).sort().pop() ?? '', fallback);

export function planSummaries(d: AppData): PlanSummary[] {
  // 1. 14 天神經可塑性練習
  const neuroRecs = Object.values(d.challenge);
  const neuroDone = challengeDays.filter((c) => d.challenge[String(c.day)]?.completed).length;
  const neuroNext = challengeDays.find((c) => !d.challenge[String(c.day)]?.completed)?.day ?? null;
  const neuro: PlanSummary = {
    id: 'neuro', title: '14 天練習', desc: '每天一個大腦小主題與一個具體小行動。',
    total: 14, done: neuroDone, nextDay: neuroNext,
    status: neuroDone === 14 ? 'done' : neuroRecs.length ? 'active' : 'none',
    lastAt: latest(neuroRecs), to: `/challenge?day=${neuroNext ?? 14}`,
  };

  // 2. 14 天打破慣性挑戰（依目前選擇的習慣）
  const pc = d.patternChallenge;
  const prog = pc.activeHabitId ? pc.progress[pc.activeHabitId] ?? {} : {};
  const pDone = Object.values(prog).filter((r) => r.completed).length;
  const pNext = pc.activeHabitId ? Array.from({ length: 14 }, (_, i) => i + 1).find((day) => !prog[String(day)]?.completed) ?? null : 1;
  const pattern: PlanSummary = {
    id: 'pattern', title: '14 天打破慣性挑戰', desc: '選一個想調整的習慣，每天練習一個替代行動。',
    total: 14, done: pDone, nextDay: pNext,
    status: pc.status === 'none' || !pc.activeHabitId ? 'none' : pDone === 14 ? 'done' : pc.status === 'paused' ? 'paused' : 'active',
    lastAt: latest(Object.values(prog)),
    to: pc.activeHabitId ? `/challenge?type=pattern&pday=${pNext ?? 14}` : '/challenge?type=pattern',
    note: pc.activeHabitId ? `目前的習慣：${patternMap[pc.activeHabitId].short}` : undefined,
  };

  // 3. 21 天七習慣探索計畫
  const pp = planProgress(d);
  const h7Recs = Object.values(d.h7Plan.days);
  const habits7: PlanSummary = {
    id: 'habits7', title: '21 天七習慣探索計畫', desc: '七個習慣，每個三天：理解概念、行動實驗、反思調整。',
    total: pp.total, done: pp.done, nextDay: pp.nextDay,
    status: pp.done === pp.total ? 'done' : pp.started || h7Recs.length ? 'active' : 'none',
    lastAt: latest(h7Recs, d.h7Plan.startedAt || ''), to: `/habits7/plan?day=${pp.nextDay ?? pp.total}`,
  };
  return [neuro, pattern, habits7];
}

/** 目前進行中的計畫：進行中（不含暫停）且最近有紀錄的那一個；都沒有時回傳 null */
export function activePlan(d: AppData): PlanSummary | null {
  const list = planSummaries(d).filter((p) => p.status === 'active');
  return list.sort((a, b) => b.lastAt.localeCompare(a.lastAt))[0] ?? null;
}

export interface ContinueItem {
  kind: 'plan' | 'chapter' | 'h7';
  label: string;
  title: string;
  detail: string;
  to: string;
  at: string;
}

/**
 * 「繼續上次」：在進行中的計畫、讀到一半的章節、學習中的 7 Habits 習慣之中，挑最近的一個。
 * 全部依真實紀錄；沒有任何進度時回傳 null（首頁就不顯示）。
 */
export function continueItem(d: AppData): ContinueItem | null {
  const items: ContinueItem[] = [];
  const plan = activePlan(d);
  if (plan) items.push({ kind: 'plan', label: '我的計畫', title: plan.title, detail: `已完成 ${plan.done}/${plan.total} 天・下一個：第 ${plan.nextDay} 天`, to: plan.to, at: plan.lastAt });
  for (const c of chapters) {
    const p = d.chapters[c.id];
    if (p?.lastVisitedAt && !p.completed) items.push({ kind: 'chapter', label: '深度導讀', title: `第 ${c.number} 章 ${c.title}`, detail: `上次看到這一章・全章約 ${c.minutes} 分鐘`, to: `/learn/${c.id}`, at: p.lastVisitedAt });
  }
  for (const [id, p] of Object.entries(d.h7Progress)) {
    const h = h7Map[id as keyof typeof h7Map];
    if (h && p?.status === 'learning') items.push({ kind: 'h7', label: '7 Habits 高效能生活', title: `習慣${'一二三四五六七'[h.no - 1]}：${h.title}`, detail: '學習中', to: `/habits7/${id}`, at: p.startedAt });
  }
  return items.sort((a, b) => b.at.localeCompare(a.at))[0] ?? null;
}
