"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ingredient } from "../generated/prisma/client";
import { recipeTypes } from "./types";

export default function CreateRecipeCard({
  ingredients,
  createRecipeAction,
}: {
  ingredients: Ingredient[];
  createRecipeAction: (formData: FormData) => Promise<void>;
}) {
  const [ingredientRowCount, setIngredientRowCount] = useState(1);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Create recipe</h2>
      <form action={createRecipeAction} className="space-y-4">
        <div>
          <label
            className="mb-2 block text-sm font-medium text-muted-foreground"
            htmlFor="recipe-title"
          >
            Recipe title
          </label>
          <Input
            id="recipe-title"
            name="title"
            placeholder="e.g. Spaghetti Bolognese"
          />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-muted-foreground"
            htmlFor="recipe-description"
          >
            Description
          </label>
          <textarea
            id="recipe-description"
            name="description"
            rows={3}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="Add a short recipe description"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-muted-foreground"
              htmlFor="recipe-type"
            >
              Recipe type
            </label>
            <Select name="type">
              <SelectTrigger id="recipe-type">
                <SelectValue placeholder="Pick a recipe type" />
              </SelectTrigger>
              <SelectContent>
                {recipeTypes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-dashed border-border p-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold">Recipe ingredients</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setIngredientRowCount((count) => Math.min(count + 1, 5))
              }
            >
              Add row
            </Button>
          </div>

          <div className="space-y-3">
            {Array.from({ length: ingredientRowCount }, (_, index) => (
              <div
                key={index}
                className="grid gap-3 md:grid-cols-[1.3fr_0.9fr]"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Ingredient
                  </label>
                  <Select name="ingredientIds">
                    <SelectTrigger>
                      <SelectValue placeholder="Select ingredient" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No ingredients yet
                        </SelectItem>
                      ) : (
                        ingredients.map((ingredient) => (
                          <SelectItem key={ingredient.id} value={ingredient.id}>
                            {ingredient.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-muted-foreground"
                    htmlFor={`quantity-${index}`}
                  >
                    Quantity
                  </label>
                  <Input
                    id={`quantity-${index}`}
                    name="quantities"
                    placeholder="e.g. 1 cup"
                  />
                </div>
              </div>
            ))}
          </div>

          {ingredientRowCount > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setIngredientRowCount((count) => Math.max(count - 1, 1))
              }
            >
              Remove row
            </Button>
          ) : null}
        </div>

        <Button type="submit">Save recipe</Button>
      </form>
    </section>
  );
}
