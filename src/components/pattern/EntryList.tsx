/** 工具紀錄清單的共用外框：標題、刪除（確認）與空狀態 */
import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useConfirm } from '../ui/Confirm';
import { useToast } from '../ui/Toast';
import { formatDateTime } from '../../lib/date';
import type { CollectionKey } from '../../types';

export function DeleteButton({ collection, id, label }: { collection: CollectionKey; id: string; label: string }) {
  const { remove } = useStore();
  const confirm = useConfirm();
  const toast = useToast();
  return (
    <button className="icon-btn h-9 w-9 shrink-0" aria-label={`刪除${label}`} onClick={async () => { if (await confirm({ title: `刪除這筆${label}？`, message: '刪除後無法復原。', confirmText: '刪除', danger: true })) { remove(collection, id); toast('已刪除'); } }}>
      <Trash2 className="h-4 w-4" aria-hidden />
    </button>
  );
}

export function EntryCard({ title, at, children, actions }: { title: string; at: string; children: ReactNode; actions: ReactNode }) {
  return (
    <li className="rounded-2xl border border-line bg-surface p-4 text-sm">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{title}</p>
          <p className="text-xs text-muted">{formatDateTime(at)}</p>
        </div>
        {actions}
      </div>
      <div className="mt-2 space-y-1 leading-relaxed">{children}</div>
    </li>
  );
}
