/**
 * 章節測驗：作答 → 送出評分 → 顯示每題解析；可重新作答。成績存入 quizzes。
 */
import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import type { ChapterId, QuizQuestion, QuizResult } from '../../types';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { nowIso } from '../../lib/id';

/**
 * chapterId：用於章節測驗（存入 quizzes）；也可傳入 saved／onSave 讓其他模組（7 Habits）保存成績。
 */
export default function Quiz({ chapterId, questions, saved: savedProp, onSave }: { chapterId: ChapterId | string; questions: QuizQuestion[]; saved?: QuizResult; onSave?: (r: QuizResult) => void }) {
  const { data, update } = useStore();
  const toast = useToast();
  const saved = onSave ? savedProp : data.quizzes[chapterId as ChapterId];
  const [answers, setAnswers] = useState<Record<string, number>>(saved?.answers ?? {});
  const [submitted, setSubmitted] = useState(!!saved);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const score = questions.filter((q) => answers[q.id] === q.answer).length;

  const submit = () => {
    if (!allAnswered) return;
    const result = { answers, score, total: questions.length, submittedAt: nowIso() };
    if (onSave) onSave(result);
    else update((p) => ({ ...p, quizzes: { ...p.quizzes, [chapterId]: result } }));
    setSubmitted(true);
    toast(`已完成測驗：${score}/${questions.length} 題答對`);
  };
  const retry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <fieldset key={q.id} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <legend className="sr-only">第 {qi + 1} 題</legend>
          <p className="font-medium">
            <span className="mr-2 font-display text-accent">Q{qi + 1}</span>
            {q.question}
          </p>
          <div className="mt-3 grid gap-2">
            {q.options.map((opt, oi) => {
              const chosen = answers[q.id] === oi;
              const correct = submitted && oi === q.answer;
              const wrong = submitted && chosen && oi !== q.answer;
              return (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                    correct ? 'border-accent bg-soft' : wrong ? 'border-[#9B3D35]/60 bg-[#9B3D35]/10' : chosen ? 'border-accent' : 'border-line hover:border-accent/50'
                  } ${submitted ? 'cursor-default' : ''}`}
                >
                  <input
                    type="radio"
                    name={`${chapterId}-${q.id}`}
                    className="mt-1 accent-[rgb(var(--accent))]"
                    checked={chosen}
                    disabled={submitted}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  />
                  <span className="flex-1">{opt}</span>
                  {correct && <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-label="正確答案" />}
                  {wrong && <XCircle className="h-4 w-4 shrink-0 text-[#9B3D35]" aria-label="你的選擇不正確" />}
                </label>
              );
            })}
          </div>
          {submitted && <p className="mt-3 rounded-xl bg-soft/70 px-3 py-2 text-sm leading-relaxed">解析：{q.explanation}</p>}
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        {!submitted ? (
          <>
            <button className="btn-primary" onClick={submit} disabled={!allAnswered}>
              送出答案
            </button>
            {!allAnswered && <span className="text-sm text-muted">已作答 {Object.keys(answers).length}/{questions.length} 題</span>}
          </>
        ) : (
          <>
            <p className="font-medium" role="status">
              得分：{score}/{questions.length}<span className="ml-2">{score === questions.length ? '全部答對，太棒了！' : '看看解析，再試一次也很好。'}</span>
            </p>
            <button className="btn-secondary" onClick={retry}>
              <RotateCcw className="h-4 w-4" aria-hidden /> 重新作答
            </button>
          </>
        )}
      </div>
    </div>
  );
}
