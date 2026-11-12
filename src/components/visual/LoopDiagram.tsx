/**
 * 循環圖：四個節點依序以箭頭連成一圈（例如 提示 → 行為 → 短期獎賞 → 強化）。
 * - SVG 繪製、隨寬度縮放（最寬 440px）；顏色使用設計變數，深淺模式皆清楚。
 * - 每個節點的文字建議 ≤ 10 字；完整內容寫在 aria-label 中。
 * - 沒有數據的概念圖，下方標示「示意圖，非實際數據」。
 */
export interface LoopNode { label: string; text: string }
const TONES = ['--amber', '--accent', '--rose', '--sageink'];
const POS: [number, number][] = [[180, 40], [270, 150], [180, 262], [90, 150]];

export default function LoopDiagram({ nodes, title, note = '示意圖，非實際數據' }: { nodes: [LoopNode, LoopNode, LoopNode, LoopNode]; title: string; note?: string }) {
  const aria = `${title}（${note}）：${nodes.map((n, i) => `${i + 1}. ${n.label}：${n.text}`).join(' → ')} → 再回到 ${nodes[0].label}`;
  return (
    <figure data-visual="loop" className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
      <svg viewBox="0 0 360 300" role="img" aria-label={aria} className="mx-auto block h-auto w-full max-w-[440px]">
        <defs>
          <marker id="loop-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" style={{ fill: 'rgb(var(--accent))' }} /></marker>
        </defs>
        <g fill="none" strokeWidth={2} markerEnd="url(#loop-arrow)" style={{ stroke: 'rgb(var(--accent))' }}>
          <path d="M180 66 Q 255 70 268 112" /><path d="M268 188 Q 255 230 180 234" /><path d="M180 234 Q 105 230 92 188" /><path d="M92 112 Q 105 70 180 66" />
        </g>
        {nodes.map((n, i) => {
          const [x, y] = POS[i];
          const tone = `rgb(var(${TONES[i]}))`;
          return (
            <g key={i}>
              <rect x={x - 74} y={y - 30} width={148} height={60} rx={16} strokeWidth={2} style={{ fill: 'rgb(var(--surface))', stroke: tone }} />
              <text x={x} y={y - 7} textAnchor="middle" fontSize={13} fontWeight={700} style={{ fill: tone }}>{`${'①②③④'[i]} ${n.label}`}</text>
              <text x={x} y={y + 15} textAnchor="middle" fontSize={13} style={{ fill: 'rgb(var(--ink))' }}>{n.text}</text>
            </g>
          );
        })}
      </svg>
      {note && <figcaption className="mt-1 text-center text-xs text-muted">{note}</figcaption>}
    </figure>
  );
}
