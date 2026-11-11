/**
 * 首頁主要入口：「今天，你想怎麼探索自己？」
 * 三個大按鈕：給我一個小驚喜／今天想玩個小遊戲／我想安靜一下。
 * 點擊後在下方展開對應內容，30 秒內就能開始；每個面板都能關閉或跳過。
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Gamepad2, Moon, X } from 'lucide-react';
import { HOME_TITLE, quietOptions } from '../../content/play';
import { PLAY_PROMISE, PRODUCT_TAGLINE } from '../../content/systems';
import MoodBox from '../play/MoodBox';

type Panel = 'surprise' | 'game' | 'quiet' | null;
const GAME_TILES = [
  { to: '/play/quest', emoji: '🧭', title: '今日輕冒險', desc: '30 秒到 5 分鐘' },
  { to: '/play/wheel', emoji: '🎡', title: '隨機探索轉盤', desc: '讓轉盤決定' },
  { to: '/play/stories', emoji: '🎭', title: '人際情境小劇場', desc: '試試不同回應' },
];

export default function HomeHero() {
  const [panel, setPanel] = useState<Panel>(null);
  const btn = (id: Exclude<Panel, null>, Icon: typeof Gift, label: string, hint: string) => (
    <button onClick={() => setPanel(panel === id ? null : id)} aria-expanded={panel === id} aria-controls="hero-panel"
      className={`flex flex-col items-start gap-1 rounded-3xl p-5 text-left transition hover:-translate-y-0.5 ${panel === id ? 'bg-[#FAF8F4] text-[#36594B]' : 'bg-white/10 text-[#FAF8F4] hover:bg-white/15'}`}>
      <Icon className="h-7 w-7" aria-hidden />
      <span className="mt-1 font-serif text-lg font-bold">{label}</span>
      <span className="text-xs opacity-80">{hint}</span>
    </button>
  );
  return (
    <section aria-labelledby="hero-h" className="relative overflow-hidden rounded-3xl bg-forest px-5 py-8 text-[#FAF8F4] sm:px-10 sm:py-12">
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
        {[[80, 300], [220, 180], [380, 250], [520, 120], [680, 200], [740, 60], [300, 60]].map(([x, y], i, arr) => (
          <g key={i}>
            {i > 0 && <line x1={arr[i - 1][0]} y1={arr[i - 1][1]} x2={x} y2={y} stroke="#A8BBA3" strokeWidth="1.5" />}
            <circle cx={x} cy={y} r={i % 2 ? 5 : 8} fill={i % 2 ? '#E8CCB2' : '#A8BBA3'} className="motion-safe:animate-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
          </g>
        ))}
      </svg>
      <div className="relative">
        <p className="font-display text-sm italic text-[#E8CCB2]">Rewire｜重塑大腦的可能</p>
        <h1 id="hero-h" className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl">{HOME_TITLE}</h1>
        <p className="mt-2 text-[#E9EEE7]">{PLAY_PROMISE}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {btn('surprise', Gift, '給我一個小驚喜', '抽一張今日心情小卡')}
          {btn('game', Gamepad2, '今天想玩個小遊戲', '冒險、轉盤或小劇場')}
          {btn('quiet', Moon, '我想安靜一下', '呼吸、靜坐或看看花園')}
        </div>
        {panel && (
          <div id="hero-panel" className="relative mt-4 rounded-3xl bg-[#FAF8F4] p-5 text-[#303630] motion-safe:animate-pop">
            <button className="absolute right-3 top-3 rounded-full p-1.5 hover:bg-black/5" onClick={() => setPanel(null)} aria-label="收起"><X className="h-4 w-4" aria-hidden /></button>
            {panel === 'surprise' && <MoodBox onClose={() => setPanel(null)} />}
            {panel === 'game' && (
              <ul className="grid gap-2 sm:grid-cols-3">
                {GAME_TILES.map((g) => (
                  <li key={g.to}><Link to={g.to} className="flex h-full flex-col rounded-2xl border border-[#DDE3DA] bg-white p-4 hover:-translate-y-0.5"><span className="text-2xl" aria-hidden>{g.emoji}</span><span className="font-medium">{g.title}</span><span className="text-xs text-[#5C665E]">{g.desc}</span></Link></li>
                ))}
              </ul>
            )}
            {panel === 'quiet' && (
              <div>
                <p className="font-serif text-xl font-bold">「我現在是安全的」</p>
                <p className="mt-1 text-sm text-[#5C665E]">先慢慢吐一口氣。想做什麼都可以，什麼都不做也可以。</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                  {quietOptions.map((q) => <li key={q.to}><Link to={q.to} className="flex h-full flex-col rounded-2xl border border-[#DDE3DA] bg-white p-4 hover:-translate-y-0.5"><span className="font-medium">{q.label}</span><span className="text-xs text-[#5C665E]">{q.desc}</span></Link></li>)}
                </ul>
              </div>
            )}
          </div>
        )}
        <p className="mt-6 text-xs text-[#E9EEE7]/80">{PRODUCT_TAGLINE}</p>
      </div>
    </section>
  );
}
