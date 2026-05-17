import { prisma } from "@/lib/prisma";
import type { Recipe } from "@/app/generated/prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import RecipeManager from "./RecipeManager";
import { RecipeListItem } from "./types";

async function createIngredient(formData: FormData) {
  "use server";
  const user = await currentUser();

  if (!user) {
    throw new Error("You must be signed in to save ingredients.");
  }

  const name = (formData.get("name") ?? formData.get("ingredient-name"))
    ?.toString()
    .trim();

  if (!name) {
    throw new Error("Ingredient name is required.");
  }

  await prisma.ingredient.create({
    data: {
      name,
      clerkId: user.id,
    },
  });
}

async function updateIngredient(formData: FormData) {
  "use server";
  const user = await currentUser();

  if (!user) {
    throw new Error("You must be signed in to update ingredients.");
  }

  const name = (formData.get("name") ?? formData.get("ingredient-name"))
    ?.toString()
    .trim();
  const id = formData.get("ingredientId")?.toString();

  if (!id || !name) {
    throw new Error("Ingredient id and name are required.");
  }

  await prisma.ingredient.updateMany({
    where: {
      id,
      clerkId: user.id,
    },
    data: {
      name,
    },
  });
}

async function deleteIngredient(formData: FormData) {
  "use server";
  const user = await currentUser();

  if (!user) {
    throw new Error("You must be signed in to delete ingredients.");
  }

  const id = formData.get("ingredientId")?.toString();

  if (!id) {
    throw new Error("Ingredient id is required.");
  }

  await prisma.recipeIngredient.deleteMany({
    where: {
      ingredientId: id,
    },
  });

  await prisma.ingredient.deleteMany({
    where: {
      id,
      clerkId: user.id,
    },
  });
}

async function createRecipe(formData: FormData) {
  "use server";
  const user = await currentUser();

  if (!user) {
    throw new Error("You must be signed in to save recipes.");
  }

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const type = formData.get("type")?.toString();
  const ingredientIds = formData
    .getAll("ingredientIds")
    .map((id) => id.toString())
    .filter(Boolean);
  const quantities = formData
    .getAll("quantities")
    .map((quantity) => quantity.toString());

  if (!title || !type || ingredientIds.length === 0) {
    throw new Error(
      "Recipe title, type, and at least one ingredient are required.",
    );
  }

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      type: type as Recipe["type"],
      clerkId: user.id,
    },
  });

  const ingredientRows = ingredientIds
    .map((ingredientId, index) => ({
      ingredientId,
      quantity: quantities[index]?.trim() || "1",
    }))
    .filter((row) => row.ingredientId);

  if (ingredientRows.length > 0) {
    await prisma.recipeIngredient.createMany({
      data: ingredientRows.map((row) => ({
        recipeId: recipe.id,
        ingredientId: row.ingredientId,
        quantity: row.quantity,
        clerkId: `${user.id}-${recipe.id}-${row.ingredientId}`,
      })),
    });
  }
}

async function updateRecipe(formData: FormData) {
  "use server";
  const user = await currentUser();

  if (!user) {
    throw new Error("You must be signed in to update recipes.");
  }

  const id = formData.get("recipeId")?.toString();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const type = formData.get("type")?.toString();

  if (!id || !title || !type) {
    throw new Error("Recipe id, title, and type are required.");
  }

  await prisma.recipe.updateMany({
    where: {
      id,
      clerkId: user.id,
    },
    data: {
      title,
      description,
      type: type as Recipe["type"],
    },
  });
}

async function deleteRecipe(formData: FormData) {
  "use server";
  const user = await currentUser();

  if (!user) {
    throw new Error("You must be signed in to delete recipes.");
  }

  const id = formData.get("recipeId")?.toString();

  if (!id) {
    throw new Error("Recipe id is required.");
  }

  await prisma.recipeIngredient.deleteMany({
    where: {
      recipeId: id,
    },
  });

  await prisma.recipe.deleteMany({
    where: {
      id,
      clerkId: user.id,
    },
  });
}

export default async function RecipePage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">
            Sign in to manage your recipes
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Your ingredients and recipes are stored per Clerk user.
          </p>
        </div>
      </div>
    );
  }

  const ingredients = await prisma.ingredient.findMany({
    where: {
      clerkId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const recipes = await prisma.recipe.findMany({
    where: {
      clerkId: user.id,
    },
    include: {
      recipeIngredients: {
        include: {
          ingredient: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const recipeItems: RecipeListItem[] = recipes.map((recipe) => ({
    ...recipe,
    createdAt: recipe.createdAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-semibold">Ingredients & Recipes</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Create ingredients first, then build recipes by selecting from the
          ingredients you have created.
        </p>
      </div>

      <RecipeManager
        ingredients={ingredients}
        recipes={recipeItems}
        createIngredientAction={createIngredient}
        updateIngredientAction={updateIngredient}
        deleteIngredientAction={deleteIngredient}
        createRecipeAction={createRecipe}
        updateRecipeAction={updateRecipe}
        deleteRecipeAction={deleteRecipe}
      />
    </main>
  );
}
