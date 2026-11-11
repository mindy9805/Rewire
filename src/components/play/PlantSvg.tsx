/** 心智花園的植物與裝飾（簡約插畫風 SVG） */
export default function PlantSvg({ kind, size = 48, grow = false }: { kind: string; size?: number; grow?: boolean }) {
  const stem = <path d="M24 44 V26" stroke="#5E7F70" strokeWidth="2.5" strokeLinecap="round" />;
  const leaf = (x: number, y: number, flip = false) => <ellipse cx={x} cy={y} rx="6" ry="3" fill="#A8BBA3" transform={`rotate(${flip ? 30 : -30} ${x} ${y})`} />;
  const shapes: Record<string, JSX.Element> = {
    sprout: <>{stem}{leaf(19, 28)}{leaf(29, 26, true)}</>,
    clover: <>{stem}{[0, 120, 240].map((r) => <circle key={r} cx={24 + 5 * Math.cos((r * Math.PI) / 180)} cy={22 + 5 * Math.sin((r * Math.PI) / 180)} r="5" fill="#7E9C8C" />)}</>,
    tulip: <>{stem}{leaf(19, 36)}<path d="M17 14 q7 -6 14 0 v8 q-7 6 -14 0 z" fill="#D9A28F" /></>,
    fern: <>{[-30, -10, 10, 30].map((a) => <path key={a} d={`M24 44 q${a / 2} -18 ${a / 1.5} -30`} stroke="#5E7F70" strokeWidth="2" fill="none" />)}{[-20, 0, 20].map((a) => <ellipse key={a} cx={24 + a / 2} cy={22} rx="3" ry="8" fill="#A8BBA3" transform={`rotate(${a} 24 22)`} />)}</>,
    stone: <ellipse cx="24" cy="38" rx="14" ry="8" fill="#B8B2A7" stroke="#8C877E" />,
    sunflower: <>{stem}{leaf(18, 36)}{Array.from({ length: 10 }).map((_, i) => <ellipse key={i} cx="24" cy="10" rx="2.5" ry="6" fill="#E3B54A" transform={`rotate(${i * 36} 24 18)`} />)}<circle cx="24" cy="18" r="5" fill="#7A5230" /></>,
    lavender: <>{[18, 24, 30].map((x) => <g key={x}><path d={`M${x} 44 V16`} stroke="#5E7F70" strokeWidth="1.5" />{[16, 20, 24].map((y) => <circle key={y} cx={x} cy={y} r="2.2" fill="#A68FC4" />)}</g>)}</>,
    lantern: <><path d="M24 6 v6" stroke="#5E7F70" strokeWidth="2" /><rect x="16" y="12" width="16" height="20" rx="6" fill="#E8CCB2" stroke="#C9A88A" /><circle cx="24" cy="22" r="4" fill="#F7E3A1" /><path d="M24 32 V44" stroke="#5E7F70" strokeWidth="2" /></>,
    mushroom: <><rect x="20" y="28" width="8" height="14" rx="3" fill="#FAF8F4" stroke="#C9A88A" /><path d="M10 30 q14 -22 28 0 z" fill="#D9A28F" /><circle cx="19" cy="24" r="2" fill="#FAF8F4" /><circle cx="28" cy="22" r="2" fill="#FAF8F4" /></>,
    tree: <><rect x="21" y="26" width="6" height="18" fill="#8B6A4E" /><circle cx="24" cy="18" r="13" fill="#7E9C8C" /><circle cx="17" cy="22" r="7" fill="#A8BBA3" /><circle cx="31" cy="20" r="6" fill="#A8BBA3" /></>,
    bench: <><rect x="6" y="26" width="36" height="5" rx="2" fill="#B08968" /><rect x="6" y="18" width="36" height="4" rx="2" fill="#C9A88A" /><path d="M10 31 v12 M38 31 v12" stroke="#8B6A4E" strokeWidth="3" /></>,
    butterfly: <><ellipse cx="17" cy="20" rx="8" ry="10" fill="#C3B4D6" /><ellipse cx="31" cy="20" rx="8" ry="10" fill="#E8CCB2" /><path d="M24 12 v18" stroke="#303630" strokeWidth="2" strokeLinecap="round" /></>,
  };
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden className={grow ? 'origin-bottom motion-safe:animate-grow' : ''}>
      {shapes[kind] ?? shapes.sprout}
    </svg>
  );
}
