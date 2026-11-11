/**
 * 首頁（輕遊戲化版本）
 * 1. 主要入口「今天，你想怎麼探索自己？」三個大按鈕（30 秒內可以開始）
 * 2. 成長夥伴＋心智花園預覽
 * 3. 今日推薦（依日期固定的冒險、小卡與心智語句）
 * 4. 最近收藏
 * 5. 自由探索入口（四大學習系統＋挑戰＋儀表板）
 * 6. 既有完整內容區塊（Daily Rewire 七句卡片、打破慣性焦點卡片、7 Habits 學習地圖、九個章節）預設收起，可在「自訂首頁」開啟
 * 使用者可自訂每個區塊是否顯示；不要求每天完成任何事。
 */
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Settings2 } from 'lucide-react';
import { chapters } from '../content/chapters';
import { affirmations } from '../content/dailyRewire';
import { badges, buddyLines, buddyWelcomeBack, DEPTH_LABEL, moodCards, quests } from '../content/play';
import { SYSTEMS } from '../content/systems';
import { PATTERN_MODULE, PATTERN_TITLE } from '../content/breakPattern';
import { H7_MODULE, H7_TITLE } from '../content/habits7';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import HomeHero from '../components/home/HomeHero';
import Buddy from '../components/play/Buddy';
import { GardenView } from '../components/play/MindGarden';
import { CardView } from '../components/play/MoodBox';
import { readyCapsules } from '../components/play/TimeCapsules';
import { unlockName } from '../components/play/GrowthWatcher';
import DailyRewireSection from '../components/daily/DailyRewireSection';
import { FocusPicker, PatternClosing } from '../components/pattern/shared';
import { StageMap } from '../components/habits7/shared';
import { activitySummary, collectActivity, dailyPick, growthPoints } from '../lib/activity';
import { formatDate, toDateKey } from '../lib/date';
import type { HomeSectionId } from '../types';

const SECTION_LABEL: Record<HomeSectionId, string> = {
  buddy: '成長夥伴',
  garden: '心智花園預覽',
  today: '今日推薦',
  collection: '最近收藏',
  explore: '自由探索入口',
  daily: 'Daily Rewire 七句卡片',
  pattern: '打破慣性：想調整的習慣',
  habits7: '7 Habits 三階段學習地圖',
  chapters: '九個神經可塑性章節',
};

export default function Overview() {
  const { data, update } = useStore();
  const toast = useToast();
  const show = data.settings.homeSections;
  const events = collectActivity(data);
  const today = toDateKey();
  const todayCount = events.filter((e) => e.date === today).length;
  const lastDay = [...events].reverse().find((e) => e.date < today)?.date;
  const away = !todayCount && lastDay && (Date.now() - new Date(lastDay).getTime()) / 86400000 >= 7;
  const buddyMood = todayCount ? 'celebrating' : away ? 'welcome' : 'curious';
  const buddyMsg = todayCount ? `今天已經累積 ${todayCount} 個小小的經驗了。${buddyLines.celebrating[0]}` : away ? buddyWelcomeBack[0] : undefined;
  const ready = readyCapsules(data.capsules);
  const recent = Object.entries(data.unlocks).filter(([k]) => k.startsWith('badge:') || (k.startsWith('plant:') && k !== 'plant:sprout')).sort((a, b) => b[1].date.localeCompare(a[1].date)).slice(0, 3);
  const quest = dailyPick(quests, 1);
  const card = dailyPick(moodCards.filter((c) => c.type !== 'affirmation'), 2);
  const aff = dailyPick(affirmations, 3);
  const summary = activitySummary(events);
  const sysCount: Record<string, number> = {
    neuro: summary.byTheme.neuro ?? 0,
    daily: summary.byTheme.daily ?? 0,
    pattern: summary.byTheme.pattern ?? 0,
    habits7: summary.byTheme.habits7 ?? 0,
    challenges: summary.byTheme.challenge ?? 0,
    dashboard: summary.total,
  };
  const setSection = (id: HomeSectionId, v: boolean) => update((p) => ({ ...p, settings: { ...p.settings, homeSections: { ...p.settings.homeSections, [id]: v } } }));

  return (
    <div className="space-y-10 motion-safe:animate-fade-up">
      <HomeHero />

      {ready.length > 0 && (
        <Link to="/play/capsule" className="flex items-center gap-3 rounded-2xl border border-accent/40 bg-soft/70 p-4 text-sm hover:bg-soft">
          <span className="text-2xl" aria-hidden>✉️</span><span className="flex-1">你有 {ready.length} 個時光膠囊可以打開了。</span><ArrowRight className="h-4 w-4 text-accent" aria-hidden />
        </Link>
      )}

      {((show.buddy && data.settings.buddyVisible) || show.garden) && (
        <section aria-label="成長夥伴與心智花園" className="grid items-center gap-5 md:grid-cols-2">
          {show.buddy && data.settings.buddyVisible && <Buddy mood={buddyMood} message={buddyMsg} />}
          {show.garden && (
            <Link to="/play/garden" className="card-hover block rounded-3xl border border-line bg-surface p-3" aria-label={`前往心智花園（成長點 ${growthPoints(events)}）`}>
              <GardenView compact />
              <p className="mt-2 flex items-center justify-between px-1 text-sm"><span>🌷 我的心智花園</span><span className="text-xs text-muted">成長點 {growthPoints(events)}・{data.garden.plants.length} 株</span></p>
            </Link>
          )}
        </section>
      )}

      {show.today && (
        <section aria-labelledby="today-h">
          <h2 id="today-h" className="text-xl font-bold">今日推薦</h2>
          <p className="text-sm text-muted">每天會換一組；喜歡就試試，不喜歡就跳過。</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Link to="/play/quest" className="card-hover rounded-2xl border border-line bg-surface p-4">
              <p className="text-xs text-accent">今日輕冒險・{DEPTH_LABEL.short}</p>
              <p className="mt-1 font-serif text-lg font-bold">{quest.title}</p>
              <p className="mt-1 text-sm">{quest.depths.short}</p>
            </Link>
            <CardView card={card} />
            <Link to="/daily/read" className="card-hover rounded-2xl bg-gradient-to-br from-soft to-apricot/30 p-4">
              <p className="text-xs text-accent">今天的心智語句</p>
              <p className="mt-1 font-serif text-xl font-bold">「{aff.text}」</p>
              <p className="mt-1 text-sm text-muted">{aff.reflection}</p>
            </Link>
          </div>
        </section>
      )}

      {show.collection && (
        <section aria-labelledby="col-h">
          <div className="flex items-end gap-2">
            <h2 id="col-h" className="text-xl font-bold">最近收藏</h2>
            <Link to="/play/collection" className="ml-auto text-sm text-accent underline">成長收藏冊</Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-2 text-sm text-muted">還沒有收藏。完成任何一個小冒險、練習或紀錄，都可能解鎖新的徽章與植物。</p>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {recent.map(([k, v]) => {
                const b = badges.find((x) => `badge:${x.id}` === k);
                return <li key={k} className="rounded-2xl border border-line bg-surface p-4 text-sm"><span className="text-2xl" aria-hidden>{b?.emoji ?? '🌱'}</span><p className="mt-1 font-medium">{unlockName(k)}</p><p className="text-xs text-muted">{formatDate(v.date)}・{v.evidence}</p></li>;
              })}
            </ul>
          )}
        </section>
      )}

      {show.explore && (
        <section aria-labelledby="explore-h">
          <h2 id="explore-h" className="text-xl font-bold">自由探索</h2>
          <p className="text-sm text-muted">四個核心學習系統，加上挑戰與成長儀表板。想深入學習時，從這裡出發。</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SYSTEMS.map((s) => (
              <li key={s.id}>
                <Link to={s.to} className={`card-hover flex h-full flex-col rounded-2xl border p-4 ${s.core ? 'border-line bg-surface' : 'border-dashed border-line bg-soft/40'}`}>
                  <span className="font-display text-xs italic text-accent">{s.en}</span>
                  <span className="font-serif text-lg font-bold">{s.title}</span>
                  <span className="text-sm">{s.desc}</span>
                  <span className="mt-2 text-xs text-muted">{s.lens}</span>
                  {sysCount[s.id] > 0 && <span className="mt-auto pt-2 text-xs text-accent">{s.id === 'dashboard' ? `共 ${sysCount[s.id]} 筆紀錄` : `已留下 ${sysCount[s.id]} 筆紀錄`}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">四個系統各有不同性質：神經可塑性提供科學研究視角，Daily Rewire 是覺察練習，打破慣性是行為實踐框架，7 Habits 是管理哲學。頁面中會清楚標示研究結論、管理哲學與本站的實踐建議。</p>
        </section>
      )}

      {show.daily && <DailyRewireSection showAll={false} />}

      {show.pattern && (
        <section aria-labelledby="bp-h" className="rounded-3xl border border-line bg-surface p-5 sm:p-8">
          <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">{PATTERN_MODULE}</p>
          <h2 id="bp-h" className="mt-2 font-serif text-2xl font-bold">{PATTERN_TITLE}</h2>
          <div className="mt-6"><FocusPicker headingLevel={3} /></div>
          <div className="mt-6"><PatternClosing /></div>
        </section>
      )}

      {show.habits7 && (
        <section aria-labelledby="h7-h">
          <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">{H7_MODULE}</p>
          <h2 id="h7-h" className="mb-4 mt-2 font-serif text-2xl font-bold">{H7_TITLE}</h2>
          <StageMap />
        </section>
      )}

      {show.chapters && (
        <section aria-labelledby="chapters-h">
          <h2 id="chapters-h" className="text-xl font-bold">九個章節</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {chapters.map((c) => (
              <Link key={c.id} to={`/learn/${c.id}`} className="card-hover relative rounded-2xl border border-line bg-surface p-4">
                <span className="font-display text-2xl italic text-sage">{String(c.number).padStart(2, '0')}</span>
                {data.chapters[c.id]?.completed && <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-accent" aria-label="已完成" />}
                <p className="mt-1 font-serif font-bold">{c.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <details className="rounded-2xl border border-line bg-surface p-4">
        <summary className="flex cursor-pointer items-center gap-2 font-medium"><Settings2 className="h-4 w-4 text-accent" aria-hidden />自訂首頁</summary>
        <p className="mt-2 text-sm text-muted">選擇首頁要顯示的內容。所有內容都仍可從選單進入。</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(SECTION_LABEL) as HomeSectionId[]).map((id) => (
            <label key={id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={show[id]} onChange={(e) => setSection(id, e.target.checked)} />{SECTION_LABEL[id]}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={data.settings.buddyVisible} onChange={(e) => { update((p) => ({ ...p, settings: { ...p.settings, buddyVisible: e.target.checked } })); toast(e.target.checked ? '小芽回來了' : '已隱藏成長夥伴', 'info'); }} />在所有頁面顯示成長夥伴「小芽」
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">若想減少動畫，可在裝置的系統設定開啟「減少動態效果」，本站會自動停用動畫。</p>
      </details>

      <p className="rounded-2xl bg-soft/60 p-4 text-xs leading-relaxed text-muted">
        本站以 Nicole Vignola《Rewire》與 Stephen R. Covey《與成功有約》為參考，所有內容為重新組織的原創解說。花園、徽章與收藏是累積經驗的紀念，不代表大腦或心理健康的分數。本站練習不能取代專業心理或醫療協助；如有需要，請撥打 1925 安心專線（24 小時）。
      </p>
    </div>
  );
}
