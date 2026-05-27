"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ingredientType } from "@/types/types";

export default function CreateIngredientCard({
  onCreate,
  disabled,
}: {
  onCreate: (formData: FormData) => Promise<void>;
  disabled?: boolean;
}) {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Create ingredient</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={onCreate} className="space-y-4">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-muted-foreground"
                htmlFor="ingredient-name"
              >
                Ingredient name
              </label>
              <Input
                id="ingredient-name"
                name="name"
                placeholder="e.g. Tomato"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-muted-foreground"
                htmlFor="ingredient-type"
              >
                Ingredient type
              </label>
              <select
                id="ingredient-type"
                name="type"
                className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">None</option>
                {ingredientType.map((typeOption) => (
                  <option key={typeOption.value} value={typeOption.value}>
                    {typeOption.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={disabled}>
              Save ingredient
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
