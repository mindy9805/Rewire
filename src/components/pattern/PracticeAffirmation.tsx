/**
 * 練習完成後顯示的心智語句提示（與 Daily Rewire 整合）
 * 顯示該習慣對應的語句與反思問題，並可設為「今日想練習的句子」或進入朗讀模式。
 */
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { affirmationMap } from '../../content/dailyRewire';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { getDailyLog } from '../../lib/daily';
import { nowIso } from '../../lib/id';

export default function PracticeAffirmation({ ids, onClose }: { ids: number[]; onClose?: () => void }) {
  const { data, upsert } = useStore();
  const toast = useToast();
  const today = getDailyLog(data);
  const choose = (id: number) => {
    // 以日期合併，避免同一天出現兩筆每日紀錄
    upsert('dailyLogs', { ...today, practiceId: id, updatedAt: nowIso() });
    toast('已設為今天想練習的句子');
  };
  return (
    <div role="status" className="rounded-2xl border border-accent/30 bg-gradient-to-br from-soft to-apricot/25 p-4 motion-safe:animate-fade-up">
      <p className="flex items-center gap-1 text-sm font-medium text-accent"><Sparkles className="h-4 w-4" aria-hidden />練習完成！帶著這句話繼續今天：</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {ids.map((id) => {
          const a = affirmationMap[id];
          const chosen = today.practiceId === id;
          return (
            <div key={id} className="rounded-xl bg-surface p-3 text-sm">
              <p className="font-serif text-lg font-bold">「{a.text}」</p>
              <p className="mt-1 text-muted">反思：{a.reflection}</p>
              <button className="btn-secondary btn-sm mt-2" onClick={() => choose(id)} aria-pressed={chosen} disabled={chosen}>
                {chosen ? '已是今天的練習句' : '設為今日練習句'}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to="/daily/read" className="btn-ghost btn-sm">進入七句朗讀模式</Link>
        {onClose && <button className="btn-ghost btn-sm" onClick={onClose}>關閉</button>}
      </div>
    </div>
  );
}
