/** 深度導讀：章節列表與學習進度 */
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { chapters } from '../content/chapters';
import { useStore } from '../store/AppStore';
import { chapterStats } from '../lib/stats';
import { ProgressBar, SectionTitle } from '../components/ui/basics';
import { INTERACTIVE_META } from '../components/interactive/InteractiveBlock';

export default function Learn() {
  const { data } = useStore();
  const cs = chapterStats(data);
  return (
    <div className="motion-safe:animate-fade-up">
      <SectionTitle eyebrow="Learn" title="神經科學深度導讀" desc="每章包含學習目標、核心概念、深入解釋、生活案例、示意圖、應用方式、反思問題、互動測驗與研究來源。可依序閱讀，也可以從感興趣的章節開始。" />
      <div className="mb-6 max-w-md"><ProgressBar label="章節完成" value={cs.completed} max={cs.total} /></div>
      <ol className="space-y-3">
        {chapters.map((c) => {
          const done = data.chapters[c.id]?.completed;
          const quiz = data.quizzes[c.id];
          return (
            <li key={c.id}>
              <Link to={`/learn/${c.id}`} className="card-hover flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <span className="font-display text-3xl italic text-sage">{String(c.number).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xs text-muted">{c.enTitle}</span>
                  <span className="block font-serif text-lg font-bold">{c.title}</span>
                  <span className="block text-sm text-muted">{c.subtitle}</span>
                  <span className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="chip"><Clock className="mr-1 h-3 w-3" aria-hidden />{c.minutes} 分鐘</span>
                    <span className="chip">互動：{INTERACTIVE_META[c.interactive].title}</span>
                    {quiz && <span className="chip">測驗 {quiz.score}/{quiz.total}</span>}
                  </span>
                </span>
                {done ? <CheckCircle2 className="h-6 w-6 shrink-0 text-accent" aria-label="已完成" /> : <Circle className="h-6 w-6 shrink-0 text-line" aria-label="未完成" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
