/**
 * 知識實驗室：集中所有模擬器與七大工具，可用 /lab/:toolId 深層連結。
 * 上方可依「想做什麼」篩選（想了解大腦／想調整情緒／想改變習慣），網址 ?goal= 會記住目前的篩選。
 */
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SectionTitle } from '../components/ui/basics';
import InteractiveBlock, { INTERACTIVE_META } from '../components/interactive/InteractiveBlock';
import ToolCards, { TOOLS } from '../components/tools/ToolCards';
import { chapters } from '../content/chapters';
import { patternHabits } from '../content/breakPattern';
import type { InteractiveKind } from '../types';

const LABS: InteractiveKind[] = ['neural-path', 'cognitive-filter', 'identity-rewriter', 'self-talk', 'habit-detective', 'habit-curve', 'if-then', 'evidence'];

/** 依使用目的分類（本站自行整理的分類，方便挑選；一個工具只歸在最主要的一類） */
type Goal = 'brain' | 'emotion' | 'habit';
const GOALS: { id: Goal; label: string }[] = [
  { id: 'brain', label: '想了解大腦' },
  { id: 'emotion', label: '想調整情緒' },
  { id: 'habit', label: '想改變習慣' },
];
const GOAL_OF: Record<string, Goal> = {
  'neural-path': 'brain', 'habit-curve': 'brain', evidence: 'brain', sleep: 'brain',
  'cognitive-filter': 'emotion', 'self-talk': 'emotion', sigh: 'emotion', labeling: 'emotion', pause: 'emotion', pocket: 'emotion',
  'identity-rewriter': 'habit', 'habit-detective': 'habit', 'if-then': 'habit', rehearsal: 'habit', steps: 'habit',
};

export default function BrainLab() {
  const { toolId } = useParams();
  const lab = LABS.find((l) => l === toolId);
  const tool = TOOLS.find((t) => t.id === toolId);
  const [params, setParams] = useSearchParams();
  const goal = (['brain', 'emotion', 'habit'] as const).find((g) => g === params.get('goal')) ?? null;
  const show = (id: string) => !goal || GOAL_OF[id] === goal;
  const labs = LABS.filter(show);
  const tools = TOOLS.filter((t) => show(t.id)).map((t) => t.id);
  // 打破慣性的七個工具都屬於「想改變習慣」
  const showPattern = !goal || goal === 'habit';

  if (lab) {
    const ch = chapters.find((c) => c.interactive === lab);
    return (
      <div className="motion-safe:animate-fade-up">
        <Link to="/lab" className="btn-ghost btn-sm mb-4"><ArrowLeft className="h-4 w-4" aria-hidden />回到實驗室</Link>
        <SectionTitle level={1} title={INTERACTIVE_META[lab].title} desc={<>{INTERACTIVE_META[lab].desc}{ch && <> 延伸閱讀：<Link className="text-accent underline" to={`/learn/${ch.id}`}>第 {ch.number} 章 {ch.title}</Link></>}</>} />
        <InteractiveBlock kind={lab} />
      </div>
    );
  }

  return (
    <div className="motion-safe:animate-fade-up">
      <SectionTitle level={1} eyebrow="Brain Lab" title="知識實驗室" desc="把章節裡的概念變成可以動手操作的實驗與練習。所有紀錄只儲存在你的瀏覽器中。" />
      <div role="group" aria-label="依目的篩選工具" className="mb-8 flex flex-wrap gap-2">
        <button type="button" aria-pressed={!goal} className="btn-toggle" onClick={() => setParams({}, { replace: true })}>全部</button>
        {GOALS.map((g) => <button key={g.id} type="button" aria-pressed={goal === g.id} className="btn-toggle" onClick={() => setParams({ goal: g.id }, { replace: true })}>{g.label}</button>)}
      </div>
      {labs.length > 0 && <>
      <h2 className="mb-3 text-xl font-bold">概念模擬與練習</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {labs.map((l) => {
          const ch = chapters.find((c) => c.interactive === l);
          return (
            <Link key={l} to={`/lab/${l}`} className="card-hover rounded-2xl border border-line bg-surface p-5">
              {ch && <span className="chip">第 {ch.number} 章</span>}
              <p className="mt-2 font-serif text-lg font-bold">{INTERACTIVE_META[l].title}</p>
              <p className="mt-1 text-sm text-muted">{INTERACTIVE_META[l].desc}</p>
            </Link>
          );
        })}
      </div>
      </>}
      {showPattern && <>
      <h2 className="mb-3 mt-12 text-xl font-bold">打破慣性：七個習慣工具</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {patternHabits.map((h) => (
          <Link key={h.id} to={`/pattern/${h.id}#tool`} className="card-hover rounded-2xl border border-line bg-surface p-5">
            <span className="chip">Habit 0{h.no} · {h.short}</span>
            <p className="mt-2 font-serif text-lg font-bold">{h.toolTitle}</p>
          </Link>
        ))}
        <Link to="/pattern/workshop" className="card-hover rounded-2xl border border-accent/40 bg-soft/50 p-5">
          <span className="chip">七步驟</span>
          <p className="mt-2 font-serif text-lg font-bold">習慣改變工作坊</p>
          <p className="mt-1 text-sm text-muted">從察覺模式到反思調整，設計屬於你的改變計畫。</p>
        </Link>
      </div>
      </>}
      {tools.length > 0 && <>
      <h2 className="mb-3 mt-12 text-xl font-bold">{goal ? '神經可塑性實踐工具' : '七個神經可塑性實踐工具'}</h2>
      <ToolCards initial={tool?.id} only={goal ? tools : undefined} />
      </>}
    </div>
  );
}
