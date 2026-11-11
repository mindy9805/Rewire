/**
 * 成長觀察者（掛在版型中，不顯示畫面）
 * 每次資料變動時重新計算「應解鎖的項目」，把新解鎖的徽章／植物／景觀寫入 unlocks 永久保存，
 * 並以 Toast 溫和地提示。已解鎖項目不會被移除（不因中斷或刪除紀錄而收回）。
 * 提示合併：短時間內（0.6 秒）陸續解鎖的項目只跳一則提示、只播一次飄葉，避免訊息疊在完成卡上。
 */
import { useEffect, useRef } from 'react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { computeUnlocks } from '../../lib/activity';
import { badges, gardenThemes, plantMap } from '../../content/play';
import { celebrate } from '../../lib/celebrate';

export function unlockName(key: string): string {
  const [type, id] = key.split(':');
  if (type === 'badge') return `收藏徽章「${badges.find((b) => b.id === id)?.title ?? id}」`;
  if (type === 'plant') return `${plantMap[id]?.kind === 'decor' ? '花園裝飾' : '新植物'}「${plantMap[id]?.name ?? id}」`;
  if (type === 'theme') return `花園景觀「${gardenThemes.find((t) => t.id === id)?.name ?? id}」`;
  return key;
}

/** 把多個解鎖項目合併成一句話（1 個：直接說；2 個：A 和 B；3 個以上：N 個新收藏，列出前兩個） */
export function unlockSummary(keys: string[]): string {
  const names = keys.map(unlockName);
  if (names.length === 1) return `🌱 解鎖了${names[0]}`;
  if (names.length === 2) return `🌱 解鎖了${names[0]}和${names[1]}`;
  return `🌱 解鎖了 ${names.length} 個新收藏：${names.slice(0, 2).join('、')}等，到「成長收藏冊」看看吧`;
}

/** 合併提示的等待時間（毫秒） */
const BATCH_MS = 600;

export default function GrowthWatcher() {
  const { data, update } = useStore();
  const toast = useToast();
  const first = useRef(true);
  const pending = useRef<string[]>([]);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

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
    if (first.current && meaningful.length > 1) {
      toast(`🌱 根據你過去的練習，已整理出 ${meaningful.length} 個收藏，到「成長收藏冊」看看吧`);
      first.current = false;
      return;
    }
    const isFirstLoad = first.current;
    first.current = false;
    // 先收集，稍等一下再一次提示（同一個動作常會連續解鎖徽章與植物）
    pending.current.push(...meaningful);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const keys = [...new Set(pending.current)];
      pending.current = [];
      if (!keys.length) return;
      toast(unlockSummary(keys));
      // 解鎖是值得小小慶祝的時刻（首次載入的整理不播放，避免一打開就有動畫）
      if (!isFirstLoad) celebrate();
    }, BATCH_MS);
  }, [data, update, toast]);

  return null;
}
