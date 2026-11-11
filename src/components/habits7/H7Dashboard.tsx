/**
 * 儀表板：7 Habits 資料區（全部依實際紀錄計算）
 * 七習慣學習進度、個人成功／公眾成功進度、自我更新紀錄、四維成長自評、本週三件要事、個人願景、21 天計畫、最近的實踐反思
 */
import { Link } from 'react-router-dom';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/AppStore';
import { Card, EmptyState, ProgressBar } from '../ui/basics';
import { h7Habits, planDays, renewDims } from '../../content/habits7';
import { h7StageProgress, planProgress, renewalRadar, weekKey } from '../../lib/habits7';
import { formatDate, formatDateTime, lastNDays } from '../../lib/date';
import { H7Icon, StatusChip } from './shared';
import { h7Status } from '../../lib/habits7';

export default function H7Dashboard() {
  const { data } = useStore();
  const sp = h7StageProgress(data);
  const pp = planProgress(data);
  const label = (id: string) => (id === 'spiritual' ? data.renewalSettings.spiritualLabel : renewDims.find((x) => x.id === id)!.label);
  const radar = renewalRadar(data, label);
  const big3 = data.big3Weeks.find((w) => w.id === weekKey());
  const week = new Set(lastNDays(7));
  const restWeek = data.restLogs.filter((r) => week.has(r.date));
  const habitWeek = data.renewalHabitLogs.filter((l) => week.has(l.date)).length;
  const reflections = [
    ...data.notes.filter((n) => n.tags.includes('7 Habits')).map((n) => ({ id: n.id, at: n.updatedAt, title: n.source ?? '7 Habits', text: n.content })),
    ...planDays.filter((p) => data.h7Plan.days[String(p.day)]?.reflection).map((p) => ({ id: `plan-${p.day}`, at: data.h7Plan.days[String(p.day)].updatedAt ?? '', title: `21 天計畫 Day ${p.day}`, text: data.h7Plan.days[String(p.day)].reflection })),
    ...data.renewalChecks.filter((c) => c.reflection).map((c) => ({ id: c.id, at: c.updatedAt, title: `四維成長週反思（${c.weekKey}）`, text: c.reflection })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  const any = Object.keys(data.h7Progress).length || data.renewalChecks.length || big3?.items.length || data.lifeCompass.vision || pp.done || reflections.length || data.restLogs.length || data.quadrantTasks.length;

  return (
    <section aria-labelledby="h7-dash" className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <h2 id="h7-dash" className="font-serif text-xl font-bold">7 Habits｜高效能生活實踐</h2>
        <Link to="/habits7" className="ml-auto text-sm text-accent underline">前往模組</Link>
      </div>
      {!any ? (
        <EmptyState title="還沒有 7 Habits 紀錄" desc="開始任一個習慣章節或使用互動工具後，這裡會顯示你的真實進度。" action={<Link to="/habits7" className="btn-primary btn-sm">開始探索</Link>} />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <h3 className="text-sm font-medium text-muted">七習慣學習進度</h3>
              <div className="mt-3 space-y-3">
                <ProgressBar label="七習慣總進度" value={sp.done} max={sp.total} />
                {sp.stages.map((s) => <ProgressBar key={s.id} label={`${s.title}學習進度`} value={s.done} max={s.total} />)}
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {h7Habits.map((h) => <li key={h.id}><Link to={`/habits7/${h.id}`} className="flex items-center gap-1 text-xs" aria-label={`${h.title}：${h7Status(data, h.id)}`}><H7Icon h={h} className="h-3.5 w-3.5 text-accent" /><StatusChip status={h7Status(data, h.id)} /></Link></li>)}
              </ul>
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-muted">本週三件要事</h3>
              {big3?.items.length ? (
                <ol className="mt-2 space-y-1 text-sm">{big3.items.map((i, n) => <li key={i.id}>{n + 1}. {i.done ? '✅' : '⬜'} {i.text}{i.when && <span className="text-xs text-muted">（{i.when}）</span>}</li>)}</ol>
              ) : <p className="mt-2 text-sm text-muted">本週尚未選擇。<Link to="/habits7/first#tool" className="underline">前往選擇</Link></p>}
              <h3 className="mt-4 text-sm font-medium text-muted">已建立的個人願景</h3>
              {data.lifeCompass.vision ? <p className="mt-1 line-clamp-4 font-serif text-sm leading-relaxed">「{data.lifeCompass.vision}」{data.lifeCompass.keyword && <span className="chip ml-1">年度關鍵字：{data.lifeCompass.keyword}</span>}</p> : <p className="mt-1 text-sm text-muted">尚未建立。<Link to="/habits7/end#tool" className="underline">前往人生羅盤</Link></p>}
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-muted">21 天探索計畫</h3>
              <div className="mt-2"><ProgressBar label="探索計畫進度" value={pp.done} max={pp.total} /></div>
              {pp.started && pp.nextDay && <Link to={`/habits7/plan?day=${pp.nextDay}`} className="mt-2 inline-block text-sm text-accent underline">繼續第 {pp.nextDay} 天 →</Link>}
              <h3 className="mt-4 text-sm font-medium text-muted">自我更新紀錄（最近 7 天）</h3>
              <p className="mt-1 text-sm">休息與恢復 {restWeek.length} 次（共 {restWeek.reduce((s, r) => s + r.minutes, 0)} 分鐘）・四維習慣完成 {habitWeek} 次</p>
            </Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="font-serif font-bold">四維成長自我評估</h3>
              {radar.count === 0 ? <div className="mt-3"><EmptyState title="還沒有每週自評" action={<Link to="/habits7/renew#tool" className="btn-secondary btn-sm">進行自評</Link>} /></div> : (
                <>
                  <div className="h-56">
                    <ResponsiveContainer>
                      <RadarChart data={radar.rows} outerRadius="70%">
                        <PolarGrid stroke="rgb(var(--line))" />
                        <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: 'rgb(var(--ink))' }} />
                        <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                        <Radar name="本次" dataKey="本次" stroke="#36594B" fill="#36594B" fillOpacity={0.35} isAnimationActive={false} />
                        {radar.prev && <Radar name="上次" dataKey="上次" stroke="#C9A88A" fill="#C9A88A" fillOpacity={0.15} isAnimationActive={false} />}
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted">最新一次：{radar.latest && formatDate(radar.latest.weekKey)} 這週（自評 1–10，共 {radar.count} 週）</p>
                </>
              )}
            </Card>
            <Card>
              <h3 className="font-serif font-bold">最近的實踐反思</h3>
              {reflections.length === 0 ? <p className="mt-2 text-sm text-muted">在章節、21 天計畫或每週自評中寫下反思後，會顯示在這裡。</p> : (
                <ul className="mt-2 space-y-2">{reflections.map((r) => <li key={r.id} className="rounded-xl bg-soft/50 p-2.5 text-sm"><p className="text-xs text-muted">{r.title}{r.at && ` · ${formatDateTime(r.at)}`}</p><p className="line-clamp-2">{r.text}</p></li>)}</ul>
              )}
            </Card>
          </div>
        </>
      )}
    </section>
  );
}
