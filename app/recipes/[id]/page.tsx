import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  getRecipeHealthStatus,
  toPrismaRecipeHealthStatus,
} from "@/lib/recipe-health";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DeleteRecipeForm from "../DeleteRecipeForm";
import IngredientsEditor from "../IngredientsEditor";
import RecipeFeedbackForm from "../RecipeFeedbackForm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import RecipeTypeBadge from "@/components/feature/RecipeTypeBadge";
import RecipeHealthAnalyzer from "@/components/feature/RecipeHealthAnalyzer";
import FavoriteToggle from "../FavoriteToggle";
import { Badge } from "@/components/ui/badge";

async function addIngredientToRecipe(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to modify recipes.");

  const recipeId = formData.get("recipeId")?.toString();
  const ingredientName = formData.get("ingredientName")?.toString();
  const quantity = (formData.get("quantity")?.toString() || "1").trim();

  if (!recipeId || !ingredientName) throw new Error("Missing ids.");
  let ingredient = await prisma.ingredient.findFirst({
    where: { name: ingredientName, clerkId: user.id },
  });

  if (!ingredient) {
    ingredient = await prisma.ingredient.create({
      data: { name: ingredientName, clerkId: user.id },
    });
  }

  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId,
        ingredientId: ingredient.id,
        quantity,
        clerkId: `${user.id}`,
      },
    ],
  });

  const recipeIngredientRows = await prisma.recipeIngredient.findMany({
    where: { recipeId },
    include: { ingredient: true },
  });

  await prisma.recipe.updateMany({
    where: { id: recipeId, clerkId: user.id },
    data: {
      healthStatus: toPrismaRecipeHealthStatus(
        getRecipeHealthStatus(recipeIngredientRows),
      ),
    },
  });
}

async function removeIngredientFromRecipe(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to modify recipes.");

  const recipeId = formData.get("recipeId")?.toString();
  const ingredientName = formData.get("ingredientName")?.toString();

  if (!recipeId || !ingredientName) throw new Error("Missing ids.");

  const ingredient = await prisma.ingredient.findFirst({
    where: { name: ingredientName, clerkId: user.id },
  });

  if (!ingredient) throw new Error("Ingredient not found.");

  await prisma.recipeIngredient.deleteMany({
    where: { recipeId, ingredientId: ingredient.id },
  });

  const recipeIngredientRows = await prisma.recipeIngredient.findMany({
    where: { recipeId },
    include: { ingredient: true },
  });

  await prisma.recipe.updateMany({
    where: { id: recipeId, clerkId: user.id },
    data: {
      healthStatus: toPrismaRecipeHealthStatus(
        getRecipeHealthStatus(recipeIngredientRows),
      ),
    },
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
  const ingredientName = formData.get("ingredientName")?.toString();
  const quantity = (formData.get("quantity")?.toString() || "1").trim();

  if (!recipeId || !ingredientName) throw new Error("Missing ids.");

  const ingredient = await prisma.ingredient.findFirst({
    where: { name: ingredientName, clerkId: user.id },
  });

  if (!ingredient) throw new Error("Ingredient not found.");

  await prisma.recipeIngredient.updateMany({
    where: { recipeId, ingredientId: ingredient.id },
    data: { quantity },
  });
}

async function toggleFavorite(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to modify recipes.");

  const recipeId = formData.get("recipeId")?.toString();
  const isFavorite = formData.get("isFavorite")?.toString() === "true";

  if (!recipeId) throw new Error("Missing recipe id.");

  await prisma.recipe.updateMany({
    where: { id: recipeId, clerkId: user.id },
    data: { isFavorite: !isFavorite },
  });
}

async function submitRecipeFeedback(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to submit feedback.");

  const recipeId = formData.get("recipeId")?.toString();
  const rating = parseInt(formData.get("rating")?.toString() || "0");
  const easiness = parseInt(formData.get("easiness")?.toString() || "0");
  const flavor = parseInt(formData.get("flavor")?.toString() || "0");
  const comment = formData.get("comment")?.toString() || null;

  if (!recipeId || !rating || !easiness || !flavor) {
    throw new Error("Missing required feedback fields.");
  }

  await prisma.recipeFeedback.create({
    data: {
      recipeId,
      rating,
      easiness,
      flavor,
      comment,
      clerkId: user.id,
    },
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
      <div>
        <Card className="p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">
            Sign in to view this recipe
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Your recipes are stored per Clerk user.
          </p>
        </Card>
      </div>
    );
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      recipeIngredients: { include: { ingredient: true } },
      dailyMenus: {
        include: {
          weeklyMenus: true,
        },
      },
    },
  });

  if (!recipe || recipe.clerkId !== user.id) {
    return (
      <main className="">
        <Card className="p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">Recipe not found</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Could not find a recipe with that id.
          </p>
        </Card>
      </main>
    );
  }

  const userIngredients = await prisma.ingredient.findMany({
    where: { clerkId: user.id },
    orderBy: { name: "asc" },
  });

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{recipe.title}</h1>
          {recipe.description ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {recipe.description}
            </p>
          ) : null}

          <div className="mt-2 flex gap-2 items-center">
            <RecipeTypeBadge type={recipe.type} />
            {recipe.isCustom && (
              <Badge variant="outline" className="ml-2">
                Custom
              </Badge>
            )}
            {recipe.instagramURL ? (
              <Link
                href={recipe.instagramURL}
                target="_blank"
                className={buttonVariants({ variant: "link", size: "sm" })}
              >
                <ExternalLink className="mr-1" />
                Instagram
              </Link>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <FavoriteToggle
            recipeId={id}
            isFavorite={recipe.isFavorite}
            toggleFavorite={toggleFavorite}
          />
          <Link
            href="/recipes"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="mr-1" />
            Back
          </Link>

          <DeleteRecipeForm recipeId={id} deleteAction={deleteRecipe} />
        </div>
      </div>

      <RecipeHealthAnalyzer recipeIngredients={recipe.recipeIngredients} />

      <div className="grid md:grid-cols-2 gap-6">
        <IngredientsEditor
          recipeId={id}
          recipeIngredients={recipe.recipeIngredients}
          allIngredients={userIngredients}
          addAction={addIngredientToRecipe}
          removeAction={removeIngredientFromRecipe}
          updateAction={updateIngredientQuantity}
        />
        <RecipeFeedbackForm recipeId={id} submitAction={submitRecipeFeedback} />
      </div>

      {recipe.dailyMenus.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Used in Weekly Menus</h2>
          <div className="grid gap-4">
            {Array.from(
              new Map(
                recipe.dailyMenus
                  .flatMap((dm) => dm.weeklyMenus)
                  .map((wm) => [wm.id, wm]),
              ).values(),
            ).map((weeklyMenu) => (
              <Card key={weeklyMenu.id} className="p-4">
                <Link
                  href={`/meal-prep/${weeklyMenu.id}`}
                  className="flex justify-between items-center hover:opacity-80 transition-opacity"
                >
                  <div>
                    <h3 className="font-semibold">{weeklyMenu.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      Week {weeklyMenu.week}, {weeklyMenu.year}
                    </p>
                  </div>
                  <ExternalLink className="text-muted-foreground" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
