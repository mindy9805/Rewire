import { describe, expect, it } from 'vitest';
import { isTaiwanFemale, splitForSpeech, tidyForSpeech, voiceScore } from './speech';

const v = (name: string, lang: string, localService = true) => ({ name, lang, localService });

describe('朗讀聲音排序', () => {
  it('台灣女聲排在最前面，自然語音優先', () => {
    const list = [
      v('Microsoft Zhiwei - Chinese (Taiwan)', 'zh-TW'),
      v('Tingting', 'zh-CN'),
      v('Microsoft HsiaoChen Online (Natural) - Chinese (Taiwan)', 'zh-TW', false),
      v('Meijia', 'zh-TW'),
      v('Samantha', 'en-US'),
    ].sort((a, b) => voiceScore(b) - voiceScore(a));
    expect(list[0].name).toContain('HsiaoChen');
    expect(list[1].name).toBe('Meijia');
    expect(voiceScore(v('Samantha', 'en-US'))).toBeLessThan(0);
    // 台灣男聲排在中國大陸女聲之後也沒關係，但一定排在台灣女聲之後
    expect(voiceScore(v('Microsoft Zhiwei', 'zh-TW'))).toBeLessThan(voiceScore(v('Meijia', 'zh-TW')));
  });
  it('Google 國語（臺灣）排第一；中國大陸聲音不列出；國外版中文排在臺灣之後', () => {
    const list = [
      v('Microsoft HsiaoChen Online (Natural) - Chinese (Taiwan)', 'zh-TW', false),
      v('Google 普通话（中国大陆）', 'zh-CN', false),
      v('Google 粤語（香港）', 'zh-HK', false),
      v('Google 國語（臺灣）', 'zh-TW', false),
      v('Meijia', 'zh-TW'),
    ].filter((x) => voiceScore(x) >= 0).sort((a, b) => voiceScore(b) - voiceScore(a));
    expect(list.map((x) => x.name)).toEqual(['Google 國語（臺灣）', 'Microsoft HsiaoChen Online (Natural) - Chinese (Taiwan)', 'Meijia', 'Google 粤語（香港）']);
    for (const lang of ['zh-CN', 'cmn-Hans-CN', 'zh', 'cmn', 'zh_CN']) expect(voiceScore(v('X', lang))).toBeLessThan(0);
    for (const lang of ['zh-HK', 'yue-HK', 'zh-SG', 'zh-MO', 'cmn-Hant-TW', 'zh_TW']) expect(voiceScore(v('X', lang))).toBeGreaterThan(0);
  });
  it('辨識台灣女聲', () => {
    expect(isTaiwanFemale(v('Google 國語（臺灣）', 'zh-TW'))).toBe(true);
    expect(isTaiwanFemale(v('Microsoft YunJhe Online (Natural)', 'zh-TW'))).toBe(false);
    expect(isTaiwanFemale(v('Tingting', 'zh-CN'))).toBe(false);
  });
});

describe('朗讀文字整理', () => {
  it('移除會造成怪異停頓或被念出來的符號', () => {
    expect(tidyForSpeech('01｜我現在是安全的……\n「慢慢來」')).toBe('01，我現在是安全的，慢慢來');
  });
  it('長文字依句號切段，短句合併', () => {
    expect(splitForSpeech('我現在是安全的。今天是新的機會。')).toEqual(['我現在是安全的。今天是新的機會。']);
    const long = '這是一個比較長的句子，用來測試切段。'.repeat(5);
    const parts = splitForSpeech(long, 40);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.join('')).toBe(long);
  });
});
