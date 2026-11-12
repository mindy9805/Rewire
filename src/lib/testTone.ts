/**
 * 測試音：用程式產生一段 0.6 秒、440Hz 的柔和提示音（WAV data URI），不需要任何音檔。
 * 用途：分辨「整支手機的網頁聲音都出不來」（靜音模式、媒體音量）還是「只有朗讀沒聲音」（語音資料問題）。
 * 必須在按鈕點擊的同一個事件裡呼叫 play()，iOS 才會允許播放。
 */
let cached = '';

export function testToneDataUri(): string {
  if (cached) return cached;
  const rate = 22050;
  const n = Math.round(rate * 0.6);
  const buf = new DataView(new ArrayBuffer(44 + n * 2));
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) buf.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); buf.setUint32(4, 36 + n * 2, true); str(8, 'WAVE');
  str(12, 'fmt '); buf.setUint32(16, 16, true); buf.setUint16(20, 1, true); buf.setUint16(22, 1, true);
  buf.setUint32(24, rate, true); buf.setUint32(28, rate * 2, true); buf.setUint16(32, 2, true); buf.setUint16(34, 16, true);
  str(36, 'data'); buf.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    // 前後各 50 毫秒淡入淡出，避免爆音
    const env = Math.min(1, i / (rate * 0.05), (n - i) / (rate * 0.05));
    buf.setInt16(44 + i * 2, Math.round(Math.sin((2 * Math.PI * 440 * i) / rate) * env * 0.4 * 32767), true);
  }
  let bin = '';
  const bytes = new Uint8Array(buf.buffer);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  cached = `data:audio/wav;base64,${btoa(bin)}`;
  return cached;
}

/** 播放測試音；回傳是否成功開始播放 */
export function playTestTone(): Promise<boolean> {
  try {
    const a = new Audio(testToneDataUri());
    return a.play().then(() => true, () => false);
  } catch {
    return Promise.resolve(false);
  }
}

/* ───────── 靜音模式下讓朗讀出聲 ───────── */
/*
 * iPhone 的 speechSynthesis 會被側邊「靜音開關」消音，但網頁 <audio> 不會（所以測試音聽得到、朗讀聽不到）。
 * 朗讀期間同步播放一段無聲的循環音訊，並把音訊工作階段設為 playback，讓系統把朗讀當成媒體播放。
 * 必須在使用者點擊的同一個事件裡呼叫；朗讀結束後停止，不會一直占用音訊。
 */
let keeper: HTMLAudioElement | null = null;
let silentUri = '';

function silentWav(): string {
  if (silentUri) return silentUri;
  const rate = 8000;
  const n = rate; // 1 秒
  const buf = new DataView(new ArrayBuffer(44 + n * 2));
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) buf.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); buf.setUint32(4, 36 + n * 2, true); str(8, 'WAVE');
  str(12, 'fmt '); buf.setUint32(16, 16, true); buf.setUint16(20, 1, true); buf.setUint16(22, 1, true);
  buf.setUint32(24, rate, true); buf.setUint32(28, rate * 2, true); buf.setUint16(32, 2, true); buf.setUint16(34, 16, true);
  str(36, 'data'); buf.setUint32(40, n * 2, true);
  let bin = '';
  const bytes = new Uint8Array(buf.buffer);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  silentUri = `data:audio/wav;base64,${btoa(bin)}`;
  return silentUri;
}

/** 開始「媒體播放」模式（同步呼叫，失敗時安靜略過） */
export function startPlaybackSession(): void {
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = 'playback';
    if (typeof Audio === 'undefined') return;
    if (!keeper) { keeper = new Audio(silentWav()); keeper.loop = true; }
    void keeper.play().catch(() => { /* 被擋下時略過 */ });
  } catch { /* 不支援時略過 */ }
}

/** 朗讀結束後停止，釋放音訊 */
export function stopPlaybackSession(): void {
  try { keeper?.pause(); } catch { /* 略過 */ }
}
