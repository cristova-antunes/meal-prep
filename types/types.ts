import { Ingredient, Recipe } from "@/app/generated/prisma/client";
import { RecipeIngredientModel } from "@/app/generated/prisma/models";

export type recipeIngredient = RecipeIngredientModel & {
  ingredient?: Ingredient | null;
};

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
  { value: "MEAT", label: "Meat", colors: "bg-yellow-100 text-yellow-800" },
  { value: "FISH", label: "Fish", colors: "bg-blue-100 text-blue-800" },
  {
    value: "VEGETARIAN",
    label: "Vegetarian",
    colors: "bg-green-100 text-green-800",
  },
  { value: "DESSERT", label: "Dessert", colors: "bg-pink-100 text-pink-800" },
  { value: "SNACK", label: "Snack", colors: "bg-purple-100 text-purple-800" },
] as const;

export type RecipeWithIngredients = Recipe & {
  recipeIngredients: Array<{
    ingredient: Ingredient;
    quantity: string;
  }>;
};
