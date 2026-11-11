/**
 * 朗讀輔助：使用瀏覽器內建 SpeechSynthesis API（在裝置上合成，不傳送文字到本站伺服器）。
 * 不支援的瀏覽器會回傳 false，介面改為提示使用者自行朗讀。
 */
export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

/** 優先選擇台灣中文語音，其次任何中文語音 */
function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => /zh[-_]TW/i.test(v.lang)) ?? voices.find((v) => /zh/i.test(v.lang));
}

export function speak(text: string, rate = 0.85): boolean {
  if (!speechSupported()) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW';
    u.rate = rate;
    const v = pickVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}
