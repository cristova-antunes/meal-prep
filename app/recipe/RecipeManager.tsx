"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ingredient } from "../generated/prisma/client";
import { RecipeListItem } from "./types";
import CreateIngredientCard from "./CreateIngredientCard";
import CreateRecipeCard from "./CreateRecipeCard";
import IngredientsCard from "./IngredientsCard";
import RecipesCard from "./RecipesCard";

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleCreateIngredient(formData: FormData) {
    await createIngredientAction(formData);
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleUpdateIngredient(formData: FormData) {
    await updateIngredientAction(formData);
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDeleteIngredient(formData: FormData) {
    await deleteIngredientAction(formData);
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleCreateRecipe(formData: FormData) {
    await createRecipeAction(formData);
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleUpdateRecipe(formData: FormData) {
    await updateRecipeAction(formData);
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDeleteRecipe(formData: FormData) {
    await deleteRecipeAction(formData);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6">
        <CreateIngredientCard
          onCreate={handleCreateIngredient}
          disabled={isPending}
        />
        <CreateRecipeCard
          ingredients={ingredients}
          createRecipeAction={handleCreateRecipe}
        />
      </div>

      <div className="space-y-6">
        <IngredientsCard
          ingredients={ingredients}
          updateIngredientAction={handleUpdateIngredient}
          deleteIngredientAction={handleDeleteIngredient}
        />
        <RecipesCard
          recipes={recipes}
          updateRecipeAction={handleUpdateRecipe}
          deleteRecipeAction={handleDeleteRecipe}
        />
      </div>
    </div>
  );
}
