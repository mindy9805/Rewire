/**
 * 全站搜尋：在瀏覽器端搜尋章節內容、每日語句、14 天挑戰與個人筆記／日誌。
 * 採用簡單的關鍵字比對（支援多個以空白分隔的關鍵字，全部符合才列出）。
 */
import { chapters } from '../content/chapters';
import { affirmations } from '../content/dailyRewire';
import { challengeDays } from '../content/challenge';
import { patternHabits } from '../content/breakPattern';
import { h7Habits } from '../content/habits7';
import { quests, socialStories } from '../content/play';
import type { AppData } from '../types';

export interface SearchResult {
  key: string;
  type: '章節' | '概念' | '每日語句' | '14 天挑戰' | '打破慣性' | '7 Habits' | '輕鬆探索' | '我的筆記' | '我的日誌';
  title: string;
  snippet: string;
  to: string;
}

interface Doc extends SearchResult {
  text: string;
}

/** 靜態內容索引（只建立一次） */
const staticDocs: Doc[] = (() => {
  const docs: Doc[] = [];
  for (const c of chapters) {
    docs.push({
      key: c.id,
      type: '章節',
      title: `第 ${c.number} 章｜${c.title}`,
      snippet: c.subtitle,
      to: `/learn/${c.id}`,
      text: [c.title, c.enTitle, c.subtitle, ...c.objectives, ...c.summary].join(' '),
    });
    for (const s of c.sections) {
      docs.push({
        key: `${c.id}-${s.id}`,
        type: '章節',
        title: `${s.heading}（第 ${c.number} 章）`,
        snippet: s.paragraphs[0],
        to: `/learn/${c.id}#sec-${s.id}`,
        text: [s.heading, ...s.paragraphs, s.callout?.text ?? ''].join(' '),
      });
    }
    for (const k of c.coreConcepts) {
      docs.push({
        key: `${c.id}-${k.term}`,
        type: '概念',
        title: k.term,
        snippet: k.definition,
        to: `/learn/${c.id}#concepts`,
        text: `${k.term} ${k.definition}`,
      });
    }
  }
  for (const a of affirmations) {
    docs.push({ key: `aff-${a.id}`, type: '每日語句', title: `${String(a.id).padStart(2, '0')}｜${a.text}`, snippet: a.meaning, to: '/daily', text: [a.theme, a.text, a.meaning, a.reflection, a.action].join(' ') });
  }
  for (const d of challengeDays) {
    docs.push({ key: `day-${d.day}`, type: '14 天挑戰', title: `Day ${d.day}：${d.theme}`, snippet: d.knowledge, to: `/challenge?day=${d.day}`, text: [d.theme, d.knowledge, d.action, d.reflection].join(' ') });
  }
  for (const h of patternHabits) {
    docs.push({
      key: `bp-${h.id}`,
      type: '打破慣性',
      title: `Habit 0${h.no}｜${h.title}`,
      snippet: h.definition,
      to: `/pattern/${h.id}`,
      text: [h.title, h.short, h.concept, h.definition, ...h.behaviors, ...h.situations, ...h.mechanisms.map((m) => `${m.term} ${m.text}`), h.boundary.note, h.neuro, ...h.alternatives, ...h.reflections, h.toolTitle].join(' '),
    });
  }
  for (const h of h7Habits) {
    docs.push({
      key: `h7-${h.id}`,
      type: '7 Habits',
      title: `習慣${h.no}｜${h.title} ${h.en}`,
      snippet: h.core,
      to: `/habits7/${h.id}`,
      text: [h.title, h.en, h.core, ...h.definition, ...h.situations.map((s) => s.text), ...h.misconceptions.map((m) => `${m.myth} ${m.better}`), ...h.concepts.map((c) => `${c.term} ${c.text}`), ...h.strategies, h.toolTitle].join(' '),
    });
  }
  for (const s of socialStories) docs.push({ key: `story-${s.id}`, type: '輕鬆探索', title: `人際小劇場：${s.title}`, snippet: s.scene, to: `/play/stories?story=${s.id}`, text: [s.title, s.theme, s.scene, ...s.options.map((o) => o.text)].join(' ') });
  for (const q of quests) docs.push({ key: `quest-${q.id}`, type: '輕鬆探索', title: `輕冒險：${q.title}`, snippet: q.depths.short, to: '/play/quest', text: [q.title, ...Object.values(q.depths)].join(' ') });
  return docs;
})();

/** 從內文擷取關鍵字附近的片段 */
function makeSnippet(text: string, term: string, fallback: string): string {
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return fallback;
  const start = Math.max(0, i - 24);
  return `${start > 0 ? '…' : ''}${text.slice(start, i + 60)}${i + 60 < text.length ? '…' : ''}`;
}

export function search(query: string, data: AppData, limit = 30): SearchResult[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const userDocs: Doc[] = [
    ...data.notes.map((n) => ({ key: `note-${n.id}`, type: '我的筆記' as const, title: n.source || (n.kind === 'highlight' ? '收藏重點' : '個人反思'), snippet: n.content, to: `/journal?tab=notes&q=${encodeURIComponent(query)}`, text: `${n.content} ${n.source ?? ''} ${n.tags.join(' ')}` })),
    ...data.journal.map((j) => ({ key: `j-${j.id}`, type: '我的日誌' as const, title: j.title || j.date, snippet: j.content, to: `/journal?q=${encodeURIComponent(query)}`, text: `${j.title} ${j.content} ${j.tags.join(' ')}` })),
  ];
  const out: SearchResult[] = [];
  for (const d of [...userDocs, ...staticDocs]) {
    const hay = `${d.title} ${d.text}`.toLowerCase();
    if (terms.every((t) => hay.includes(t))) {
      out.push({ key: d.key, type: d.type, title: d.title, to: d.to, snippet: makeSnippet(d.text, terms[0], d.snippet) });
      if (out.length >= limit) break;
    }
  }
  return out;
}
