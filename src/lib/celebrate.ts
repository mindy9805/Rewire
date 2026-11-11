/**
 * 全站「小慶祝」事件：任何元件呼叫 celebrate()，由 Layout 中的 <LeafBurst /> 播放飄葉動畫。
 * 用事件而不是 Context，讓觸發端不需要知道動畫元件放在哪裡。
 * 減少動畫（系統或站內設定）時不播放，只保留觸發端原本的文字回饋。
 */
export const CELEBRATE_EVENT = 'rewire:celebrate';

export function celebrate() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CELEBRATE_EVENT));
}
