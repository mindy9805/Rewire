/**
 * 心智花園的植物與裝飾（水彩風 SVG，與小芽同一套水彩濾鏡，見 watercolor.tsx）
 * 每種植物：墨線莖＋水彩色塊（邊緣積色、紙紋）＋暈染的地面陰影。
 * grow：剛種下時從底部長出來（減少動畫時不播放）。
 */
import type { ReactNode } from 'react';
import { WatercolorDefs, WC, useWcId, wc } from './watercolor';

export default function PlantSvg({ kind, size = 48, grow = false }: { kind: string; size?: number; grow?: boolean }) {
  const id = useWcId('pl');
  const f = wc(id);
  const stem = (d = 'M24 44 C 23.5 38, 24.5 32, 24 25', w = 1.8) => <path d={d} stroke={WC.stem} strokeWidth={w} strokeLinecap="round" fill="none" filter={f.ink} />;
  /** 水彩葉片：rotate 角度、顏色 */
  const leaf = (x: number, y: number, rot: number, color: string = WC.leafA, rx = 6, ry = 3) => (
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={color} opacity={0.9} transform={`rotate(${rot} ${x} ${y})`} />
  );
  const shadow = <ellipse cx="24" cy="45" rx="12" ry="2.2" fill={WC.leafB} opacity={0.25} filter={f.bloom} />;
  const wash = (children: ReactNode) => <g filter={f.wash}>{children}</g>;

  const shapes: Record<string, ReactNode> = {
    sprout: <>{shadow}{stem('M24 44 C 23.5 38, 24.5 33, 24 28')}{wash(<>{leaf(18.5, 27, -28, WC.leafLight)}{leaf(29.5, 25.5, 28, WC.leafB)}</>)}</>,
    // 幸運草：三片圓潤小葉圍著中心，每片有一條淺色葉脈
    clover: <>{shadow}{stem('M24 44 C 23.5 38, 24.5 31, 24 24')}{wash([-90, 30, 150].map((deg, k) => {
      const a = (deg * Math.PI) / 180;
      return <circle key={deg} cx={+(24 + 5.2 * Math.cos(a)).toFixed(1)} cy={+(21 + 5.2 * Math.sin(a)).toFixed(1)} r={4.6} fill={[WC.leafA, WC.leafB, WC.leafLight][k]} />;
    }))}<g filter={f.ink} stroke="#EEF3E6" strokeWidth={0.7} strokeLinecap="round" opacity={0.8}>{[-90, 30, 150].map((deg) => { const a = (deg * Math.PI) / 180; return <path key={deg} d={`M24 21 l${(4.6 * Math.cos(a)).toFixed(1)} ${(4.6 * Math.sin(a)).toFixed(1)}`} />; })}</g></>,
    tulip: <>{shadow}{stem('M24 44 C 23.5 36, 24.5 28, 24 21')}{wash(<>{leaf(19, 36, -50, WC.leafA, 7, 2.6)}{leaf(29, 33, 45, WC.leafB, 6, 2.4)}<path d="M17 13 q2 9 7 10 q5 -1 7 -10 l-3.5 3 l-3.5 -5 l-3.5 5 z" fill={WC.petal} /><path d="M21 14 l3 -4 l3 4 q-3 7 -3 9 q0 -2 -3 -9z" fill={WC.petalDeep} opacity={0.55} /></>)}</>,
    // 蕨類：三支微彎的葉軸，兩側成對的小葉，越往上越小
    fern: <>{shadow}{[-9, 0, 9].map((a) => <path key={a} d={`M24 44 q${a * 0.6} -14 ${a} -30`} stroke={WC.stem} strokeWidth={1.2} fill="none" filter={f.ink} />)}{wash([-9, 0, 9].flatMap((a) => [0.25, 0.42, 0.59, 0.76, 0.9].flatMap((t) => {
      const x = 24 + a * t * t; const y = 44 - 30 * t; const len = 4.2 - t * 2.6;
      return [-1, 1].map((side) => <ellipse key={`${a}${t}${side}`} cx={x + side * len * 0.75} cy={y - 0.6} rx={len} ry={1.15} fill={t > 0.55 ? WC.leafLight : a === 0 ? WC.leafB : WC.leafA} transform={`rotate(${side * -25 + a * 1.5} ${x + side * len * 0.75} ${y - 0.6})`} />);
    })))}</>,
    stone: <>{shadow}{wash(<><path d="M10 40 C 9 31, 18 27, 25 28 C 34 28, 40 33, 38 40 C 36 44, 14 45, 10 40 z" fill={WC.stone} /><path d="M15 33 C 19 30, 25 30, 28 31" stroke="#FFFFFF" strokeWidth={2} opacity={0.5} fill="none" /></>)}<path d="M28 38 c 3 -1 5 -3 6 -5" stroke={WC.stoneDeep} strokeWidth={1} fill="none" filter={f.ink} opacity={0.6} /></>,
    sunflower: <>{shadow}{stem('M24 44 C 23.5 36, 24.5 28, 24 22', 2)}{wash(<>{leaf(18, 36, -40, WC.leafA, 7, 3)}{leaf(30, 33, 35, WC.leafB, 6, 2.6)}{Array.from({ length: 12 }).map((_, i) => <ellipse key={i} cx="24" cy="9.5" rx="2.6" ry="5.6" fill={i % 2 ? WC.sun : WC.sunDeep} transform={`rotate(${i * 30} 24 17)`} />)}</>)}<circle cx="24" cy="17" r="4.6" fill={WC.seed} filter={f.wash} /><g filter={f.ink} fill="#5A3E24" opacity={0.6}><circle cx="23" cy="16" r="0.6" /><circle cx="25.4" cy="17.6" r="0.6" /><circle cx="23.6" cy="18.8" r="0.6" /></g></>,
    lavender: <>{shadow}{[18, 24, 30].map((x, k) => <g key={x}><path d={`M${x} 44 C ${x - 0.5} 34, ${x + 0.5} 24, ${x} ${15 + k % 2 * 2}`} stroke={WC.stem} strokeWidth={1.2} fill="none" filter={f.ink} />{wash([15, 18.5, 22, 25.5].map((y, i) => <ellipse key={y} cx={x + (i % 2 ? 0.8 : -0.8)} cy={y + (k % 2) * 2} rx={1.9} ry={2.4} fill={i % 2 ? WC.lavender : WC.lavenderDeep} />))}</g>)}</>,
    lantern: <><ellipse cx="24" cy="22" rx="11" ry="12" fill={WC.glow} opacity={0.45} filter={f.bloom} />{stem('M24 6 v6', 1.6)}{wash(<><rect x="16" y="12" width="16" height="20" rx="6" fill={WC.lantern} /><rect x="18" y="12" width="12" height="3" rx="1.5" fill={WC.woodDeep} opacity={0.7} /></>)}<circle cx="24" cy="22" r="4" fill={WC.glow} filter={f.bloom} />{stem('M24 32 V44', 1.6)}{shadow}</>,
    mushroom: <>{shadow}{wash(<><path d="M20 28 h8 l1 14 q-5 2 -10 0 z" fill="#FAF4EA" /><path d="M9 30 C 9 16, 39 16, 39 30 C 32 32, 16 32, 9 30 z" fill={WC.petal} /><path d="M12 27 C 14 21, 22 18, 28 19" stroke="#F3D3C6" strokeWidth={2} fill="none" opacity={0.7} /></>)}<g filter={f.ink} fill="#FFF8EF"><ellipse cx="18" cy="24" rx="2.2" ry="1.6" /><ellipse cx="28" cy="22" rx="1.8" ry="1.3" /><ellipse cx="33" cy="27" rx="1.4" ry="1" /></g></>,
    tree: <>{shadow}{wash(<><path d="M22 44 C 22.5 36, 22 30, 21.5 25 L 26.5 25 C 26 30, 25.5 36, 26 44 z" fill={WC.wood} /><circle cx="24" cy="18" r="12" fill={WC.leafB} /><circle cx="16.5" cy="21.5" r="7" fill={WC.leafA} /><circle cx="31" cy="20" r="6.5" fill={WC.leafA} /><circle cx="23" cy="11" r="6" fill={WC.leafLight} /></>)}<path d="M24 30 c -2 -3 -4 -4 -6 -4" stroke={WC.woodDeep} strokeWidth={1} fill="none" filter={f.ink} /></>,
    bench: <>{shadow}{wash(<><rect x="6" y="17" width="36" height="4.5" rx="2" fill={WC.lantern} /><rect x="6" y="25.5" width="36" height="5" rx="2" fill={WC.wood} /></>)}<path d="M10 30.5 v12 M38 30.5 v12 M10 21.5 v4 M38 21.5 v4" stroke={WC.woodDeep} strokeWidth={2.4} strokeLinecap="round" filter={f.ink} /></>,
    butterfly: <><ellipse cx="24" cy="44" rx="8" ry="1.6" fill={WC.leafB} opacity={0.18} filter={f.bloom} />{wash(<><path d="M23 20 C 14 6, 4 12, 9 21 C 12 26, 19 25, 23 22 z" fill={WC.wing} /><path d="M25 20 C 34 6, 44 12, 39 21 C 36 26, 29 25, 25 22 z" fill={WC.lantern} /><path d="M23 23 C 15 26, 13 34, 19 33 C 22 32, 23 28, 23 24 z" fill={WC.lavender} opacity={0.75} /><path d="M25 23 C 33 26, 35 34, 29 33 C 26 32, 25 28, 25 24 z" fill={WC.peach} opacity={0.8} /></>)}<path d="M24 14 v18" stroke={WC.ink} strokeWidth={1.6} strokeLinecap="round" filter={f.ink} /><path d="M24 14 q-2 -4 -4 -5 M24 14 q2 -4 4 -5" stroke={WC.ink} strokeWidth={0.8} fill="none" filter={f.ink} /></>,
  };
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden className={grow ? 'origin-bottom motion-safe:animate-grow' : ''}>
      <WatercolorDefs id={id} scale={0.3} />
      {shapes[kind] ?? shapes.sprout}
    </svg>
  );
}
