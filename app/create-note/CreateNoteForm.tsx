"use client";

import { FormEvent, useState } from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, Essentials, Paragraph, Bold, Italic } from "ckeditor5";

export default function CreateNoteForm({
  ckEditorKey,
}: {
  ckEditorKey: string;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.error || "Unable to create note");
      }

      setTitle("");
      setContent("<p></p>");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
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
        <div className="mb-4">
          <CKEditor
            editor={ClassicEditor}
            data={content}
            config={{
              licenseKey: ckEditorKey,
              plugins: [Essentials, Paragraph, Bold, Italic],
              toolbar: ["undo", "redo", "|", "bold", "italic", "|"],
            }}
            onChange={(_, editor) => {
              setContent(editor.getData());
            }}
          />
        </div>

        {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}

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
