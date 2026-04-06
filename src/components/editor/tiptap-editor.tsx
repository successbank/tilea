'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import { Button } from '@/components/ui/button';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full' } }),
      Link.configure({ openOnClick: false }),
      Youtube.configure({ width: 640, height: 360 }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[200px] p-4 focus:outline-none text-foreground',
      },
    },
  });

  if (!editor) return null;

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'posts');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const { url } = await res.json();
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  };

  const addYoutube = () => {
    const url = prompt('YouTube URL을 입력하세요');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        <Button type="button" size="sm" variant={editor.isActive('bold') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleBold().run()}>B</Button>
        <Button type="button" size="sm" variant={editor.isActive('italic') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleItalic().run()}>I</Button>
        <Button type="button" size="sm" variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
        <Button type="button" size="sm" variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Button>
        <Button type="button" size="sm" variant={editor.isActive('bulletList') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleBulletList().run()}>UL</Button>
        <Button type="button" size="sm" variant={editor.isActive('orderedList') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleOrderedList().run()}>OL</Button>
        <Button type="button" size="sm" variant={editor.isActive('blockquote') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleBlockquote().run()}>""</Button>
        <Button type="button" size="sm" variant="ghost" onClick={addImage}>📷</Button>
        <Button type="button" size="sm" variant="ghost" onClick={addYoutube}>▶</Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
