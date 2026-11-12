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
