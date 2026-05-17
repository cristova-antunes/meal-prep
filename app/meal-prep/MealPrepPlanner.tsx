"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Card, CardContent } from "@/components/ui/card";

export type RecipeItem = {
  id: string;
  title: string;
  type: string;
  ingredients: { id: string; name: string }[];
};

export type PrepSlot = {
  id: string;
  dinnerLabel: string;
  lunchLabel: string;
  recipeId: string | null;
};

type MealPrepPlannerProps = {
  slots: PrepSlot[];
  recipes: RecipeItem[];
  weekStartLabel: string;
  weekEndLabel: string;
};

function buildIngredientGroups(recipes: RecipeItem[]) {
  const groups = new Map<
    string,
    { id: string; name: string; recipes: RecipeItem[] }
  >();

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      const existing = groups.get(ingredient.id);
      if (existing) {
        if (!existing.recipes.some((item) => item.id === recipe.id)) {
          existing.recipes.push(recipe);
        }
      } else {
        groups.set(ingredient.id, {
          id: ingredient.id,
          name: ingredient.name,
          recipes: [recipe],
        });
      }
    });
  });

  return Array.from(groups.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

function RecipeSelect({
  id,
  value,
  onChange,
  recipes,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  recipes: RecipeItem[];
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Choose recipe..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="empty">Choose recipe...</SelectItem>
        {recipes.map((recipe) => (
          <SelectItem key={recipe.id} value={recipe.id}>
            {recipe.title} — {recipe.type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function MealPrepPlanner({
  slots,
  recipes,
  weekStartLabel,
  weekEndLabel,
}: MealPrepPlannerProps) {
  const [assignments, setAssignments] = useState<Record<string, string>>(() =>
    Object.fromEntries(slots.map((slot) => [slot.id, slot.recipeId ?? ""])),
  );

  const filledCount = Object.values(assignments).filter(Boolean).length;

  function handleChange(slotId: string, recipeId: string) {
    setAssignments((current) => ({
      ...current,
      [slotId]: recipeId,
    }));
  }

  const selectedRecipeIds = new Set(
    Object.values(assignments).filter((value) => value),
  );

  const ingredientSourceRecipes =
    selectedRecipeIds.size > 0
      ? recipes.filter((recipe) => selectedRecipeIds.has(recipe.id))
      : recipes;

  const ingredientGroups = buildIngredientGroups(ingredientSourceRecipes);
  const ingredientSourceLabel =
    selectedRecipeIds.size > 0 ? "Selected recipes" : "All available recipes";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Upcoming meal prep week
            </p>
            <h1 className="text-3xl font-semibold">
              {weekStartLabel} to {weekEndLabel}
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              {filledCount} of {slots.length} slots filled
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {slots.map((slot, index) => (
            <Card key={slot.id}>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Slot {index + 1}
                    </p>
                    <h2 className="text-xl font-semibold">
                      {slot.dinnerLabel} &mdash; {slot.lunchLabel}
                    </h2>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
                    {slot.dinnerLabel.split(",")[0]}
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  <label
                    className="block text-sm font-medium text-foreground"
                    htmlFor={`recipe-${slot.id}`}
                  >
                    Recipe for this slot
                  </label>
                  <RecipeSelect
                    id={`recipe-${slot.id}`}
                    value={assignments[slot.id]}
                    onChange={(recipeId: string) =>
                      handleChange(slot.id, recipeId)
                    }
                    recipes={recipes}
                  />
                  {assignments[slot.id] ? (
                    <p className="text-sm text-muted-foreground">
                      This recipe will cover tonight&apos;s dinner and
                      tomorrow&apos;s lunch.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a recipe to prepare for this dinner + next day
                      lunch slot.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <aside className="space-y-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {ingredientSourceLabel}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Ingredient shopping list
            </h2>
            <p className="mt-2 mb-4 text-sm text-muted-foreground">
              Each accordion section shows the recipes that use that ingredient.
            </p>
            {ingredientGroups.length === 0 ? (
              <p>
                No ingredient groups are available yet. Assign a recipe to a
                slot to build the list.
              </p>
            ) : (
              <Accordion type="single" collapsible>
                {ingredientGroups.map((group) => (
                  <AccordionItem key={group.id} value={group.id}>
                    <AccordionTrigger className="text-base">
                      <span>{group.name}</span>
                      <span className="text-muted-foreground ml-1">
                        {group.recipes.length} recipe
                        {group.recipes.length > 1 ? "s" : ""}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-2 list-inside list-decimal">
                        {group.recipes.map((recipe) => (
                          <li key={recipe.id}>{recipe.title}</li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
