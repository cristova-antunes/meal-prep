import { Ingredient, Recipe } from "../generated/prisma/client";

export type RecipeListItem = {
  id: string;
  title: string;
  description: string | null;
  instagramURL?: string | null;
  type: string;
  createdAt: string;
  recipeIngredients: Array<{ ingredient: Ingredient; quantity: string }>;
};

export const recipeTypes = [
  { value: "MEAT", label: "Meat" },
  { value: "FISH", label: "Fish" },
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "DESSERT", label: "Dessert" },
  { value: "SNACK", label: "Snack" },
] as const;

export type RecipeWithIngredients = Recipe & {
  recipeIngredients: Array<{
    ingredient: Ingredient;
    quantity: string;
  }>;
};
