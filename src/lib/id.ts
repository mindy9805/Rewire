/** 產生本機唯一識別碼（不需後端） */
export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 目前時間的 ISO 字串 */
export const nowIso = () => new Date().toISOString();
