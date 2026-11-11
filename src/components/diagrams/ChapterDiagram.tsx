/**
 * 各章節的概念示意圖（純 SVG，支援深色模式）
 * 每張圖皆提供 role="img" 與 <title>/<desc> 作為替代文字；均為概念示意，非真實比例。
 */
import type { ChapterId } from '../../types';

const C = {
  ink: 'rgb(var(--ink))',
  muted: 'rgb(var(--muted))',
  sage: 'rgb(var(--sage))',
  accent: 'rgb(var(--accent))',
  apricot: 'rgb(var(--apricot))',
  soft: 'rgb(var(--soft))',
  surface: 'rgb(var(--surface))',
  line: 'rgb(var(--line))',
};

function Box({ x, y, w, h, label, fill = C.soft, sub }: { x: number; y: number; w: number; h: number; label: string; fill?: string; sub?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={fill} stroke={C.line} />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -4 : 5)} textAnchor="middle" fontSize="15" fill={C.ink} fontWeight={600}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" fontSize="11" fill={C.muted}>
          {sub}
        </text>
      )}
    </g>
  );
}

const Arrow = ({ d }: { d: string }) => <path d={d} stroke={C.accent} strokeWidth={2} fill="none" markerEnd="url(#arr)" />;

const Defs = () => (
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill={C.accent} />
    </marker>
  </defs>
);

function Neuron() {
  return (
    <>
      {[
        [90, 110],
        [300, 70],
        [300, 160],
        [510, 110],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={26} fill={C.soft} stroke={C.sage} strokeWidth={2} />
          <circle cx={cx} cy={cy} r={8} fill={C.sage} />
        </g>
      ))}
      <path d="M116 108 C 190 70, 230 70, 274 70" stroke={C.accent} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M116 114 C 190 160, 230 160, 274 160" stroke={C.sage} strokeWidth={2} fill="none" strokeDasharray="5 5" />
      <path d="M326 70 C 410 70, 440 100, 484 108" stroke={C.accent} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M326 160 C 410 160, 440 120, 484 114" stroke={C.sage} strokeWidth={2} fill="none" strokeDasharray="5 5" />
      <circle cx={274} cy={70} r={5} fill={C.apricot} />
      <text x={90} y={165} textAnchor="middle" fontSize="12" fill={C.muted}>提示</text>
      <text x={510} y={165} textAnchor="middle" fontSize="12" fill={C.muted}>行為</text>
      <text x={200} y={58} textAnchor="middle" fontSize="12" fill={C.ink}>常走的連結（較強）</text>
      <text x={200} y={190} textAnchor="middle" fontSize="12" fill={C.muted}>少走的連結（較弱）</text>
      <text x={290} y={110} textAnchor="middle" fontSize="11" fill={C.muted}>突觸</text>
    </>
  );
}

function FilterFlow() {
  const labels = ['事件', '解讀', '情緒', '行為', '結果'];
  return (
    <>
      {labels.map((l, i) => (
        <Box key={l} x={14 + i * 118} y={80} w={96} h={56} label={l} fill={i === 1 ? C.apricot : C.soft} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={i} d={`M${110 + i * 118} 108 L${130 + i * 118} 108`} />
      ))}
      <text x={180} y={60} textAnchor="middle" fontSize="12" fill={C.ink}>認知濾鏡在這裡運作</text>
      <path d="M180 66 L180 78" stroke={C.ink} strokeWidth={1.5} />
      <text x={300} y={170} textAnchor="middle" fontSize="12" fill={C.muted}>同一事件 × 不同解讀 → 不同結果</text>
    </>
  );
}

function Mindset() {
  return (
    <>
      <Box x={20} y={30} w={250} h={60} label="固定型思維" sub="挑戰＝威脅，失敗＝我不行" />
      <Box x={330} y={30} w={250} h={60} label="成長型思維" sub="挑戰＝學習，失敗＝調整資訊" fill={C.apricot} />
      <line x1={40} y1={140} x2={560} y2={140} stroke={C.line} strokeWidth={6} strokeLinecap="round" />
      <circle cx={180} cy={140} r={9} fill={C.sage} />
      <circle cx={420} cy={140} r={9} fill={C.accent} />
      <text x={300} y={175} textAnchor="middle" fontSize="12" fill={C.muted}>連續光譜：不同領域可能有不同傾向</text>
      <Arrow d="M195 140 L400 140" />
    </>
  );
}

function CbtModel() {
  return (
    <>
      <Box x={235} y={8} w={130} h={44} label="情境" />
      <Box x={235} y={78} w={130} h={44} label="想法" fill={C.apricot} />
      <Box x={40} y={150} w={130} h={44} label="情緒" />
      <Box x={235} y={150} w={130} h={44} label="身體反應" />
      <Box x={430} y={150} w={130} h={44} label="行為" />
      <Arrow d="M300 52 L300 76" />
      <Arrow d="M250 122 L160 148" />
      <Arrow d="M300 122 L300 148" />
      <Arrow d="M350 122 L440 148" />
      <path d="M170 172 L233 172" stroke={C.sage} strokeWidth={2} markerEnd="url(#arr)" markerStart="url(#arr)" />
      <path d="M365 172 L428 172" stroke={C.sage} strokeWidth={2} markerEnd="url(#arr)" markerStart="url(#arr)" />
    </>
  );
}

function HabitLoop() {
  return (
    <>
      <Box x={30} y={70} w={130} h={56} label="提示 Cue" sub="時間、地點、情緒" />
      <Box x={235} y={20} w={130} h={56} label="行為" sub="舊習慣／替代行動" fill={C.apricot} />
      <Box x={440} y={70} w={130} h={56} label="立即回饋" sub="放鬆、逃避、刺激" />
      <Box x={235} y={140} w={130} h={50} label="長期代價" sub="常被忽略" fill={C.surface} />
      <Arrow d="M160 90 C 190 60, 205 50, 233 48" />
      <Arrow d="M365 48 C 400 50, 420 60, 440 88" />
      <path d="M505 128 C 480 200, 140 200, 95 128" stroke={C.sage} strokeWidth={2} fill="none" strokeDasharray="6 5" markerEnd="url(#arr)" />
      <text x={300} y={210} textAnchor="middle" fontSize="11" fill={C.muted}>回饋強化「提示 → 行為」的連結</text>
    </>
  );
}

function Curve() {
  const pts = (k: number, wobble: number) =>
    Array.from({ length: 41 }, (_, i) => {
      const x = 40 + i * 13;
      const y = 180 - 140 * (1 - Math.exp(-k * i)) + Math.sin(i * 1.3) * wobble;
      return `${i ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
    }).join(' ');
  return (
    <>
      <line x1={40} y1={180} x2={575} y2={180} stroke={C.line} />
      <line x1={40} y1={30} x2={40} y2={180} stroke={C.line} />
      <path d={pts(0.18, 3)} stroke={C.accent} strokeWidth={3} fill="none" />
      <path d={pts(0.06, 5)} stroke={C.sage} strokeWidth={3} fill="none" strokeDasharray="7 5" />
      <text x={560} y={200} textAnchor="end" fontSize="11" fill={C.muted}>時間（重複次數）</text>
      <text x={48} y={26} fontSize="11" fill={C.muted}>自動化程度</text>
      <text x={250} y={58} fontSize="12" fill={C.ink}>簡單行為：較快接近高原</text>
      <text x={300} y={130} fontSize="12" fill={C.ink}>複雜行為：曲線較長</text>
    </>
  );
}

function ToolsWheel() {
  const items = ['生理性嘆息', '情緒命名', '停察選行', '心智預演', '微小行動', '口袋句', '睡眠'];
  return (
    <>
      <circle cx={300} cy={110} r={42} fill={C.apricot} />
      <text x={300} y={115} textAnchor="middle" fontSize="14" fontWeight={700} fill={C.ink}>日常練習</text>
      {items.map((t, i) => {
        const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        const x = 300 + Math.cos(a) * 160;
        const y = 110 + Math.sin(a) * 82;
        return (
          <g key={t}>
            <line x1={300 + Math.cos(a) * 44} y1={110 + Math.sin(a) * 44} x2={x} y2={y} stroke={C.line} />
            <rect x={x - 48} y={y - 15} width={96} height={30} rx={15} fill={C.soft} stroke={C.sage} />
            <text x={x} y={y + 5} textAnchor="middle" fontSize="12" fill={C.ink}>{t}</text>
          </g>
        );
      })}
    </>
  );
}

function IfThen() {
  return (
    <>
      <Box x={20} y={30} w={160} h={56} label="如果（情境）" sub="週一晚上 8 點吃完飯" />
      <Box x={220} y={30} w={160} h={56} label="我就（行動）" sub="換鞋走 20 分鐘" fill={C.apricot} />
      <Box x={420} y={30} w={160} h={56} label="回饋與紀錄" sub="打勾、寫一句話" />
      <Box x={120} y={140} w={160} h={50} label="可能障礙" sub="下雨、加班" fill={C.surface} />
      <Box x={320} y={140} w={160} h={50} label="備用方案" sub="在家伸展 10 分鐘" />
      <Arrow d="M180 58 L218 58" />
      <Arrow d="M380 58 L418 58" />
      <Arrow d="M280 165 L318 165" />
      <path d="M300 88 L200 138" stroke={C.sage} strokeDasharray="5 5" strokeWidth={2} />
    </>
  );
}

function EvidenceLadder() {
  const steps = ['個人經驗／案例', '觀察與相關研究', '隨機對照實驗', '重複驗證與後設分析'];
  return (
    <>
      {steps.map((s, i) => (
        <g key={s}>
          <rect x={60 + i * 40} y={160 - i * 42} width={480 - i * 80} height={34} rx={10} fill={i === 3 ? C.apricot : C.soft} stroke={C.line} />
          <text x={300} y={182 - i * 42} textAnchor="middle" fontSize="13" fill={C.ink}>{s}</text>
        </g>
      ))}
      <Arrow d="M570 190 L570 40" />
      <text x={565} y={30} textAnchor="end" fontSize="11" fill={C.muted}>證據強度（一般而言）</text>
    </>
  );
}

const MAP: Record<ChapterId, { el: () => JSX.Element; title: string }> = {
  ch1: { el: Neuron, title: '神經元與突觸連結示意圖' },
  ch2: { el: FilterFlow, title: '事件、解讀、情緒、行為與結果的流程圖' },
  ch3: { el: Mindset, title: '固定型與成長型思維光譜圖' },
  ch4: { el: CbtModel, title: '認知行為模型圖' },
  ch5: { el: HabitLoop, title: '習慣循環示意圖' },
  ch6: { el: Curve, title: '習慣自動化曲線示意圖' },
  ch7: { el: ToolsWheel, title: '七個實踐工具示意圖' },
  ch8: { el: IfThen, title: 'If-Then 行動計畫流程圖' },
  ch9: { el: EvidenceLadder, title: '科學證據強度階梯示意圖' },
};

export default function ChapterDiagram({ id, caption }: { id: ChapterId; caption: string }) {
  const { el: El, title } = MAP[id];
  const tid = `dg-${id}`;
  return (
    <figure className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <svg viewBox="0 0 600 215" className="h-auto w-full" role="img" aria-labelledby={`${tid}-t ${tid}-d`}>
        <title id={`${tid}-t`}>{title}</title>
        <desc id={`${tid}-d`}>{caption}</desc>
        <Defs />
        <El />
      </svg>
      <figcaption className="mt-2 text-xs leading-relaxed text-muted">{caption}</figcaption>
    </figure>
  );
}
