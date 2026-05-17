"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateIngredientCard({
  onCreate,
  disabled,
}: {
  onCreate: (formData: FormData) => Promise<void>;
  disabled?: boolean;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Create ingredient</h2>
      <form action={onCreate} className="space-y-4">
        <div>
          <label
            className="mb-2 block text-sm font-medium text-muted-foreground"
            htmlFor="ingredient-name"
          >
            Ingredient name
          </label>
          <Input id="ingredient-name" name="name" placeholder="e.g. Tomato" />
        </div>
        <Button type="submit" disabled={disabled}>
          Save ingredient
        </Button>
      </form>
    </section>
  );
}
