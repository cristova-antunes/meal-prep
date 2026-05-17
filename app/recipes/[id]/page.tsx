import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import DeleteRecipeForm from "../DeleteRecipeForm";
import IngredientsEditor from "../IngredientsEditor";

async function addIngredientToRecipe(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to modify recipes.");

  const recipeId = formData.get("recipeId")?.toString();
  const ingredientId = formData.get("ingredientId")?.toString();
  const quantity = (formData.get("quantity")?.toString() || "1").trim();

  if (!recipeId || !ingredientId) throw new Error("Missing ids.");

  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId,
        ingredientId,
        quantity,
        clerkId: `${user.id}-${recipeId}-${ingredientId}`,
      },
    ],
  });
}

async function removeIngredientFromRecipe(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to modify recipes.");

  const recipeId = formData.get("recipeId")?.toString();
  const ingredientId = formData.get("ingredientId")?.toString();

  if (!recipeId || !ingredientId) throw new Error("Missing ids.");

  await prisma.recipeIngredient.deleteMany({
    where: { recipeId, ingredientId },
  });
}

async function deleteRecipe(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to delete recipes.");

  const recipeId = formData.get("recipeId")?.toString();
  if (!recipeId) throw new Error("Missing recipe id.");

  await prisma.recipeIngredient.deleteMany({ where: { recipeId } });
  await prisma.recipe.deleteMany({ where: { id: recipeId, clerkId: user.id } });
}

async function updateIngredientQuantity(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to modify recipes.");

  const recipeId = formData.get("recipeId")?.toString();
  const ingredientId = formData.get("ingredientId")?.toString();
  const quantity = (formData.get("quantity")?.toString() || "1").trim();

  if (!recipeId || !ingredientId) throw new Error("Missing ids.");

  await prisma.recipeIngredient.updateMany({
    where: { recipeId, ingredientId },
    data: { quantity },
  });
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await currentUser();
  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">
            Sign in to view this recipe
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Your recipes are stored per Clerk user.
          </p>
        </div>
      </div>
    );
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      recipeIngredients: { include: { ingredient: true } },
    },
  });

  if (!recipe || recipe.clerkId !== user.id) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Recipe not found</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Could not find a recipe with that id.
          </p>
        </div>
      </main>
    );
  }

  const userIngredients = await prisma.ingredient.findMany({
    where: { clerkId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{recipe.title}</h1>
          {recipe.description ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {recipe.description}
            </p>
          ) : null}
          <p className="mt-2 text-sm">Type: {recipe.type}</p>
          {recipe.instagramURL ? (
            <p className="mt-2 text-sm">
              Instagram:{" "}
              <Link
                href={recipe.instagramURL}
                className={buttonVariants({ variant: "link", size: "sm" })}
              >
                {recipe.instagramURL}
              </Link>
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/recipes"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Back
          </Link>
          <DeleteRecipeForm recipeId={id} deleteAction={deleteRecipe} />
        </div>
      </div>

      <IngredientsEditor
        recipeId={id}
        recipeIngredients={recipe.recipeIngredients}
        allIngredients={userIngredients}
        addAction={addIngredientToRecipe}
        removeAction={removeIngredientFromRecipe}
        updateAction={updateIngredientQuantity}
      />
    </main>
  );
}
