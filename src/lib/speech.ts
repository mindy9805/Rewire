/**
 * 朗讀輔助：使用瀏覽器內建 SpeechSynthesis API（在裝置上合成，不傳送文字到本站伺服器）。
 *
 * ── 手機能正常發聲的關鍵（iOS Safari 特別嚴格）──
 * 1. speak() 必須在使用者點擊的「同一個事件、同一個呼叫堆疊」中同步呼叫 speechSynthesis.speak()，
 *    中間不可有 await／Promise／setTimeout，否則會被無聲擋下（不會有任何錯誤訊息）。
 * 2. 語音清單還沒載入時，不等待：只設定 lang='zh-TW' 立即朗讀（交給系統挑中文聲音），
 *    同時在背景監聽 voiceschanged，下一句就能用上挑好的台灣女聲。
 * 3. 只有「正在朗讀或有排隊中的語句」時才 cancel()；部分 iOS 版本在 cancel() 後立刻 speak() 會失效。
 * 4. unlockSpeech()：在第一次相關點擊（例如「開始每日心智練習」）時同步播放一段無聲短句，
 *    之後頁面中的朗讀比較不會被擋。
 *
 * ── 聲音選擇 ──
 * 優先「台灣中文＋女聲」，其中又優先自然語音（Natural／Neural／Premium 等）。
 * 實際可用的聲音取決於裝置：iPhone／Mac 常見「美佳 Meijia」、Windows／Edge 常見「HsiaoChen 曉臻」「HsiaoYu 曉雨」「Yating 雅婷」，
 * Chrome 有「Google 國語（臺灣）」。使用者也可以在「資料與隱私 → 朗讀聲音」自行指定。
 *
 * ── 通順不中斷 ──
 * 語速 0.95；整理會造成怪異停頓的符號；較長的文字依句號切段排入佇列（避免 Chrome 約 15 秒後中斷）。
 *
 * ── 狀態回饋 ──
 * 透過 subscribeSpeech／getSpeechState（React 端用 useSpeechState）讓介面顯示「正在朗讀…」、
 * 「按下後 1.5 秒仍未開始」的排除提示，以及「朗讀檢查」所需的最後一次結果。
 */

export const speechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window && !!window.speechSynthesis;

/** 預設語速與音高 */
export const SPEECH_RATE = 0.95;
const SPEECH_PITCH = 1.05;
/** 按下後多久仍未開始，就視為「可能被擋下」 */
export const BLOCKED_AFTER_MS = 1500;

const TW = /^(zh[-_]TW|cmn[-_]Hant[-_]TW|zh[-_]Hant)/i;
const FEMALE = /(HsiaoChen|Hsiao-?Chen|曉臻|HsiaoYu|Hsiao-?Yu|曉雨|Yating|雅婷|Hanhan|涵涵|Mei-?Jia|美佳|Sin-?ji|善怡|Ting-?Ting|婷婷|Google\s*國語|female|女)/i;
const MALE = /(Zhiwei|志偉|YunJhe|Yun-?Jhe|雲哲|male(?!.*female)|男)/i;
const NATURAL = /(Natural|Neural|Online|Premium|Enhanced|高品質)/i;
/** 常見 App 內建瀏覽器（常不支援朗讀） */
const IN_APP = /(Line\/|FBAN|FBAV|FB_IAB|Instagram|MicroMessenger|KAKAOTALK|Threads|WhatsApp)/i;

/** 依「台灣中文 → 女聲 → 自然語音」為聲音打分數；分數越高越優先；非中文回傳 -1 */
export function voiceScore(v: Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>): number {
  let s = 0;
  if (TW.test(v.lang)) s += 100;
  else if (/^zh[-_]HK/i.test(v.lang)) s += 30;
  else if (/^(zh|cmn)/i.test(v.lang)) s += 20;
  else return -1;
  if (FEMALE.test(v.name)) s += 50;
  if (MALE.test(v.name) && !FEMALE.test(v.name)) s -= 60;
  if (NATURAL.test(v.name)) s += 15;
  if (v.localService) s += 3;
  return s;
}

/** 是否為「台灣女聲」（設定頁用來提示使用者裝置是否有合適的聲音） */
export const isTaiwanFemale = (v: Pick<SpeechSynthesisVoice, 'name' | 'lang'>) => TW.test(v.lang) && FEMALE.test(v.name);

/** 是否在 LINE／Facebook／Instagram 等 App 內建瀏覽器中 */
export const isInAppBrowser = (ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') => IN_APP.test(ua);

/** 同步取得目前已載入、排序好的中文聲音（可能是空陣列：清單尚未載入） */
export function chineseVoicesNow(): SpeechSynthesisVoice[] {
  if (!speechSupported()) return [];
  return window.speechSynthesis.getVoices().filter((v) => voiceScore(v) >= 0).sort((a, b) => voiceScore(b) - voiceScore(a));
}

/** 等待語音清單（最多 1.5 秒）；只用在設定頁顯示清單，朗讀本身不會等待 */
export function loadChineseVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([]);
  const now = chineseVoicesNow();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => { window.speechSynthesis.removeEventListener?.('voiceschanged', done); resolve(chineseVoicesNow()); };
    window.speechSynthesis.addEventListener?.('voiceschanged', done);
    setTimeout(done, 1500);
  });
}

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

/* ───────── 狀態（供介面顯示與「朗讀檢查」使用） ───────── */

export type SpeechStatus = 'idle' | 'starting' | 'speaking' | 'blocked' | 'error';
export interface SpeechState {
  status: SpeechStatus;
  /** 最後一次朗讀的結果 */
  lastResult: 'none' | 'success' | 'blocked' | 'error';
  /** 錯誤代碼（例如 not-allowed、synthesis-failed） */
  lastError: string;
  /** 最後一次實際使用的聲音名稱（空字串＝交給系統挑選的 zh-TW 聲音） */
  lastVoice: string;
}
let state: SpeechState = { status: 'idle', lastResult: 'none', lastError: '', lastVoice: '' };
const listeners = new Set<() => void>();
const setState = (patch: Partial<SpeechState>) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); };
export const getSpeechState = () => state;
export function subscribeSpeech(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

/* ───────── 朗讀 ───────── */

/** 使用者指定的聲音（voiceURI）；空字串代表自動挑選 */
let preferredVoiceURI = '';
export const setPreferredVoice = (uri: string) => { preferredVoiceURI = uri; };

/** 背景監聽語音清單載入（只掛一次），讓下一句能用上台灣女聲 */
let listening = false;
function ensureVoiceListener() {
  if (listening || !speechSupported()) return;
  listening = true;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => { window.speechSynthesis.getVoices(); });
}

let unlocked = false;
/** 在使用者第一次點擊相關按鈕時同步呼叫：播放一段無聲短句，解除 iOS 的朗讀限制 */
export function unlockSpeech() {
  if (unlocked || !speechSupported()) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    u.lang = 'zh-TW';
    window.speechSynthesis.speak(u);
    unlocked = true;
  } catch { /* 不支援時略過 */ }
  ensureVoiceListener();
}

let token = 0;
let watchdog: ReturnType<typeof setTimeout> | undefined;

/**
 * 朗讀一段文字（請在點擊事件中直接呼叫）。整個過程同步完成，不等待語音清單。
 * 回傳是否支援朗讀。
 */
export function speak(text: string, rate = SPEECH_RATE): boolean {
  if (!speechSupported()) return false;
  const my = ++token;
  const synth = window.speechSynthesis;
  try {
    // 只有正在朗讀或有排隊時才取消，避免 iOS 吃掉下一句
    if (synth.speaking || synth.pending) synth.cancel();
    if (synth.paused) synth.resume();
    const voices = chineseVoicesNow();
    const voice = voices.find((v) => v.voiceURI === preferredVoiceURI) ?? voices[0];
    const parts = splitForSpeech(tidyForSpeech(text));
    setState({ status: 'starting', lastVoice: voice?.name ?? '' });
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = voice?.lang || 'zh-TW';
      if (voice) u.voice = voice;
      u.rate = rate;
      u.pitch = SPEECH_PITCH;
      if (i === 0) u.onstart = () => { if (my === token) { clearTimeout(watchdog); setState({ status: 'speaking' }); } };
      if (i === parts.length - 1) u.onend = () => { if (my === token) setState({ status: 'idle', lastResult: 'success', lastError: '' }); };
      u.onerror = (e: Event) => {
        const code = (e as SpeechSynthesisErrorEvent).error ?? 'unknown';
        if (my !== token || code === 'interrupted' || code === 'canceled') return; // 我們自己取消的不算錯誤
        clearTimeout(watchdog);
        setState({ status: 'error', lastResult: code === 'not-allowed' ? 'blocked' : 'error', lastError: code });
      };
      synth.speak(u);
    });
    unlocked = true;
    // 1.5 秒後仍未開始：多半是被瀏覽器擋下或裝置靜音，讓介面顯示排除方法
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      if (my === token && state.status === 'starting') setState({ status: 'blocked', lastResult: 'blocked', lastError: 'no-start' });
    }, BLOCKED_AFTER_MS);
    ensureVoiceListener();
    return true;
  } catch (e) {
    setState({ status: 'error', lastResult: 'error', lastError: e instanceof Error ? e.message : 'exception' });
    return false;
  }
}

export function stopSpeaking() {
  token++;
  clearTimeout(watchdog);
  if (speechSupported()) {
    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) synth.cancel();
  }
  if (state.status !== 'idle') setState({ status: 'idle' });
}
