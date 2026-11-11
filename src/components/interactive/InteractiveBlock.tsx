/** 依章節設定，渲染對應的互動元件 */
import type { InteractiveKind } from '../../types';
import NeuralPathSim from './NeuralPathSim';
import CognitiveFilter from './CognitiveFilter';
import IdentityRewriter from './IdentityRewriter';
import SelfTalkCoach from './SelfTalkCoach';
import HabitDetective from './HabitDetective';
import HabitCurveSim from './HabitCurveSim';
import IfThenPlanner from './IfThenPlanner';
import EvidenceCards from './EvidenceCards';
import ToolCards from '../tools/ToolCards';

export const INTERACTIVE_META: Record<InteractiveKind, { title: string; desc: string }> = {
  'neural-path': { title: '神經道路模擬器', desc: '點擊執行新習慣，觀察小徑如何隨重複逐漸清晰。' },
  'cognitive-filter': { title: '認知濾鏡實驗', desc: '同一事件、不同解讀，會帶來什麼不同的結果？' },
  'identity-rewriter': { title: '身份敘事改寫器', desc: '把「我就是……」改寫成具體、可調整的描述。' },
  'self-talk': { title: '自我對話轉換練習', desc: '五個步驟，把負面想法轉為平衡且有建設性的陳述。' },
  'habit-detective': { title: '習慣偵探 Habit Detective', desc: '用好奇心記錄習慣的提示、需求與替代行動。' },
  'habit-curve': { title: '習慣養成模擬器', desc: '調整難度與頻率，觀察假設性的自動化曲線。' },
  tools: { title: '七個實踐工具', desc: '展開工具卡，實際練習並留下紀錄。' },
  'if-then': { title: 'If-Then 行動計畫產生器', desc: '把目標變成具體的情境與行動。' },
  evidence: { title: '科學證據檢視卡', desc: '用批判性問題閱讀本站引用的重要研究。' },
};

export default function InteractiveBlock({ kind }: { kind: InteractiveKind }) {
  switch (kind) {
    case 'neural-path': return <NeuralPathSim />;
    case 'cognitive-filter': return <CognitiveFilter />;
    case 'identity-rewriter': return <IdentityRewriter />;
    case 'self-talk': return <SelfTalkCoach />;
    case 'habit-detective': return <HabitDetective />;
    case 'habit-curve': return <HabitCurveSim />;
    case 'tools': return <ToolCards />;
    case 'if-then': return <IfThenPlanner />;
    case 'evidence': return <EvidenceCards />;
  }
}
