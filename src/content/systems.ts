/**
 * Rewire 的整體架構：四個核心學習系統＋兩個練習與追蹤工具（首頁「自由探索」入口使用）。
 *
 * 四個系統的分工：
 * - 神經可塑性：提供理解行為改變的科學視角（研究發現）。
 * - Daily Rewire：自我覺察與自我對話的練習工具。
 * - Break the Pattern：辨識可能妨礙長期目標的行為模式（實踐框架）。
 * - 7 Habits：價值導向的生活與人際實踐架構（管理哲學）。
 * 各系統可以整合運用，但頁面上會清楚區分研究結論、管理哲學與本站的實踐建議。
 */

/** 網站的核心理念（一句話） */
export const PRODUCT_TAGLINE = '看見自己的慣性，理解自己的價值，練習有意識的選擇，逐漸成為自己希望成為的人。';
export const PRODUCT_SUBLINE = '理解自己，調整慣性，創造有意義的成長';

/** 輕遊戲化的產品體驗宣言 */
export const PLAY_PROMISE = '成長可以很輕盈，每天一點點，慢慢遇見新的自己。';

export type SystemId = 'neuro' | 'daily' | 'pattern' | 'habits7' | 'challenges' | 'dashboard';

export interface LearningSystem {
  id: SystemId;
  en: string;
  title: string;
  desc: string;
  /** 這個系統提供的視角：研究、練習、實踐框架、管理哲學或追蹤工具 */
  lens: string;
  to: string;
  core: boolean;
}

export const SYSTEMS: LearningSystem[] = [
  { id: 'neuro', en: 'Neuroscience', title: '神經可塑性', desc: '理解神經可塑性與習慣形成', lens: '科學視角：大腦如何學習與改變', to: '/learn', core: true },
  { id: 'daily', en: 'Daily Rewire', title: '每日七句心智練習', desc: '每日七句心智與自我對話練習', lens: '覺察練習：培養自我接納與心理彈性', to: '/daily', core: true },
  { id: 'pattern', en: 'Break the Pattern', title: '七個隱形消耗習慣', desc: '辨識七個隱形消耗習慣', lens: '實踐框架：看見妨礙長期目標的模式', to: '/pattern', core: true },
  { id: 'habits7', en: '7 Habits', title: '高效能人士的七個習慣', desc: '建立個人成功與互賴合作能力', lens: '管理哲學：價值選擇、時間管理與合作', to: '/habits7', core: true },
  { id: 'challenges', en: 'Challenges', title: '挑戰與探索計畫', desc: '14 天改變挑戰與 21 天探索', lens: '持續練習：把學習變成每天的小行動', to: '/challenge', core: false },
  { id: 'dashboard', en: 'Growth Dashboard', title: '成長儀表板', desc: '追蹤行動、反思與成長', lens: '回顧：用自己的真實紀錄看見變化', to: '/dashboard', core: false },
];
