/**
 * 成長觀察者（掛在版型中，不顯示畫面）
 * 每次資料變動時重新計算「應解鎖的項目」，把新解鎖的徽章／植物／景觀寫入 unlocks 永久保存，
 * 並以 Toast 溫和地提示。已解鎖項目不會被移除（不因中斷或刪除紀錄而收回）。
 */
import { useEffect, useRef } from 'react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { computeUnlocks } from '../../lib/activity';
import { badges, gardenThemes, plantMap } from '../../content/play';

export function unlockName(key: string): string {
  const [type, id] = key.split(':');
  if (type === 'badge') return `收藏徽章「${badges.find((b) => b.id === id)?.title ?? id}」`;
  if (type === 'plant') return `${plantMap[id]?.kind === 'decor' ? '花園裝飾' : '新植物'}「${plantMap[id]?.name ?? id}」`;
  if (type === 'theme') return `花園景觀「${gardenThemes.find((t) => t.id === id)?.name ?? id}」`;
  return key;
}

export default function GrowthWatcher() {
  const { data, update } = useStore();
  const toast = useToast();
  const first = useRef(true);

  useEffect(() => {
    const should = computeUnlocks(data);
    const fresh = Object.keys(should).filter((k) => !data.unlocks[k]);
    if (!fresh.length) {
      first.current = false;
      return;
    }
    update((p) => ({ ...p, unlocks: { ...Object.fromEntries(fresh.map((k) => [k, should[k]])), ...p.unlocks } }));
    // 首次載入（例如既有使用者第一次看到這個功能）只給一則總結，避免一次跳出很多提示
    const meaningful = fresh.filter((k) => k !== 'plant:sprout' && k !== 'theme:spring');
    if (!meaningful.length) return;
    if (first.current && meaningful.length > 1) toast(`🌱 根據你過去的練習，已整理出 ${meaningful.length} 個收藏，到「成長收藏冊」看看吧`);
    else meaningful.slice(0, 2).forEach((k) => toast(`🌱 解鎖了${unlockName(k)}`));
    first.current = false;
  }, [data, update, toast]);

  return null;
}
