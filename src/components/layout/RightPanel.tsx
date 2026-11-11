/**
 * 右側可收合面板（xl 以上顯示）
 * - 在章節頁：顯示本章完成狀態、測驗成績、本章收藏重點與快速筆記。
 * - 其他頁面：顯示整體學習進度與最近的筆記。
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, PenLine } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { chapterMap } from '../../content/chapters';
import { chapterStats, challengeStats, dailyStats } from '../../lib/stats';
import { ProgressBar } from '../ui/basics';
import { useToast } from '../ui/Toast';
import { nowIso, uid } from '../../lib/id';
import type { ChapterId } from '../../types';

export default function RightPanel() {
  const { data, upsert } = useStore();
  const toast = useToast();
  const { pathname } = useLocation();
  const [text, setText] = useState('');
  const match = pathname.match(/^\/learn\/(ch\d)$/);
  const chapter = match ? chapterMap[match[1] as ChapterId] : undefined;

  const cs = chapterStats(data);
  const ch = challengeStats(data);
  const ds = dailyStats(data);
  const notes = chapter ? data.notes.filter((n) => n.chapterId === chapter.id) : data.notes.slice(0, 5);

  const addNote = () => {
    if (!text.trim()) return;
    const t = nowIso();
    upsert('notes', { id: uid(), chapterId: chapter?.id ?? 'general', kind: 'reflection', content: text.trim(), tags: [], createdAt: t, updatedAt: t });
    setText('');
    toast('已儲存筆記');
  };

  return (
    <aside aria-label="重點筆記與學習進度" className="sticky top-[4.125rem] hidden h-[calc(100vh-4.125rem)] w-72 shrink-0 overflow-y-auto border-l border-line/70 px-5 py-6 xl:block">
      <h2 className="font-display text-xs uppercase tracking-[0.2em] text-muted">Progress</h2>
      <div className="mt-3 space-y-3">
        <ProgressBar label="章節完成" value={cs.completed} max={cs.total} />
        <ProgressBar label="14 天挑戰" value={ch.done} max={ch.total} />
        <p className="text-xs text-muted">Daily Rewire 累計 {ds.totalDays} 天</p>
      </div>

      {chapter && (
        <div className="mt-6 rounded-xl bg-soft/60 p-3 text-xs leading-relaxed">
          <p className="font-medium text-ink">第 {chapter.number} 章</p>
          <p>{data.chapters[chapter.id]?.completed ? '✓ 已標記完成' : '尚未標記完成'}</p>
          <p>{data.quizzes[chapter.id] ? `測驗：${data.quizzes[chapter.id]!.score}/${data.quizzes[chapter.id]!.total}` : '測驗：尚未作答'}</p>
        </div>
      )}

      <h2 className="mt-8 flex items-center gap-1.5 font-display text-xs uppercase tracking-[0.2em] text-muted">
        <Bookmark className="h-3.5 w-3.5" aria-hidden />
        {chapter ? '本章筆記' : '最近筆記'}
      </h2>
      {notes.length === 0 ? (
        <p className="mt-2 text-xs text-muted">{chapter ? '點擊段落旁的書籤即可收藏重點。' : '還沒有筆記。'}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {notes.slice(0, 8).map((n) => (
            <li key={n.id} className="rounded-xl border border-line bg-surface p-2.5 text-xs leading-relaxed">
              {n.source && <p className="mb-0.5 font-medium text-accent">{n.source}</p>}
              <p className="line-clamp-4">{n.content}</p>
            </li>
          ))}
        </ul>
      )}
      <Link to="/journal?tab=notes" className="mt-2 inline-block text-xs text-accent underline">
        管理全部筆記
      </Link>

      <div className="mt-6">
        <label htmlFor="quick-note" className="flex items-center gap-1.5 text-xs font-medium">
          <PenLine className="h-3.5 w-3.5" aria-hidden /> 快速筆記
        </label>
        <textarea id="quick-note" value={text} onChange={(e) => setText(e.target.value)} rows={3} className="field mt-1.5 text-sm" placeholder={chapter ? '寫下本章的想法…' : '寫下此刻的想法…'} />
        <button className="btn-primary btn-sm mt-2 w-full" onClick={addNote} disabled={!text.trim()}>
          儲存筆記
        </button>
      </div>
    </aside>
  );
}
