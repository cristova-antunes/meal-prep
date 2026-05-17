"use client";

import { Button } from "@/components/ui/button";

export default function DeleteRecipeForm({
  recipeId,
  deleteAction,
}: {
  recipeId: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Delete this recipe? This action cannot be undone.")) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteAction} onSubmit={onSubmit}>
      <input type="hidden" name="recipeId" value={recipeId} />
      <Button type="submit" variant="destructive" size="sm">
        Delete
      </Button>
    </form>
  );
}
