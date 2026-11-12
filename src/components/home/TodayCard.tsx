/**
 * 今日小練習（首頁）：把原本三張推薦卡合併成一張，依照「一句話 → 一個小行動 → 下一步」的順序。
 * - 今天的心智語句與它對應的小行動（每天固定，換天才換）
 * - 主要按鈕：開始每日心智練習；次要：30 秒小冒險
 * - 若使用者做過章節測驗，會多一個可展開的「回想一下」（間隔回想，不計分、可跳過）
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, CheckCircle2, XCircle } from 'lucide-react';
import { affirmations } from '../../content/dailyRewire';
import { quests } from '../../content/play';
import { useStore } from '../../store/AppStore';
import { dailyPick } from '../../lib/activity';
import { todaysRecall, type RecallItem } from '../../lib/recall';
import { unlockSpeech } from '../../lib/speech';
import WatercolorSpot from '../visual/WatercolorSpot';

function Recall({ item }: { item: RecallItem }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  if (!open) {
    return (
      <button type="button" className="btn-ghost btn-sm -ml-3" onClick={() => setOpen(true)}>
        <Brain className="h-4 w-4 text-accent" aria-hidden />回想一下第 {item.chapterNo} 章（30 秒・可跳過）
      </button>
    );
  }
  const answered = picked !== null;
  return (
    <div className="rounded-2xl bg-soft/60 p-4" role="group" aria-labelledby="recall-q">
      <p className="text-xs text-accent">回想一下・第 {item.chapterNo} 章 {item.chapterTitle}</p>
      <p id="recall-q" className="mt-1 font-medium">{item.q.question}</p>
      <ul className="mt-3 grid gap-2">
        {item.q.options.map((o, i) => {
          const right = i === item.q.answer;
          const state = !answered ? '' : right ? 'border-accent bg-surface' : i === picked ? 'border-[#9B3D35]/50 bg-surface' : 'opacity-60';
          return (
            <li key={i}>
              <button type="button" disabled={answered} onClick={() => setPicked(i)} className={`flex w-full items-start gap-2 rounded-xl border border-line bg-bg px-3 py-2 text-left text-sm ${state}`}>
                {answered && right && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-label="正確答案" />}
                {answered && !right && i === picked && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#9B3D35]" aria-label="你的選擇" />}
                {o}
              </button>
            </li>
          );
        })}
      </ul>
      {answered && (
        <p className="mt-3 text-sm leading-relaxed" aria-live="polite">
          {picked === item.q.answer ? '記得很清楚！' : '沒關係，回想本身就是練習。'}{item.q.explanation}{' '}
          <Link to={`/learn/${item.chapterId}`} className="text-accent underline">回到第 {item.chapterNo} 章</Link>
        </p>
      )}
    </div>
  );
}

export default function TodayCard() {
  const { data } = useStore();
  const aff = dailyPick(affirmations, 3);
  const quest = dailyPick(quests, 1);
  const recall = todaysRecall(data);
  return (
    <section aria-labelledby="today-h" className="rounded-3xl border border-line bg-gradient-to-br from-surface to-soft/60 p-5 sm:p-7">
      <h2 id="today-h" className="text-xl font-bold">今日小練習</h2>
      <p className="text-sm text-muted">每天換一組；想做就做，不想做也沒關係。</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="w-20 shrink-0 sm:w-28"><WatercolorSpot kind={`aff${aff.id}`} /></div>
        <div className="min-w-0">
          <p className="font-serif text-2xl font-bold">「{aff.text}」</p>
          <p className="mt-2 text-sm leading-relaxed"><span className="font-medium text-accent">今天的小行動：</span>{aff.action}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link onClick={unlockSpeech} to="/daily/read" className="btn-primary btn-sm">開始每日心智練習<ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
        <Link to="/play/quest" className="text-sm text-accent underline">或來個 30 秒小冒險：{quest.title}</Link>
      </div>
      {recall && <div className="mt-5 border-t border-line pt-4"><Recall item={recall} /></div>}
    </section>
  );
}
