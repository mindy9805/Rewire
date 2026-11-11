/**
 * Growth Collection｜成長收藏冊
 * 徽章（獎勵探索與過程）、收藏的小卡、已解鎖的植物。每張徽章顯示取得日期與相關紀錄。
 * 沒有排行榜、連續天數或人格優劣分級。
 */
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { badges, moodCardMap, plants } from '../../content/play';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { formatDate } from '../../lib/date';
import { CardView } from './MoodBox';
import PlantSvg from './PlantSvg';

export default function GrowthCollection() {
  const { data, remove } = useStore();
  const toast = useToast();
  const got = badges.filter((b) => data.unlocks[`badge:${b.id}`]);
  return (
    <div className="space-y-8">
      <section aria-labelledby="badge-h">
        <h3 id="badge-h" className="font-serif text-xl font-bold">成長徽章（{got.length}/{badges.length}）</h3>
        <p className="text-sm text-muted">徽章記錄的是你「實際嘗試過的事」。已取得的徽章會一直保留。</p>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => {
            const u = data.unlocks[`badge:${b.id}`];
            return (
              <li key={b.id} className={`flex flex-col items-center rounded-2xl border p-4 text-center ${u ? 'border-accent/40 bg-surface shadow-card' : 'border-dashed border-line bg-soft/30'}`}>
                <span className={`text-4xl ${u ? '' : 'opacity-30 grayscale'}`} aria-hidden>{b.emoji}</span>
                <p className="mt-2 font-medium">{b.title}</p>
                {u ? (
                  <>
                    <p className="text-xs text-muted">{b.desc}</p>
                    <p className="mt-1 text-[11px] text-accent">取得於 {formatDate(u.date)}</p>
                    <p className="text-[11px] text-muted">{u.evidence}</p>
                  </>
                ) : <p className="text-xs text-muted">尚未取得・{b.how}</p>}
              </li>
            );
          })}
        </ul>
      </section>
      <section aria-labelledby="cards-h">
        <h3 id="cards-h" className="font-serif text-xl font-bold">收藏的小卡（{data.savedCards.length}）</h3>
        {data.savedCards.length === 0 ? <p className="mt-1 text-sm text-muted">在<Link to="/play/surprise" className="underline">心情盲盒</Link>按「收藏這張卡」，就會出現在這裡。</p> : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {[...data.savedCards].reverse().map((s) => moodCardMap[s.cardId] && (
              <li key={s.id} className="relative">
                <CardView card={moodCardMap[s.cardId]} />
                <button className="icon-btn absolute right-2 top-2 h-8 w-8" aria-label={`移除收藏：${moodCardMap[s.cardId].text}`} onClick={() => { remove('savedCards', s.id); toast('已移除收藏', 'info'); }}><Trash2 className="h-4 w-4" aria-hidden /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="plants-h">
        <h3 id="plants-h" className="font-serif text-xl font-bold">花園圖鑑</h3>
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {plants.map((p) => {
            const u = data.unlocks[`plant:${p.id}`];
            return (
              <li key={p.id} className={`flex flex-col items-center rounded-xl p-2 text-center text-xs ${u ? 'bg-soft/60' : 'bg-soft/20 text-muted'}`}>
                <span className={u ? '' : 'opacity-25 grayscale'}><PlantSvg kind={p.id} size={40} /></span>
                {u ? p.name : '？？？'}
                {!u && <span className="text-[10px]">{p.points} 成長點</span>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
