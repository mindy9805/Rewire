/** 筆記新增／編輯表單（內容＋自訂標籤） */
import { useState } from 'react';
import { TagInput, TextArea } from '../ui/basics';

export default function NoteEditor({ initial = '', initialTags = [], label = '我的筆記', submitText = '儲存筆記', onSubmit, onCancel }: {
  initial?: string;
  initialTags?: string[];
  label?: string;
  submitText?: string;
  onSubmit: (content: string, tags: string[]) => void;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState(initial);
  const [tags, setTags] = useState<string[]>(initialTags);
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit(content.trim(), tags);
        if (!onCancel) { setContent(''); setTags([]); }
      }}
    >
      <TextArea label={label} value={content} onChange={(e) => setContent(e.target.value)} />
      <TagInput value={tags} onChange={setTags} />
      <div className="flex gap-2">
        <button type="submit" className="btn-primary btn-sm" disabled={!content.trim()}>{submitText}</button>
        {onCancel && <button type="button" className="btn-ghost btn-sm" onClick={onCancel}>取消</button>}
      </div>
    </form>
  );
}
