/**
 * 儀表板：輕鬆探索與自願參與
 * 自願參與的練習次數、最常探索的主題、最喜歡的互動形式、累積收藏、已完成的小冒險、個人反思紀錄。
 * 全部依「共用活動紀錄」計算（定義見 lib/activity.ts），不產生大腦升級、心理健康等沒有依據的分數。
 */
import { Link } from 'react-router-dom';
import { useStore } from '../../store/AppStore';
import { Card, EmptyState } from '../ui/basics';
import { activitySummary, collectActivity, KIND_LABEL, THEME_LABEL } from '../../lib/activity';
import { questMap } from '../../content/play';
import { formatDate } from '../../lib/date';

export default function PlayDashboard() {
  const { data } = useStore();
  const events = collectActivity(data);
  const s = activitySummary(events);
  const collected = Object.keys(data.unlocks).filter((k) => k.startsWith('badge:')).length + data.savedCards.length;
  const reflections = events.filter((e) => e.kind === 'reflect').length;
  const recentQuests = [...data.questLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  return (
    <section aria-labelledby="play-dash" className="space-y-3">
      <h2 id="play-dash" className="font-serif text-xl font-bold">自願參與與輕鬆探索</h2>
      {s.total === 0 ? (
        <EmptyState title="還沒有任何紀錄" desc="隨時都可以從一個 30 秒的小冒險開始。" action={<Link to="/play/quest" className="btn-primary btn-sm">今日輕冒險</Link>} />
      ) : (
        <Card>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div><dt className="text-xs text-muted">自願參與的練習</dt><dd className="font-display text-2xl font-bold">{s.total}<span className="ml-1 text-sm font-normal text-muted">筆・{s.activeDays} 天</span></dd></div>
            <div><dt className="text-xs text-muted">最常探索的主題</dt><dd className="font-serif text-lg font-bold">{s.topTheme ? THEME_LABEL[s.topTheme[0] as keyof typeof THEME_LABEL] : '—'}</dd></div>
            <div><dt className="text-xs text-muted">最喜歡的互動形式</dt><dd className="font-serif text-lg font-bold">{s.topKind ? KIND_LABEL[s.topKind[0] as keyof typeof KIND_LABEL] : '—'}</dd></div>
            <div><dt className="text-xs text-muted">累積收藏（徽章＋小卡）</dt><dd className="font-display text-2xl font-bold">{collected}</dd></div>
            <div><dt className="text-xs text-muted">已完成的小冒險</dt><dd className="font-display text-2xl font-bold">{data.questLogs.length}</dd></div>
            <div><dt className="text-xs text-muted">個人反思紀錄</dt><dd className="font-display text-2xl font-bold">{reflections}</dd></div>
          </dl>
          {recentQuests.length > 0 && (
            <ul className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
              {recentQuests.map((q) => <li key={q.id}>🧭 {formatDate(q.date)}・{questMap[q.questId]?.title}{q.note && <span className="text-muted">：{q.note}</span>}</li>)}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">「自願參與的練習」＝你實際保存的每一筆練習或紀錄（同一筆編輯不重複計算，瀏覽與抽卡本身不計入）。這些數字只是回顧，不是評分。</p>
        </Card>
      )}
    </section>
  );
}
