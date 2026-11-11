/**
 * Rewire Buddy｜成長夥伴「小芽」（原創 SVG 角色）
 * 六種表情：歡迎、好奇、思考、慶祝、休息、鼓勵。
 * 只說歡迎、陪伴與慶祝的話；不催促、不責備。可在設定中隱藏；減少動畫偏好時不跳動。
 * 互動：點一下小芽會跳一下並換一句話；連續點 7 次會說出悄悄話（彩蛋）並飄下葉子。
 * 版型：手機上角色置中、對話框在下方；sm 以上角色在左、對話框在右。
 */
import { useMemo, useRef, useState } from 'react';
import { buddyLines, buddySecretLines, BUDDY_NAME, type BuddyMood } from '../../content/play';
import { celebrate } from '../../lib/celebrate';

/** 彩蛋需要的連續點擊次數，以及「連續」的判定間隔（毫秒） */
const SECRET_TAPS = 7;
const TAP_WINDOW = 1500;
const pick = <T,>(list: T[], not?: T) => {
  const pool = list.length > 1 ? list.filter((x) => x !== not) : list;
  return pool[Math.floor(Math.random() * pool.length)];
};

function Face({ mood }: { mood: BuddyMood }) {
  const eyes =
    mood === 'resting' ? (
      <><path d="M38 52 q5 4 10 0" stroke="#303630" strokeWidth="2.5" fill="none" strokeLinecap="round" /><path d="M58 52 q5 4 10 0" stroke="#303630" strokeWidth="2.5" fill="none" strokeLinecap="round" /></>
    ) : mood === 'celebrating' ? (
      <><path d="M38 54 q5 -6 10 0" stroke="#303630" strokeWidth="2.5" fill="none" strokeLinecap="round" /><path d="M58 54 q5 -6 10 0" stroke="#303630" strokeWidth="2.5" fill="none" strokeLinecap="round" /></>
    ) : mood === 'thinking' ? (
      <><circle cx="44" cy="50" r="3.2" fill="#303630" /><circle cx="64" cy="48" r="3.2" fill="#303630" /></>
    ) : (
      <><circle cx="43" cy="52" r={mood === 'curious' ? 4 : 3.4} fill="#303630" /><circle cx="63" cy="52" r={mood === 'curious' ? 4 : 3.4} fill="#303630" /><circle cx="44.5" cy="50.5" r="1.1" fill="#fff" /><circle cx="64.5" cy="50.5" r="1.1" fill="#fff" /></>
    );
  const mouth =
    mood === 'celebrating' ? <path d="M45 62 q8 9 16 0 z" fill="#C0675A" /> :
    mood === 'thinking' ? <path d="M48 64 h10" stroke="#303630" strokeWidth="2.5" strokeLinecap="round" /> :
    mood === 'curious' ? <circle cx="53" cy="64" r="3" fill="#303630" /> :
    mood === 'resting' ? <path d="M48 63 q5 3 10 0" stroke="#303630" strokeWidth="2.2" fill="none" strokeLinecap="round" /> :
    <path d="M46 62 q7 6 14 0" stroke="#303630" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  return <>{eyes}{mouth}</>;
}

export function BuddySvg({ mood, size = 96 }: { mood: BuddyMood; size?: number }) {
  return (
    <svg viewBox="0 0 106 110" width={size} height={size} aria-hidden className={mood === 'celebrating' ? 'motion-safe:animate-buddy-hop' : 'motion-safe:animate-buddy-float'}>
      {/* 頭上的兩片葉子 */}
      <path d="M53 20 C 40 4, 24 10, 30 22 C 38 26, 48 24, 53 20 z" fill="#A8BBA3" />
      <path d="M53 20 C 64 2, 82 8, 76 20 C 68 26, 58 24, 53 20 z" fill="#7E9C8C" />
      <path d="M53 20 v10" stroke="#36594B" strokeWidth="3" strokeLinecap="round" />
      {/* 圓滾滾的身體 */}
      <ellipse cx="53" cy="62" rx="36" ry="34" fill="#FAF8F4" stroke="#36594B" strokeWidth="3" />
      <ellipse cx="34" cy="64" rx="5" ry="3" fill="#E8CCB2" />
      <ellipse cx="72" cy="64" rx="5" ry="3" fill="#E8CCB2" />
      <Face mood={mood} />
      {mood === 'celebrating' && <><circle cx="14" cy="30" r="3" fill="#E8CCB2" /><circle cx="94" cy="26" r="3" fill="#A8BBA3" /><path d="M90 44 l6 -2" stroke="#D8C38E" strokeWidth="3" strokeLinecap="round" /></>}
      {mood === 'resting' && <text x="82" y="34" fontSize="12" fill="#7E9C8C">z</text>}
      {mood === 'thinking' && <text x="84" y="34" fontSize="16" fill="#7E9C8C">?</text>}
      {mood === 'encouraging' && <path d="M88 66 q8 -6 6 -14" stroke="#36594B" strokeWidth="3" fill="none" strokeLinecap="round" />}
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
