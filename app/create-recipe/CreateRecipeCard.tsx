"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Ingredient } from "../generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recipeTypes } from "@/types/types";

export default function CreateRecipeCard({
  ingredients,
  createRecipeAction,
}: {
  ingredients: Ingredient[];
  createRecipeAction: (formData: FormData) => Promise<void>;
}) {
  const [ingredientRowCount, setIngredientRowCount] = useState(1);

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Create recipe</CardTitle>
        </CardHeader>
        <CardContent>
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
                required
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
            <div>
              <label
                className="mb-2 block text-sm font-medium text-muted-foreground"
                htmlFor="recipe-instagram-url"
              >
                Instagram URL
              </label>
              <Input
                id="recipe-instagram-url"
                name="instagramUrl"
                placeholder="e.g. https://www.instagram.com/p/..."
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
                <Select name="type" required>
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

              <div className="flex items-end gap-2 ">
                <Checkbox id="recipe-is-custom" name="isCustom" value="true" />
                <label
                  className="text-sm font-medium text-muted-foreground"
                  htmlFor="recipe-is-custom"
                >
                  Custom recipe
                </label>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-dashed border-border p-4 bg-neutral-100">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold">Recipe ingredients</h3>
                <p className="text-sm text-muted-foreground mr-auto">
                  {ingredientRowCount} total ingredient
                  {ingredientRowCount === 1 ? "" : "s"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIngredientRowCount((count) => count + 1)}
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

                      <Combobox
                        items={ingredients.map((ingredient) => ingredient.name)}
                        name="ingredientIds"
                      >
                        <ComboboxInput placeholder="Select an ingredient" />
                        <ComboboxContent>
                          <ComboboxEmpty>No ingredients yet</ComboboxEmpty>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item} value={item}>
                                {item}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
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
            </div>

            <Button type="submit">Save recipe</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
