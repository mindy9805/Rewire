/**
 * 習慣六工具：團隊合作思考板
 * 八個區塊的便利貼：新增、編輯、刪除、拖曳（或選單）移動；匯出 JSON／Markdown、匯入 JSON。
 * ⚠️ 本工具為「個人工作坊」，資料只存在本機；可透過匯出檔與他人分享，不具即時多人協作功能。
 */
import { useRef, useState } from 'react';
import { Download, Upload, Plus, X, ArrowLeft, FileText, GripVertical } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { EmptyState, TextField } from '../ui/basics';
import { boardZones } from '../../content/habits7';
import { nowIso, uid } from '../../lib/id';
import { formatDateTime } from '../../lib/date';
import { downloadText } from '../../lib/clipboard';
import type { BoardZone, TeamBoard } from '../../types';
import { DeleteButton } from '../pattern/EntryList';
import { draggable, dropZone } from './dnd';

const ZONE_IDS = boardZones.map((z) => z.id);

/** 匯出為 Markdown（方便貼到會議紀錄或訊息） */
export function boardToMarkdown(b: TeamBoard): string {
  return [`# ${b.title}`, '', ...boardZones.flatMap((z) => [`## ${z.title}`, ...(b.cards.filter((c) => c.zone === z.id).map((c) => `- ${c.text}`) || []), '']), `_匯出自 Rewire 團隊合作思考板・${formatDateTime(nowIso())}_`].join('\n');
}

/** 驗證匯入的思考板 JSON */
export function parseBoard(text: string): TeamBoard | null {
  try {
    const o = JSON.parse(text);
    const b = o?.app === 'rewire-board' ? o.board : null;
    if (!b || typeof b.title !== 'string' || !Array.isArray(b.cards)) return null;
    const cards = b.cards.filter((c: { zone?: string; text?: string }) => ZONE_IDS.includes(c?.zone as BoardZone) && typeof c?.text === 'string').map((c: { zone: BoardZone; text: string }) => ({ id: uid(), zone: c.zone, text: c.text.slice(0, 500) }));
    const t = nowIso();
    return { id: uid(), title: b.title.slice(0, 120) || '匯入的思考板', cards, createdAt: t, updatedAt: t };
  } catch {
    return null;
  }
}

function Board({ board, onBack }: { board: TeamBoard; onBack: () => void }) {
  const { data, upsert } = useStore();
  const toast = useToast();
  const b = data.teamBoards.find((x) => x.id === board.id) ?? board;
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [over, setOver] = useState<BoardZone | null>(null);
  const save = (cards: TeamBoard['cards']) => upsert('teamBoards', { ...b, cards, updatedAt: nowIso() });
  const move = (id: string, zone: BoardZone) => save(b.cards.map((c) => (c.id === id ? { ...c, zone } : c)));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-ghost btn-sm" onClick={onBack}><ArrowLeft className="h-4 w-4" aria-hidden />所有思考板</button>
        <h4 className="font-serif text-lg font-bold">{b.title}</h4>
        <span className="ml-auto flex gap-1">
          <button className="btn-secondary btn-sm" onClick={() => { downloadText(`board-${b.title}.json`, JSON.stringify({ app: 'rewire-board', version: 1, board: b }, null, 2), 'application/json'); toast('已匯出 JSON，可傳給夥伴匯入'); }}><Download className="h-4 w-4" aria-hidden />匯出 JSON</button>
          <button className="btn-secondary btn-sm" onClick={() => { downloadText(`board-${b.title}.md`, boardToMarkdown(b), 'text/markdown'); toast('已匯出 Markdown'); }}><FileText className="h-4 w-4" aria-hidden />匯出 Markdown</button>
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {boardZones.map((z) => (
          <section key={z.id} aria-label={z.title} {...dropZone((id) => move(id, z.id), (v) => setOver(v ? z.id : null))} className={`flex min-h-[9rem] flex-col rounded-2xl border border-line bg-soft/50 p-3 ${over === z.id ? 'ring-2 ring-accent' : ''}`}>
            <p className="text-sm font-medium">{z.title}</p>
            <ul className="mt-2 flex-1 space-y-1.5">
              {b.cards.filter((c) => c.zone === z.id).map((c, i) => (
                <li key={c.id} {...draggable(c.id)} className={`cursor-grab rounded-lg p-2 text-sm shadow-sm ${i % 2 ? 'bg-apricot/50' : 'bg-[#FFF6D9] dark:bg-[#4a4632]'} text-ink`}>
                  <label htmlFor={`card-${c.id}`} className="sr-only">便利貼內容</label>
                  <textarea id={`card-${c.id}`} className="w-full resize-none bg-transparent outline-none" rows={2} defaultValue={c.text} onBlur={(e) => e.target.value.trim() && e.target.value !== c.text && save(b.cards.map((x) => (x.id === c.id ? { ...x, text: e.target.value.trim() } : x)))} />
                  <div className="flex items-center gap-1">
                    <GripVertical className="drag-handle h-4 w-4 shrink-0 text-muted" aria-hidden />
                    <label htmlFor={`cz-${c.id}`} className="sr-only">移動便利貼到</label>
                    <select id={`cz-${c.id}`} className="flex-1 rounded border border-line bg-bg px-1 py-0.5 text-xs" value={c.zone} onChange={(e) => move(c.id, e.target.value as BoardZone)}>
                      {boardZones.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
                    </select>
                    <button className="rounded p-0.5 hover:bg-black/5" aria-label="刪除便利貼" onClick={() => { save(b.cards.filter((x) => x.id !== c.id)); toast('已刪除便利貼'); }}><X className="h-3.5 w-3.5" aria-hidden /></button>
                  </div>
                </li>
              ))}
            </ul>
            <form className="mt-2 flex gap-1" onSubmit={(e) => { e.preventDefault(); const t = (drafts[z.id] ?? '').trim(); if (!t) return; save([...b.cards, { id: uid(), zone: z.id, text: t }]); setDrafts((d) => ({ ...d, [z.id]: '' })); }}>
              <input className="field py-1.5 text-sm" aria-label={`在「${z.title}」新增便利貼`} value={drafts[z.id] ?? ''} onChange={(e) => setDrafts((d) => ({ ...d, [z.id]: e.target.value }))} placeholder="新增…" />
              <button className="icon-btn shrink-0" type="submit" aria-label={`加入「${z.title}」`}><Plus className="h-4 w-4" aria-hidden /></button>
            </form>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function TeamBoardTool() {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const file = useRef<HTMLInputElement>(null);
  const open = data.teamBoards.find((b) => b.id === openId);

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-soft/70 px-3 py-2 text-xs">這是個人工作坊工具：資料只存在你的瀏覽器，不會即時同步給其他人。想與夥伴分享時，請匯出 JSON 檔傳給對方，對方再用「匯入思考板」開啟。</p>
      {open ? <Board board={open} onBack={() => setOpenId(null)} /> : (
        <>
          <form className="flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; const t = nowIso(); const id = uid(); upsert('teamBoards', { id, title: title.trim(), cards: [], createdAt: t, updatedAt: t }); setTitle(''); setOpenId(id); toast('已建立思考板'); }}>
            <div className="flex-1"><TextField label="專案挑戰" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：社團迎新活動參加人數偏低" /></div>
            <button className="btn-primary" type="submit" disabled={!title.trim()}>建立思考板</button>
          </form>
          <div>
            <input ref={file} id="board-import" type="file" accept="application/json,.json" className="sr-only" onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              const b = parseBoard(await f.text());
              if (!b) { setErr('檔案格式不正確，請選擇由 Rewire 團隊合作思考板匯出的 JSON。'); return; }
              setErr('');
              upsert('teamBoards', b);
              toast('已匯入思考板');
              setOpenId(b.id);
            }} />
            <button className="btn-secondary btn-sm" onClick={() => file.current?.click()}><Upload className="h-4 w-4" aria-hidden />匯入思考板</button>
            {err && <p role="alert" className="mt-2 text-sm text-[#9B3D35] dark:text-[#E8A39A]">{err}</p>}
          </div>
          {data.teamBoards.length === 0 ? <EmptyState title="還沒有思考板" desc="輸入一個專案挑戰，開始整理不同觀點與方案。" /> : (
            <ul className="space-y-2">
              {data.teamBoards.map((b) => (
                <li key={b.id} className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-3 text-sm">
                  <button className="flex-1 text-left" onClick={() => setOpenId(b.id)}>
                    <span className="font-medium">{b.title}</span>
                    <span className="block text-xs text-muted">{b.cards.length} 張便利貼・更新於 {formatDateTime(b.updatedAt)}</span>
                  </button>
                  <button className="btn-secondary btn-sm" onClick={() => setOpenId(b.id)}>開啟</button>
                  <DeleteButton collection="teamBoards" id={b.id} label="思考板" />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
