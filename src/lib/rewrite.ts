/**
 * 本地規則：偵測絕對性用語與身份標籤，並依引導式表單產生改寫建議。
 * ⚠️ 完全在瀏覽器內以預設規則運作，沒有串接任何 AI 或外部服務。
 */

/** 絕對化／全面否定用語（依長度排序，避免短詞先被比對） */
export const ABSOLUTE_WORDS = [
  '每一次', '所有人', '沒有人', '不可能', '一輩子', '這輩子', '一定', '絕對', '完全', '根本', '總是', '從來', '永遠', '每次', '全部', '老是', '只會', '必須', '應該', '都',
];

/** 身份標籤句型 */
const LABEL_PATTERNS: { re: RegExp; hint: string }[] = [
  { re: /我(就是|天生|本來就)/, hint: '「我就是／天生」把一段經驗變成固定身份。' },
  { re: /我是(一個|個)?.{0,6}(的人|者|鬼|廢物|魯蛇)/, hint: '「我是……的人」是抽象的身份標籤。' },
  { re: /不擅長|不會|做不到|沒辦法|學不會/, hint: '「不擅長／做不到」沒有說明情境，也沒有留下學習空間。' },
  { re: /很爛|很差|很笨|沒用|失敗/, hint: '評價性的字眼針對「人」而不是「行為」。' },
];

export interface Detection {
  absolutes: string[];
  labels: string[];
}

export function detect(text: string): Detection {
  const absolutes: string[] = [];
  let rest = text;
  for (const w of ABSOLUTE_WORDS) {
    if (rest.includes(w)) {
      absolutes.push(w);
      rest = rest.split(w).join('　');
    }
  }
  const labels = LABEL_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.hint);
  return { absolutes, labels };
}

/** 去除常見的標籤開頭，取出核心描述（例如「我就是不擅長社交」→「社交」） */
export function extractTopic(text: string): string {
  return text
    .replace(/[。！!？?，,]/g, '')
    .replace(/^我/, '')
    .replace(/^(就是|天生|本來就|總是|永遠|從來都?|一直)/, '')
    .replace(/^(不擅長|沒辦法|做不到|學不會|不會|很|不)+/, '')
    .replace(/(的人|啦|了|吧)$/, '')
    .trim();
}

export interface RewriteInput {
  original: string;
  situation: string; // 在什麼情境下覺得困難
  skill: string; // 正在學習的具體技能
  evidence: string; // 一個小小的進步證據
  nextStep: string; // 下一步
}

/** 依引導答案產生三種改寫建議 */
export function suggestRewrites(i: RewriteInput): string[] {
  const topic = extractTopic(i.original) || '這件事';
  const skill = i.skill.trim() || `${topic}相關的技巧`;
  const situation = i.situation.trim();
  const out: string[] = [];
  out.push(`我正在學習${skill}。`);
  if (situation) out.push(`在${situation}時，我目前還不太熟練；這是可以練習的技能，不是我的全部。`);
  else out.push(`對於${topic}，我目前還在練習中；這是可以學習的技能，不是我的全部。`);
  if (i.evidence.trim() && i.nextStep.trim()) out.push(`我曾經${i.evidence.trim()}，下一步我可以${i.nextStep.trim()}。`);
  else if (i.nextStep.trim()) out.push(`我還在學習${skill}，下一步我可以${i.nextStep.trim()}。`);
  else out.push(`我還不夠熟練${topic}，但我可以先從一個小練習開始。`);
  return out;
}
