'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import { useCallback, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type Level = 1 | 2 | 3;

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all ${
        active
          ? 'bg-primary-container text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="h-6 w-px bg-slate-200 mx-0.5" />;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeOpen, setYoutubeOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 cursor-pointer',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-xl max-w-full h-auto my-4' },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: { class: 'w-full rounded-xl my-4 aspect-video' },
      }),
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing your article…' }),
      CharacterCount,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setLinkUrl('');
    setLinkOpen(false);
  }, [editor, linkUrl]);

  const addYoutube = useCallback(() => {
    if (!editor || !youtubeUrl) return;
    editor.commands.setYoutubeVideo({ src: youtubeUrl });
    setYoutubeUrl('');
    setYoutubeOpen(false);
  }, [editor, youtubeUrl]);

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'waygo/blog');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const { url } = await res.json();
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters() ?? 0;
  const wordCount = editor.storage.characterCount?.words() ?? 0;

  return (
    <div className="rounded-xl border border-outline-variant overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-outline-variant bg-slate-50 px-2 py-1.5">
        {/* History */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo" active={false}>
          <span className="material-symbols-outlined text-[16px]">undo</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo" active={false}>
          <span className="material-symbols-outlined text-[16px]">redo</span>
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        {([1, 2, 3] as Level[]).map((level) => (
          <ToolbarButton
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            active={editor.isActive('heading', { level })}
            title={`Heading ${level}`}
          >
            <span className="text-[11px] font-black">H{level}</span>
          </ToolbarButton>
        ))}

        <Divider />

        {/* Inline styles */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <span className="material-symbols-outlined text-[16px]">format_bold</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <span className="material-symbols-outlined text-[16px]">format_italic</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <span className="material-symbols-outlined text-[16px]">format_underlined</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <span className="material-symbols-outlined text-[16px]">strikethrough_s</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
          <span className="material-symbols-outlined text-[16px]">ink_highlighter</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          <span className="material-symbols-outlined text-[16px]">code</span>
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
          <span className="material-symbols-outlined text-[16px]">format_align_left</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
          <span className="material-symbols-outlined text-[16px]">format_align_center</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
          <span className="material-symbols-outlined text-[16px]">format_align_right</span>
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <span className="material-symbols-outlined text-[16px]">format_quote</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
          <span className="material-symbols-outlined text-[16px]">data_object</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider">
          <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <div className="relative">
          <ToolbarButton onClick={() => { setLinkOpen(v => !v); setYoutubeOpen(false); }} active={editor.isActive('link')} title="Insert link">
            <span className="material-symbols-outlined text-[16px]">link</span>
          </ToolbarButton>
          {linkOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 flex gap-1 rounded-xl border border-outline-variant bg-white shadow-card-hover p-2">
              <input
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setLink()}
                placeholder="https://…"
                className="h-8 w-52 rounded-lg border border-outline-variant px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="button" onClick={setLink} className="h-8 px-3 rounded-lg bg-primary-container text-white text-sm font-semibold hover:bg-primary transition">
                OK
              </button>
              {editor.isActive('link') && (
                <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }} className="h-8 px-3 rounded-lg bg-error/10 text-error text-sm font-semibold hover:bg-error/20 transition">
                  <span className="material-symbols-outlined text-[14px]">link_off</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Image upload */}
        <ToolbarButton onClick={addImage} active={false} title="Insert image">
          <span className="material-symbols-outlined text-[16px]">image</span>
        </ToolbarButton>

        {/* YouTube */}
        <div className="relative">
          <ToolbarButton onClick={() => { setYoutubeOpen(v => !v); setLinkOpen(false); }} active={false} title="Embed YouTube">
            <span className="material-symbols-outlined text-[16px]">smart_display</span>
          </ToolbarButton>
          {youtubeOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 flex gap-1 rounded-xl border border-outline-variant bg-white shadow-card-hover p-2">
              <input
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addYoutube()}
                placeholder="YouTube URL…"
                className="h-8 w-60 rounded-lg border border-outline-variant px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="button" onClick={addYoutube} className="h-8 px-3 rounded-lg bg-primary-container text-white text-sm font-semibold hover:bg-primary transition">
                Embed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <EditorContent
        editor={editor}
        className="prose prose-slate max-w-none px-5 py-4 min-h-[320px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[300px]"
      />

      {/* Footer stats */}
      <div className="flex items-center gap-4 border-t border-outline-variant bg-slate-50 px-4 py-1.5">
        <span className="text-[11px] text-secondary">{wordCount} words</span>
        <span className="text-[11px] text-secondary">{charCount} characters</span>
      </div>
    </div>
  );
}
