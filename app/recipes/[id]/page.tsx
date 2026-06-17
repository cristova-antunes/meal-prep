import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  getRecipeHealthStatus,
  toPrismaRecipeHealthStatus,
} from "@/lib/recipe-health";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeleteRecipeForm from "../DeleteRecipeForm";
import IngredientsEditor from "../IngredientsEditor";
import RecipeFeedbackForm from "../RecipeFeedbackForm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import RecipeTypeBadge from "@/components/feature/RecipeTypeBadge";
import RecipeHealthAnalyzer from "@/components/feature/RecipeHealthAnalyzer";
import FavoriteToggle from "../FavoriteToggle";
import EditRecipeForm from "../EditRecipeForm";
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
    cacheStrategy: { ttl: 60, swr: 10 },
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
    skipDuplicates: true,
  });

  const recipeIngredientRows = await prisma.recipeIngredient.findMany({
    where: { recipeId },
    include: { ingredient: true },
    cacheStrategy: { ttl: 60, swr: 10 },
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
    cacheStrategy: { ttl: 60, swr: 10 },
  });

  if (!ingredient) throw new Error("Ingredient not found.");

  await prisma.recipeIngredient.deleteMany({
    where: { recipeId, ingredientId: ingredient.id },
  });

  const recipeIngredientRows = await prisma.recipeIngredient.findMany({
    where: { recipeId },
    include: { ingredient: true },
    cacheStrategy: { ttl: 60, swr: 10 },
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
    cacheStrategy: { ttl: 60, swr: 10 },
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
  const timeSpent = formData.get("timeSpent")?.toString() || null;
  const comment = formData.get("comment")?.toString() || null;

  if (!recipeId || !rating || !easiness || !flavor || !timeSpent) {
    throw new Error("Missing required feedback fields.");
  }

  await prisma.recipeFeedback.create({
    data: {
      recipeId,
      rating,
      easiness,
      flavor,
      timeSpent,
      comment,
      clerkId: user.id,
    },
  });
}

async function updateRecipeFeedback(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to update feedback.");

  const feedbackId = formData.get("feedbackId")?.toString();
  const rating = parseInt(formData.get("rating")?.toString() || "0");
  const easiness = parseInt(formData.get("easiness")?.toString() || "0");
  const flavor = parseInt(formData.get("flavor")?.toString() || "0");
  const timeSpent = formData.get("timeSpent")?.toString() || null;
  const comment = formData.get("comment")?.toString() || null;

  if (!feedbackId || !rating || !easiness || !flavor || !timeSpent) {
    throw new Error("Missing required feedback fields.");
  }

  await prisma.recipeFeedback.updateMany({
    where: { id: feedbackId, clerkId: user.id },
    data: { rating, easiness, flavor, timeSpent, comment },
  });
}

async function deleteRecipeFeedback(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to delete feedback.");

  const feedbackId = formData.get("feedbackId")?.toString();
  if (!feedbackId) throw new Error("Missing feedback id.");

  await prisma.recipeFeedback.deleteMany({
    where: { id: feedbackId, clerkId: user.id },
  });
}

async function updateRecipe(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to modify recipes.");

  const recipeId = formData.get("recipeId")?.toString();
  const title = formData.get("title")?.toString()?.trim();
  const description = formData.get("description")?.toString()?.trim() || null;

  if (!recipeId || !title) {
    throw new Error("Recipe name is required.");
  }

  await prisma.recipe.updateMany({
    where: { id: recipeId, clerkId: user.id },
    data: { title, description },
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
    cacheStrategy: { ttl: 60, swr: 10 },
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
    cacheStrategy: { ttl: 60, swr: 10 },
  });

  const feedbacks = await prisma.recipeFeedback.findMany({
    where: { recipeId: id, clerkId: user.id },
    orderBy: { createdAt: "desc" },
    cacheStrategy: { ttl: 60, swr: 10 },
  });

  const mappedFeedbacks = feedbacks.map((fb) => ({
    id: fb.id,
    rating: fb.rating,
    easiness: fb.easiness ?? 0,
    flavor: fb.flavor ?? 0,
    timeSpent: fb.timeSpent ?? null,
    comment: fb.comment ?? null,
    createdAt: fb.createdAt,
    updatedAt: fb.updatedAt,
  }));

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{recipe.title}</h1>

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
          <EditRecipeForm
            recipeId={id}
            title={recipe.title}
            description={recipe.description}
            updateAction={updateRecipe}
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

      {recipe.description ? (
        <Card className="my-6  border-indigo-400 bg-indigo-100">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>

          <CardContent>
            <p>{recipe.description}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid md:grid-cols-2 gap-6">
        <IngredientsEditor
          recipeId={id}
          recipeIngredients={recipe.recipeIngredients}
          allIngredients={userIngredients}
          addAction={addIngredientToRecipe}
          removeAction={removeIngredientFromRecipe}
          updateAction={updateIngredientQuantity}
        />
        <RecipeFeedbackForm
          recipeId={id}
          submitAction={submitRecipeFeedback}
          initialFeedbacks={mappedFeedbacks}
          updateAction={updateRecipeFeedback}
          deleteAction={deleteRecipeFeedback}
        />
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
