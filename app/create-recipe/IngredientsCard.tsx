"use client";

import { useState } from "react";
import { Ingredient } from "../generated/prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ingredientType } from "@/types/types";

export default function IngredientsCard({
  ingredients,
  updateIngredientAction,
  deleteIngredientAction,
}: {
  ingredients: Ingredient[];
  updateIngredientAction: (formData: FormData) => Promise<void>;
  deleteIngredientAction: (formData: FormData) => Promise<void>;
}) {
  const [ingredientEditId, setIngredientEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <section>
      <Card className="max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Ingredients</CardTitle>
              <p className="text-sm text-muted-foreground">
                {ingredients.length} total ingredient
                {ingredients.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:w-72">
              <label className="sr-only" htmlFor="ingredient-search">
                Search ingredients
              </label>
              <Input
                id="ingredient-search"
                type="search"
                placeholder="Search ingredients"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {ingredients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ingredients yet. Add one above.
              </p>
            ) : filteredIngredients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ingredients match your search.
              </p>
            ) : (
              filteredIngredients.map((ingredient) => (
                <Card key={ingredient.id} size="sm">
                  <CardContent>
                    {ingredientEditId === ingredient.id ? (
                      <form
                        action={updateIngredientAction}
                        className="space-y-3"
                      >
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
                        <div>
                          <label className="mb-2 block text-sm font-medium text-muted-foreground">
                            Type
                          </label>
                          <select
                            name="type"
                            defaultValue={ingredient.type ?? ""}
                            className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">None</option>
                            {ingredientType.map((typeOption) => (
                              <option
                                key={typeOption.value}
                                value={typeOption.value}
                              >
                                {typeOption.label}
                              </option>
                            ))}
                          </select>
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
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
