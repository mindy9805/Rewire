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
  // 過度依賴便利與舒適：一張軟綿綿的沙發，旁邊放著一本闔上的書
  convenience: {
    alt: '一張軟綿綿的沙發，旁邊一本闔上的書，象徵舒適區',
    paint: (f) => <>
      <ellipse cx="100" cy="136" rx="78" ry="7" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <g filter={f.wash}>
        <rect x="34" y="48" width="132" height="52" rx="18" fill={WC.leafA} />
        <rect x="24" y="80" width="152" height="40" rx="14" fill={WC.leafB} opacity={0.92} />
        <rect x="18" y="70" width="24" height="52" rx="10" fill={WC.leafA} />
        <rect x="158" y="70" width="24" height="52" rx="10" fill={WC.leafA} />
        <rect x="58" y="74" width="40" height="16" rx="8" fill={WC.lantern} opacity={0.9} />
      </g>
      <path d="M30 124 v10 M170 124 v10" stroke={WC.woodDeep} strokeWidth={4} strokeLinecap="round" filter={f.ink} />
      <g filter={f.wash}><rect x="126" y="62" width="26" height="8" rx="2" fill={WC.petal} transform="rotate(-8 139 66)" /></g>
    </>,
  },
  // 為了他人印象而過度消費：一個購物袋，袋口冒出閃亮的小星光
  impress: {
    alt: '一個購物袋，袋口冒出閃亮的小星光，象徵想被看見的消費',
    paint: (f) => <>
      <ellipse cx="100" cy="136" rx="58" ry="7" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <path d="M78 52 C 78 28, 122 28, 122 52" stroke={WC.woodDeep} strokeWidth={5} fill="none" strokeLinecap="round" filter={f.ink} />
      <g filter={f.wash}><path d="M58 50 h84 l10 82 h-104 z" fill={WC.petal} /><path d="M58 50 h84 l3 22 h-90 z" fill={WC.petalDeep} opacity={0.4} /></g>
      <g filter={f.ink} stroke={WC.spark} strokeWidth={4} strokeLinecap="round"><path d="M100 16 v14 M93 23 h14" /><path d="M146 30 v10 M141 35 h10" /><path d="M56 26 v8 M52 30 h8" /></g>
      <circle cx="100" cy="96" r="10" fill={WC.lantern} opacity={0.9} filter={f.bloom} />
    </>,
  },
  // 缺少與自己獨處的時間：一杯冒著熱氣的茶，安靜的片刻
  solitude: {
    alt: '一杯冒著熱氣的茶，象徵留給自己的安靜片刻',
    paint: (f) => <>
      <ellipse cx="100" cy="136" rx="60" ry="7" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <g filter={f.ink} stroke={WC.leafB} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7}><path d="M86 52 c-8 -10 8 -16 0 -28" /><path d="M104 50 c-8 -10 8 -16 0 -28" /></g>
      <g filter={f.wash}>
        <path d="M60 62 h80 v38 a40 26 0 0 1 -80 0 z" fill={WC.lantern} />
        <path d="M140 72 c22 0 22 28 0 28" stroke={WC.lantern} strokeWidth={9} fill="none" />
        <ellipse cx="100" cy="128" rx="58" ry="8" fill={WC.leafA} opacity={0.85} />
      </g>
      <ellipse cx="100" cy="64" rx="38" ry="6" fill={WC.seed} opacity={0.35} filter={f.bloom} />
    </>,
  },
  // 反覆違背對自己的承諾：小盆栽冒出新芽，盆上一個小勾勾（小承諾慢慢長大）
  promises: {
    alt: '一個小盆栽冒出新芽，盆上有一個小勾勾，象徵小小的承諾慢慢長大',
    paint: (f) => <>
      <ellipse cx="100" cy="136" rx="52" ry="7" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <path d="M100 92 C 99 76, 101 64, 100 50" stroke={WC.stem} strokeWidth={4} strokeLinecap="round" fill="none" filter={f.ink} />
      <g filter={f.wash}>
        <path d="M100 58 C 84 34, 58 40, 64 58 C 72 68, 90 66, 100 58 z" fill={WC.leafLight} />
        <path d="M100 58 C 116 32, 144 38, 136 56 C 128 68, 110 66, 100 58 z" fill={WC.leafB} />
        <path d="M66 90 h68 l-8 44 h-52 z" fill={WC.petal} />
        <rect x="62" y="84" width="76" height="12" rx="5" fill={WC.petalDeep} opacity={0.75} />
      </g>
      <path d="M88 112 l8 8 l16 -16" stroke="#FFF8EF" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" filter={f.ink} />
    </>,
  },
  // 長期處於不利於成長的環境：一株植物在陰影裡，努力朝向一旁的陽光
  environment: {
    alt: '一株植物從陰影中朝向一旁的陽光生長，象徵環境對成長的影響',
    paint: (f) => <>
      <circle cx="160" cy="34" r="22" fill={WC.glow} opacity={0.9} filter={f.bloom} />
      <ellipse cx="64" cy="96" rx="58" ry="46" fill={WC.stoneDeep} opacity={0.18} filter={f.bloom} />
      <ellipse cx="96" cy="136" rx="56" ry="7" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <path d="M86 112 C 86 92, 98 74, 122 60" stroke={WC.stem} strokeWidth={4} strokeLinecap="round" fill="none" filter={f.ink} />
      <g filter={f.wash}>
        <path d="M122 60 C 112 40, 136 32, 146 44 C 144 56, 132 62, 122 60 z" fill={WC.leafB} />
        <path d="M100 76 C 80 70, 76 52, 92 50 C 102 56, 104 68, 100 76 z" fill={WC.leafLight} />
        <path d="M62 110 h50 l-6 26 h-38 z" fill={WC.stone} />
      </g>
      <g filter={f.ink} stroke={WC.spark} strokeWidth={2.5} strokeLinecap="round" opacity={0.8}><path d="M134 50 l-10 6" /><path d="M140 62 l-12 2" /></g>
    </>,
  },
  // 長期偏向立即滿足：一個沙漏，上方的沙還很多（時間與選擇）
  shortterm: {
    alt: '一個沙漏，上方的沙還很多，象徵現在的選擇與長遠的時間',
    paint: (f) => <>
      <ellipse cx="100" cy="138" rx="46" ry="6" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <g filter={f.wash}>
        <rect x="62" y="16" width="76" height="10" rx="4" fill={WC.wood} />
        <rect x="62" y="122" width="76" height="10" rx="4" fill={WC.wood} />
        <path d="M70 26 h60 c0 30 -24 38 -26 48 c2 10 26 18 26 48 h-60 c0 -30 24 -38 26 -48 c-2 -10 -26 -18 -26 -48z" fill="#EEF3E6" opacity={0.85} />
        <path d="M76 32 h48 c-2 18 -16 26 -24 34 c-8 -8 -22 -16 -24 -34z" fill={WC.sun} />
        <path d="M86 120 h28 c-2 -8 -8 -12 -14 -14 c-6 2 -12 6 -14 14z" fill={WC.sunDeep} />
      </g>
      <path d="M100 70 v36" stroke={WC.sunDeep} strokeWidth={2} strokeDasharray="2 4" filter={f.ink} />
    </>,
  },
  /* ───── 每日七句（aff1–aff7）：每句一張與句意相關的小插畫 ───── */
  // 01 我現在是安全的：亮著燈的小屋
  aff1: {
    alt: '一間亮著暖光的小屋，象徵安全與安穩',
    paint: (f) => <>
      <ellipse cx="100" cy="136" rx="62" ry="7" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <g filter={f.wash}>
        <path d="M52 70 L100 30 L148 70 z" fill={WC.petal} />
        <rect x="60" y="66" width="80" height="64" rx="4" fill={WC.lantern} />
        <rect x="90" y="96" width="20" height="34" rx="3" fill={WC.wood} />
      </g>
      <rect x="70" y="80" width="14" height="14" rx="2" fill={WC.glow} filter={f.bloom} />
      <rect x="116" y="80" width="14" height="14" rx="2" fill={WC.glow} filter={f.bloom} />
      <g filter={f.wash}><ellipse cx="44" cy="124" rx="16" ry="10" fill={WC.leafA} /><ellipse cx="160" cy="126" rx="14" ry="8" fill={WC.leafLight} /></g>
    </>,
  },
  // 02 我的大腦可以改變：舊路旁長出一條新的小徑
  aff2: {
    alt: '一條彎彎的小路旁，長出另一條新的小徑，象徵大腦可以形成新的路徑',
    paint: (f) => <>
      <g filter={f.wash}><ellipse cx="100" cy="100" rx="88" ry="40" fill={WC.leafLight} opacity={0.6} /></g>
      <path d="M14 128 C 60 110, 70 80, 120 72 S 180 50, 190 36" stroke={WC.stone} strokeWidth={14} fill="none" strokeLinecap="round" filter={f.wash} />
      <path d="M86 92 C 100 104, 130 108, 170 104" stroke={WC.sun} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="2 10" filter={f.ink} />
      <g filter={f.wash}><path d="M172 104 c-2 -12 10 -16 14 -8 c-4 6 -8 8 -14 8z" fill={WC.leafB} /></g>
    </>,
  },
  // 03 我已經足夠好了：一顆完整、圓潤的心
  aff3: {
    alt: '一顆完整、圓潤的心，象徵本來就足夠',
    paint: (f) => <>
      <ellipse cx="100" cy="136" rx="50" ry="6" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <path d="M100 126 C 40 90, 44 36, 78 34 C 92 34, 100 46, 100 54 C 100 46, 108 34, 122 34 C 156 36, 160 90, 100 126 z" fill={WC.petal} filter={f.wash} />
      <ellipse cx="80" cy="56" rx="12" ry="7" fill="#FFF8EF" opacity={0.6} filter={f.bloom} />
    </>,
  },
  // 04 犯錯是我成長的方式：從石頭裂縫中長出的嫩芽
  aff4: {
    alt: '一株嫩芽從石頭的裂縫中長出來，象徵從錯誤中成長',
    paint: (f) => <>
      <ellipse cx="100" cy="136" rx="66" ry="7" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <g filter={f.wash}><path d="M34 132 C 30 104, 60 88, 96 90 C 140 88, 172 104, 168 132 z" fill={WC.stone} /></g>
      <path d="M100 92 l-6 14 l8 8 l-4 16" stroke={WC.stoneDeep} strokeWidth={2.5} fill="none" filter={f.ink} />
      <path d="M100 94 C 99 80, 101 68, 100 56" stroke={WC.stem} strokeWidth={4} strokeLinecap="round" fill="none" filter={f.ink} />
      <g filter={f.wash}><path d="M100 62 C 86 42, 64 48, 70 62 C 78 70, 92 68, 100 62 z" fill={WC.leafLight} /><path d="M100 62 C 114 40, 138 46, 130 60 C 122 70, 108 68, 100 62 z" fill={WC.leafB} /></g>
    </>,
  },
  // 05 我的想法不等於事實：一朵思緒的雲，飄在穩穩的石頭上方
  aff5: {
    alt: '一朵思緒的雲飄在空中，下方是一塊穩穩的石頭，象徵想法和事實是兩回事',
    paint: (f) => <>
      <g filter={f.wash}><path d="M52 64 c-16 0 -18 -24 0 -24 c2 -16 26 -18 32 -6 c8 -14 34 -10 34 6 c18 -2 22 24 2 24 z" fill="#C9D7E4" /></g>
      <g filter={f.ink} fill={WC.ink} opacity={0.5}><circle cx="84" cy="74" r="3" /><circle cx="92" cy="84" r="2" /></g>
      <ellipse cx="110" cy="136" rx="56" ry="6" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
      <g filter={f.wash}><path d="M70 132 C 68 112, 90 100, 112 102 C 136 102, 152 114, 150 132 z" fill={WC.stone} /></g>
    </>,
  },
  // 06 我的存在很重要：一盞亮著的燈籠
  aff6: {
    alt: '一盞亮著的燈籠，象徵每個人的存在都有光',
    paint: (f) => <>
      <circle cx="100" cy="78" r="46" fill={WC.glow} opacity={0.55} filter={f.bloom} />
      <path d="M100 12 v16" stroke={WC.woodDeep} strokeWidth={4} strokeLinecap="round" filter={f.ink} />
      <g filter={f.wash}><rect x="72" y="28" width="56" height="74" rx="22" fill={WC.lantern} /><rect x="80" y="28" width="40" height="8" rx="4" fill={WC.woodDeep} opacity={0.8} /><rect x="80" y="96" width="40" height="8" rx="4" fill={WC.woodDeep} opacity={0.8} /></g>
      <ellipse cx="100" cy="66" rx="12" ry="16" fill={WC.glow} filter={f.bloom} />
      <ellipse cx="100" cy="136" rx="40" ry="6" fill={WC.leafB} opacity={0.2} filter={f.bloom} />
    </>,
  },
  // 07 今天是新的機會：山丘後升起的太陽
  aff7: {
    alt: '太陽從山丘後升起，象徵新的一天、新的機會',
    paint: (f) => <>
      <circle cx="100" cy="92" r="34" fill={WC.sun} filter={f.wash} />
      <g filter={f.ink} stroke={WC.sun} strokeWidth={4} strokeLinecap="round" opacity={0.8}><path d="M100 36 v12" /><path d="M54 60 l9 8" /><path d="M146 60 l-9 8" /><path d="M36 96 h12" /><path d="M152 96 h12" /></g>
      <g filter={f.wash}><path d="M0 150 C 30 104, 80 104, 110 126 C 140 108, 180 110, 200 128 V150 z" fill={WC.leafA} /><path d="M0 150 C 50 128, 120 124, 200 140 V150 z" fill={WC.leafB} opacity={0.9} /></g>
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
/** 所有插畫主題（預覽頁用） */
export const SPOT_KINDS = () => Object.keys(SPOTS);

export default function WatercolorSpot({ kind, className = '' }: { kind: string; className?: string }) {
  const id = useWcId('sp');
  const spot = SPOTS[kind] ?? SPOTS.leaf;
  return (
    <svg data-visual="spot" viewBox="0 0 200 150" role="img" aria-label={`插畫：${spot.alt}`} className={`h-auto w-full ${className}`}>
      <WatercolorDefs id={id} />
      {spot.paint(wc(id))}
    </svg>
  );
}
