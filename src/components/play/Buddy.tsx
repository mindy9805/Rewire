/**
 * Rewire Buddy｜成長夥伴「小芽」（原創水彩風 SVG 角色，水彩效果見 watercolor.tsx）
 * 六種表情：歡迎、好奇、思考、慶祝、休息、鼓勵。
 * 只說歡迎、陪伴與慶祝的話；不催促、不責備。可在設定中隱藏；減少動畫偏好時不跳動。
 * 互動：點一下小芽會跳一下並換一句話；連續點 7 次會說出悄悄話（彩蛋）並飄下葉子。
 * 版型：手機上角色置中、對話框在下方；sm 以上角色在左、對話框在右。
 */
import { useMemo, useRef, useState } from 'react';
import { buddyLines, buddySecretLines, BUDDY_NAME, type BuddyMood } from '../../content/play';
import { celebrate } from '../../lib/celebrate';
import { WatercolorDefs, WC, useWcId, wc } from './watercolor';

/** 彩蛋需要的連續點擊次數，以及「連續」的判定間隔（毫秒） */
const SECRET_TAPS = 7;
const TAP_WINDOW = 1500;
const pick = <T,>(list: T[], not?: T) => {
  const pool = list.length > 1 ? list.filter((x) => x !== not) : list;
  return pool[Math.floor(Math.random() * pool.length)];
};

/** 小芽的身體輪廓（圓滾滾、略帶手繪的不規則感） */
const BODY = 'M100 62 C 148 60, 172 92, 168 128 C 165 164, 136 186, 100 186 C 62 186, 34 164, 32 128 C 30 92, 54 64, 100 62 z';

/** 六種表情：墨線五官＋暈染腮紅，各表情另有小配件（星光、zz、問號、揮手） */
function Face({ mood, id }: { mood: BuddyMood; id: string }) {
  const f = wc(id);
  const line = { stroke: WC.ink, strokeWidth: 3, strokeLinecap: 'round' as const, fill: 'none' };
  let eyes: JSX.Element, mouth: JSX.Element, extra: JSX.Element | null = null;
  switch (mood) {
    case 'resting':
      eyes = <><path d="M70 116 q8 7 16 0" {...line} /><path d="M114 116 q8 7 16 0" {...line} /></>;
      mouth = <path d="M92 136 q8 4 16 0" {...line} strokeWidth={2.6} />;
      extra = <g filter={f.ink} fill={WC.leafB} opacity={0.8} fontFamily="Georgia, serif" fontStyle="italic"><text x="150" y="72" fontSize="17">z</text><text x="163" y="56" fontSize="12">z</text></g>;
      break;
    case 'celebrating':
      eyes = <><path d="M70 118 q8 -10 16 0" {...line} /><path d="M114 118 q8 -10 16 0" {...line} /></>;
      mouth = <path d="M88 132 q12 16 24 0 q-12 3 -24 0z" fill={WC.mouth} opacity={0.85} stroke={WC.ink} strokeWidth={2} />;
      extra = <>
        <g filter={f.bloom} opacity={0.75}><circle cx="30" cy="70" r="6" fill={WC.spark} /><circle cx="176" cy="60" r="5" fill={WC.leafA} /><circle cx="168" cy="104" r="4" fill={WC.cheek} /><circle cx="24" cy="112" r="4" fill={WC.leafA} /></g>
        <g filter={f.ink} stroke={WC.spark} strokeWidth={2.6} strokeLinecap="round"><path d="M34 46 v10 M29 51 h10" /><path d="M172 84 v8 M168 88 h8" /></g>
      </>;
      break;
    case 'thinking':
      eyes = <><circle cx="80" cy="114" r="4.6" fill={WC.ink} /><circle cx="120" cy="111" r="4.6" fill={WC.ink} /></>;
      mouth = <path d="M92 138 q8 -3 16 1" {...line} strokeWidth={2.6} />;
      extra = <text x="152" y="70" fontSize="24" fill={WC.leafB} fontFamily="Georgia, serif" filter={f.ink} opacity={0.85}>?</text>;
      break;
    case 'curious':
      eyes = <><circle cx="78" cy="115" r="6" fill={WC.ink} /><circle cx="122" cy="115" r="6" fill={WC.ink} /><circle cx="80.5" cy="112.5" r="1.9" fill="#fff" /><circle cx="124.5" cy="112.5" r="1.9" fill="#fff" /></>;
      mouth = <ellipse cx="100" cy="137" rx="4.2" ry="5" fill={WC.ink} opacity={0.9} />;
      break;
    case 'encouraging':
      eyes = <><path d="M70 117 q8 -8 16 0" {...line} /><circle cx="122" cy="115" r="5" fill={WC.ink} /><circle cx="124" cy="113" r="1.6" fill="#fff" /></>;
      mouth = <path d="M88 132 q12 12 24 0" {...line} />;
      extra = <><path d="M166 132 q14 -10 10 -26" stroke={WC.stem} strokeWidth={5} strokeLinecap="round" fill="none" filter={f.ink} /><circle cx="175" cy="104" r="6" fill={WC.leafA} filter={f.wash} /></>;
      break;
    default: // welcome
      eyes = <><circle cx="78" cy="115" r="5" fill={WC.ink} /><circle cx="122" cy="115" r="5" fill={WC.ink} /><circle cx="80" cy="113" r="1.6" fill="#fff" /><circle cx="124" cy="113" r="1.6" fill="#fff" /></>;
      mouth = <path d="M89 132 q11 10 22 0" {...line} />;
  }
  return (
    <>
      <g filter={f.bloom} opacity={0.7}><ellipse cx="62" cy="130" rx="11" ry="7" fill={WC.cheek} /><ellipse cx="138" cy="130" rx="11" ry="7" fill={WC.cheek} /></g>
      <g filter={f.ink}>{eyes}{mouth}</g>
      {extra}
    </>
  );
}

/** 水彩版小芽（原創角色）：奶油色圓身體、兩片嫩葉、杏色腮紅 */
export function BuddySvg({ mood, size = 96 }: { mood: BuddyMood; size?: number }) {
  const id = useWcId('xy');
  const f = wc(id);
  return (
    <svg viewBox="0 0 200 210" width={size} height={size * 1.05} aria-hidden className={mood === 'celebrating' ? 'motion-safe:animate-buddy-hop' : 'motion-safe:animate-buddy-float'}>
      <WatercolorDefs id={id} />
      <defs>
        <linearGradient id={`${id}-leafL`} x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor={WC.leafLight} /><stop offset="100%" stopColor={WC.leafA} /></linearGradient>
        <linearGradient id={`${id}-leafR`} x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor={WC.leafA} /><stop offset="100%" stopColor={WC.leafDeep} /></linearGradient>
        <radialGradient id={`${id}-body`} cx="42%" cy="38%" r="70%"><stop offset="0%" stopColor="#FFFDF8" /><stop offset="55%" stopColor={WC.body} /><stop offset="100%" stopColor={WC.bodyShade} /></radialGradient>
        <clipPath id={`${id}-clip`}><path d={BODY} /></clipPath>
      </defs>
      {/* 地面陰影 */}
      <ellipse cx="100" cy="190" rx="58" ry="9" fill={WC.leafB} opacity={0.22} filter={f.bloom} />
      {/* 莖、兩片葉子與葉脈 */}
      <path d="M100 66 C 99 56, 101 48, 100 40" stroke={WC.stem} strokeWidth={5} strokeLinecap="round" fill="none" filter={f.ink} />
      <g filter={f.wash}>
        <path d="M100 44 C 82 14, 46 18, 52 42 C 64 56, 88 54, 100 44 z" fill={`url(#${id}-leafL)`} opacity={0.92} />
        <path d="M100 44 C 116 10, 156 14, 150 38 C 138 54, 114 54, 100 44 z" fill={`url(#${id}-leafR)`} opacity={0.9} />
      </g>
      <g filter={f.ink} stroke="#EEF3E6" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.75}>
        <path d="M96 42 C 84 34, 70 32, 60 36" /><path d="M104 42 C 118 32, 132 28, 144 30" />
      </g>
      {/* 身體：底色＋陰影／色斑／高光（裁在身體內）＋邊線 */}
      <g filter={f.wash}><path d={BODY} fill={`url(#${id}-body)`} /></g>
      <g clipPath={`url(#${id}-clip)`}>
        <g filter={f.bloom}>
          <path d="M156 100 C 172 132, 160 170, 112 184" stroke={WC.bodyShade} strokeWidth={22} fill="none" opacity={0.55} />
          <ellipse cx="140" cy="164" rx="26" ry="16" fill={WC.peach} opacity={0.35} />
          <ellipse cx="58" cy="164" rx="24" ry="14" fill={WC.leafA} opacity={0.1} />
          <ellipse cx="76" cy="88" rx="22" ry="12" fill="#FFFFFF" opacity={0.6} />
        </g>
        <path d="M118 150 c 8 -6, 18 -2, 16 6 c 6 2, 4 12, -4 12 c -2 6, -12 6, -14 0 c -8 0, -8 -10, 2 -18 z" fill="#FFF8EF" opacity={0.28} filter={f.bloom} />
      </g>
      <path d={BODY} fill="none" stroke={WC.bodyRim} strokeWidth={1.8} opacity={0.6} filter={f.ink} />
      {/* 顏料噴點 */}
      <g filter={f.ink} opacity={0.55}><circle cx="40" cy="58" r="2.2" fill={WC.leafA} /><circle cx="33" cy="66" r="1.2" fill={WC.leafA} /><circle cx="170" cy="168" r="2" fill={WC.peach} /><circle cx="177" cy="160" r="1.1" fill={WC.peach} /><circle cx="158" cy="22" r="1.5" fill={WC.leafB} /></g>
      <Face mood={mood} id={id} />
    </svg>
  );
}

/** 夥伴與對話框；message 未提供時依心情隨機選一句。點擊小芽可換一句話。 */
export default function Buddy({ mood, message, size = 88 }: { mood: BuddyMood; message?: string; size?: number }) {
  const initial = useMemo(() => message ?? pick(buddyLines[mood]), [mood, message]);
  const [override, setOverride] = useState<{ line: string; secret: boolean } | null>(null);
  const [hop, setHop] = useState(0);
  const taps = useRef({ count: 0, last: 0 });
  const line = override?.line ?? initial;

  const poke = () => {
    const now = Date.now();
    taps.current.count = now - taps.current.last < TAP_WINDOW ? taps.current.count + 1 : 1;
    taps.current.last = now;
    setHop((h) => h + 1);
    if (taps.current.count >= SECRET_TAPS) {
      taps.current.count = 0;
      setOverride({ line: pick(buddySecretLines, line), secret: true });
      celebrate();
      return;
    }
    // 一般點擊：從所有「正向」語句中換一句（不重複目前這句）
    setOverride({ line: pick(Object.values(buddyLines).flat(), line), secret: false });
  };

  return (
    <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-end sm:gap-3 sm:text-left" data-testid="buddy">
      <button type="button" onClick={poke} aria-label={`和${BUDDY_NAME}打招呼（換一句話）`} title={`點點${BUDDY_NAME}`}
        className="shrink-0 rounded-full transition-transform hover:scale-105 active:scale-95">
        {/* key 改變時重新播放跳躍動畫 */}
        <span key={hop} className={`block ${hop ? 'motion-safe:animate-buddy-hop' : ''}`}>
          <BuddySvg mood={override?.secret ? 'celebrating' : mood} size={size} />
        </span>
      </button>
      <div className={`relative max-w-xs rounded-2xl border px-4 py-2.5 text-sm leading-relaxed shadow-card sm:mb-4 sm:rounded-bl-sm ${override?.secret ? 'border-apricot bg-apricot/20' : 'border-line bg-surface'}`} role="status" aria-live="polite">
        {/* 手機版：對話框在角色下方，用小三角形指向上方 */}
        <span aria-hidden className={`absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t sm:hidden ${override?.secret ? 'border-apricot bg-[#F6EEE6] dark:bg-surface' : 'border-line bg-surface'}`} />
        <span className="sr-only">{BUDDY_NAME}說：</span>{line}
      </div>
    </div>
  );
}
