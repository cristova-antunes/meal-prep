"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IngredientType, RecipeType } from "../generated/prisma/enums";
import RecipeTypeBadge from "@/components/feature/RecipeTypeBadge";
import IngredientBadge from "@/components/feature/IngredientBadge";
import { Badge } from "@/components/ui/badge";
import { ingredientType as ingredientTypeOptions } from "@/types/types";
import { saveWeeklyMealPrep, resetWeeklyMealPrep } from "./actions";

type RecipeItem = {
  id: string;
  title: string;
  type: RecipeType;
  ingredients: { id: string; name: string; type: IngredientType | null }[];
};

export type PrepSlot = {
  id: string;
  dinnerLabel: string;
  lunchLabel: string;
  recipeId: string | null;
  date: Date;
};

type MealPrepPlannerProps = {
  slots: PrepSlot[];
  recipes: RecipeItem[];
  weekStartLabel: string;
  weekEndLabel: string;
  weeklyMenuId: string;
  previousWeeklyMenuRecipeIds?: string[];
};

function buildIngredientGroups(recipes: RecipeItem[]) {
  const groups = new Map<
    string,
    {
      id: string;
      type: IngredientType | null;
      label: string;
      ingredients: {
        id: string;
        name: string;
        type: IngredientType | null;
        recipes: RecipeItem[];
      }[];
    }
  >();

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      const typeKey = ingredient.type ?? "uncategorized";
      const typeLabel =
        ingredientTypeOptions.find((option) => option.value === ingredient.type)
          ?.label || "Uncategorized";

      const typeGroup = groups.get(typeKey);

      if (typeGroup) {
        const ingredientEntry = typeGroup.ingredients.find(
          (item) => item.id === ingredient.id,
        );

        if (ingredientEntry) {
          if (!ingredientEntry.recipes.some((item) => item.id === recipe.id)) {
            ingredientEntry.recipes.push(recipe);
          }
        } else {
          typeGroup.ingredients.push({
            id: ingredient.id,
            name: ingredient.name,
            type: ingredient.type,
            recipes: [recipe],
          });
        }
      } else {
        groups.set(typeKey, {
          id: typeKey,
          type: ingredient.type,
          label: typeLabel,
          ingredients: [
            {
              id: ingredient.id,
              name: ingredient.name,
              type: ingredient.type,
              recipes: [recipe],
            },
          ],
        });
      }
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      ingredients: group.ingredients.sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function RecipeSelect({
  id,
  value,
  onChange,
  recipes,
  previousWeeklyMenuRecipeIds,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  recipes: RecipeItem[];
  previousWeeklyMenuRecipeIds?: string[];
}) {
  const previousRecipeIds = new Set(previousWeeklyMenuRecipeIds);

  return (
    <Select value={value} onValueChange={(v) => onChange(v)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Choose recipe..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="empty">Choose recipe...</SelectItem>
        {recipes.map((recipe) => {
          const isPreviousWeek = previousRecipeIds.has(recipe.id);
          return (
            <SelectItem key={recipe.id} value={recipe.id}>
              <span className="flex flex-wrap items-center gap-2">
                <span>{recipe.title}</span>
                <RecipeTypeBadge type={recipe.type} />
                {isPreviousWeek && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-800"
                  >
                    Previous week
                  </Badge>
                )}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export default function MealPrepPlanner({
  slots,
  recipes,
  weekStartLabel,
  weekEndLabel,
  weeklyMenuId,
  previousWeeklyMenuRecipeIds,
}: MealPrepPlannerProps) {
  const [assignments, setAssignments] = useState<Record<string, string>>(() =>
    Object.fromEntries(slots.map((slot) => [slot.id, slot.recipeId ?? ""])),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filledCount = Object.values(assignments).filter(Boolean).length;

  function handleChange(slotId: string, recipeId: string) {
    setAssignments((current) => {
      const normalizedRecipeId = recipeId === "empty" ? "" : recipeId;

      if (normalizedRecipeId) {
        const duplicate = Object.entries(current).find(
          ([otherSlotId, otherRecipeId]) =>
            otherSlotId !== slotId && otherRecipeId === normalizedRecipeId,
        );

        if (duplicate) {
          toast.error(
            "That recipe is already selected on another day this week.",
          );
          return current;
        }
      }

      return {
        ...current,
        [slotId]: normalizedRecipeId,
      };
    });

    setError(null);
    setSuccess(null);
  }

  const router = useRouter();

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const slotDates = Object.fromEntries(
        slots.map((slot) => [slot.id, slot.date]),
      );
      const result = await saveWeeklyMealPrep(
        weeklyMenuId,
        assignments,
        slotDates,
      );
      setSuccess("Meal prep plan saved successfully!");
      router.push(`/meal-prep/${result.weeklyMenuId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save meal prep plan",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("Are you sure you want to reset all your meal assignments?")) {
      return;
    }
    setIsResetting(true);
    setError(null);
    setSuccess(null);
    try {
      await resetWeeklyMealPrep(weeklyMenuId);
      setAssignments(Object.fromEntries(slots.map((slot) => [slot.id, ""])));
      setSuccess("Meal prep plan reset successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset plan");
    } finally {
      setIsResetting(false);
    }
  }

  const selectedRecipeIds = new Set(
    Object.values(assignments).filter((value) => value),
  );

  const ingredientSourceRecipes =
    selectedRecipeIds.size > 0
      ? recipes.filter((recipe) => selectedRecipeIds.has(recipe.id))
      : [];

  const ingredientTypeGroups = buildIngredientGroups(ingredientSourceRecipes);
  const ingredientCount = ingredientTypeGroups.reduce(
    (count, group) => count + group.ingredients.length,
    0,
  );
  const ingredientSourceLabel =
    selectedRecipeIds.size > 0
      ? "Selected recipes"
      : "Choose a recipe to build your shopping list";

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

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-600 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

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
                    previousWeeklyMenuRecipeIds={previousWeeklyMenuRecipeIds}
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

        <div className="flex gap-3 p-2 pb-4 sticky bottom-0 bg-background">
          <Button
            onClick={handleSave}
            disabled={isSaving || filledCount === 0}
            size="lg"
            className="flex-1"
          >
            {isSaving ? "Saving..." : "Save Meal Prep Week"}
          </Button>
          <Button
            onClick={handleReset}
            disabled={isResetting || filledCount === 0}
            variant="outline"
            size="lg"
          >
            {isResetting ? "Resetting..." : "Reset"}
          </Button>
        </div>
      </section>
      <aside className="space-y-4">
        <Card className="sticky top-4">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {ingredientSourceLabel}
            </p>
            <h2 className="mt-3 text-xl font-semibold">
              Ingredient shopping list
            </h2>
            {ingredientTypeGroups.length > 0 && (
              <p className="mt-2 mb-6 text-sm">
                {ingredientCount} ingredients across{" "}
                {ingredientTypeGroups.length} categories
              </p>
            )}
            <p className="mt-2 mb-2 text-sm text-muted-foreground">
              Ingredients are grouped by type. Expand an ingredient to view the
              recipes that use it.
            </p>

            {ingredientTypeGroups.length === 0 ? (
              <p>
                No ingredient groups are available yet. Assign a recipe to a
                slot to build the list.
              </p>
            ) : (
              <div className="space-y-4">
                {ingredientTypeGroups.map((group) => (
                  <div
                    key={group.id}
                    className="space-y-3 rounded-3xl border border-border bg-muted/50 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        {group.type ? (
                          <IngredientBadge type={group.type} />
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-800"
                          >
                            Uncategorized
                          </Badge>
                        )}
                        <span className="text-sm font-medium">
                          {group.label}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {group.ingredients.length} ingredient
                        {group.ingredients.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <Accordion type="single" collapsible>
                      {group.ingredients.map((ingredient) => (
                        <AccordionItem
                          key={ingredient.id}
                          value={ingredient.id}
                        >
                          <AccordionTrigger className="text-base">
                            <span>{ingredient.name}</span>
                            <span className="text-muted-foreground ml-1">
                              {ingredient.recipes.length} recipe
                              {ingredient.recipes.length > 1 ? "s" : ""}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ol className="space-y-2 list-inside list-decimal">
                              {ingredient.recipes.map((recipe) => (
                                <li key={recipe.id}>{recipe.title}</li>
                              ))}
                            </ol>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
