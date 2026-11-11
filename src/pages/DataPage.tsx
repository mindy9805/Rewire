/**
 * 資料與隱私：本地儲存說明、完整備份（JSON）、Markdown 匯出、匯入還原（含格式驗證）、清除所有紀錄
 */
import { useRef, useState } from 'react';
import { Download, Upload, Trash2, ShieldCheck, FileText } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import { useConfirm } from '../components/ui/Confirm';
import { Card, SectionTitle } from '../components/ui/basics';
import { createBackup, validateBackup, COLLECTION_KEYS } from '../store/storage';
import { downloadText } from '../lib/clipboard';
import { allToMarkdown, stamp } from '../lib/exporters';

export default function DataPage() {
  const { data, replaceAll, resetAll } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const file = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const count = COLLECTION_KEYS.reduce((s, k) => s + (data[k] as unknown[]).length, 0) + Object.keys(data.challenge).length;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setImportMsg({ ok: false, text: '檔案超過 5MB，請確認是否為 Rewire 備份檔。' });
      return;
    }
    const result = validateBackup(await f.text());
    if (!result.ok) {
      setImportMsg({ ok: false, text: result.error });
      toast('匯入失敗：格式不正確', 'error');
      return;
    }
    const yes = await confirm({ title: '用備份檔取代目前資料？', message: `備份內容：${result.summary}\n目前瀏覽器中的紀錄將被取代，建議先匯出一份目前的備份。`, confirmText: '確認還原' });
    if (!yes) return;
    replaceAll({ ...result.data, settings: { ...result.data.settings, storageNoticeDismissed: true } });
    setImportMsg({ ok: true, text: `還原成功！${result.summary}` });
    toast('已從備份還原資料');
  };

  const clearAll = async () => {
    const yes = await confirm({ title: '確定清除所有紀錄？', message: '將刪除所有筆記、日誌、練習、挑戰與每日紀錄（外觀設定會保留）。此操作無法復原，建議先匯出備份。', confirmText: '我了解，清除全部', danger: true });
    if (!yes) return;
    resetAll();
    toast('已清除所有紀錄', 'info');
  };

  return (
    <div className="space-y-6 motion-safe:animate-fade-up">
      <SectionTitle eyebrow="Data & Privacy" title="資料與隱私" desc="Rewire 沒有帳號、沒有後端伺服器。你的所有紀錄都只保存在這台裝置的瀏覽器（LocalStorage）。" />
      <Card>
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold"><ShieldCheck className="h-5 w-5 text-accent" aria-hidden />本地儲存說明</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
          <li>個人反思、情緒紀錄、練習內容與行動計畫，<strong>不會自動傳送到任何第三方服務</strong>。</li>
          <li>網站僅從 Google Fonts 下載字型檔，不會傳送你的任何輸入內容。</li>
          <li><strong>以下情況可能導致紀錄遺失：</strong>清除瀏覽器網站資料、更換裝置或瀏覽器、使用無痕模式、瀏覽器自動清理長期未使用的網站資料。</li>
          <li>建議每週匯出一次完整備份（JSON），存到雲端硬碟或電腦中。</li>
        </ul>
        <p className="mt-3 text-sm text-muted">目前共有 {count} 筆紀錄。</p>
      </Card>
      <Card>
        <h2 className="font-serif text-lg font-bold">匯出備份</h2>
        <p className="mt-1 text-sm text-muted">JSON 可用於日後還原；Markdown 方便閱讀、列印或貼到其他筆記軟體。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => { downloadText(`rewire-backup-${stamp()}.json`, JSON.stringify(createBackup(data), null, 2), 'application/json'); toast('已下載完整備份'); }}>
            <Download className="h-4 w-4" aria-hidden />下載完整備份（JSON）
          </button>
          <button className="btn-secondary" onClick={() => { downloadText(`rewire-records-${stamp()}.md`, allToMarkdown(data), 'text/markdown'); toast('已匯出 Markdown'); }}>
            <FileText className="h-4 w-4" aria-hidden />匯出閱讀版（Markdown）
          </button>
        </div>
      </Card>
      <Card>
        <h2 className="font-serif text-lg font-bold">從備份還原</h2>
        <p className="mt-1 text-sm text-muted">只接受 Rewire 匯出的 JSON 備份檔；系統會先檢查格式，確認後才會取代目前資料。</p>
        <input ref={file} type="file" accept="application/json,.json" className="sr-only" id="import-file" onChange={onFile} />
        <label htmlFor="import-file" className="btn-secondary mt-4 cursor-pointer" onClick={(e) => { e.preventDefault(); file.current?.click(); }}>
          <Upload className="h-4 w-4" aria-hidden />選擇備份檔
        </label>
        {importMsg && <p role="alert" className={`mt-3 rounded-xl px-3 py-2 text-sm ${importMsg.ok ? 'bg-soft text-accent' : 'bg-[#9B3D35]/10 text-[#9B3D35] dark:text-[#E8A39A]'}`}>{importMsg.text}</p>}
      </Card>
      <Card className="border-[#9B3D35]/30">
        <h2 className="font-serif text-lg font-bold">清除所有紀錄</h2>
        <p className="mt-1 text-sm text-muted">刪除這台裝置上所有 Rewire 個人紀錄。清除前會再次確認。</p>
        <button className="btn-danger mt-4" onClick={clearAll} disabled={count === 0 && data.neuralReps === 0 && !Object.keys(data.chapters).length && !Object.keys(data.quizzes).length}>
          <Trash2 className="h-4 w-4" aria-hidden />清除所有紀錄
        </button>
      </Card>
    </div>
  );
}
