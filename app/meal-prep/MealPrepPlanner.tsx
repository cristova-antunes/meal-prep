"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

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

  function resetAssignments() {
    setAssignments(
      Object.fromEntries(slots.map((slot) => [slot.id, slot.recipeId ?? ""])),
    );
  }

  function autofillAssignments() {
    setAssignments(
      Object.fromEntries(
        slots.map((slot, index) => [
          slot.id,
          recipes[index % recipes.length]?.id ?? "",
        ]),
      ),
    );
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
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Upcoming meal prep week
              </p>
              <h1 className="text-3xl font-semibold">
                Sunday through Saturday
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Each slot represents one recipe cooked for dinner and then used
                again for lunch the next day. The current draft covers{" "}
                {weekStartLabel} through {weekEndLabel}.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background p-3 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Slots
                </p>
                <p className="mt-2 text-2xl font-semibold">{slots.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-3 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Assigned
                </p>
                <p className="mt-2 text-2xl font-semibold">{filledCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-3 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Open
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {slots.length - filledCount}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={autofillAssignments}
            >
              Auto-fill slots
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetAssignments}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {slots.map((slot, index) => (
            <article
              key={slot.id}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
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
                <select
                  id={`recipe-${slot.id}`}
                  value={assignments[slot.id]}
                  onChange={(event) =>
                    handleChange(slot.id, event.target.value)
                  }
                  className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/50"
                >
                  <option value="">Choose recipe...</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.title} — {recipe.type}
                    </option>
                  ))}
                </select>
                {assignments[slot.id] ? (
                  <p className="text-sm text-muted-foreground">
                    This recipe will cover tonight&apos;s dinner and
                    tomorrow&apos;s lunch.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a recipe to prepare for this dinner + next day lunch
                    slot.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            {ingredientSourceLabel}
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Ingredient shopping list
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Each accordion section shows the recipes that use that ingredient.
          </p>
        </div>

        {ingredientGroups.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
            No ingredient groups are available yet. Assign a recipe to a slot to
            build the list.
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {ingredientGroups.map((group) => (
              <AccordionItem
                key={group.id}
                value={group.id}
                className="rounded-2xl border border-border bg-background"
              >
                <AccordionTrigger className="px-4">
                  <span>{group.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {group.recipes.length} recipe
                    {group.recipes.length > 1 ? "s" : ""}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <ul className="space-y-2">
                    {group.recipes.map((recipe) => (
                      <li
                        key={recipe.id}
                        className="rounded-2xl border border-border bg-card px-3 py-2 text-sm"
                      >
                        {recipe.title} — {recipe.type}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </aside>
    </div>
  );
}
