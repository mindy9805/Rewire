/**
 * 我的（總覽）：自己的紀錄、成長收藏與設定，集中在一個入口。
 * 數字只來自真實紀錄；沒有紀錄時顯示說明文字，不顯示 0 分之類的指標。
 */
import { Link } from 'react-router-dom';
import { NotebookPen, LayoutDashboard, Flower2, Award, Mail, Database, ArrowRight } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { SectionTitle } from '../components/ui/basics';
import { collectActivity } from '../lib/activity';

export default function Me() {
  const { data } = useStore();
  const total = collectActivity(data).length;
  const badges = Object.keys(data.unlocks).filter((k) => k.startsWith('badge:')).length;
  const items = [
    { to: '/journal', icon: NotebookPen, title: '反思日誌', desc: data.journal.length || data.notes.length ? `${data.journal.length} 篇日誌・${data.notes.length} 則章節筆記` : '寫下今天的一個小觀察，或整理章節筆記。' },
    { to: '/dashboard', icon: LayoutDashboard, title: '學習儀表板', desc: total ? `共 ${total} 筆練習與紀錄，看看自己的變化。` : '開始練習後，這裡會整理你的真實紀錄。' },
    { to: '/play/garden', icon: Flower2, title: '心智花園', desc: `${data.garden.plants.length} 株植物與裝飾` },
    { to: '/play/collection', icon: Award, title: '成長收藏冊', desc: badges ? `已收藏 ${badges} 枚徽章` : '完成任何練習或紀錄，都可能解鎖收藏。' },
    { to: '/play/capsule', icon: Mail, title: '時光膠囊', desc: data.capsules.length ? `${data.capsules.length} 個膠囊` : '寫一封信給未來的自己。' },
    { to: '/data', icon: Database, title: '資料與隱私', desc: '備份、還原、外觀與動畫設定。' },
  ];
  return (
    <div className="space-y-6 motion-safe:animate-fade-up">
      <SectionTitle eyebrow="Me" title="我的" desc="你留下的紀錄、收藏與設定都在這裡。所有內容只保存在這台裝置的瀏覽器。" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map(({ to, icon: Icon, title, desc }) => (
          <li key={to}>
            <Link to={to} className="card-hover flex h-full items-center gap-3 rounded-2xl border border-line bg-surface p-4">
              <Icon className="h-6 w-6 shrink-0 text-accent" aria-hidden />
              <span className="min-w-0 flex-1"><span className="block font-serif font-bold">{title}</span><span className="text-sm text-muted">{desc}</span></span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
