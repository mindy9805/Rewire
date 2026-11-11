import { describe, expect, it } from 'vitest';
import { unlockSummary } from './GrowthWatcher';

describe('解鎖提示合併', () => {
  it('依數量組成一句話', () => {
    expect(unlockSummary(['plant:clover'])).toBe('🌱 解鎖了新植物「幸運草」');
    expect(unlockSummary(['plant:clover', 'plant:tulip'])).toBe('🌱 解鎖了新植物「幸運草」和新植物「鬱金香」');
    expect(unlockSummary(['plant:clover', 'plant:tulip', 'plant:fern'])).toMatch(/^🌱 解鎖了 3 個新收藏：新植物「幸運草」、新植物「鬱金香」等/);
  });
});
