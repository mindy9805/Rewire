/**
 * Rewire 的整體架構：四個核心學習系統＋兩個練習與追蹤工具（「學習」總覽頁使用）。
 *
 * ★ 名稱對照表：title 即全站統一名稱，導覽（components/layout/nav.ts）、頁面標題與按鈕都使用同一個名稱；
 *   en 只作為英文小標。要改名時，請同時檢查 nav.ts 與對應頁面的 SectionTitle。
 *
 * 四個系統的分工：
 * - 神經可塑性：提供理解行為改變的科學視角（研究發現）。
 * - Daily Rewire：自我覺察與自我對話的練習工具。
 * - Break the Pattern：辨識可能妨礙長期目標的行為模式（實踐框架）。
 * - 高效能生活：價值導向的生活與人際實踐架構（管理哲學）。
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
  { id: 'neuro', en: 'Neuroscience', title: '主題學習', desc: '九章神經可塑性：理解大腦如何學習與改變', lens: '科學視角：大腦如何學習與改變', to: '/learn', core: true },
  { id: 'daily', en: 'Daily Rewire', title: '每日心智練習', desc: '每天七句心智語句與自我對話練習', lens: '覺察練習：培養自我接納與心理彈性', to: '/daily', core: true },
  { id: 'pattern', en: 'Break the Pattern', title: '打破慣性', desc: '辨識七個在不知不覺中消耗你的習慣', lens: '實踐框架：看見妨礙長期目標的模式', to: '/pattern', core: true },
  { id: 'habits7', en: 'Effective Living', title: '高效能生活', desc: '建立個人成功與互賴合作能力', lens: '管理哲學：價值選擇、時間管理與合作', to: '/habits7', core: true },
  { id: 'challenges', en: 'My Plans', title: '我的計畫', desc: '14 天練習、14 天打破慣性挑戰、21 天探索計畫', lens: '持續練習：把學習變成每天的小行動', to: '/plans', core: false },
  { id: 'dashboard', en: 'Dashboard', title: '學習儀表板', desc: '追蹤行動、反思與成長', lens: '回顧：用自己的真實紀錄看見變化', to: '/dashboard', core: false },
];
