"use client";

import ImageExt from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";
import { Icon } from "../Icon";
import { uploadToStorage } from "./uploadClient";

type Btn = { label: string; text: string; run: () => void; active?: boolean };

/** Éditeur riche (Tiptap). Le HTML est envoyé dans un champ caché puis nettoyé côté serveur. */
export function RichTextEditor({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  const [html, setHtml] = useState(defaultValue ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, protocols: ["mailto", "tel"] } }),
      ImageExt.configure({ inline: false }),
    ],
    content: defaultValue || "<p></p>",
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: { class: "prose-content min-h-64 p-4 outline-none", "aria-label": label, "aria-multiline": "true", role: "textbox" },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  if (!editor) return <div className="field min-h-64" aria-busy="true">Chargement de l&apos;éditeur…</div>;

  const c = () => editor.chain().focus();
  const buttons: Btn[] = [
    { label: "Gras", text: "G", run: () => c().toggleBold().run(), active: editor.isActive("bold") },
    { label: "Italique", text: "I", run: () => c().toggleItalic().run(), active: editor.isActive("italic") },
    { label: "Titre de section", text: "H2", run: () => c().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { label: "Sous-titre", text: "H3", run: () => c().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
    { label: "Liste à puces", text: "• Liste", run: () => c().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { label: "Liste numérotée", text: "1. Liste", run: () => c().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { label: "Citation", text: "« »", run: () => c().toggleBlockquote().run(), active: editor.isActive("blockquote") },
    {
      label: "Lien",
      text: "Lien",
      active: editor.isActive("link"),
      run: () => {
        const prev = editor.getAttributes("link").href as string | undefined;
        const href = window.prompt("Adresse du lien (https://…, mailto:…, tel:… ou /page)", prev ?? "https://");
        if (href === null) return;
        if (!href.trim()) c().unsetLink().run();
        else c().extendMarkRange("link").setLink({ href: href.trim() }).run();
      },
    },
    { label: "Insérer une image", text: "Image", run: () => fileRef.current?.click() },
    { label: "Annuler", text: "↶", run: () => c().undo().run() },
    { label: "Rétablir", text: "↷", run: () => c().redo().run() },
  ];

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg("Téléversement de l'image…");
    try {
      const { publicUrl } = await uploadToStorage(file, "image", "actualites");
      const alt = window.prompt("Description de l'image (accessibilité)", "") ?? "";
      if (publicUrl) c().setImage({ src: publicUrl, alt }).run();
      setMsg(null);
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  return (
    <div>
      <p className="field-label" id={`${name}-label`}>{label}</p>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div role="toolbar" aria-label="Mise en forme" className="flex flex-wrap gap-1 border-b border-line bg-surface-2 p-2">
          {buttons.map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={b.run}
              aria-label={b.label}
              title={b.label}
              aria-pressed={b.active ?? undefined}
              className="min-h-10 min-w-10 rounded-lg px-2 text-sm font-semibold hover:bg-surface aria-pressed:bg-primary aria-pressed:text-on-primary"
            >
              {b.text}
            </button>
          ))}
        </div>
        <EditorContent editor={editor} />
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" tabIndex={-1} onChange={onImage} />
      <input type="hidden" name={name} value={html} />
      {msg && <p className="mt-1 text-sm text-muted" role="status"><Icon name="image" size={14} className="inline" /> {msg}</p>}
    </div>
  );
}
