/**
 * 輕鬆探索 Play：八個輕遊戲化互動的入口與各自頁面（/play、/play/:game）
 */
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PLAY_PROMISE } from '../content/systems';
import Buddy from '../components/play/Buddy';
import MoodBox from '../components/play/MoodBox';
import QuestPicker from '../components/play/QuestPicker';
import SurpriseWheel from '../components/play/SurpriseWheel';
import SocialStories from '../components/play/SocialStories';
import GrowthCollection from '../components/play/GrowthCollection';
import MindGarden from '../components/play/MindGarden';
import TimeCapsules from '../components/play/TimeCapsules';
import { useStore } from '../store/AppStore';
import type { BuddyMood } from '../content/play';

export const GAMES: { id: string; title: string; en: string; emoji: string; desc: string; mood: BuddyMood; El: () => JSX.Element }[] = [
  { id: 'quest', title: '今日輕冒險', en: 'Mini Quest', emoji: '🧭', desc: '30 秒到 5 分鐘的日常小冒險。', mood: 'curious', El: () => <QuestPicker /> },
  { id: 'surprise', title: '今日心情盲盒', en: 'Mood Surprise', emoji: '🎁', desc: '打開看看今天抽到什麼。', mood: 'curious', El: () => <div className="mx-auto max-w-md"><MoodBox /></div> },
  { id: 'wheel', title: '隨機探索轉盤', en: 'Surprise Wheel', emoji: '🎡', desc: '不知道做什麼時，讓轉盤決定。', mood: 'welcome', El: () => <SurpriseWheel /> },
  { id: 'stories', title: '人際情境小劇場', en: 'Social Stories', emoji: '🎭', desc: '在故事裡試試不同的回應。', mood: 'thinking', El: () => <SocialStories /> },
  { id: 'garden', title: '心智花園', en: 'Mind Garden', emoji: '🌷', desc: '每一筆練習，都讓花園多一點生機。', mood: 'resting', El: () => <MindGarden /> },
  { id: 'collection', title: '成長收藏冊', en: 'Growth Collection', emoji: '📒', desc: '收集嘗試過的經驗與喜歡的小卡。', mood: 'celebrating', El: () => <GrowthCollection /> },
  { id: 'capsule', title: '時光膠囊', en: 'Time Capsule', emoji: '✉️', desc: '寫一句話給未來的自己。', mood: 'encouraging', El: () => <TimeCapsules /> },
];

export default function Play() {
  const { game } = useParams();
  const { data } = useStore();
  if (game) {
    const g = GAMES.find((x) => x.id === game);
    if (!g) return <Navigate to="/play" replace />;
    return (
      <div className="space-y-6 motion-safe:animate-fade-up">
        <Link to="/play" className="btn-ghost btn-sm"><ArrowLeft className="h-4 w-4" aria-hidden />輕鬆探索</Link>
        <header>
          <p className="font-display text-sm italic text-accent">{g.en}</p>
          <h1 className="text-3xl font-bold">{g.emoji} {g.title}</h1>
          <p className="mt-1 text-muted">{g.desc}</p>
        </header>
        {data.settings.buddyVisible && <Buddy mood={g.mood} size={64} />}
        <g.El />
      </div>
    );
  }
  return (
    <div className="space-y-8 motion-safe:animate-fade-up">
      <header className="rounded-3xl bg-gradient-to-br from-soft via-bg to-apricot/30 p-6 sm:p-10">
        <p className="font-display text-sm italic text-accent">Playful Growth</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">輕鬆探索</h1>
        <p className="mt-3 font-serif text-lg">{PLAY_PROMISE}</p>
        <p className="mt-2 text-sm text-muted">每個互動都可以直接開始，也可以隨時跳過。沒有每日任務、沒有連續天數、沒有排行榜。</p>
      </header>
      {data.settings.buddyVisible && <Buddy mood="welcome" />}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g) => (
          <li key={g.id}>
            <Link to={`/play/${g.id}`} className="card-hover flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
              <span className="text-3xl" aria-hidden>{g.emoji}</span>
              <span className="mt-2 font-serif text-lg font-bold">{g.title}</span>
              <span className="text-xs text-muted">{g.en}</span>
              <span className="mt-1 text-sm">{g.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
