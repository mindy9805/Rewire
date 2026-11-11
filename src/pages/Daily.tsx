/**
 * 每日心智練習 Daily Rewire 頁面
 * - 七句卡片、開始練習、複製全部
 * - 今日紀錄（可編輯）、科學說明
 * - 我的收藏、最常選擇的句子、不同日期的練習紀錄（可編輯、刪除）
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Heart, Download } from 'lucide-react';
import DailyRewireSection from '../components/daily/DailyRewireSection';
import DailyLogForm from '../components/daily/DailyLogForm';
import AffirmationCard from '../components/daily/AffirmationCard';
import { affirmationMap, affirmations, dailyScienceNote, noPressureNote } from '../content/dailyRewire';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import { useConfirm } from '../components/ui/Confirm';
import { EmptyState, MOODS } from '../components/ui/basics';
import { dailyStats } from '../lib/stats';
import { formatDate, toDateKey, shortDate } from '../lib/date';
import { downloadText } from '../lib/clipboard';
import { dailyToMarkdown, stamp } from '../lib/exporters';
import { getDailyLog } from '../lib/daily';
import { nowIso } from '../lib/id';
import { patternHabits } from '../content/breakPattern';

export default function Daily() {
  const { data, remove, upsert } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [editDate, setEditDate] = useState<string | null>(null);
  const ds = dailyStats(data);
  const today = toDateKey();
  const logs = [...data.dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
  const favs = affirmations.filter((a) => data.dailyFavorites.includes(a.id));

  return (
    <div className="space-y-12 motion-safe:animate-fade-up">
      <DailyRewireSection />

      <section aria-labelledby="pick-h" className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <h2 id="pick-h" className="font-serif text-xl font-bold">今天想練習哪一句？</h2>
        <p className="mt-1 text-sm text-muted">自由選擇一句，今天多留意它。也可以在打破慣性的練習完成後設定。</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {affirmations.map((a) => {
            const todayLog = getDailyLog(data, today);
            const on = todayLog.practiceId === a.id;
            const related = patternHabits.filter((h) => h.affirmationIds.includes(a.id)).map((h) => h.short);
            return (
              <button key={a.id} aria-pressed={on} onClick={() => { upsert('dailyLogs', { ...todayLog, practiceId: on ? 0 : a.id, updatedAt: nowIso() }); toast(on ? '已取消今日練習句' : `今天練習：「${a.text}」`); }}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${on ? 'border-accent bg-soft' : 'border-line bg-bg hover:border-accent/50'}`}>
                <span className="font-display italic text-sage">{String(a.id).padStart(2, '0')}</span> <strong>{a.text}</strong>{on && <span className="chip ml-2">今日練習句</span>}
                {related.length > 0 && <span className="mt-0.5 block text-xs text-muted">相關習慣：{related.join('、')}</span>}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="today-h" className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <h2 id="today-h" className="font-serif text-xl font-bold">今日心智練習紀錄</h2>
        <p className="mt-1 text-sm text-muted">{noPressureNote}</p>
        <div className="mt-5">
          <DailyLogForm key={`today-${data.dailyLogs.find((l) => l.date === today)?.updatedAt ?? 'new'}`} date={today} />
        </div>
      </section>

      <section aria-labelledby="stats-h">
        <h2 id="stats-h" className="font-serif text-xl font-bold">我的練習軌跡</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-soft/60 p-4"><p className="text-xs text-muted">累計完成天數</p><p className="mt-1 font-display text-3xl">{ds.totalDays}</p></div>
          <div className="rounded-2xl bg-soft/60 p-4">
            <p className="text-xs text-muted">最近七天</p>
            <div className="mt-2 flex gap-1.5">
              {ds.week.map((w) => (
                <span key={w.date} className="flex flex-col items-center gap-1 text-[10px] text-muted">
                  <span className={`h-6 w-6 rounded-full ${w.done ? 'bg-accent' : 'border border-line bg-surface'}`} aria-label={`${w.date}${w.done ? '已練習' : '未練習'}`} />
                  {shortDate(w.date)}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-soft/60 p-4">
            <p className="text-xs text-muted">最常選擇的語句</p>
            <p className="mt-1 font-serif font-bold">{ds.topId ? `「${affirmationMap[ds.topId].text}」（${ds.topCount} 次）` : '尚無資料'}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="fav-h">
        <h2 id="fav-h" className="flex items-center gap-2 font-serif text-xl font-bold"><Heart className="h-5 w-5 text-[#C0675A]" aria-hidden />我收藏的句子</h2>
        {favs.length === 0 ? (
          <p className="mt-2 text-sm text-muted">在語句卡片上按「收藏」，就會出現在這裡。</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">{favs.map((a) => <AffirmationCard key={a.id} a={a} compact />)}</div>
        )}
      </section>

      <section aria-labelledby="history-h">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="history-h" className="font-serif text-xl font-bold">練習紀錄回顧</h2>
          {logs.length > 0 && (
            <button className="btn-ghost btn-sm ml-auto" onClick={() => { downloadText(`daily-rewire-${stamp()}.md`, dailyToMarkdown(data), 'text/markdown'); toast('已匯出 Markdown'); }}>
              <Download className="h-4 w-4" aria-hidden />匯出
            </button>
          )}
        </div>
        {logs.length === 0 ? (
          <div className="mt-4"><EmptyState title="還沒有練習紀錄" desc="完成一次每日朗讀，或在上方填寫今日紀錄。" action={<Link to="/daily/read" className="btn-primary btn-sm">開始今日練習</Link>} /></div>
        ) : (
          <ul className="mt-4 space-y-3">
            {logs.map((l) => (
              <li key={l.id} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium">{formatDate(l.date)} {l.completedReading && <span className="chip ml-1">✓ 已完成朗讀</span>}</p>
                    {l.favoriteId > 0 && <p className="mt-1 text-sm">最有感觸：「{affirmationMap[l.favoriteId]?.text}」</p>}
                    {l.why && <p className="mt-1 text-sm text-muted">{l.why}</p>}
                    {l.action && <p className="mt-1 text-sm">小行動：{l.action}</p>}
                    {l.mood > 0 && <p className="mt-1 text-sm">情緒：{MOODS.find((m) => m.v === l.mood)?.emoji} {MOODS.find((m) => m.v === l.mood)?.label}{l.moodWords && `（${l.moodWords}）`}</p>}
                  </div>
                  <button className="icon-btn" aria-label={`編輯 ${l.date} 的紀錄`} onClick={() => setEditDate(editDate === l.date ? null : l.date)}><Pencil className="h-4 w-4" aria-hidden /></button>
                  <button className="icon-btn" aria-label={`刪除 ${l.date} 的紀錄`} onClick={async () => { if (await confirm({ title: '刪除這天的練習紀錄？', message: '包含完成狀態與反思內容，刪除後無法復原。', confirmText: '刪除', danger: true })) { remove('dailyLogs', l.id); toast('已刪除紀錄'); } }}><Trash2 className="h-4 w-4" aria-hidden /></button>
                </div>
                {editDate === l.date && (
                  <div className="mt-4 border-t border-line pt-4">
                    <DailyLogForm date={l.date} onSaved={() => setEditDate(null)} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="science-h" className="rounded-3xl bg-soft/50 p-5 sm:p-7">
        <h2 id="science-h" className="font-serif text-xl font-bold">簡短科學說明：為什麼是「練習」而不是「咒語」？</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {dailyScienceNote.map((n) => (
            <div key={n.title} className="rounded-2xl bg-surface p-4 text-sm leading-relaxed">
              <p className="font-medium text-accent">{n.title}</p>
              <p className="mt-1">{n.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">這七句話是自我覺察與自我對話的練習工具。目前沒有直接證據顯示「每天唸七句話」本身就能改造大腦；研究支持的是持續的注意、認知重構與實際行動對學習與行為改變的幫助。</p>
      </section>
    </div>
  );
}
