/**
 * 資料與隱私：本地儲存說明、外觀與動畫設定、完整備份（JSON）、Markdown 匯出、匯入還原（含格式驗證）、清除所有紀錄
 */
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Upload, Trash2, ShieldCheck, FileText, Palette } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import { useConfirm } from '../components/ui/Confirm';
import { Card, SectionTitle } from '../components/ui/basics';
import { createBackup, validateBackup, COLLECTION_KEYS } from '../store/storage';
import { downloadText } from '../lib/clipboard';
import { allToMarkdown, stamp } from '../lib/exporters';
import VoicePicker from '../components/ui/VoicePicker';
import type { FontScale, MotionMode, Settings, ThemeMode } from '../types';

/** 外觀設定的選項（與頂部列按鈕使用同一組設定值） */
const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: '跟隨系統' },
  { value: 'light', label: '淺色' },
  { value: 'dark', label: '深色' },
];
const fontOptions: { value: FontScale; label: string }[] = [
  { value: 'sm', label: '小' },
  { value: 'md', label: '中' },
  { value: 'lg', label: '大' },
  { value: 'xl', label: '特大' },
];
const motionOptions: { value: MotionMode; label: string }[] = [
  { value: 'system', label: '跟隨系統' },
  { value: 'reduce', label: '關閉動畫' },
];

/** 一組互斥的選項按鈕（以 aria-pressed 標示目前選擇，可用鍵盤 Tab＋Enter 操作） */
function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label}>
      <p className="field-label">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} className="btn-toggle">
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DataPage() {
  const { data, update, replaceAll, resetAll } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const file = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const setSettings = (patch: Partial<Settings>) => update((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  // 系統是否已開啟「減少動態效果」：用來說明「跟隨系統」目前的實際效果
  const systemReduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
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
      <SectionTitle level={1} title="資料與隱私" desc="Rewire 沒有帳號、沒有後端伺服器。你的所有紀錄都只保存在這台裝置的瀏覽器（LocalStorage）。" />
      <Card>
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold"><ShieldCheck className="h-5 w-5 text-accent" aria-hidden />本地儲存說明</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
          <li>個人反思、情緒紀錄、練習內容與行動計畫，<strong>不會自動傳送到任何第三方服務</strong>。</li>
          <li>字型由本站自行提供，不會連到 Google 等第三方；你輸入的內容也不會被傳送出去。</li>
          <li>本站放在 GitHub Pages。GitHub 依其政策可能記錄一般網站的存取資訊（例如 IP），這些資料由 GitHub 處理，本站取不到也沒有使用。</li>
          <li><strong>朗讀的例外：</strong>朗讀使用瀏覽器或系統的語音功能。部分聲音是「線上聲音」（例如 Chrome 的「Google 國語（臺灣）」），朗讀的那段文字會送到提供聲音的公司合成語音。聲音選單中標示「連線」的就是這類；不想送出文字的話，請選沒有標示的本機聲音（例如 iPhone 的美佳）。</li>
          <li>完整的來源、授權與免責說明請見「<Link to="/about" className="underline">關於與聲明</Link>」。</li>
          <li><strong>以下情況可能導致紀錄遺失：</strong>清除瀏覽器網站資料、更換裝置或瀏覽器、使用無痕模式、瀏覽器自動清理長期未使用的網站資料。</li>
          <li>建議每週匯出一次完整備份（JSON），存到雲端硬碟或電腦中。</li>
        </ul>
        <p className="mt-3 text-sm text-muted">目前共有 {count} 筆紀錄。</p>
      </Card>
      <Card>
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold"><Palette className="h-5 w-5 text-accent" aria-hidden />外觀、朗讀與動畫</h2>
        <p className="mt-1 text-sm text-muted">設定只保存在這台裝置，清除紀錄時也會保留。</p>
        <div className="mt-4 space-y-4">
          <OptionGroup label="主題" options={themeOptions} value={data.settings.theme} onChange={(theme) => setSettings({ theme })} />
          <OptionGroup label="字體大小" options={fontOptions} value={data.settings.fontScale} onChange={(fontScale) => setSettings({ fontScale })} />
          <VoicePicker />
          <div>
            <OptionGroup label="動畫" options={motionOptions} value={data.settings.motion} onChange={(motion) => setSettings({ motion })} />
            <p className="mt-2 text-xs leading-relaxed text-muted">
              關閉後，頁面轉場、卡片彈出、轉盤旋轉、花園成長與夥伴「小芽」的動作都會停止，內容與功能不受影響。
              {data.settings.motion === 'system' && (systemReduced ? '你的裝置目前已開啟「減少動態效果」，所以動畫已經停用。' : '你的裝置目前沒有開啟「減少動態效果」，所以會顯示柔和的動畫。')}
            </p>
          </div>
        </div>
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
