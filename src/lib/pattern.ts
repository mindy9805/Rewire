/**
 * Break the Pattern 計算邏輯（純函式，方便單元測試）
 * 所有結果皆由使用者實際輸入計算；不產生「自律分數」「大腦改造百分比」等虛構指標。
 */
import type { AppData, CommitmentLog, EnvironmentEntry, MicroCommitment, PatternAssessment, PatternHabitId, SpendingEntry } from '../types';
import { assessmentQuestions, assessmentScale, environmentItems, patternHabits, patternMap, spendingReasons } from '../content/breakPattern';
import { lastNDays, toDateKey } from './date';

/** 頻率平均值轉為文字（沿用量表標籤） */
export function frequencyLabel(avg: number): string {
  return assessmentScale[Math.min(4, Math.max(0, Math.round(avg) - 1))].label;
}

/** 評估結果：每個習慣的自我回報頻率（平均 1–5） */
export function scoreAssessment(answers: Record<string, number>) {
  return patternHabits.map((h) => {
    const vals = assessmentQuestions.filter((q) => q.habitId === h.id).map((q) => answers[q.id]).filter((v): v is number => typeof v === 'number' && v >= 1 && v <= 5);
    const avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
    return { habitId: h.id, short: h.short, answered: vals.length, avg, label: vals.length ? frequencyLabel(avg) : '未作答' };
  });
}

/** 評估變化：依時間排列的各習慣平均頻率（給折線圖） */
export function assessmentTrend(list: PatternAssessment[]) {
  return [...list]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((a) => {
      const row: Record<string, string | number> = { date: a.date };
      for (const s of scoreAssessment(a.answers)) row[s.short] = s.avg;
      return row;
    });
}

/** 微承諾：最近 n 天每日完成／中斷數 */
export function commitmentWeek(logs: CommitmentLog[], n = 7, today = new Date()) {
  return lastNDays(n, today).map((date) => ({
    date,
    完成: logs.filter((l) => l.date === date && l.status === 'done').length,
    中斷: logs.filter((l) => l.date === date && l.status === 'missed').length,
  }));
}

/** 單一微承諾的最近七天狀態 */
export function commitmentDays(c: MicroCommitment, logs: CommitmentLog[], today = new Date()) {
  return lastNDays(7, today).map((date) => ({ date, log: logs.find((l) => l.commitmentId === c.id && l.date === date) }));
}

/** 本週（最近 7 天）微承諾完成率；無紀錄時回傳 null */
export function commitmentRate(logs: CommitmentLog[], today = new Date()) {
  const days = new Set(lastNDays(7, today));
  const week = logs.filter((l) => days.has(l.date));
  if (!week.length) return null;
  const done = week.filter((l) => l.status === 'done').length;
  return { done, total: week.length, pct: Math.round((done / week.length) * 100) };
}

/** 消費動機檢視：依輸入整理反思（不判定對錯） */
export function spendingReflection(e: Pick<SpendingEntry, 'price' | 'reasons' | 'usesPerMonth' | 'budget' | 'alternative'>) {
  const picked = spendingReasons.filter((r) => e.reasons.includes(r.id));
  const yearlyUses = Math.max(0, e.usesPerMonth) * 12;
  const costPerUse = yearlyUses > 0 && e.price > 0 ? Math.round(e.price / yearlyUses) : null;
  const need = picked.some((r) => r.need)
    ? `你提到的原因包含實際需要或對品質的重視${e.usesPerMonth >= 4 ? '，且預估使用頻率較高（每月約 ' + e.usesPerMonth + ' 次）' : ''}。`
    : '你選擇的原因中，沒有勾選實際需要。這不代表不能買，只是可以再確認它想滿足的是什麼。';
  const social = picked.some((r) => r.social)
    ? '原因中包含與他人或社群相關的因素。可以問問自己：如果沒有人看到，我還會想要它嗎？'
    : '原因中沒有明顯的社會比較因素。';
  const emotion = picked.some((r) => r.emotion) ? '也有情緒或時機的因素（犒賞、心情、優惠）。這些都很常見，冷靜期能幫助你確認感受是否持續。' : '';
  const longTerm = [
    e.budget === 'no' ? '你評估這筆花費不在預算內，可能需要調整其他支出或延後購買。' : e.budget === 'unsure' ? '你還不確定是否在預算內，可以先確認本月的可支配金額。' : '你評估這筆花費在預算內。',
    costPerUse !== null ? `以一年估算，每次使用成本約 ${costPerUse.toLocaleString()} 元。` : '',
  ].filter(Boolean).join('');
  const next = [
    '設定冷靜期，到期後再看一次。',
    e.alternative.trim() ? `考慮你提到的替代方案：${e.alternative.trim()}。` : '想想是否有借用、二手或已擁有的替代品。',
    '如果需求明確、在預算內，也可以安心購買並好好使用它。',
  ];
  return { need, social: [social, emotion].filter(Boolean).join(''), longTerm, next, costPerUse };
}

/** 成長環境盤點：整理為反思，不替使用者做決定 */
export function environmentReflection(ratings: EnvironmentEntry['ratings']) {
  const strengths: string[] = [];
  const attention: string[] = [];
  for (const it of environmentItems) {
    const v = ratings[it.id];
    if (!v) continue;
    const positive = it.reverse ? v <= 2 : v >= 4;
    const concern = it.reverse ? v >= 4 : v <= 2;
    const name = it.text.replace('。', '');
    if (positive) strengths.push(it.reverse ? '這段互動較少帶來持續壓力' : name);
    if (concern) attention.push(name);
  }
  return { strengths, attention };
}

/** 最常出現的觸發情境：來自工作坊（時間／情緒／提示）與習慣偵探的觸發提示 */
export function topTriggers(d: AppData, limit = 6) {
  const count: Record<string, number> = {};
  const add = (s: string) => s.split(/[、,，;；\n]+/).map((x) => x.trim()).filter(Boolean).forEach((x) => (count[x] = (count[x] ?? 0) + 1));
  d.workshops.forEach((w) => [w.time, w.emotion, w.cue].forEach(add));
  d.habitLogs.forEach((h) => [h.cue, h.emotion].forEach(add));
  return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

/** 行動實驗（反向選擇）依習慣統計 */
export function experimentsByHabit(d: AppData) {
  return patternHabits.map((h) => ({ habitId: h.id, short: h.short, 次數: d.counterChoices.filter((c) => c.habitId === h.id).length }));
}

/** 14 天打破慣性挑戰：某習慣的完成天數 */
export function patternChallengeDone(d: AppData, id: PatternHabitId) {
  return Object.values(d.patternChallenge.progress[id] ?? {}).filter((r) => r.completed).length;
}

/** 下次可嘗試的小步驟：從實際資料中找出尚未完成的下一步 */
export function nextSmallSteps(d: AppData, today = toDateKey()) {
  const out: { text: string; to: string }[] = [];
  for (const c of d.patternEntries) {
    if (c.kind !== 'comfort') continue;
    const step = [...c.steps].sort((a, b) => a.level - b.level).find((s) => !s.done);
    if (step) out.push({ text: `${c.task}：${step.text}`, to: '/pattern/convenience#tool' });
  }
  for (const m of d.microCommitments.filter((m) => m.active)) {
    if (!d.commitmentLogs.some((l) => l.commitmentId === m.id && l.date === today)) out.push({ text: `今天的微承諾：${m.text}`, to: '/pattern/promises#tool' });
  }
  for (const w of d.workshops) if (w.alternative) out.push({ text: `替代行動：${w.alternative}`, to: '/pattern/workshop' });
  const pc = d.patternChallenge;
  if (pc.status === 'active' && pc.activeHabitId) {
    const done = patternChallengeDone(d, pc.activeHabitId);
    if (done < 14) out.push({ text: `14 天打破慣性挑戰（${patternMap[pc.activeHabitId].short}）：繼續下一天`, to: '/challenge?type=pattern' });
  }
  return out.slice(0, 6);
}
