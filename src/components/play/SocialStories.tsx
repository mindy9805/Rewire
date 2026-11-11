/**
 * Social Stories｜人際情境小劇場
 * 互動式文字情境：故事 → 2–4 個回應 → 不同的情境發展、各選項的優點與限制 → 反思問題。
 * 沒有單一標準答案；可重玩並探索其他選項。
 */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { socialStories, storyMap } from '../../content/play';
import { useStore } from '../../store/AppStore';
import { nowIso, uid } from '../../lib/id';
import Buddy from './Buddy';

export default function SocialStories() {
  const { data, upsert } = useStore();
  const [params, setParams] = useSearchParams();
  const sid = params.get('story');
  const story = sid ? storyMap[sid] : null;
  const [choice, setChoice] = useState<number | null>(null);
  const [seen, setSeen] = useState<number[]>([]);

  useEffect(() => { setChoice(null); setSeen([]); }, [sid]);

  const choose = (i: number) => {
    if (!story) return;
    setChoice(i);
    setSeen((s) => (s.includes(i) ? s : [...s, i]));
    upsert('storyPlays', { id: uid(), storyId: story.id, choice: i, createdAt: nowIso() });
  };
  const played = (id: string) => data.storyPlays.some((p) => p.storyId === id);

  if (!story) {
    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {socialStories.map((s) => (
          <li key={s.id}>
            <button className="card-hover h-full w-full rounded-2xl border border-line bg-surface p-4 text-left" onClick={() => setParams({ story: s.id })}>
              <span className="chip">{s.theme}</span>{played(s.id) && <span className="ml-2 text-xs text-accent">✓ 玩過</span>}
              <span className="mt-2 block font-serif text-lg font-bold">{s.title}</span>
              <span className="mt-1 block text-sm text-muted line-clamp-2">{s.scene}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  }
  const opt = choice !== null ? story.options[choice] : null;
  return (
    <div className="space-y-4">
      <button className="btn-ghost btn-sm" onClick={() => setParams({})}>← 所有小劇場</button>
      <article className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <span className="chip">{story.theme}</span>
        <h3 className="mt-2 font-serif text-2xl font-bold">{story.title}</h3>
        <p className="mt-3 rounded-2xl bg-soft/60 p-4 leading-relaxed">{story.scene}</p>
        <p className="mt-4 font-medium">你會怎麼做？</p>
        <div className="mt-2 grid gap-2">
          {story.options.map((o, i) => (
            <button key={i} aria-pressed={choice === i} onClick={() => choose(i)} className={`rounded-xl border p-3 text-left text-sm transition ${choice === i ? 'border-accent bg-soft' : 'border-line hover:border-accent/50'}`}>
              {o.text}{seen.includes(i) && choice !== i && <span className="ml-2 text-xs text-muted">（看過）</span>}
            </button>
          ))}
        </div>
        {opt && (
          <div className="mt-4 space-y-3 motion-safe:animate-pop" aria-live="polite">
            <div className="rounded-2xl border-l-4 border-sage bg-bg p-4">
              <p className="text-xs font-medium text-accent">接下來……</p>
              <p className="mt-1 leading-relaxed">{opt.outcome}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-soft/60 p-3 text-sm"><p className="font-medium text-accent">這個選擇的優點</p><p>{opt.pros}</p></div>
              <div className="rounded-xl bg-apricot/25 p-3 text-sm"><p className="font-medium">可能的限制</p><p>{opt.limits}</p></div>
            </div>
            <p className="text-xs text-muted">這裡沒有唯一正確的答案。不同的時機、關係與你當下的狀態，都會讓合適的選擇不一樣。</p>
            {seen.length < story.options.length ? (
              <Buddy mood="curious" message="要不要試試看其他選項，看看會怎麼發展？" size={64} />
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-soft to-apricot/25 p-4">
                <p className="text-sm font-medium text-accent">反思一下</p>
                <p className="font-serif text-lg">{story.reflection}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary btn-sm" onClick={() => setChoice(null)}><RotateCcw className="h-4 w-4" aria-hidden />換個選擇</button>
              <Link to={story.link.to} className="btn-ghost btn-sm">延伸：{story.link.label}</Link>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
