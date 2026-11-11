/**
 * 水彩插畫共用工具（小芽與心智花園植物共用）
 *
 * 用 SVG 濾鏡模擬水彩，不需要任何圖片檔：
 * - wash（顏料層）：雜訊位移讓輪廓不規則；侵蝕後相減取出外圈並加深，模擬顏料乾掉時堆在邊緣的線；
 *   再乘上高頻雜訊，做出水彩紙吸色的顆粒感。
 * - bloom（暈染）：位移＋高斯模糊，用在腮紅、陰影、光點等柔和色塊。
 * - ink（墨線）：極輕微的抖動與模糊，讓五官與莖像手繪線條。
 * 每張圖用 useWcId() 產生獨立的濾鏡 id，同一頁放多張圖也不會互相干擾。
 * scale 依 viewBox 大小調整效果強度（小芽 200 寬用 1；花園植物 48 寬用約 0.3）。
 */
import { useId } from 'react';

/** 產生可放進 url(#...) 的唯一 id（React 的 useId 含冒號，需移除） */
export const useWcId = (prefix: string) => `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

export function WatercolorDefs({ id, scale = 1 }: { id: string; scale?: number }) {
  const k = (n: number) => +(n * scale).toFixed(2);
  return (
    <defs>
      <filter id={`${id}-wash`} x="-25%" y="-25%" width="150%" height="150%">
        <feTurbulence type="fractalNoise" baseFrequency={+(0.028 / scale).toFixed(3)} numOctaves={3} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={k(7)} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feMorphology in="d" operator="erode" radius={k(1.8)} result="inner" />
        <feComposite in="d" in2="inner" operator="out" result="ring" />
        <feColorMatrix in="ring" type="matrix" values="0.66 0 0 0 0  0 0.66 0 0 0  0 0 0.66 0 0  0 0 0 0.7 0" result="ringDark" />
        <feGaussianBlur in="ringDark" stdDeviation={k(0.7)} result="ringSoft" />
        <feTurbulence type="fractalNoise" baseFrequency={+(0.85 / scale).toFixed(2)} numOctaves={2} seed={11} result="g" />
        <feColorMatrix in="g" type="saturate" values="0" result="gg" />
        <feComponentTransfer in="gg" result="grain">
          <feFuncR type="linear" slope="0.22" intercept="0.82" />
          <feFuncG type="linear" slope="0.22" intercept="0.82" />
          <feFuncB type="linear" slope="0.22" intercept="0.82" />
        </feComponentTransfer>
        <feBlend in="d" in2="grain" mode="multiply" result="tex" />
        <feComposite in="tex" in2="d" operator="in" result="texIn" />
        <feMerge><feMergeNode in="texIn" /><feMergeNode in="ringSoft" /></feMerge>
      </filter>
      <filter id={`${id}-bloom`} x="-40%" y="-40%" width="180%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency={+(0.05 / scale).toFixed(3)} numOctaves={2} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={k(10)} result="d" />
        <feGaussianBlur in="d" stdDeviation={k(3.2)} />
      </filter>
      <filter id={`${id}-ink`} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency={+(0.9 / scale).toFixed(2)} numOctaves={1} seed={2} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={k(1.2)} result="d" />
        <feGaussianBlur in="d" stdDeviation={k(0.25)} />
      </filter>
    </defs>
  );
}

/** 濾鏡引用的簡寫 */
export const wc = (id: string) => ({
  wash: `url(#${id}-wash)`,
  bloom: `url(#${id}-bloom)`,
  ink: `url(#${id}-ink)`,
});

/** 水彩調色盤（與品牌色協調） */
export const WC = {
  body: '#F6EBDD', bodyShade: '#E9CDB4', bodyRim: '#C9A88C',
  leafLight: '#B9CC9C', leafA: '#9DB596', leafB: '#6F9381', leafDeep: '#5E8577', stem: '#4E715F',
  cheek: '#EBA98F', ink: '#3B4A41', mouth: '#C46E5E', spark: '#E2C27A', peach: '#E8B99A',
  petal: '#D9A28F', petalDeep: '#C27F6E', sun: '#E6BC5A', sunDeep: '#C9963A', seed: '#7A5634',
  lavender: '#A68FC4', lavenderDeep: '#8770AE', stone: '#BDB6AA', stoneDeep: '#958E83',
  wood: '#B08968', woodDeep: '#8B6A4E', lantern: '#E8CCB2', glow: '#F7E3A1', wing: '#C3B4D6',
};
