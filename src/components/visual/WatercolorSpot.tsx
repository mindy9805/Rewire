/**
 * 水彩小插畫：每個主題一張、與內容直接相關（不是裝飾圖）。共用 play/watercolor.tsx 的水彩濾鏡與調色盤。
 * 新增主題：在 SPOTS 加一個 kind，畫面以 200×150 為基準，並寫好 alt（插畫在表達什麼）。
 */
import type { ReactNode } from 'react';
import { WatercolorDefs, WC, useWcId, wc } from '../play/watercolor';

type Painter = (f: ReturnType<typeof wc>) => ReactNode;
const SPOTS: Record<string, { alt: string; paint: Painter }> = {
  // 過度尋求認可：兩個對話框，一個裝著愛心、一個裝著問號（在意別人的回應）
  approval: {
    alt: '兩個對話框，一個裝著愛心，一個裝著問號，象徵很在意別人的回應',
    paint: (f) => <>
      <ellipse cx="100" cy="138" rx="70" ry="7" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <g filter={f.wash}>
        <path d="M28 30 h86 a16 16 0 0 1 16 16 v34 a16 16 0 0 1 -16 16 h-50 l-20 18 v-18 h-16 a16 16 0 0 1 -16 -16 v-34 a16 16 0 0 1 16 -16z" fill={WC.lantern} opacity={0.92} />
        <path d="M100 58 h70 a14 14 0 0 1 14 14 v28 a14 14 0 0 1 -14 14 h-8 v16 l-18 -16 h-44 a14 14 0 0 1 -14 -14 v-28 a14 14 0 0 1 14 -14z" fill={WC.leafA} opacity={0.88} />
      </g>
      <path d="M60 70 c-8-10-22-2-14 9 l14 12 l14-12 c8-11-6-19-14-9z" fill={WC.mouth} opacity={0.85} filter={f.wash} />
      <text x="135" y="100" fontSize="30" fontFamily="Georgia, serif" fill={WC.ink} filter={f.ink}>?</text>
      <g filter={f.ink} opacity={0.55}><circle cx="20" cy="22" r="2.4" fill={WC.leafA} /><circle cx="186" cy="48" r="2" fill={WC.peach} /></g>
    </>,
  },
  // 通用：一片新葉（找不到對應主題時使用）
  leaf: {
    alt: '一片新長出來的葉子',
    paint: (f) => <>
      <ellipse cx="100" cy="138" rx="50" ry="6" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <path d="M100 136 C 98 110, 102 90, 100 70" stroke={WC.stem} strokeWidth={4} strokeLinecap="round" fill="none" filter={f.ink} />
      <g filter={f.wash}><path d="M100 76 C 70 30, 30 46, 44 74 C 60 92, 88 90, 100 76 z" fill={WC.leafLight} /><path d="M100 76 C 128 26, 172 40, 158 70 C 142 90, 112 90, 100 76 z" fill={WC.leafB} /></g>
    </>,
  },
};

export const hasSpot = (kind: string) => kind in SPOTS;

export default function WatercolorSpot({ kind, className = '' }: { kind: string; className?: string }) {
  const id = useWcId('sp');
  const spot = SPOTS[kind] ?? SPOTS.leaf;
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label={`插畫：${spot.alt}`} className={`h-auto w-full ${className}`}>
      <WatercolorDefs id={id} />
      {spot.paint(wc(id))}
    </svg>
  );
}
