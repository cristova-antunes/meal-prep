"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, LexicalEditor } from "lexical";
import { RichTextEditor } from "@/components/feature/RichTextEditor";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Note = {
  id: string;
  title: string;
  content: string;
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

  // Parse the stored HTML and populate the editor before first render
  const editorState = (editor: LexicalEditor) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(note.content, "text/html");
    const nodes = $generateNodesFromDOM(editor, dom);
    $getRoot().select();
    $getRoot().clear();
    $getRoot().append(...nodes);
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
        <RichTextEditor
          onChange={setContent}
          editorState={editorState}
          namespace="EditNoteEditor"
          placeholder="Write your note..."
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <Button type="submit" variant={"default"} disabled={loading}>
          {loading ? "Updating..." : "Update Note"}
        </Button>
      </form>
    </div>
  );
}
