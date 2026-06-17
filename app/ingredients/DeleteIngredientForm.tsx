"use client";

import { Button } from "@/components/ui/button";

export default function DeleteIngredientForm({
  ingredientId,
  deleteAction,
}: {
  ingredientId: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Delete this ingredient? This action cannot be undone.")) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteAction} onSubmit={onSubmit} className="inline-block">
      <input type="hidden" name="ingredientId" value={ingredientId} />
      <Button type="submit" variant="destructive" size="sm">
        Delete ingredient
      </Button>
    </form>
  );
}
