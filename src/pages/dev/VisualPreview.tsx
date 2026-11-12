/**
 * 視覺元件預覽頁（僅開發用）：npm run dev 後開啟 #/dev/visual。
 * 正式建置不會包含這一頁（App.tsx 只在 import.meta.env.DEV 時註冊路由）。
 * 用真實內容示範每一個元件，方便調整樣式與檢查深色模式。
 */
import { Briefcase, HandHelping, Smartphone, PenLine, MessageSquareQuote, ListChecks, MessageCircle, Sun, Moon } from 'lucide-react';
import { patternMap } from '../../content/breakPattern';
import { h7Map } from '../../content/habits7';
import { ChainDiagram, CompareColumns, EvidenceBadge, IconCardGrid, KeyPointCard, LoopDiagram, SpectrumBar, StepCards, Timeline, WatercolorSpot } from '../../components/visual';
import { useStore } from '../../store/AppStore';

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2"><h2 className="font-display text-sm uppercase tracking-widest text-muted">{title}</h2>{children}</section>
);

export default function VisualPreview() {
  const h = patternMap.approval;
  const p = h7Map.proactive;
  const { data, update } = useStore();
  const dark = data.settings.theme === 'dark';
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">視覺元件預覽（開發用）</h1>
        <button type="button" className="btn-secondary btn-sm" onClick={() => update((d) => ({ ...d, settings: { ...d.settings, theme: dark ? 'light' : 'dark' } }))}>{dark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}切換{dark ? '淺色' : '深色'}</button>
      </div>
      <Block title="KeyPointCard＋WatercolorSpot"><KeyPointCard text={h.definition} spot={<WatercolorSpot kind="approval" />}><p>{h.behaviors.join('、')}</p></KeyPointCard></Block>
      <Block title="IconCardGrid"><IconCardGrid items={h.situations.map((text, i) => ({ icon: [Briefcase, HandHelping, Smartphone][i], text }))} /></Block>
      <Block title="LoopDiagram"><LoopDiagram title="心理機制循環" nodes={[{ label: '提示', text: '主管皺眉、別人請求' }, { label: '行為', text: '附和、答應' }, { label: '短期獎賞', text: '避免衝突、被喜歡' }, { label: '強化', text: '下次更快附和' }]} /></Block>
      <Block title="ChainDiagram"><ChainDiagram title="示範流程" steps={[{ label: '提示', text: '進門看到沙發' }, { label: '行為', text: '坐下看影片' }, { label: '結果', text: '運動計畫延後' }]} /></Block>
      <Block title="SpectrumBar"><SpectrumBar left={h.boundary.healthy} right={h.boundary.excessive} note={h.boundary.note} /></Block>
      <Block title="CompareColumns"><CompareColumns leftTitle="常見誤解" rightTitle="較貼近的理解" rows={p.misconceptions.map((m) => ({ left: m.myth, right: m.better }))} /></Block>
      <Block title="StepCards"><StepCards steps={h.alternatives.map((text, i) => ({ text, icon: [PenLine, MessageSquareQuote, ListChecks, MessageCircle][i] }))} /></Block>
      <Block title="EvidenceBadge"><EvidenceBadge kind="preliminary" label="相關性研究為主" summary={h.evidence.text} meta={[['適用限制', h.evidence.limits]]}><p>（這裡放研究來源清單）</p></EvidenceBadge></Block>
      <Block title="Timeline"><Timeline ariaLabel="14 天練習進度" current={4} items={Array.from({ length: 14 }, (_, i) => ({ label: String(i + 1), state: i < 4 ? 'done' : i === 4 ? 'today' : 'later' }))} onSelect={() => undefined} /></Block>
    </div>
  );
}
