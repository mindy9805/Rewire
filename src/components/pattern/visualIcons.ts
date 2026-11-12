/**
 * 打破慣性學習頁的圖解圖示（純呈現，不屬於內容）：依習慣與段落對應 lucide 圖示，順序與內容陣列相同。
 * 新增習慣的圖解時，在這裡補上同樣數量的圖示即可；缺少時使用通用圖示。
 */
import { Activity, Ban, BatteryLow, BedDouble, BookOpen, Briefcase, Calculator, CalendarCheck, Circle, Clock, CloudRain, Coffee, Compass, Dumbbell, Eye, Flag, Footprints, Frown, GraduationCap, HandHelping, HeadphoneOff, Hourglass, Laptop, Layers, ListChecks, ListTodo, MessageCircle, MessageSquareQuote, MessageSquareWarning, MessageSquareX, Minimize2, Moon, MousePointerClick, NotebookPen, PenLine, RefreshCcw, Route, Scale, Share2, Shirt, ShoppingBag, ShoppingCart, Shuffle, Smartphone, Tag, Target, Timer, TrendingUp, Tv, UserMinus, UserX, Users, Utensils, Wallet, Wind, type LucideIcon } from 'lucide-react';
import type { PatternHabitId } from '../../types';

export const PATTERN_ICONS: Partial<Record<PatternHabitId, { situations: LucideIcon[]; impacts: LucideIcon[]; alternatives: LucideIcon[] }>> = {
  approval: {
    situations: [Briefcase, HandHelping, Smartphone], // 會議改口、累了還答應、一直看回應
    impacts: [Scale, BatteryLow, Activity], // 決策猶豫、承接過多而疲憊、自我感覺隨回應起伏
    alternatives: [PenLine, MessageSquareQuote, ListChecks, MessageCircle], // 寫下想要、口袋句、列價值來源、用「我」開頭
  },
  convenience: {
    situations: [Laptop, Dumbbell, ListTodo], // 新軟體教學、運動喘就停、先做瑣事
    impacts: [GraduationCap, Shuffle, Ban], // 學習停在入門、面對變動、把不舒服當做不到
    alternatives: [Layers, Timer, Tag, NotebookPen], // 三階段、10 分鐘先試、命名感受、記下學到的
  },
  impress: {
    situations: [Shirt, ShoppingCart, CloudRain], // 聚會買新衣、深夜下單、心情不好逛購物網站
    impacts: [Wallet, Frown, TrendingUp], // 財務壓力、事後後悔、「足夠」標準提高
    alternatives: [Hourglass, Calculator, PenLine, Footprints], // 冷靜期、每次使用成本、寫下原因、散步
  },
  solitude: {
    situations: [Coffee, Utensils, BedDouble], // 排隊滑短影音、邊吃邊看、睡前滑手機
    impacts: [CloudRain, Compass, Shuffle], // 壓力累積、方向不清、注意力分散
    alternatives: [HeadphoneOff, Timer, Utensils, NotebookPen], // 不戴耳機、安靜五分鐘、吃飯只吃飯、睡前寫一個想法
  },
  promises: {
    situations: [Dumbbell, BookOpen, Frown], // 運動計畫放棄、明天再讀書、責怪自己
    impacts: [MessageSquareX, Target, RefreshCcw], // 「我做不到」、不敢設目標、自責循環
    alternatives: [Minimize2, Route, NotebookPen, CalendarCheck], // 2 分鐘版本、情境與備案、記錄原因、七天回顧
  },
  environment: {
    situations: [MessageSquareWarning, Moon, UserMinus], // 被說沒用、熬夜聚餐、相處後覺得不夠好
    impacts: [Wind, Clock, UserX], // 念頭被消磨、作息受影響、孤立
    alternatives: [Eye, MessageSquareQuote, Users, Share2], // 觀察互動、口袋句、找社群、分享資源
  },
  shortterm: {
    situations: [Tv, Smartphone, ShoppingBag], // 再一集、短影音、購物犒賞
    impacts: [BedDouble, Target, RefreshCcw], // 睡眠健康延後、重要目標難累積、懊悔循環
    alternatives: [Flag, Scale, MousePointerClick, Timer], // 先決定停點、折衷方案、多一步、每天 10 分鐘
  },
};

/** 取第 i 個圖示，沒有設定時用通用圖示 */
export const iconAt = (list: LucideIcon[] | undefined, i: number): LucideIcon => list?.[i] ?? Circle;
