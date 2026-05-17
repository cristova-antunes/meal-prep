"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <Button type="submit" disabled={disabled}>
              Save ingredient
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
