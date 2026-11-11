import { describe, expect, it } from 'vitest';
import { detect, extractTopic, suggestRewrites } from './rewrite';

describe('rewrite rules', () => {
  it('偵測絕對性用語與身份標籤', () => {
    const d = detect('我總是搞砸，大家一定都覺得我很笨');
    expect(d.absolutes).toEqual(expect.arrayContaining(['總是', '一定', '都']));
    expect(d.labels.length).toBeGreaterThan(0);
  });
  it('不會把「每一次」重複算成「每次」', () => {
    expect(detect('每一次都這樣').absolutes).toContain('每一次');
    expect(detect('每一次都這樣').absolutes).not.toContain('每次');
  });
  it('擷取主題', () => {
    expect(extractTopic('我就是不擅長社交。')).toBe('社交');
  });
  it('產生三則改寫建議並使用使用者輸入', () => {
    const r = suggestRewrites({ original: '我就是不擅長社交', situation: '超過五個人的聚會', skill: '如何主動開啟並延續對話', evidence: '上週主動和同事聊了五分鐘', nextStep: '準備兩個開場問題' });
    expect(r).toHaveLength(3);
    expect(r[0]).toBe('我正在學習如何主動開啟並延續對話。');
    expect(r[2]).toContain('準備兩個開場問題');
  });
});
