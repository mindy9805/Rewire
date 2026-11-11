/**
 * Mind Garden｜心智花園
 * - 6 × 4 格的花園：選一株已解鎖的植物，點格子擺放；再點已擺放的植物可移除。手機觸控與鍵盤皆可操作。
 * - 景觀主題依成長點解鎖，可自由切換。
 * - 植物永遠不會枯萎，也不會因中斷而被收回。
 * ⚠️ 花園是「累積經驗的視覺化」，不代表實際神經迴路的成長。
 */
import { useState } from 'react';
import { gardenThemes, plants, plantMap } from '../../content/play';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { collectActivity, growthPoints } from '../../lib/activity';
import { GARDEN_CELLS } from '../../store/storage';
import { nowIso, uid } from '../../lib/id';
import PlantSvg from './PlantSvg';

export function GardenView({ compact = false }: { compact?: boolean }) {
  const { data } = useStore();
  const theme = gardenThemes.find((t) => t.id === data.garden.theme) ?? gardenThemes[0];
  const byCell = new Map(data.garden.plants.map((p) => [p.cell, p]));
  if (!data.garden.plants.length) {
    // 空花園：顯示一株小嫩芽與邀請，而不是一大片空白
    return (
      <div className="flex flex-col items-center justify-end rounded-2xl pb-3 pt-6 text-center" style={{ background: `linear-gradient(${theme.sky} 0 45%, ${theme.ground} 45%)` }}>
        <PlantSvg kind="sprout" size={compact ? 56 : 72} grow />
        <p className="mt-1 text-xs text-[#36594B]">花園還空空的，點進來種下第一株小嫩芽吧</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: `linear-gradient(${theme.sky} 0 35%, ${theme.ground} 35%)` }} role="img" aria-label={`心智花園（${theme.name}），共有 ${data.garden.plants.length} 株植物與裝飾`}>
      {theme.id === 'night' && <div className="flex justify-around pt-2 text-[10px] text-[#F7E3A1]" aria-hidden>{'✦ · ✧ · ✦ · ✧'}</div>}
      <div className={`grid grid-cols-6 ${compact ? 'gap-0 p-2 pt-8' : 'gap-1 p-3 pt-12'}`}>
        {Array.from({ length: GARDEN_CELLS }).map((_, i) => {
          const p = byCell.get(i);
          return <div key={i} className="flex aspect-square items-end justify-center">{p && <PlantSvg kind={p.kind} size={compact ? 30 : 48} grow />}</div>;
        })}
      </div>
    </div>
  );
}

export default function MindGarden() {
  const { data, update } = useStore();
  const toast = useToast();
  const pts = growthPoints(collectActivity(data));
  const unlocked = plants.filter((p) => data.unlocks[`plant:${p.id}`] || p.points === 0);
  const [selected, setSelected] = useState(unlocked[unlocked.length - 1]?.id ?? 'sprout');
  const theme = gardenThemes.find((t) => t.id === data.garden.theme) ?? gardenThemes[0];
  const next = plants.find((p) => !data.unlocks[`plant:${p.id}`] && p.points > 0);
  const byCell = new Map(data.garden.plants.map((p) => [p.cell, p]));

  const tap = (cell: number) => {
    const existing = byCell.get(cell);
    if (existing) {
      update((d) => ({ ...d, garden: { ...d.garden, plants: d.garden.plants.filter((p) => p.cell !== cell) } }));
      toast(`把「${plantMap[existing.kind]?.name}」收回種子袋了（隨時可以再種）`, 'info');
    } else {
      update((d) => ({ ...d, garden: { ...d.garden, plants: [...d.garden.plants, { id: uid(), kind: selected, cell, placedAt: nowIso() }] } }));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-soft px-3 py-1">🌱 成長點：<strong>{pts}</strong></span>
        {next ? <span className="text-muted">再累積 {next.points - pts} 點，可以解鎖「{next.name}」</span> : <span className="text-muted">所有植物都解鎖了，謝謝你一路的累積。</span>}
      </div>
      <p className="text-xs text-muted">成長點＝你在網站中實際保存的每一筆練習或紀錄（同一筆編輯不重複計算）。花園是你累積經驗的小小紀念，不代表大腦或心理健康的分數；植物也永遠不會枯萎。</p>

      <div className="overflow-hidden rounded-3xl border border-line" style={{ background: `linear-gradient(${theme.sky} 0 30%, ${theme.ground} 30%)` }}>
        {theme.id === 'night' && <div className="flex justify-around pt-3 text-xs text-[#F7E3A1]" aria-hidden>{'✦ · ✧ · ✦ · ✧ · ✦'}</div>}
        <div className="grid grid-cols-6 gap-1 p-3 pt-14 sm:gap-2 sm:p-5 sm:pt-20" role="grid" aria-label="花園格子：點空格種下選擇的植物，點植物收回">
          {Array.from({ length: GARDEN_CELLS }).map((_, i) => {
            const p = byCell.get(i);
            return (
              <button key={i} role="gridcell" onClick={() => tap(i)} aria-label={p ? `第 ${i + 1} 格：${plantMap[p.kind]?.name}（點擊收回）` : `第 ${i + 1} 格：空地（點擊種下${plantMap[selected]?.name}）`}
                className="flex aspect-square items-end justify-center rounded-xl border border-dashed border-black/10 transition hover:bg-white/30 focus-visible:bg-white/40">
                {p && <PlantSvg key={p.id} kind={p.kind} size={52} grow />}
              </button>
            );
          })}
        </div>
      </div>

      <fieldset>
        <legend className="field-label">種子袋：選一株想種的植物</legend>
        <div className="flex flex-wrap gap-2">
          {plants.map((p) => {
            const ok = !!(data.unlocks[`plant:${p.id}`] || p.points === 0);
            return (
              <button key={p.id} type="button" disabled={!ok} aria-pressed={selected === p.id} onClick={() => setSelected(p.id)} title={ok ? p.name : `${p.points} 成長點解鎖`}
                className={`flex flex-col items-center rounded-xl border px-2 py-1 text-xs ${selected === p.id ? 'border-accent bg-soft' : 'border-line bg-surface'} disabled:opacity-40`}>
                <PlantSvg kind={p.id} size={32} />{ok ? p.name : `🔒 ${p.points}`}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="field-label">景觀主題</legend>
        <div className="flex flex-wrap gap-2">
          {gardenThemes.map((t) => {
            const ok = !!(data.unlocks[`theme:${t.id}`] || t.points === 0);
            return <button key={t.id} type="button" disabled={!ok} aria-pressed={data.garden.theme === t.id} onClick={() => update((d) => ({ ...d, garden: { ...d.garden, theme: t.id } }))} className={data.garden.theme === t.id ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{ok ? t.name : `🔒 ${t.name}（${t.points} 點）`}</button>;
          })}
        </div>
      </fieldset>
    </div>
  );
}
