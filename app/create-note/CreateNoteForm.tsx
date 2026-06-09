"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  EditorState,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { $generateHtmlFromNodes } from "@lexical/html";

// ---------------------------------------------------------------------------
// Toolbar plugin
// ---------------------------------------------------------------------------

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Keep toolbar state in sync with the editor selection
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
// Editor theme
// ---------------------------------------------------------------------------

const editorTheme = {
  text: {
    bold: "font-bold",
    italic: "italic",
  },
};

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
      ); // 👈 pass editor as context
    });
  }, [editor, onChange]);
  return null;
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

// Empty Lexical editor state used to reset the editor after submission
const EMPTY_EDITOR_STATE =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

export default function CreateNoteForm() {
  const [title, setTitle] = useState("");
  // content is stored as Lexical's serialized JSON string
  const [content, setContent] = useState(EMPTY_EDITOR_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Increment this key to force a full remount of LexicalComposer on reset,
  // which is the recommended way to programmatically clear the editor.
  const [editorKey, setEditorKey] = useState(0);

  const handleChange = useCallback((editorState: EditorState) => {
    setContent(JSON.stringify(editorState.toJSON()));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.error || "Unable to create note");
      }

      // Reset form
      setTitle("");
      setContent(EMPTY_EDITOR_STATE);
      setEditorKey((k) => k + 1); // remount the editor to clear it
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const initialConfig = {
    namespace: "CreateNoteEditor",
    theme: editorTheme,
    onError: (error: Error) => console.error(error),
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">New Note</h1>
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
          {/* key forces full remount on reset, cleanly clearing editor state */}
          <LexicalComposer key={editorKey} initialConfig={initialConfig}>
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
          {loading ? "Creating..." : "Create Note"}
        </button>
      </form>
    </div>
  );
}
