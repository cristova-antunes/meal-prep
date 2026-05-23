import { prisma } from "@/lib/prisma";
import type { Recipe } from "@/app/generated/prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import RecipeManager from "./RecipeManager";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { redirect } from "next/dist/client/components/navigation";

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
  const instagramUrl = formData.get("instagramUrl")?.toString().trim() || null;
  const type = formData.get("type")?.toString();
  const isCustom = formData.get("isCustom") === "true";
  const ingredientNames = formData
    .getAll("ingredientIds")
    .map((name) => name.toString())
    .filter(Boolean);
  const quantities = formData
    .getAll("quantities")
    .map((quantity) => quantity.toString());

  if (!title || !type || ingredientNames.length === 0) {
    throw new Error(
      "Recipe title, type, and at least one ingredient are required.",
    );
  }

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      instagramURL: instagramUrl,
      type: type as Recipe["type"],
      isCustom,
      clerkId: user.id,
    },
  });

  // Look up ingredient IDs by name
  const ingredients = await prisma.ingredient.findMany({
    where: {
      name: {
        in: ingredientNames,
      },
      clerkId: user.id,
    },
  });

  const ingredientNameToId: Record<string, string> = {};
  ingredients.forEach((ing) => {
    ingredientNameToId[ing.name] = ing.id;
  });

  const ingredientRows = ingredientNames
    .map((ingredientName, index) => ({
      ingredientId: ingredientNameToId[ingredientName],
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

  redirect(`/recipes/${recipe.id}`);
}

export default async function RecipePage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div>
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">
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

  return (
    <main>
      <div className="mb-8">
        <div className="flex justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold">Ingredients & Recipes</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Create ingredients first, then build recipes by selecting from the
              ingredients you have created.
            </p>
          </div>
          <Link
            href={"/recipes"}
            className={buttonVariants({ variant: "default" })}
          >
            Recipes
          </Link>
        </div>
      </div>

      <RecipeManager
        ingredients={ingredients}
        createIngredientAction={createIngredient}
        updateIngredientAction={updateIngredient}
        deleteIngredientAction={deleteIngredient}
        createRecipeAction={createRecipe}
      />
    </main>
  );
}
