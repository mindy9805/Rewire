/**
 * 儀表板：Break the Pattern 資料區
 * 1 目前正在練習的習慣  2 已完成的行動實驗  3 每週微承諾完成情況  4 七大習慣自我評估變化
 * 5 最常出現的觸發情境  6 個人反思紀錄  7 已建立的替代行動  8 下次可嘗試的小步驟
 * 全部依使用者實際紀錄計算；沒有資料時顯示空狀態，不產生任何虛構分數。
 */
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../../store/AppStore';
import { Card, EmptyState } from '../ui/basics';
import { patternHabits, patternMap } from '../../content/breakPattern';
import { assessmentTrend, commitmentRate, commitmentWeek, experimentsByHabit, nextSmallSteps, patternChallengeDone, topTriggers } from '../../lib/pattern';
import { formatDateTime, shortDate } from '../../lib/date';

const tooltipStyle = { background: 'rgb(var(--surface))', border: '1px solid rgb(var(--line))', borderRadius: 12, fontSize: 12 };
const axis = { fontSize: 11, fill: 'rgb(var(--muted))' };
const LINE_COLORS = ['#36594B', '#A8BBA3', '#C9A88A', '#7E9C8C', '#9FB3C8', '#D9A28F', '#5E7F70'];

export default function PatternDashboard() {
  const { data } = useStore();
  const pc = data.patternChallenge;
  const current = [...new Set([...(pc.status !== 'none' && pc.activeHabitId ? [pc.activeHabitId] : []), ...data.patternFocus])];
  const experiments = experimentsByHabit(data);
  const expTotal = data.counterChoices.length;
  const week = commitmentWeek(data.commitmentLogs);
  const rate = commitmentRate(data.commitmentLogs);
  const trend = assessmentTrend(data.patternAssessments);
  const triggers = topTriggers(data);
  const reflections = [
    ...data.patternEntries.map((e) => ({
      id: e.id,
      at: e.updatedAt,
      habit: patternMap[e.habitId]?.short ?? '',
      text: e.kind === 'validation' ? `${e.decision}：${e.balance || e.wanted}` : e.kind === 'quiet' ? [e.thoughts, e.feelings, e.need].filter(Boolean).join('／') : e.kind === 'environment' ? `${e.label}${e.note ? `：${e.note}` : ''}` : e.kind === 'choice' ? `${e.want} → ${e.next || e.compromise}` : e.kind === 'spending' ? `${e.item}（冷靜期至 ${e.coolUntil}）` : `${e.task}`,
    })),
    ...data.notes.filter((n) => n.tags.includes('打破慣性')).map((n) => ({ id: n.id, at: n.updatedAt, habit: n.source?.replace('打破慣性：', '') ?? '', text: n.content })),
  ].filter((r) => r.text.trim()).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  const alternatives = [
    ...data.workshops.filter((w) => w.alternative).map((w) => ({ id: w.id, habit: patternMap[w.habitId].short, text: w.alternative })),
    ...data.microCommitments.map((m) => ({ id: m.id, habit: m.habitId === 'general' ? '' : patternMap[m.habitId]?.short ?? '', text: m.text })),
  ];
  const steps = nextSmallSteps(data);
  const hasAny = current.length || expTotal || data.commitmentLogs.length || trend.length || triggers.length || reflections.length || alternatives.length;

  return (
    <section aria-labelledby="bp-dash" className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <h2 id="bp-dash" className="font-serif text-xl font-bold">Break the Pattern｜打破慣性</h2>
        <Link to="/pattern" className="ml-auto text-sm text-accent underline">前往模組</Link>
      </div>
      {!hasAny ? (
        <EmptyState title="還沒有打破慣性的紀錄" desc="選擇想調整的習慣、完成自我評估或使用任一工具後，這裡會顯示你的真實進展。" action={<Link to="/pattern" className="btn-primary btn-sm">開始探索</Link>} />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <h3 className="text-sm font-medium text-muted">1. 目前正在練習的習慣</h3>
              {current.length ? (
                <ul className="mt-2 space-y-1.5">
                  {current.map((id) => (
                    <li key={id} className="text-sm">
                      <Link to={`/pattern/${id}`} className="font-medium text-accent underline">{patternMap[id].short}</Link>
                      {pc.activeHabitId === id && pc.status !== 'none' && <span className="ml-1 text-xs text-muted">· 14 天挑戰 {patternChallengeDone(data, id)}/14{pc.status === 'paused' ? '（暫停中）' : ''}</span>}
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-sm text-muted">尚未選擇</p>}
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-muted">2. 已完成的行動實驗</h3>
              <p className="mt-1 font-display text-3xl font-bold">{expTotal}</p>
              <ul className="mt-1 flex flex-wrap gap-1">{experiments.filter((e) => e.次數).map((e) => <li key={e.habitId} className="chip">{e.short} × {e.次數}</li>)}</ul>
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-muted">3. 本週微承諾</h3>
              {rate ? <p className="mt-1"><span className="font-display text-3xl font-bold">{rate.done}</span><span className="text-sm text-muted"> / {rate.total} 筆紀錄完成（{rate.pct}%）</span></p> : <p className="mt-1 text-sm text-muted">本週尚無微承諾紀錄</p>}
              <p className="mt-1 text-xs text-muted">完成率只反映紀錄，不代表你的價值；中斷也是有用的資訊。</p>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="font-serif font-bold">每週微承諾完成情況</h3>
              {data.commitmentLogs.length === 0 ? <div className="mt-3"><EmptyState title="還沒有微承諾紀錄" action={<Link to="/pattern/promises#tool" className="btn-secondary btn-sm">建立微承諾</Link>} /></div> : (
                <div className="mt-2 h-56">
                  <ResponsiveContainer>
                    <BarChart data={week.map((w) => ({ ...w, date: shortDate(w.date) }))} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                      <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={axis} />
                      <YAxis allowDecimals={false} tick={axis} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgb(var(--soft))' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="完成" stackId="c" fill="#36594B" isAnimationActive={false} />
                      <Bar dataKey="中斷" stackId="c" fill="#E8CCB2" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
            <Card>
              <h3 className="font-serif font-bold">七大習慣自我評估變化</h3>
              {trend.length === 0 ? <div className="mt-3"><EmptyState title="還沒有評估紀錄" action={<Link to="/pattern/assessment" className="btn-secondary btn-sm">進行評估</Link>} /></div> : (
                <>
                  <div className="mt-2 h-56">
                    <ResponsiveContainer>
                      <LineChart data={trend.map((r) => ({ ...r, date: shortDate(String(r.date)) }))} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                        <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={axis} />
                        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={axis} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {patternHabits.map((h, i) => <Line key={h.id} dataKey={h.short} stroke={LINE_COLORS[i]} strokeWidth={2} dot isAnimationActive={false} />)}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted">數值為自我回報的頻率（1 幾乎沒有 ～ 5 幾乎總是），{trend.length === 1 ? '完成第二次評估後即可看到變化。' : '僅供自我反思，不是診斷。'}</p>
                </>
              )}
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="font-serif font-bold">最常出現的觸發情境</h3>
              {triggers.length === 0 ? <p className="mt-2 text-sm text-muted">在工作坊「理解觸發」或習慣偵探中記錄後，會顯示在這裡。</p> : (
                <ul className="mt-2 space-y-1.5">
                  {triggers.map(([t, n]) => (
                    <li key={t} className="flex items-center gap-2 text-sm">
                      <span className="w-28 shrink-0 truncate">{t}</span>
                      <span className="h-2 flex-1 rounded-full bg-soft" aria-hidden><span className="block h-full rounded-full bg-accent" style={{ width: `${(n / triggers[0][1]) * 100}%` }} /></span>
                      <span className="w-10 text-right text-xs text-muted">{n} 次</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <h3 className="font-serif font-bold">個人反思紀錄</h3>
              {reflections.length === 0 ? <p className="mt-2 text-sm text-muted">尚無反思紀錄。</p> : (
                <ul className="mt-2 space-y-2">{reflections.map((r) => <li key={r.id} className="rounded-xl bg-soft/50 p-2.5 text-sm"><p className="text-xs text-muted">{r.habit} · {formatDateTime(r.at)}</p><p className="line-clamp-2">{r.text}</p></li>)}</ul>
              )}
            </Card>
            <Card>
              <h3 className="font-serif font-bold">已建立的替代行動</h3>
              {alternatives.length === 0 ? <p className="mt-2 text-sm text-muted">在工作坊或微承諾追蹤器建立後會顯示在這裡。</p> : (
                <ul className="mt-2 space-y-1.5">{alternatives.slice(0, 8).map((a) => <li key={a.id} className="text-sm">・{a.text}{a.habit && <span className="ml-1 text-xs text-muted">（{a.habit}）</span>}</li>)}</ul>
              )}
            </Card>
            <Card>
              <h3 className="font-serif font-bold">下次可嘗試的小步驟</h3>
              {steps.length === 0 ? <p className="mt-2 text-sm text-muted">建立探索地圖、微承諾或工作坊後，這裡會提醒你下一步。</p> : (
                <ul className="mt-2 space-y-1.5">{steps.map((s) => <li key={s.text}><Link to={s.to} className="text-sm underline decoration-line hover:text-accent">→ {s.text}</Link></li>)}</ul>
              )}
            </Card>
          </div>
        </>
      )}
    </section>
  );
}
