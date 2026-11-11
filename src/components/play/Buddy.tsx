/**
 * Rewire Buddy｜成長夥伴「小芽」（原創 SVG 角色）
 * 六種表情：歡迎、好奇、思考、慶祝、休息、鼓勵。
 * 只說歡迎、陪伴與慶祝的話；不催促、不責備。可在設定中隱藏；減少動畫偏好時不跳動。
 */
import { useMemo } from 'react';
import { buddyLines, BUDDY_NAME, type BuddyMood } from '../../content/play';

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

/** 夥伴與對話框；message 未提供時依心情隨機選一句 */
export default function Buddy({ mood, message, size = 88 }: { mood: BuddyMood; message?: string; size?: number }) {
  const line = useMemo(() => message ?? buddyLines[mood][Math.floor(Math.random() * buddyLines[mood].length)], [mood, message]);
  return (
    <div className="flex items-end gap-3">
      <BuddySvg mood={mood} size={size} />
      <div className="relative mb-4 max-w-xs rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-2.5 text-sm leading-relaxed shadow-card" role="status" aria-live="polite">
        <span className="sr-only">{BUDDY_NAME}說：</span>{line}
      </div>
    </div>
  );
}
