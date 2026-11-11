/**
 * 個人反思日誌與章節筆記
 * - 日誌：新增、編輯、刪除（確認）、搜尋、標籤篩選、匯出
 * - 筆記：搜尋、依章節／類型／標籤篩選、編輯、刪除、匯出
 */
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Trash2, Download, Plus, Search } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import { useConfirm } from '../components/ui/Confirm';
import { EmptyState, MoodPicker, MOODS, SectionTitle, TagInput, TextArea, TextField } from '../components/ui/basics';
import NoteList from '../components/notes/NoteList';
import { chapters } from '../content/chapters';
import { formatDate, toDateKey } from '../lib/date';
import { nowIso, uid } from '../lib/id';
import { downloadText } from '../lib/clipboard';
import { journalToMarkdown, notesToMarkdown, stamp } from '../lib/exporters';
import type { JournalEntry } from '../types';

type Draft = Pick<JournalEntry, 'date' | 'title' | 'content' | 'mood' | 'tags'>;
const newDraft = (): Draft => ({ date: toDateKey(), title: '', content: '', mood: 0, tags: [] });

function JournalTab({ initialQ }: { initialQ: string }) {
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [draft, setDraft] = useState<Draft>(newDraft);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [q, setQ] = useState(initialQ);
  const [tag, setTag] = useState('');
  const allTags = [...new Set(data.journal.flatMap((j) => j.tags))];
  const list = useMemo(
    () =>
      [...data.journal]
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
        .filter((j) => (!tag || j.tags.includes(tag)) && (!q.trim() || `${j.title} ${j.content} ${j.tags.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase()))),
    [data.journal, q, tag],
  );

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.content.trim()) return;
    const t = nowIso();
    upsert('journal', editing ? { ...editing, ...draft, updatedAt: t } : { id: uid(), ...draft, createdAt: t, updatedAt: t });
    toast(editing ? '已更新日誌' : '已新增日誌');
    setDraft(newDraft());
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      {!showForm ? (
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setDraft(newDraft()); }}><Plus className="h-4 w-4" aria-hidden />寫一篇日誌</button>
      ) : (
        <form onSubmit={save} className="space-y-3 rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <p className="font-serif font-bold">{editing ? '編輯日誌' : '新的日誌'}</p>
          <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <TextField label="日期" type="date" required value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
            <TextField label="標題（選填）" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="例如：今天第一次拒絕加班" />
          </div>
          <TextArea label="內容" required rows={6} value={draft.content} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} placeholder="今天發生了什麼？我注意到自己的什麼想法、情緒或行為？" />
          <MoodPicker value={draft.mood} onChange={(v) => setDraft((d) => ({ ...d, mood: v }))} />
          <TagInput value={draft.tags} onChange={(tags) => setDraft((d) => ({ ...d, tags }))} />
          <div className="flex gap-2">
            <button className="btn-primary" type="submit" disabled={!draft.content.trim()}>{editing ? '儲存修改' : '儲存日誌'}</button>
            <button className="btn-ghost" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>取消</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="j-search" className="sr-only">搜尋日誌</label>
          <input id="j-search" className="field pl-9" placeholder="搜尋日誌…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label htmlFor="j-tag" className="sr-only">依標籤篩選</label>
        <select id="j-tag" className="field sm:w-48" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">全部標籤</option>
          {allTags.map((t) => <option key={t} value={t}>#{t}</option>)}
        </select>
        <button className="btn-secondary" onClick={() => { downloadText(`rewire-journal-${stamp()}.md`, journalToMarkdown(data), 'text/markdown'); toast('已匯出日誌'); }} disabled={!data.journal.length}>
          <Download className="h-4 w-4" aria-hidden />匯出
        </button>
      </div>

      {data.journal.length === 0 ? (
        <EmptyState title="還沒有日誌" desc="寫下今天的一個小觀察，就是很好的開始。" />
      ) : list.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">沒有符合條件的日誌。</p>
      ) : (
        <ul className="space-y-3">
          {list.map((j) => {
            const m = MOODS.find((x) => x.v === j.mood);
            return (
              <li key={j.id} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted">{formatDate(j.date)}{m && ` · ${m.emoji} ${m.label}`}</p>
                    <p className="mt-1 font-serif text-lg font-bold">{j.title || '（未命名）'}</p>
                  </div>
                  <button className="icon-btn" aria-label="編輯日誌" onClick={() => { setEditing(j); setDraft({ date: j.date, title: j.title, content: j.content, mood: j.mood, tags: j.tags }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Pencil className="h-4 w-4" aria-hidden /></button>
                  <button className="icon-btn" aria-label="刪除日誌" onClick={async () => { if (await confirm({ title: '刪除這篇日誌？', message: '刪除後無法復原。', confirmText: '刪除', danger: true })) { remove('journal', j.id); toast('已刪除日誌'); } }}><Trash2 className="h-4 w-4" aria-hidden /></button>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{j.content}</p>
                {j.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{j.tags.map((t) => <button key={t} className="chip hover:bg-sage/40" onClick={() => setTag(t)}>#{t}</button>)}</div>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function NotesTab({ initialQ }: { initialQ: string }) {
  const { data } = useStore();
  const toast = useToast();
  const [q, setQ] = useState(initialQ);
  const [ch, setCh] = useState('');
  const [kind, setKind] = useState('');
  const [tag, setTag] = useState('');
  const allTags = [...new Set(data.notes.flatMap((n) => n.tags))];
  const list = data.notes.filter(
    (n) =>
      (!ch || n.chapterId === ch) &&
      (!kind || n.kind === kind) &&
      (!tag || n.tags.includes(tag)) &&
      (!q.trim() || `${n.content} ${n.source ?? ''} ${n.tags.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase())),
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="n-search" className="sr-only">搜尋筆記</label>
          <input id="n-search" className="field pl-9" placeholder="搜尋筆記…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label htmlFor="n-ch" className="sr-only">依章節篩選</label>
        <select id="n-ch" className="field" value={ch} onChange={(e) => setCh(e.target.value)}>
          <option value="">全部章節</option>
          {chapters.map((c) => <option key={c.id} value={c.id}>第 {c.number} 章 {c.title}</option>)}
          <option value="general">一般筆記</option>
        </select>
        <label htmlFor="n-kind" className="sr-only">依類型篩選</label>
        <select id="n-kind" className="field" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">全部類型</option>
          <option value="highlight">收藏重點</option>
          <option value="reflection">個人反思</option>
        </select>
        <label htmlFor="n-tag" className="sr-only">依標籤篩選</label>
        <select id="n-tag" className="field" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">全部標籤</option>
          {allTags.map((t) => <option key={t} value={t}>#{t}</option>)}
        </select>
      </div>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>共 {list.length} 則</span>
        <button className="btn-secondary btn-sm" disabled={!list.length} onClick={() => { downloadText(`rewire-notes-${stamp()}.md`, notesToMarkdown(data, list), 'text/markdown'); toast('已匯出筆記'); }}>
          <Download className="h-4 w-4" aria-hidden />匯出目前清單
        </button>
      </div>
      <NoteList notes={list} showChapter emptyText={data.notes.length ? '沒有符合條件的筆記。' : '在章節頁收藏段落、寫下反思，筆記就會集中在這裡。'} />
    </div>
  );
}

export default function Journal() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'notes' ? 'notes' : 'journal';
  const q = params.get('q') ?? '';
  return (
    <div className="motion-safe:animate-fade-up">
      <SectionTitle eyebrow="Journal" title="個人反思日誌" desc="記錄每天的觀察與感受，也管理你在各章節收藏的重點與反思。所有內容只存在這台裝置的瀏覽器中。" />
      <div role="tablist" aria-label="日誌與筆記" className="mb-6 inline-flex rounded-full border border-line bg-surface p-1">
        {(['journal', 'notes'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`rounded-full px-5 py-2 text-sm ${tab === t ? 'bg-accent text-onaccent' : 'text-ink'}`} onClick={() => setParams(t === 'notes' ? { tab: 'notes' } : {})}>
            {t === 'journal' ? '反思日誌' : '章節筆記'}
          </button>
        ))}
      </div>
      <div role="tabpanel">{tab === 'journal' ? <JournalTab initialQ={q} /> : <NotesTab initialQ={q} />}</div>
    </div>
  );
}
