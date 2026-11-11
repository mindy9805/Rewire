import { describe, expect, it } from 'vitest';
import { createEmptyData } from '../store/storage';
import { todaysRecall } from './recall';
import { linkFor } from './records';

describe('間隔回想', () => {
  const now = new Date('2026-11-11T09:00:00');
  it('沒有作答過測驗時不出題', () => {
    expect(todaysRecall(createEmptyData(), now)).toBeNull();
  });
  it('今天剛作答的章節不出題（至少間隔一天）', () => {
    const d = createEmptyData();
    d.quizzes = { ch2: { answers: {}, score: 3, total: 4, submittedAt: '2026-11-11T08:00:00' } };
    expect(todaysRecall(d, now)).toBeNull();
  });
  it('隔天之後，從做過的章節出一題，同一天固定同一題', () => {
    const d = createEmptyData();
    d.quizzes = { ch2: { answers: {}, score: 3, total: 4, submittedAt: '2026-11-08T08:00:00' } };
    const a = todaysRecall(d, now)!;
    expect(a.chapterId).toBe('ch2');
    expect(a.q.options.length).toBeGreaterThan(1);
    expect(todaysRecall(d, now)!.q.id).toBe(a.q.id);
  });
});

describe('我的紀錄：查看連結', () => {
  it('依紀錄類型連回原本的工具', () => {
    expect(linkFor('quiz:ch3').to).toBe('/learn/ch3');
    expect(linkFor('challenge:5')).toEqual({ to: '/challenge?day=5', detail: '第 5 天' });
    expect(linkFor('h7plan:12').to).toBe('/habits7/plan?day=12');
    expect(linkFor('journal:abc').to).toBe('/journal');
    expect(linkFor('emotionLogs:x').to).toBe('/lab/labeling');
    expect(linkFor('restLogs:x').to).toBe('/habits7/renew');
  });
});
