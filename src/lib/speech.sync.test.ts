/**
 * 手機朗讀修正的單元測試：用假的 speechSynthesis 驗證
 * 1. speak() 在同一個呼叫堆疊內同步呼叫 speechSynthesis.speak()（iOS 要求）
 * 2. 語音清單尚未載入時，仍立即以 lang='zh-TW' 朗讀
 * 3. 只在正在朗讀或有排隊時才 cancel()
 * 4. 1.5 秒內沒有開始 → 狀態變為「被擋下」
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type U = { text: string; lang: string; voice?: unknown; volume?: number; onstart?: () => void; onend?: () => void; onerror?: (e: unknown) => void };

function installFakeSpeech(voices: { name: string; lang: string; voiceURI: string; localService: boolean }[] = []) {
  const synth = {
    speaking: false, pending: false, paused: false,
    spoken: [] as U[],
    speak: vi.fn(function (this: void, u: U) { synth.spoken.push(u); }),
    cancel: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => voices),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  class FakeUtterance { text: string; lang = ''; constructor(t: string) { this.text = t; } }
  vi.stubGlobal('window', { speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance });
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  return synth;
}

describe('手機朗讀：同步朗讀', () => {
  beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); });
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it('speak() 回傳前就已經呼叫 speechSynthesis.speak()（同一個呼叫堆疊）', async () => {
    const synth = installFakeSpeech();
    const { speak } = await import('./speech');
    expect(speak('我現在是安全的')).toBe(true);
    expect(synth.speak).toHaveBeenCalledTimes(1); // 沒有等待任何 Promise 或計時器
  });

  it('語音清單尚未載入時，仍立即以 zh-TW 朗讀，不指定 voice', async () => {
    const synth = installFakeSpeech([]);
    const { speak } = await import('./speech');
    speak('今天是新的機會');
    expect(synth.spoken[0].lang).toBe('zh-TW');
    expect(synth.spoken[0].voice).toBeUndefined();
  });

  it('清單已載入時使用台灣女聲', async () => {
    const synth = installFakeSpeech([
      { name: 'Microsoft Zhiwei', lang: 'zh-TW', voiceURI: 'zhiwei', localService: true },
      { name: 'Meijia', lang: 'zh-TW', voiceURI: 'meijia', localService: true },
    ]);
    const { speak } = await import('./speech');
    speak('我的大腦可以改變');
    expect((synth.spoken[0].voice as { name: string }).name).toBe('Meijia');
  });

  it('只在正在朗讀或有排隊時才 cancel()', async () => {
    const synth = installFakeSpeech();
    const { speak } = await import('./speech');
    speak('第一句');
    expect(synth.cancel).not.toHaveBeenCalled();
    synth.speaking = true;
    speak('第二句');
    expect(synth.cancel).toHaveBeenCalledTimes(1);
  });

  it('1.5 秒內沒有開始 → 狀態變為被擋下；有開始則為朗讀中、結束後成功', async () => {
    const synth = installFakeSpeech();
    const { speak, getSpeechState } = await import('./speech');
    speak('測試');
    expect(getSpeechState().status).toBe('starting');
    vi.advanceTimersByTime(1600);
    expect(getSpeechState()).toMatchObject({ status: 'blocked', lastResult: 'blocked' });
    speak('再試一次');
    const u = synth.spoken[synth.spoken.length - 1];
    u.onstart?.();
    expect(getSpeechState().status).toBe('speaking');
    u.onend?.();
    expect(getSpeechState()).toMatchObject({ status: 'idle', lastResult: 'success' });
  });

  it('unlockSpeech() 同步播放一段無聲短句', async () => {
    const synth = installFakeSpeech();
    const { unlockSpeech } = await import('./speech');
    unlockSpeech();
    expect(synth.speak).toHaveBeenCalledTimes(1);
    expect(synth.spoken[0].volume).toBe(0);
  });

  it('辨識 App 內建瀏覽器', async () => {
    installFakeSpeech();
    const { isInAppBrowser } = await import('./speech');
    expect(isInAppBrowser('Mozilla/5.0 (iPhone) Line/13.0')).toBe(true);
    expect(isInAppBrowser('Mozilla/5.0 (iPhone) Safari/604.1')).toBe(false);
  });
});
