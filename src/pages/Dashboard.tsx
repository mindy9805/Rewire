/**
 * 學習進度儀表板
 * 所有統計都由使用者實際輸入的資料計算；無資料時顯示空狀態，不產生假成績。
 */
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BookOpen, ListChecks, CalendarCheck, Sparkles, Award, Lock } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { chapterStats, challengeStats, dailyStats, milestones, moodTrend, practiceFrequency } from '../lib/stats';
import PatternDashboard from '../components/pattern/PatternDashboard';
import H7Dashboard from '../components/habits7/H7Dashboard';
import PlayDashboard from '../components/play/PlayDashboard';
import Hideable from '../components/ui/Hideable';
import { Card, EmptyState, SectionTitle, MOODS } from '../components/ui/basics';
import { affirmationMap } from '../content/dailyRewire';
import { chapterLabel } from '../content/chapters';
import { shortDate, formatDate, formatDateTime } from '../lib/date';
import { planText } from '../components/interactive/IfThenPlanner';

const tooltipStyle = { background: 'rgb(var(--surface))', border: '1px solid rgb(var(--line))', borderRadius: 12, fontSize: 12 };
const axis = { fontSize: 11, fill: 'rgb(var(--muted))' };

function Stat({ icon: Icon, label, value, sub }: { icon: typeof BookOpen; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <Icon className="h-5 w-5 text-accent" aria-hidden />
      <p className="mt-2 text-xs text-muted">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { data } = useStore();
  const cs = chapterStats(data);
  const ch = challengeStats(data);
  const ds = dailyStats(data);
  const freq = practiceFrequency(data);
  const mood = moodTrend(data);
  const moodWeek = moodTrend(data, 7);
  const ms = milestones(data);
  const recent = [
    ...data.journal.map((j) => ({ id: j.id, at: j.updatedAt, title: j.title || '反思日誌', text: j.content, where: '日誌' })),
    ...data.notes.filter((n) => n.kind === 'reflection').map((n) => ({ id: n.id, at: n.updatedAt, title: n.source || '個人反思', text: n.content, where: chapterLabel(n.chapterId) })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);

  return (
    <div className="space-y-8 motion-safe:animate-fade-up">
      <SectionTitle eyebrow="Dashboard" title="學習進度儀表板" desc="所有數字都來自你在這台裝置上留下的真實紀錄，只用來回顧，不是評分。任何區塊都可以按右上角的眼睛圖示隱藏。" />

      <Hideable id="play" title="自願參與與輕鬆探索">
        <PlayDashboard />
      </Hideable>

      <Hideable id="overview" title="學習概覽">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={BookOpen} label="已完成章節" value={`${cs.completed}/${cs.total}`} />
        <Stat icon={ListChecks} label="已完成測驗" value={`${cs.quizDone}/9`} sub={cs.quizDone ? `平均答對率 ${cs.quizAvg}%` : '尚未作答'} />
        <Stat icon={CalendarCheck} label="14 天挑戰" value={`${ch.done}/14`} />
        <Stat icon={Sparkles} label="每日心智練習" value={`${ds.totalDays} 天`} sub={`累計完成 ${ds.totalSessions} 次`} />
      </div>
      </Hideable>

      <Hideable id="daily" title="每日心智練習">
      {/* Daily Rewire 統計 */}
      <Card>
        <h2 className="font-serif text-lg font-bold">每日心智練習 Daily Rewire</h2>
        {ds.totalDays === 0 && data.dailyLogs.length === 0 ? (
          <div className="mt-4"><EmptyState title="還沒有每日練習紀錄" action={<Link to="/daily/read" className="btn-primary btn-sm">開始今日練習</Link>} /></div>
        ) : (
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted">最近七天練習情況</p>
              <div className="mt-2 flex gap-2">
                {ds.week.map((w) => (
                  <span key={w.date} className="flex flex-col items-center gap-1 text-[10px] text-muted">
                    <span className={`h-7 w-7 rounded-full ${w.done ? 'bg-accent' : 'border border-line'}`} role="img" aria-label={`${w.date}：${w.done ? '已完成' : '未練習'}`} />
                    {shortDate(w.date)}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted">最常選擇的心智語句</p>
              <p className="font-serif font-bold">{ds.topId ? `「${affirmationMap[ds.topId].text}」· ${ds.topCount} 次` : '尚未選擇'}</p>
            </div>
            <div>
              <p className="text-xs text-muted">最近一次反思</p>
              {ds.latest ? (
                <div className="mt-1 rounded-xl bg-soft/60 p-3 text-sm">
                  <p className="text-xs text-muted">{formatDate(ds.latest.date)}</p>
                  {ds.latest.why && <p className="mt-1">{ds.latest.why}</p>}
                  {ds.latest.action && <p className="mt-1">小行動：{ds.latest.action}</p>}
                </div>
              ) : <p className="mt-1 text-sm text-muted">尚無反思內容</p>}
              <p className="mt-4 text-xs text-muted">本週情緒紀錄</p>
              {moodWeek.hasData ? (
                <div className="mt-1 flex gap-2">
                  {moodWeek.rows.map((r) => {
                    const m = r.心情 ? MOODS.find((x) => x.v === Math.round(r.心情!)) : null;
                    return <span key={r.date} className="flex flex-col items-center text-[10px] text-muted"><span className="text-lg" role="img" aria-label={`${r.date}：${m ? m.label : '無紀錄'}`}>{m ? m.emoji : '·'}</span>{shortDate(r.date)}</span>;
                  })}
                </div>
              ) : <p className="mt-1 text-sm text-muted">本週尚無情緒紀錄</p>}
            </div>
          </div>
        )}
      </Card>
      </Hideable>

      <Hideable id="charts" title="練習頻率與情緒趨勢">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-lg font-bold">習慣練習頻率（近 14 天）</h2>
          {freq.total === 0 ? (
            <div className="mt-4"><EmptyState title="還沒有練習紀錄" desc="使用習慣偵探、情緒命名、呼吸練習、打破慣性工具或完成挑戰後，這裡會顯示每天的練習次數。" /></div>
          ) : (
            <div className="mt-3 h-64">
              <ResponsiveContainer>
                <BarChart data={freq.rows.map((r) => ({ ...r, date: shortDate(r.date) }))} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={axis} interval={1} />
                  <YAxis allowDecimals={false} tick={axis} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgb(var(--soft))' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="習慣紀錄" stackId="a" fill="#36594B" isAnimationActive={false} />
                  <Bar dataKey="情緒命名" stackId="a" fill="#A8BBA3" isAnimationActive={false} />
                  <Bar dataKey="呼吸練習" stackId="a" fill="#E8CCB2" isAnimationActive={false} />
                  <Bar dataKey="每日語句" stackId="a" fill="#7E9C8C" isAnimationActive={false} />
                  <Bar dataKey="挑戰" stackId="a" fill="#C9A88A" isAnimationActive={false} />
                  <Bar dataKey="打破慣性" stackId="a" fill="#5E7F70" isAnimationActive={false} />
                  <Bar dataKey="7 習慣" stackId="a" fill="#9FB3C8" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <h2 className="font-serif text-lg font-bold">情緒紀錄趨勢（近 14 天）</h2>
          {!mood.hasData ? (
            <div className="mt-4"><EmptyState title="還沒有情緒紀錄" desc="在日誌、每日練習填寫心情，或使用情緒命名工具後，這裡會顯示趨勢。" /></div>
          ) : (
            <div className="mt-3 h-64">
              <ResponsiveContainer>
                <LineChart data={mood.rows.map((r) => ({ ...r, date: shortDate(r.date) }))} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={axis} interval={1} />
                  <YAxis yAxisId="m" domain={[1, 5]} tick={axis} />
                  <YAxis yAxisId="i" orientation="right" domain={[0, 10]} hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="m" dataKey="心情" name="心情（1–5）" stroke="#36594B" strokeWidth={2.5} connectNulls isAnimationActive={false} />
                  <Line yAxisId="i" dataKey="情緒強度" name="情緒強度（1–10）" stroke="#C9A88A" strokeDasharray="5 4" connectNulls isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
      </Hideable>

      <Hideable id="pattern" title="打破慣性">
      <PatternDashboard />
      </Hideable>

      <Hideable id="habits7" title="7 Habits">
      <H7Dashboard />
      </Hideable>

      <Hideable id="reflections" title="反思與計畫">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-lg font-bold">最近的反思筆記</h2>
          {recent.length === 0 ? <div className="mt-4"><EmptyState title="還沒有反思筆記" action={<Link to="/journal" className="btn-secondary btn-sm">寫第一篇日誌</Link>} /></div> : (
            <ul className="mt-3 space-y-2">
              {recent.map((r) => (
                <li key={r.id} className="rounded-xl bg-soft/50 p-3 text-sm">
                  <p className="text-xs text-muted">{r.where} · {formatDateTime(r.at)}</p>
                  <p className="font-medium">{r.title}</p>
                  <p className="line-clamp-2 text-muted">{r.text}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-serif text-lg font-bold">已建立的 If-Then 計畫（{data.plans.length}）</h2>
          {data.plans.length === 0 ? <div className="mt-4"><EmptyState title="還沒有行動計畫" action={<Link to="/lab/if-then" className="btn-secondary btn-sm">建立計畫</Link>} /></div> : (
            <ul className="mt-3 space-y-2">
              {data.plans.slice(0, 5).map((p) => <li key={p.id} className="whitespace-pre-line rounded-xl bg-soft/50 p-3 text-sm">{planText(p)}</li>)}
            </ul>
          )}
        </Card>
      </div>
      </Hideable>

      <Hideable id="milestones" title="學習里程碑">
      <Card>
        <h2 className="font-serif text-lg font-bold">個人學習里程碑（{ms.filter((m) => m.achieved).length}/{ms.length}）</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ms.map((m) => (
            <li key={m.id} className={`rounded-2xl border p-3 text-sm ${m.achieved ? 'border-accent/40 bg-soft' : 'border-dashed border-line text-muted'}`}>
              {m.achieved ? <Award className="h-5 w-5 text-accent" aria-hidden /> : <Lock className="h-5 w-5" aria-hidden />}
              <p className="mt-1 font-medium">{m.label}</p>
              <p className="text-xs">{m.desc}</p>
              <span className="sr-only">{m.achieved ? '已達成' : '尚未達成'}</span>
            </li>
          ))}
        </ul>
      </Card>
      </Hideable>
    </div>
  );
}
