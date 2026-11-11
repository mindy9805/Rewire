/**
 * 依中文標點換行的標題文字：只在「，、：；？！。」等標點後換行，避免手機上出現「探索自／己？」這種單字落行。
 * 做法：CSS word-break: keep-all（中文字之間不斷行，標點後仍可斷行），
 * 搭配 overflow-wrap: anywhere —— 某一段本身比一行還長時仍會換行，不會造成橫向捲動。
 * 只用 CSS、不拆元素，所以文字內容與螢幕閱讀器讀到的名稱完全不變。
 */
export default function Phrased({ text }: { text: string }) {
  return <span className="text-phrase">{text}</span>;
}
