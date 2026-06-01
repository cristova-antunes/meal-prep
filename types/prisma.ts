import { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";

export type RecipesWithCount = Prisma.Result<
  typeof prisma.recipe,
  {
    select: {
      id: true;
      title: true;
      type: true;
      isCustom: true;
      instagramURL: true;
      thumbnailURL: true;
      description: true;
      isFavorite: true;
      _count: { select: { recipeFeedbacks: true } };
    };
  },
  "findMany"
>;

export type WeeklyMenuWithRecipesAndIngredients = Prisma.Result<
  typeof prisma.weeklyMenu,
  {
    include: {
      recipes: {
        include: {
          recipes: {
            include: {
              recipeIngredients: {
                include: {
                  ingredient: true;
                };
              };
            };
          };
        };
      };
    };
  },
  "findUnique"
>;

export type RecipesWithIngredients = Prisma.Result<
  typeof prisma.recipe,
  {
    select: {
      id: true;
      title: true;
      type: true;
      recipeIngredients: {
        select: {
          ingredient: {
            select: { id: true; name: true; type: true };
          };
        };
      };
    };
  },
  "findMany"
>;

export type WeeklyMenuWithRecipes = Prisma.Result<
  typeof prisma.weeklyMenu,
  {
    include: {
      recipes: {
        include: {
          recipes: true;
        };
      };
    };
  },
  "findMany"
>;

export type IngredientWithTheirRecipes = Prisma.Result<
  typeof prisma.ingredient,
  {
    select: {
      id: true;
      name: true;
      type: true;
      recipeIngredients: {
        select: {
          recipe: {
            select: {
              id: true;
              title: true;
              description: true;
            };
          };
        };
      };
    };
  },
  "findFirst"
>;
