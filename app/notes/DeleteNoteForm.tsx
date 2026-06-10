"use client";

import { Button } from "@/components/ui/button";

export default function DeleteNoteForm({
  noteId,
  deleteAction,
}: {
  noteId: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Delete this note? This action cannot be undone.")) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteAction} onSubmit={onSubmit} className="inline-block">
      <input type="hidden" name="noteId" value={noteId} />
      <Button type="submit" variant="destructive" size="sm">
        Delete note
      </Button>
    </form>
  );
}
