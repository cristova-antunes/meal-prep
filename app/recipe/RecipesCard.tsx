"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecipeListItem, recipeTypes } from "./types";

export default function RecipesCard({
  recipes,
  updateRecipeAction,
  deleteRecipeAction,
}: {
  recipes: RecipeListItem[];
  updateRecipeAction: (formData: FormData) => Promise<void>;
  deleteRecipeAction: (formData: FormData) => Promise<void>;
}) {
  const [recipeEditId, setRecipeEditId] = useState<string | null>(null);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Recipes</h2>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {recipes.length}
        </span>
      </div>

      <div className="space-y-4">
        {recipes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recipes yet. Create one using your saved ingredients.
          </p>
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="rounded-3xl border border-border bg-background p-4"
            >
              {recipeEditId === recipe.id ? (
                <form action={updateRecipeAction} className="space-y-4">
                  <input type="hidden" name="recipeId" value={recipe.id} />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Title
                    </label>
                    <input
                      name="title"
                      defaultValue={recipe.title}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={recipe.description ?? ""}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Type
                    </label>
                    <Select name="type">
                      <SelectTrigger>
                        <SelectValue>{recipe.type}</SelectValue>
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
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRecipeEditId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold">{recipe.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {recipe.type}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRecipeEditId(recipe.id)}
                      >
                        Edit
                      </Button>
                      <form action={deleteRecipeAction} className="inline">
                        <input
                          type="hidden"
                          name="recipeId"
                          value={recipe.id}
                        />
                        <Button type="submit" variant="destructive" size="sm">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                  {recipe.description ? (
                    <p className="text-sm text-muted-foreground">
                      {recipe.description}
                    </p>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {recipe.recipeIngredients.map((item) => (
                      <div
                        key={item.ingredient.id}
                        className="rounded-2xl border border-border bg-muted/50 p-3"
                      >
                        <p className="font-medium">{item.ingredient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
