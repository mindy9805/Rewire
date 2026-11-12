/**
 * 打破慣性學習頁的圖解圖示（純呈現，不屬於內容）：依習慣與段落對應 lucide 圖示，順序與內容陣列相同。
 * 新增習慣的圖解時，在這裡補上同樣數量的圖示即可；缺少時使用通用圖示。
 */
import { Activity, BatteryLow, Briefcase, Circle, HandHelping, ListChecks, MessageCircle, MessageSquareQuote, PenLine, Scale, Smartphone, type LucideIcon } from 'lucide-react';
import type { PatternHabitId } from '../../types';

export const PATTERN_ICONS: Partial<Record<PatternHabitId, { situations: LucideIcon[]; impacts: LucideIcon[]; alternatives: LucideIcon[] }>> = {
  approval: {
    situations: [Briefcase, HandHelping, Smartphone], // 會議改口、累了還答應、一直看回應
    impacts: [Scale, BatteryLow, Activity], // 決策猶豫、承接過多而疲憊、自我感覺隨回應起伏
    alternatives: [PenLine, MessageSquareQuote, ListChecks, MessageCircle], // 寫下想要、口袋句、列價值來源、用「我」開頭
  },
};

/** 取第 i 個圖示，沒有設定時用通用圖示 */
export const iconAt = (list: LucideIcon[] | undefined, i: number): LucideIcon => list?.[i] ?? Circle;
