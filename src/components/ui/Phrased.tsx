/**
 * 依中文標點換行的標題文字：優先在「，、：；？！。｜」之後換行，避免手機上出現「探索自／己？」這種單字落行。
 *
 * 做法：
 * - 有標點時，每一段包成 inline-block；某一段本身比一行還長時，段內仍會正常換行（不會橫向捲動）。
 * - 畫面上的分段文字設為 aria-hidden，另外放一份完整文字給螢幕閱讀器（sr-only），
 *   讓朗讀與無障礙名稱維持原本的一句話，不會在分段處多出停頓。
 * - 數字與後面的中文之間（例如「7 個」）改用不換行空格，避免數字單獨留在上一行。
 */
const PUNCT = /([，、：；？！。｜])/;
const keepNumber = (t: string) => t.replace(/(\d)\s+(?=[一-鿿])/g, '$1 ');

export default function Phrased({ text }: { text: string }) {
  const parts: string[] = [];
  for (const piece of keepNumber(text).split(PUNCT)) {
    if (!piece) continue;
    if (PUNCT.test(piece) && parts.length) parts[parts.length - 1] += piece;
    else parts.push(piece);
  }
  if (parts.length < 2) return <>{keepNumber(text)}</>;
  return (
    <>
      <span aria-hidden="true">
        {parts.map((p, i) => <span key={i} className="inline-block">{p}</span>)}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
