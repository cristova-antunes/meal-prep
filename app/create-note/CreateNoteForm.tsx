"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/feature/RichTextEditor";
import { EMPTY_EDITOR_STATE } from "@/components/feature/RichTextEditorConfigs";
import { createNote } from "./actions";

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export default function CreateNoteForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  // content is stored as Lexical's serialized JSON string
  const [content, setContent] = useState(EMPTY_EDITOR_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Increment this key to force a full remount of LexicalComposer on reset,
  // which is the recommended way to programmatically clear the editor.
  const [editorKey, setEditorKey] = useState(0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const note = await createNote(title, content);
      // Reset form
      setTitle("");
      setContent(EMPTY_EDITOR_STATE);
      setEditorKey((k) => k + 1); // remount the editor to clear it
      // Redirect to note detail page
      router.push(`/notes/${note.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setLoading(false);
    }
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
        <RichTextEditor
          onChange={setContent}
          namespace="CreateNoteEditor"
          editorKey={editorKey}
          placeholder="Write your note..."
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <Button type="submit" variant={"default"} disabled={loading}>
          {loading ? "Creating..." : "Create Note"}
        </Button>
      </form>
    </div>
  );
}
