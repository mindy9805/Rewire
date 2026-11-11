/**
 * 飄葉小慶祝：收到 celebrate() 事件時，從畫面上方飄下十幾片葉子，約 2.5 秒後自動消失。
 * - 純裝飾：aria-hidden、pointer-events-none，不擋住任何操作。
 * - 減少動畫時完全不顯示。
 */
import { useEffect, useState } from 'react';
import { CELEBRATE_EVENT } from '../../lib/celebrate';
import { prefersReducedMotion } from '../../lib/motion';

const LEAVES = ['🍃', '🌱', '🌿', '✨', '🍂'];
type Leaf = { id: number; left: number; delay: number; duration: number; char: string; size: number };

export default function LeafBurst() {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  useEffect(() => {
    let timer: number | undefined;
    const onCelebrate = () => {
      if (prefersReducedMotion()) return;
      const seed = Date.now();
      setLeaves(Array.from({ length: 14 }, (_, i) => ({
        id: seed + i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 0.9,
        char: LEAVES[i % LEAVES.length],
        size: 18 + Math.random() * 12,
      })));
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setLeaves([]), 2800);
    };
    window.addEventListener(CELEBRATE_EVENT, onCelebrate);
    return () => { window.removeEventListener(CELEBRATE_EVENT, onCelebrate); window.clearTimeout(timer); };
  }, []);
  if (!leaves.length) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" data-testid="leaf-burst">
      {leaves.map((l) => (
        <span key={l.id} className="absolute top-0 animate-leaf-fall" style={{ left: `${l.left}%`, fontSize: l.size, animationDelay: `${l.delay}s`, animationDuration: `${l.duration}s` }}>{l.char}</span>
      ))}
    </div>
  );
}
