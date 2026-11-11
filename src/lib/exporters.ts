/**
 * 匯出工具：將個人資料轉為 Markdown（筆記、日誌、挑戰、每日練習）或 JSON。
 * 所有匯出都在瀏覽器內完成，不會上傳到任何伺服器。
 */
import type { AppData } from '../types';
import { chapterLabel } from '../content/chapters';
import { challengeDays } from '../content/challenge';
import { affirmationMap } from '../content/dailyRewire';
import { formatDate, formatDateTime } from './date';
import { MOODS } from '../components/ui/basics';
import { patternHabits, patternMap } from '../content/breakPattern';
import { compassAreas, h7Habits, h7Map, planDays, quadrants, renewDims } from '../content/habits7';
import { selfCheckAverage } from './habits7';
import { badges, moodCardMap, questMap, storyMap, DEPTH_LABEL } from '../content/play';
import { scoreAssessment } from './pattern';

const moodText = (m: number) => MOODS.find((x) => x.v === m)?.label ?? '未填';

export function notesToMarkdown(d: AppData, notes = d.notes): string {
  const lines = ['# Rewire 學習筆記', '', `匯出時間：${formatDateTime(new Date().toISOString())}`, ''];
  const groups = new Map<string, typeof notes>();
  notes.forEach((n) => groups.set(n.chapterId, [...(groups.get(n.chapterId) ?? []), n]));
  for (const [ch, list] of groups) {
    lines.push(`## ${chapterLabel(ch as never)}`, '');
    for (const n of list) {
      lines.push(`### ${n.kind === 'highlight' ? '📌 收藏重點' : '✏️ 個人反思'}${n.source ? `：${n.source}` : ''}`);
      lines.push('', n.content, '');
      if (n.tags.length) lines.push(`標籤：${n.tags.map((t) => `#${t}`).join(' ')}`, '');
      lines.push(`_${formatDateTime(n.updatedAt)}_`, '');
    }
  }
  if (!notes.length) lines.push('（目前沒有筆記）');
  return lines.join('\n');
}

export function journalToMarkdown(d: AppData): string {
  const lines = ['# Rewire 反思日誌', ''];
  [...d.journal].sort((a, b) => b.date.localeCompare(a.date)).forEach((j) => {
    lines.push(`## ${formatDate(j.date)}｜${j.title || '未命名'}`, '', `心情：${moodText(j.mood)}`, '', j.content, '');
    if (j.tags.length) lines.push(`標籤：${j.tags.map((t) => `#${t}`).join(' ')}`, '');
  });
  if (!d.journal.length) lines.push('（目前沒有日誌）');
  return lines.join('\n');
}

export function challengeToMarkdown(d: AppData): string {
  const done = Object.values(d.challenge).filter((c) => c.completed).length;
  const lines = ['# Rewire 14 天神經可塑性練習紀錄', '', `完成進度：${done}/14 天`, ''];
  for (const day of challengeDays) {
    const r = d.challenge[String(day.day)];
    lines.push(`## Day ${day.day}：${day.theme} ${r?.completed ? '✅' : '⬜'}`, '');
    lines.push(`- 今日心智語句：${affirmationMap[day.affirmationId].text}`);
    if (r?.note) lines.push(`- 我的紀錄：${r.note.replace(/\n/g, ' ')}`);
    if (r?.affirmationReflection) lines.push(`- 語句反思：${r.affirmationReflection.replace(/\n/g, ' ')}`);
    if (r?.microActionDone) lines.push('- 已完成微小行動');
    if (r?.feeling) lines.push(`- 感受：${r.feeling}`);
    lines.push('');
  }
  return lines.join('\n');
}

export function dailyToMarkdown(d: AppData): string {
  const lines = ['# Daily Rewire 每日心智練習紀錄', ''];
  [...d.dailyLogs].sort((a, b) => b.date.localeCompare(a.date)).forEach((l) => {
    lines.push(`## ${formatDate(l.date)} ${l.completedReading ? '✅ 已完成朗讀' : ''}`, '');
    if (l.favoriteId) lines.push(`- 最有感觸：${affirmationMap[l.favoriteId]?.text}`);
    if (l.why) lines.push(`- 為什麼：${l.why.replace(/\n/g, ' ')}`);
    if (l.action) lines.push(`- 小行動：${l.action}`);
    if (l.mood) lines.push(`- 情緒：${moodText(l.mood)}${l.moodWords ? `（${l.moodWords}）` : ''}`);
    lines.push('');
  });
  if (!d.dailyLogs.length) lines.push('（目前沒有紀錄）');
  return lines.join('\n');
}

/** Break the Pattern：評估、行動實驗、工具紀錄、微承諾、工作坊、14 天打破慣性挑戰 */
export function patternToMarkdown(d: AppData): string {
  const L = ['# Break the Pattern｜打破慣性 紀錄', ''];
  if (d.patternFocus.length) L.push(`目前想調整的習慣：${d.patternFocus.map((id) => patternMap[id].short).join('、')}`, '');
  if (d.patternAssessments.length) {
    L.push('## 七大習慣自我覺察評估（自我回報頻率 1–5，非診斷）', '');
    [...d.patternAssessments].sort((a, b) => b.date.localeCompare(a.date)).forEach((a) => {
      L.push(`### ${formatDate(a.date)}`, ...scoreAssessment(a.answers).map((s) => `- ${s.short}：${s.avg}（${s.label}）`));
      if (a.priorityIds.length) L.push(`- 優先改善：${a.priorityIds.map((id) => patternMap[id].short).join('、')}`);
      L.push('');
    });
  }
  if (d.counterChoices.length) {
    L.push('## 行動實驗與反向選擇', '');
    [...d.counterChoices].sort((a, b) => b.date.localeCompare(a.date)).forEach((c) => L.push(`- ${formatDate(c.date)}｜${patternMap[c.habitId as keyof typeof patternMap]?.short ?? ''}：${c.choice}`));
    L.push('');
  }
  if (d.patternEntries.length) {
    L.push('## 互動工具紀錄', '');
    for (const e of d.patternEntries) {
      const t = formatDateTime(e.createdAt);
      if (e.kind === 'validation') L.push(`- ${t}｜認可依賴覺察：${e.decision}（原本想做：${e.wanted || '—'}；兼顧方式：${e.balance || '—'}）`);
      if (e.kind === 'comfort') L.push(`- ${t}｜舒適圈探索：${e.task}（${e.steps.filter((s) => s.done).length}/${e.steps.length} 步完成）`);
      if (e.kind === 'spending') L.push(`- ${t}｜消費檢視：${e.item}（${e.price} 元，冷靜期至 ${e.coolUntil}）`);
      if (e.kind === 'quiet') L.push(`- ${t}｜安靜 ${Math.round(e.seconds / 60)} 分鐘：${[e.thoughts, e.feelings, e.need].filter(Boolean).join('／')}`);
      if (e.kind === 'environment') L.push(`- ${t}｜環境盤點：${e.label}${e.note ? `（${e.note}）` : ''}`);
      if (e.kind === 'choice') L.push(`- ${t}｜選擇比較：${e.want} → 折衷：${e.compromise || '—'}；下一次：${e.next || '—'}`);
    }
    L.push('');
  }
  if (d.microCommitments.length) {
    L.push('## 微承諾', '');
    d.microCommitments.forEach((m) => {
      const logs = d.commitmentLogs.filter((l) => l.commitmentId === m.id);
      L.push(`- ${m.text}${m.active ? '' : '（已暫停）'}：完成 ${logs.filter((l) => l.status === 'done').length} 次、中斷 ${logs.filter((l) => l.status === 'missed').length} 次`);
    });
    L.push('');
  }
  if (d.workshops.length) {
    L.push('## 習慣改變工作坊', '');
    d.workshops.forEach((w) => L.push(`### ${patternMap[w.habitId].title}`, `- 模式：${w.pattern || '—'}`, `- 觸發：${[w.time, w.emotion, w.cue].filter(Boolean).join('、') || '—'}`, `- 替代行動：${w.alternative || '—'}`, `- If-Then：如果${w.ifSituation || '……'}，我就${w.ifAction || '……'}`, `- 回顧：${w.reviewNote || '—'}`, ''));
  }
  const pc = d.patternChallenge;
  for (const h of patternHabits) {
    const days = pc.progress[h.id];
    if (!days || !Object.keys(days).length) continue;
    L.push(`## 14 天打破慣性挑戰：${h.short}`, '');
    Object.entries(days).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([k, r]) => L.push(`- Day ${k} ${r.completed ? '✅' : '⬜'}${r.reflection ? `｜反思：${r.reflection.replace(/\n/g, ' ')}` : ''}${r.note ? `｜紀錄：${r.note.replace(/\n/g, ' ')}` : ''}`));
    L.push('');
  }
  if (L.length <= 2) L.push('（目前沒有紀錄）');
  return L.join('\n');
}

/** 7 Habits：學習進度、願景、四象限、協商、同理、思考板、四維成長、21 天計畫 */
export function habits7ToMarkdown(d: AppData): string {
  const L = ['# 7 Habits｜高效能生活實踐 紀錄', ''];
  L.push('## 學習進度', '', ...h7Habits.map((h) => `- 習慣${h.no}「${h.title}」：${d.h7Progress[h.id]?.status === 'done' ? '已完成' : d.h7Progress[h.id] ? '學習中' : '未開始'}${d.h7Quizzes[h.id] ? `（測驗 ${d.h7Quizzes[h.id]!.score}/${d.h7Quizzes[h.id]!.total}）` : ''}`), '');
  if (d.h7SelfChecks.length) L.push('## 自我評估', '', ...d.h7SelfChecks.map((c) => `- ${formatDate(c.date)}｜${h7Map[c.habitId].title}：平均 ${selfCheckAverage(c.answers)}／5`), '');
  for (const c of d.circles) L.push(`## 關注圈與影響圈：${c.problem}`, '', ...c.items.map((i) => `- [${i.zone === 'control' ? '能控制' : i.zone === 'influence' ? '能影響' : '超出控制'}] ${i.text}`), '');
  const lc = d.lifeCompass;
  if (lc.vision || lc.keyword || lc.goals.length || Object.keys(lc.areas).length) {
    L.push('## 人生羅盤', '');
    if (lc.vision) L.push(`**個人願景宣言**：${lc.vision}`, '');
    if (lc.keyword) L.push(`**年度關鍵字**：${lc.keyword}`, '');
    for (const a of compassAreas) {
      const v = lc.areas[a.id];
      if (v && Object.values(v).some((x) => x.trim())) L.push(`### ${a.label}`, `- 重視：${v.values}`, `- 為什麼：${v.why}`, `- 一年後：${v.oneYear}`, `- 需要調整：${v.adjust}`, `- 下一步：${v.next}`, '');
    }
    if (lc.goals.length) L.push('### 年度目標', ...lc.goals.map((g) => `- ${g.done ? '✅' : '⬜'} ${g.text}${g.plan ? `（計畫：${g.plan.replace(/\n/g, ' ')}）` : ''}`), '');
  }
  if (d.quadrantTasks.length) {
    L.push('## 四象限任務', '');
    for (const q of quadrants) L.push(`### ${q.title}：${q.desc}`, ...d.quadrantTasks.filter((t) => t.quadrant === q.q).map((t) => `- ${t.done ? '✅' : '⬜'} ${t.title}${t.due ? `（截止 ${t.due}）` : ''}${t.note ? `｜${t.note}` : ''}`), '');
  }
  for (const w of d.big3Weeks) L.push(`## 本週三件要事（${w.id} 起）`, ...w.items.map((i) => `- ${i.done ? '✅' : '⬜'} ${i.text}${i.when ? `（${i.when}）` : ''}`), '');
  for (const n of d.negotiations) L.push(`## 雙贏協商：${n.situation}`, `- 我的需求：${n.myNeeds}`, `- 對方可能的需求：${n.theirNeeds}`, `- 共同目標：${n.commonGoal}`, `- 界線：${n.boundaries}`, ...n.options.map((o) => `- 方案：${o.text}（我 ${o.mine}／對方 ${o.theirs}／可行性 ${o.feasible}）`), '');
  if (d.empathyFavorites.length) L.push('## 收藏的同理句型', ...d.empathyFavorites.map((p) => `- ${p}`), '');
  for (const b of d.teamBoards) L.push(`## 團隊合作思考板：${b.title}`, ...b.cards.map((c) => `- [${c.zone}] ${c.text}`), '');
  if (d.renewalChecks.length) {
    const label = (id: string) => (id === 'spiritual' ? d.renewalSettings.spiritualLabel : renewDims.find((x) => x.id === id)?.label);
    L.push('## 四維成長自評', '', ...[...d.renewalChecks].sort((a, b) => b.weekKey.localeCompare(a.weekKey)).map((c) => `- ${c.weekKey} 週：${renewDims.map((x) => `${label(x.id)} ${c.scores[x.id]}`).join('、')}${c.reflection ? `｜${c.reflection.replace(/\n/g, ' ')}` : ''}`), '');
  }
  if (d.restLogs.length) L.push('## 休息與恢復', ...d.restLogs.map((r) => `- ${r.date}｜${r.kind} ${r.minutes} 分鐘${r.note ? `｜${r.note}` : ''}`), '');
  const days = Object.keys(d.h7Plan.days);
  if (days.length || d.h7Plan.finalReview) {
    L.push('## 21 天七習慣探索計畫', '', ...planDays.filter((p) => d.h7Plan.days[String(p.day)]).map((p) => { const r = d.h7Plan.days[String(p.day)]; return `- Day ${p.day} ${r.completed ? '✅' : '⬜'} ${p.title}${r.reflection ? `｜反思：${r.reflection.replace(/\n/g, ' ')}` : ''}${r.actionPlan ? `｜計畫：${r.actionPlan.replace(/\n/g, ' ')}` : ''}`; }));
    if (d.h7Plan.finalReview) L.push('', `**課程回顧**：${d.h7Plan.finalReview}`);
  }
  return L.join('\n');
}

/** 輕鬆探索：輕冒險、收藏、小劇場、時光膠囊（未到期的封存內容不匯出，保留驚喜） */
export function playToMarkdown(d: AppData): string {
  const L = ['# 輕鬆探索 Playful Growth 紀錄', ''];
  const got = badges.filter((b) => d.unlocks[`badge:${b.id}`]);
  if (got.length) L.push('## 成長徽章', ...got.map((b) => `- ${b.emoji} ${b.title}（${d.unlocks[`badge:${b.id}`].date}）：${d.unlocks[`badge:${b.id}`].evidence}`), '');
  if (d.questLogs.length) L.push('## 今日輕冒險', ...[...d.questLogs].sort((a, b) => b.date.localeCompare(a.date)).map((q) => `- ${q.date}｜${questMap[q.questId]?.title}（${DEPTH_LABEL[q.depth]}）${q.note ? `：${q.note}` : ''}`), '');
  if (d.savedCards.length) L.push('## 收藏的小卡', ...d.savedCards.map((c) => `- ${moodCardMap[c.cardId]?.text ?? ''}`), '');
  if (d.storyPlays.length) L.push('## 人際情境小劇場', ...[...new Set(d.storyPlays.map((p) => p.storyId))].map((id) => `- ${storyMap[id]?.title}（玩了 ${d.storyPlays.filter((p) => p.storyId === id).length} 次）`), '');
  const today = new Date().toISOString().slice(0, 10);
  if (d.capsules.length) L.push('## 時光膠囊', ...d.capsules.map((c) => `- 開啟日 ${c.openOn}：${c.openedAt || !c.sealed || c.openOn <= today ? c.message : '（封存中）'}`), '');
  if (d.garden.plants.length) L.push(`## 心智花園`, `- 已種下 ${d.garden.plants.length} 株植物與裝飾`, '');
  if (L.length <= 2) L.push('（目前沒有紀錄）');
  return L.join('\n');
}

export function allToMarkdown(d: AppData): string {
  return [notesToMarkdown(d), journalToMarkdown(d), challengeToMarkdown(d), dailyToMarkdown(d), patternToMarkdown(d), habits7ToMarkdown(d), playToMarkdown(d)].join('\n\n---\n\n');
}

export const stamp = () => new Date().toISOString().slice(0, 10);
