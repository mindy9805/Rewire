/**
 * 7 Habits 學習頁的圖解圖示（純呈現）：依情境標籤（求職、職場、生活……）對應 lucide 圖示。
 * 新增標籤時在這裡補上；沒有對應時使用通用圖示。
 */
import { Activity, Brain, Briefcase, Building2, ClipboardList, GraduationCap, Handshake, Heart, HeartPulse, Home, Lightbulb, MessageCircle, Shapes, TrendingUp, Users, UsersRound, type LucideIcon } from 'lucide-react';

const BY_LABEL: Record<string, LucideIcon> = {
  求職: Briefcase, 職場: Building2, 生活: Home, 職涯: TrendingUp, 學習: GraduationCap, 健康: HeartPulse,
  家庭: Users, 合作: Handshake, 友誼: Heart, 團隊: UsersRound, 專案: ClipboardList, 社團: Shapes,
  身體: Activity, 心智: Brain, 人際: MessageCircle,
};
export const situationIcon = (label: string): LucideIcon => BY_LABEL[label] ?? Lightbulb;
