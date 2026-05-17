"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function IngredientsEditor({
  recipeId,
  recipeIngredients,
  allIngredients,
  addAction,
  removeAction,
  updateAction,
}: {
  recipeId: string;
  recipeIngredients: any[];
  allIngredients: any[];
  addAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const [selectedIngredient, setSelectedIngredient] = useState<string>(
    allIngredients[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState<string>("1");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Ingredients</h2>
          <p className="text-sm text-muted-foreground">
            {recipeIngredients.length} ingredient
            {recipeIngredients.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recipeIngredients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No ingredients yet.</p>
        ) : (
          recipeIngredients.map((ri) => (
            <div
              key={ri.ingredientId}
              className="rounded-2xl border border-border bg-background p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {ri.ingredient?.name ?? ri.ingredientId}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isEditing ? (
                    <form
                      action={updateAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="recipeId" value={recipeId} />
                      <input
                        type="hidden"
                        name="ingredientId"
                        value={ri.ingredientId}
                      />
                      <input
                        name="quantity"
                        defaultValue={ri.quantity}
                        className="rounded-md border px-2 py-1 w-20"
                      />
                      <Button type="submit" size="sm">
                        Update
                      </Button>
                    </form>
                  ) : (
                    <>Qty: {ri.quantity}</>
                  )}
                </div>
              </div>
              {isEditing ? (
                <form action={removeAction} className="inline">
                  <input type="hidden" name="recipeId" value={recipeId} />
                  <input
                    type="hidden"
                    name="ingredientId"
                    value={ri.ingredientId}
                  />
                  <Button type="submit" variant="destructive" size="sm">
                    Remove
                  </Button>
                </form>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between">
          <div />
          <div className="flex gap-2">
            {isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Done
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>

        {isEditing ? (
          <form action={addAction} className="mt-4 flex gap-2 items-center">
            <input type="hidden" name="recipeId" value={recipeId} />
            <select
              name="ingredientId"
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              className="rounded-md border px-3 py-2"
            >
              {allIngredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name}
                </option>
              ))}
            </select>
            <input
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="rounded-md border px-3 py-2 w-24"
            />
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
