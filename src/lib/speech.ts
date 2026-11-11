/**
 * 朗讀輔助：使用瀏覽器內建 SpeechSynthesis API（在裝置上合成，不傳送文字到本站伺服器）。
 * 不支援的瀏覽器會回傳 false，介面改為提示使用者自行朗讀。
 *
 * 聲音選擇：優先「台灣中文＋女聲」，其中又優先自然語音（Natural／Neural／Premium 等）。
 * 實際可用的聲音取決於裝置：iPhone／Mac 常見「美佳 Meijia」、Windows／Edge 常見「HsiaoChen 曉臻」「HsiaoYu 曉雨」「Yating 雅婷」，
 * Chrome 有「Google 國語（臺灣）」。使用者也可以在「資料與隱私 → 朗讀聲音」自行指定。
 *
 * 讓朗讀通順、不中斷：
 * - 等語音清單載入完成再朗讀（Chrome 第一次呼叫時清單常是空的，會改用預設聲音）
 * - 語速 0.95：太慢（0.8 左右）中文會一字一頓
 * - 整理會造成怪異停頓的符號（全形空白、｜、換行、刪節號）
 * - 較長的文字依句號切段排入佇列，避免 Chrome 約 15 秒後自動中斷
 * - cancel() 後稍等再 speak()，避免 Chrome／Safari 吃掉下一句
 */

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

/** 預設語速與音高 */
export const SPEECH_RATE = 0.95;
const SPEECH_PITCH = 1.05;

const TW = /^(zh[-_]TW|cmn[-_]Hant[-_]TW|zh[-_]Hant)/i;
const FEMALE = /(HsiaoChen|Hsiao-?Chen|曉臻|HsiaoYu|Hsiao-?Yu|曉雨|Yating|雅婷|Hanhan|涵涵|Mei-?Jia|美佳|Sin-?ji|善怡|Ting-?Ting|婷婷|Google\s*國語|female|女)/i;
const MALE = /(Zhiwei|志偉|YunJhe|Yun-?Jhe|雲哲|male(?!.*female)|男)/i;
const NATURAL = /(Natural|Neural|Online|Premium|Enhanced|高品質)/i;

/** 依「台灣中文 → 女聲 → 自然語音」為聲音打分數；分數越高越優先 */
export function voiceScore(v: Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>): number {
  let s = 0;
  if (TW.test(v.lang)) s += 100;
  else if (/^zh[-_]HK/i.test(v.lang)) s += 30;
  else if (/^(zh|cmn)/i.test(v.lang)) s += 20;
  else return -1; // 非中文聲音不考慮
  if (FEMALE.test(v.name)) s += 50;
  if (MALE.test(v.name) && !FEMALE.test(v.name)) s -= 60;
  if (NATURAL.test(v.name)) s += 15;
  if (v.localService) s += 3;
  return s;
}

/** 等待語音清單（最多 1.5 秒）；回傳排序好的中文聲音，最推薦的在前 */
export function loadChineseVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([]);
  const sorted = () => window.speechSynthesis.getVoices().filter((v) => voiceScore(v) >= 0).sort((a, b) => voiceScore(b) - voiceScore(a));
  const now = sorted();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => { window.speechSynthesis.removeEventListener('voiceschanged', done); resolve(sorted()); };
    window.speechSynthesis.addEventListener('voiceschanged', done);
    setTimeout(done, 1500);
  });
}

/** 是否為「台灣女聲」（設定頁用來提示使用者裝置是否有合適的聲音） */
export const isTaiwanFemale = (v: Pick<SpeechSynthesisVoice, 'name' | 'lang'>) => TW.test(v.lang) && FEMALE.test(v.name);

/** 整理文字：移除造成停頓或被念出來的符號，讓語氣連貫 */
export function tidyForSpeech(text: string): string {
  return text
    .replace(/[\u3000\s]+/g, ' ')
    .replace(/[｜|]/g, '，')
    .replace(/……|…|⋯/g, '，')
    .replace(/[「」『』《》〈〉]/g, '')
    .replace(/\s*，\s*/g, '，')
    .replace(/，+/g, '，')
    .trim();
}

/** 依句尾標點切段（每段不超過約 60 字），避免單一朗讀太長被瀏覽器中斷 */
export function splitForSpeech(text: string, max = 60): string[] {
  const sentences = text.split(/(?<=[。！？!?；;])/).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  for (const s of sentences) {
    const last = out[out.length - 1];
    if (last && last.length + s.length <= max) out[out.length - 1] = last + s;
    else out.push(s);
  }
  return out.length ? out : [text];
}

/** 使用者指定的聲音（voiceURI）；空字串代表自動挑選 */
let preferredVoiceURI = '';
export const setPreferredVoice = (uri: string) => { preferredVoiceURI = uri; };

let token = 0;

/** 朗讀一段文字；回傳是否支援朗讀 */
export function speak(text: string, rate = SPEECH_RATE): boolean {
  if (!speechSupported()) return false;
  const my = ++token;
  try {
    window.speechSynthesis.cancel();
    void loadChineseVoices().then((voices) => {
      if (my !== token) return; // 期間又按了別的句子，就不念舊的
      const voice = voices.find((v) => v.voiceURI === preferredVoiceURI) ?? voices[0];
      // 稍等一下再開始，避免剛 cancel() 時瀏覽器吃掉這一句
      setTimeout(() => {
        if (my !== token) return;
        const synth = window.speechSynthesis;
        if (synth.paused) synth.resume();
        for (const part of splitForSpeech(tidyForSpeech(text))) {
          const u = new SpeechSynthesisUtterance(part);
          u.lang = voice?.lang || 'zh-TW';
          if (voice) u.voice = voice;
          u.rate = rate;
          u.pitch = SPEECH_PITCH;
          synth.speak(u);
        }
      }, 60);
    });
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  token++;
  if (speechSupported()) window.speechSynthesis.cancel();
}
