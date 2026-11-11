/**
 * 我的紀錄（時間軸）：沿用 collectActivity 的「每筆保存的紀錄算一次」定義，
 * 再為每一筆補上「在哪裡可以看到它」的連結與更具體的說明。
 * 只是集中顯示，資料仍留在原本的工具裡，不搬動、不複製。
 */
import type { AppData } from '../types';
import { collectActivity, type ActivityEvent } from './activity';
import { chapterMap } from '../content/chapters';
import { h7Map } from '../content/habits7';
import { patternMap } from '../content/breakPattern';

export interface RecordItem extends ActivityEvent {
  to: string;
  detail?: string;
}

/** 依紀錄 key 的前綴，對應到可以查看這筆紀錄的頁面 */
const LAB: Record<string, string> = {
  habitLogs: '/lab/habit-detective', emotionLogs: '/lab/labeling', sleepLogs: '/lab/sleep', plans: '/lab/if-then',
  rehearsals: '/lab/rehearsal', smallSteps: '/lab/steps', sessions: '/lab/sigh', identityRewrites: '/lab/identity-rewriter', selfTalk: '/lab/self-talk',
};
const H7_TOOL: Record<string, string> = {
  circles: '/habits7/proactive', negotiations: '/habits7/winwin', empathyLogs: '/habits7/understand', teamBoards: '/habits7/synergize',
  renewalChecks: '/habits7/renew', restLogs: '/habits7/renew', rhabit: '/habits7/renew', quad: '/habits7/first', vision: '/habits7/end',
};

export function linkFor(key: string): { to: string; detail?: string } {
  const [prefix, a, b] = key.split(':');
  const ch = a ? chapterMap[a as keyof typeof chapterMap] : undefined;
  const h7 = a ? h7Map[a as keyof typeof h7Map] : undefined;
  switch (prefix) {
    case 'chapter': case 'quiz': return { to: `/learn/${a}`, detail: ch && `第 ${ch.number} 章 ${ch.title}` };
    case 'note': return { to: '/journal?tab=notes' };
    case 'journal': return { to: '/journal' };
    case 'daily': return { to: '/daily?tab=records' };
    case 'challenge': return { to: `/challenge?day=${a}`, detail: `第 ${a} 天` };
    case 'pchallenge': return { to: '/challenge?type=pattern', detail: `${patternMap[a as keyof typeof patternMap]?.short ?? ''}・第 ${b} 天` };
    case 'h7plan': return { to: `/habits7/plan?day=${a}`, detail: `第 ${a} 天` };
    case 'exp': case 'ptool': case 'commit': return { to: '/pattern' };
    case 'assess': return { to: '/pattern/assessment' };
    case 'workshop': return { to: '/pattern/workshop' };
    case 'h7': case 'h7quiz': return { to: `/habits7/${a}`, detail: h7 && `習慣${'一二三四五六七'[h7.no - 1]}：${h7.title}` };
    case 'h7check': return { to: '/habits7' };
    case 'quest': return { to: '/play/quest' };
    case 'card': return { to: '/play/collection' };
    case 'story': return { to: '/play/stories' };
    case 'capsule': return { to: '/play/capsule' };
    default: return { to: LAB[prefix] ?? H7_TOOL[prefix] ?? '/dashboard' };
  }
}

/** 所有紀錄，最新的在前 */
export function collectRecords(d: AppData): RecordItem[] {
  return collectActivity(d).map((e) => ({ ...e, ...linkFor(e.key) })).reverse();
}
