"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ingredient } from "../generated/prisma/client";
import CreateIngredientCard from "./CreateIngredientCard";
import CreateRecipeCard from "./CreateRecipeCard";
import IngredientsCard from "./IngredientsCard";

export default function RecipeManager({
  ingredients,
  createIngredientAction,
  updateIngredientAction,
  deleteIngredientAction,
  createRecipeAction,
}: {
  ingredients: Ingredient[];
  createIngredientAction: (formData: FormData) => Promise<void>;
  updateIngredientAction: (formData: FormData) => Promise<void>;
  deleteIngredientAction: (formData: FormData) => Promise<void>;
  createRecipeAction: (formData: FormData) => Promise<void>;
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

      <IngredientsCard
        ingredients={ingredients}
        updateIngredientAction={handleUpdateIngredient}
        deleteIngredientAction={handleDeleteIngredient}
      />
    </div>
  );
}
