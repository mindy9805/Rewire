/** 首次使用的本地儲存提示，以及儲存失敗警告 */
import { Link } from 'react-router-dom';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/AppStore';

export default function StorageNotice() {
  const { data, update, storageError } = useStore();
  if (storageError) {
    return (
      <div role="alert" className="mb-5 flex gap-3 rounded-2xl border border-[#9B3D35]/40 bg-[#9B3D35]/10 p-4 text-sm">
        <AlertTriangle className="h-5 w-5 shrink-0 text-[#9B3D35]" aria-hidden />
        <p>目前無法寫入瀏覽器儲存空間（可能是無痕模式或儲存空間已滿），新的紀錄在關閉頁面後可能遺失。建議先到「<Link className="underline" to="/data">資料與隱私</Link>」匯出備份。</p>
      </div>
    );
  }
  if (data.settings.storageNoticeDismissed) return null;
  return (
    <div className="mb-4 flex items-center gap-2 rounded-2xl border border-line bg-soft/60 px-3 py-2 text-xs sm:text-sm">
      <HardDrive className="h-4 w-4 shrink-0 text-accent" aria-hidden />
      {/* 精簡為一行，讓手機首屏能直接看到主要入口；完整說明在「資料與隱私」頁 */}
      <p className="flex-1 leading-relaxed">
        紀錄<strong>只存在這台裝置的瀏覽器</strong>，清除網站資料或換裝置可能遺失。<Link className="underline" to="/data">了解與備份</Link>
      </p>
      <button className="btn-ghost btn-sm shrink-0" onClick={() => update((p) => ({ ...p, settings: { ...p.settings, storageNoticeDismissed: true } }))}>
        我知道了
      </button>
    </div>
  );
}
