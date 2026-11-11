/** 研究來源與延伸閱讀 */
import { references, referenceMap } from '../content/references';
import ReferenceList from '../components/ui/ReferenceList';
import EvidenceCards from '../components/interactive/EvidenceCards';
import { SectionTitle } from '../components/ui/basics';

export default function References() {
  const all = references.map((r) => referenceMap[r.id]);
  return (
    <div className="space-y-10 motion-safe:animate-fade-up">
      <SectionTitle eyebrow="References" title="研究來源與延伸閱讀" desc="本站優先引用同行評審論文與學術專書。作者、標題、年份與 DOI 依原始出版資訊整理；無法完整確認的資料標示「待查證」。建議點擊 DOI 連結閱讀原文。" />
      <section aria-labelledby="ev-h">
        <h2 id="ev-h" className="mb-3 text-xl font-bold">科學證據檢視卡</h2>
        <p className="mb-4 text-sm text-muted">用「研究設計、樣本與限制、合理推論、過度簡化」等問題，練習批判性閱讀。</p>
        <EvidenceCards />
      </section>
      <section aria-labelledby="all-h">
        <h2 id="all-h" className="mb-3 text-xl font-bold">完整文獻清單（{all.length}）</h2>
        <ReferenceList refs={all} />
      </section>
      <section className="rounded-2xl bg-soft/60 p-5 text-sm leading-relaxed">
        <h2 className="font-serif text-lg font-bold">內容與著作權說明</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>本站所有學習解說皆為重新組織的原創文字，不複製書籍或影片中的長篇內容。</li>
          <li>研究發現與限制為摘要整理，可能無法涵蓋原文所有細節，請以原始論文為準。</li>
          <li>本站內容僅供學習與自我覺察，不構成醫療或心理治療建議。</li>
        </ul>
      </section>
    </div>
  );
}
