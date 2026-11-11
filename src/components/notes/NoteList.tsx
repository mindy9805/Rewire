/** 筆記清單：顯示、編輯、刪除（刪除前確認） */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Bookmark, PenLine } from 'lucide-react';
import type { Note } from '../../types';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { EmptyState } from '../ui/basics';
import NoteEditor from './NoteEditor';
import { chapterLabel } from '../../content/chapters';
import { formatDateTime } from '../../lib/date';
import { nowIso } from '../../lib/id';

export default function NoteList({ notes, emptyText, showChapter = false }: { notes: Note[]; emptyText: string; showChapter?: boolean }) {
  const { upsert, remove } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<string | null>(null);
  if (!notes.length) return <EmptyState title="目前沒有筆記" desc={emptyText} />;
  return (
    <ul className="space-y-3">
      {notes.map((n) => (
        <li key={n.id} className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2 text-xs text-muted">
            {n.kind === 'highlight' ? <Bookmark className="h-3.5 w-3.5 text-accent" aria-hidden /> : <PenLine className="h-3.5 w-3.5 text-accent" aria-hidden />}
            <span>{n.kind === 'highlight' ? '收藏重點' : '個人反思'}</span>
            {showChapter && n.chapterId !== 'general' && <Link to={`/learn/${n.chapterId}`} className="underline">{chapterLabel(n.chapterId)}</Link>}
            <span className="ml-auto">{formatDateTime(n.updatedAt)}</span>
          </div>
          {editing === n.id ? (
            <div className="mt-3">
              <NoteEditor initial={n.content} initialTags={n.tags} submitText="儲存修改" onCancel={() => setEditing(null)} onSubmit={(content, tags) => {
                upsert('notes', { ...n, content, tags, updatedAt: nowIso() });
                setEditing(null);
                toast('已更新筆記');
              }} />
            </div>
          ) : (
            <>
              {n.source && <p className="mt-2 text-sm font-medium text-accent">{n.source}</p>}
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{n.content}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {n.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
                <span className="ml-auto flex">
                  <button className="icon-btn" aria-label="編輯筆記" onClick={() => setEditing(n.id)}><Pencil className="h-4 w-4" aria-hidden /></button>
                  <button className="icon-btn" aria-label="刪除筆記" onClick={async () => { if (await confirm({ title: '刪除這則筆記？', message: '刪除後無法復原。', confirmText: '刪除', danger: true })) { remove('notes', n.id); toast('已刪除筆記'); } }}><Trash2 className="h-4 w-4" aria-hidden /></button>
                </span>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
