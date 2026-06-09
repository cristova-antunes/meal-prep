"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { mergeRegister } from "@lexical/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Note = {
  id: string;
  title: string;
  content: string;
};

// ---------------------------------------------------------------------------
// Toolbar plugin (same as CreateNoteForm)
// ---------------------------------------------------------------------------

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          setIsBold(selection.hasFormat("bold"));
          setIsItalic(selection.hasFormat("italic"));
        });
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        1,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        1,
      ),
    );
  }, [editor]);

  return (
    <div className="flex items-center gap-1 border-b px-2 py-1 bg-gray-50">
      <ToolbarButton
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo}
        title="Undo"
      >
        ↩
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo}
        title="Redo"
      >
        ↪
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-gray-300" />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        active={isBold}
        title="Bold"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        active={isItalic}
        title="Italic"
      >
        <em>I</em>
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  onClick,
  disabled = false,
  active = false,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 rounded text-sm transition-colors
        ${active ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100"}
        disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// HtmlOnChangePlugin (same as CreateNoteForm)
// ---------------------------------------------------------------------------

function HtmlOnChangePlugin({
  onChange,
}: {
  onChange: (html: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(
        () => {
          const html = $generateHtmlFromNodes(editor);
          onChange(html);
        },
        { editor },
      );
    });
  }, [editor, onChange]);
  return null;
}

// ---------------------------------------------------------------------------
// Editor theme
// ---------------------------------------------------------------------------

const editorTheme = {
  text: {
    bold: "font-bold",
    italic: "italic",
  },
};

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export default function EditNoteForm({ note }: { note: Note }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, title, content }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.error || "Unable to update note");
      }

      router.push(`/notes/${note.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const initialConfig = {
    namespace: "EditNoteEditor",
    theme: editorTheme,
    onError: (error: Error) => console.error(error),
    // 👇 Parse the stored HTML and populate the editor before first render
    editorState: (editor: import("lexical").LexicalEditor) => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(note.content, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot().select();
      $getRoot().clear();
      $getRoot().append(...nodes);
    },
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Edit Note</h1>
        <Link
          href={`/notes/${note.id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Back to note
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Title</label>
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          required
        />

        <label className="block mb-2">Content</label>
        <div className="mb-4 border rounded overflow-hidden">
          <LexicalComposer initialConfig={initialConfig}>
            <ToolbarPlugin />
            <div className="relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="min-h-36 px-3 py-2 outline-none text-sm"
                    aria-placeholder="Write your note..."
                    placeholder={
                      <div className="absolute top-2 left-3 text-gray-400 text-sm pointer-events-none select-none">
                        Write your note...
                      </div>
                    }
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            <HistoryPlugin />
            <HtmlOnChangePlugin onChange={setContent} />
          </LexicalComposer>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
