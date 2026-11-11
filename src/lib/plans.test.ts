import { describe, expect, it } from 'vitest';
import { createEmptyData } from '../store/storage';
import { activePlan, continueItem, planSummaries } from './plans';

const day = (at: string) => ({ completed: true, completedAt: at, note: '', affirmationReflection: '', microActionDone: true, feeling: '' });

describe('我的計畫', () => {
  it('新使用者：三個計畫都未開始，沒有進行中的計畫，也沒有「繼續上次」', () => {
    const d = createEmptyData();
    expect(planSummaries(d).map((p) => p.status)).toEqual(['none', 'none', 'none']);
    expect(activePlan(d)).toBeNull();
    expect(continueItem(d)).toBeNull();
  });
  it('14 天練習完成 3 天：成為進行中計畫，下一個是第 4 天', () => {
    const d = createEmptyData();
    d.challenge = { 1: day('2026-11-01T00:00:00Z'), 2: day('2026-11-02T00:00:00Z'), 3: day('2026-11-03T00:00:00Z') };
    const p = activePlan(d)!;
    expect(p.id).toBe('neuro');
    expect(p.done).toBe(3);
    expect(p.nextDay).toBe(4);
    expect(p.to).toBe('/challenge?day=4');
  });
  it('暫停中的打破慣性挑戰不算「進行中」', () => {
    const d = createEmptyData();
    d.patternChallenge = { activeHabitId: 'approval', status: 'paused', level: 'gentle', progress: { approval: {} } };
    expect(planSummaries(d)[1].status).toBe('paused');
    expect(activePlan(d)).toBeNull();
  });
  it('「繼續上次」挑最近的一項：較新的章節瀏覽優先於較舊的計畫紀錄', () => {
    const d = createEmptyData();
    d.challenge = { 1: day('2026-11-01T00:00:00Z') };
    d.chapters = { ch2: { completed: false, lastVisitedAt: '2026-11-05T00:00:00Z' } };
    const c = continueItem(d)!;
    expect(c.kind).toBe('chapter');
    expect(c.to).toBe('/learn/ch2');
    // 章節已完成就不再出現，改回計畫
    d.chapters.ch2!.completed = true;
    expect(continueItem(d)!.kind).toBe('plan');
  });
});
