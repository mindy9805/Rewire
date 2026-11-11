/**
 * 簡易拖曳工具（HTML5 Drag and Drop）
 * 手機觸控與鍵盤使用者無法拖曳，因此每個可拖曳項目都另外提供「移動到…」選單或按鈕作為替代操作。
 */
import type { DragEvent } from 'react';

const MIME = 'application/x-rewire-item';

/** 讓元素可拖曳，攜帶項目 id */
export const draggable = (id: string) => ({
  draggable: true,
  onDragStart: (e: DragEvent) => {
    e.dataTransfer.setData(MIME, id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  },
});

/** 讓區塊可接收拖放，放下時回呼 onDrop(id) */
export const dropZone = (onDrop: (id: string) => void, setOver?: (v: boolean) => void) => ({
  onDragOver: (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOver?.(true);
  },
  onDragLeave: () => setOver?.(false),
  onDrop: (e: DragEvent) => {
    e.preventDefault();
    setOver?.(false);
    const id = e.dataTransfer.getData(MIME) || e.dataTransfer.getData('text/plain');
    if (id) onDrop(id);
  },
});
