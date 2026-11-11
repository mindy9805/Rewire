/**
 * Mood Surprise｜今日心情盲盒
 * 點擊開盒，隨機獲得一張卡片（心智語句、30 秒微練習、反思問題、大腦冷知識、溫柔提醒）。
 * 可收藏、再抽一次或直接跳過。沒有稀有度、付費或限時機制。
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Heart, RefreshCcw, X } from 'lucide-react';
import { CARD_TYPE_LABEL, moodCards, type CardType, type MoodCard } from '../../content/play';
import { referenceMap } from '../../content/references';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { nowIso, uid } from '../../lib/id';

/** 隨機抽一張（避免連續抽到同一張；可限定類型） */
export function drawCard(prevId?: string, type?: CardType): MoodCard {
  const pool = moodCards.filter((c) => (!type || c.type === type) && c.id !== prevId);
  return pool[Math.floor(Math.random() * pool.length)] ?? moodCards[0];
}

export function CardView({ card }: { card: MoodCard }) {
  const ref = card.refId ? referenceMap[card.refId] : undefined;
  return (
    <div className="rounded-2xl border border-line bg-gradient-to-br from-surface to-soft p-5 text-center motion-safe:animate-pop">
      <p className="text-xs font-medium tracking-wider text-accent">{CARD_TYPE_LABEL[card.type]}</p>
      <p className={`mt-2 leading-relaxed ${card.type === 'affirmation' ? 'font-serif text-2xl font-bold' : 'text-base'}`}>{card.text}</p>
      {ref && <p className="mt-2 text-xs text-muted">來源：{ref.authors.split(',')[0]} 等（{ref.year}）{ref.url && <> · <a href={ref.url} target="_blank" rel="noopener noreferrer" className="underline">DOI</a></>}</p>}
      {card.affirmationId && <Link to="/daily" className="mt-2 inline-block text-xs text-accent underline">看看這句話的反思與行動</Link>}
    </div>
  );
}

export default function MoodBox({ onClose }: { onClose?: () => void }) {
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const [card, setCard] = useState<MoodCard | null>(null);
  const saved = card ? data.savedCards.find((s) => s.cardId === card.id) : undefined;

  const toggleSave = () => {
    if (!card) return;
    if (saved) { remove('savedCards', saved.id); toast('已取消收藏', 'info'); }
    else { upsert('savedCards', { id: uid(), cardId: card.id, createdAt: nowIso() }); toast('已收進收藏冊 🃏'); }
  };

  return (
    <div className="space-y-4">
      {!card ? (
        <button className="group mx-auto flex flex-col items-center gap-2 rounded-3xl p-4 focus-visible:ring-2" onClick={() => setCard(drawCard())} aria-label="打開盲盒，抽一張卡">
          <span className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-apricot to-sage shadow-card transition group-hover:-translate-y-1 motion-safe:animate-wiggle">
            <Gift className="h-12 w-12 text-[#36594B]" aria-hidden />
          </span>
          <span className="text-sm font-medium">點一下打開盲盒</span>
        </button>
      ) : (
        <CardView key={card.id} card={card} />
      )}
      {card && (
        <div className="flex flex-wrap justify-center gap-2">
          <button className={saved ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} aria-pressed={!!saved} onClick={toggleSave}><Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} aria-hidden />{saved ? '已收藏' : '收藏這張卡'}</button>
          <button className="btn-secondary btn-sm" onClick={() => setCard(drawCard(card.id))}><RefreshCcw className="h-4 w-4" aria-hidden />再抽一次</button>
          {onClose && <button className="btn-ghost btn-sm" onClick={onClose}><X className="h-4 w-4" aria-hidden />先跳過</button>}
        </div>
      )}
    </div>
  );
}
