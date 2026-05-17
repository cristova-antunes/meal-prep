"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ingredient } from "../generated/prisma/client";
import { RecipeListItem, recipeTypes } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RecipeManager({
  ingredients,
  recipes,
  createIngredientAction,
  updateIngredientAction,
  deleteIngredientAction,
  createRecipeAction,
  updateRecipeAction,
  deleteRecipeAction,
}: {
  ingredients: Ingredient[];
  recipes: RecipeListItem[];
  createIngredientAction: (formData: FormData) => Promise<void>;
  updateIngredientAction: (formData: FormData) => Promise<void>;
  deleteIngredientAction: (formData: FormData) => Promise<void>;
  createRecipeAction: (formData: FormData) => Promise<void>;
  updateRecipeAction: (formData: FormData) => Promise<void>;
  deleteRecipeAction: (formData: FormData) => Promise<void>;
}) {
  "use client";

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [ingredientEditId, setIngredientEditId] = useState<string | null>(null);
  const [recipeEditId, setRecipeEditId] = useState<string | null>(null);
  const [ingredientRowCount, setIngredientRowCount] = useState(1);

  async function handleCreateIngredient(formData: FormData) {
    await createIngredientAction(formData);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Create ingredient</h2>
          <form action={handleCreateIngredient} className="space-y-4">
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
            <Button type="submit" disabled={isPending}>
              Save ingredient
            </Button>
          </form>
        </section>

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
                              <SelectItem
                                key={ingredient.id}
                                value={ingredient.id}
                              >
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
      </div>

      <div className="space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Ingredients</h2>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {ingredients.length}
            </span>
          </div>

          <div className="space-y-3">
            {ingredients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ingredients yet. Add one above.
              </p>
            ) : (
              ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="rounded-3xl border border-border bg-background p-4"
                >
                  {ingredientEditId === ingredient.id ? (
                    <form action={updateIngredientAction} className="space-y-3">
                      <input
                        type="hidden"
                        name="ingredientId"
                        value={ingredient.id}
                      />
                      <div>
                        <label className="mb-2 block text-sm font-medium text-muted-foreground">
                          Name
                        </label>
                        <Input name="name" defaultValue={ingredient.name} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" size="sm">
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIngredientEditId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{ingredient.name}</p>
                        <p
                          className="text-xs text-muted-foreground"
                          suppressHydrationWarning
                        >
                          Created at{" "}
                          {new Date(ingredient.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIngredientEditId(ingredient.id)}
                        >
                          Edit
                        </Button>
                        <form
                          action={deleteIngredientAction}
                          className="inline"
                        >
                          <input
                            type="hidden"
                            name="ingredientId"
                            value={ingredient.id}
                          />
                          <Button type="submit" variant="destructive" size="sm">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

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
                        <Input name="title" defaultValue={recipe.title} />
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
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
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
                          <p className="text-lg font-semibold">
                            {recipe.title}
                          </p>
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
                            <Button
                              type="submit"
                              variant="destructive"
                              size="sm"
                            >
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
                            <p className="font-medium">
                              {item.ingredient.name}
                            </p>
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
      </div>
    </div>
  );
}
