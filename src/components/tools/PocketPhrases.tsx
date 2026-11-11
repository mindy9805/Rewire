/** 工具六：口袋句（可複製的句型卡片） */
import { Copy } from 'lucide-react';
import { pocketPhrases } from '../../content/tools';
import { copyText } from '../../lib/clipboard';
import { useToast } from '../ui/Toast';

export default function PocketPhrases() {
  const toast = useToast();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {pocketPhrases.map((g) => (
        <section key={g.category} className="rounded-2xl border border-line bg-surface p-4">
          <h4 className="font-serif font-bold">{g.category}</h4>
          <p className="text-xs text-muted">{g.desc}</p>
          <ul className="mt-3 space-y-2">
            {g.phrases.map((p) => (
              <li key={p} className="flex items-start gap-2 rounded-xl bg-soft/60 p-3 text-sm">
                <span className="flex-1">{p}</span>
                <button className="icon-btn h-8 w-8 shrink-0" aria-label={`複製句子：${p}`} onClick={async () => toast((await copyText(p)) ? '已複製口袋句' : '複製失敗', 'info')}>
                  <Copy className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
