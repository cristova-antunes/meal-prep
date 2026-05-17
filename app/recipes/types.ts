import { Ingredient } from "../generated/prisma/client";
import type { RecipeIngredientModel } from "../generated/prisma/models/RecipeIngredient";

export type recipeIngredient = RecipeIngredientModel & {
  ingredient?: Ingredient | null;
};
