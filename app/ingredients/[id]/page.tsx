import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import IngredientBadge from "@/components/feature/IngredientBadge";

export default async function IngredientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  const resolvedParams = await params;

  if (!user) {
    return (
      <div>
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">
            Sign in to view this ingredient
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Ingredient details are available once you sign in.
          </p>
        </div>
      </div>
    );
  }

  const ingredient = await prisma.ingredient.findFirst({
    where: {
      id: resolvedParams.id,
      clerkId: user.id,
    },
    select: {
      id: true,
      name: true,
      type: true,
      recipeIngredients: {
        where: { recipe: { clerkId: user.id } },
        orderBy: { recipe: { title: "asc" } },
        select: {
          recipe: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!ingredient) {
    notFound();
  }

  return (
    <main>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{ingredient.name}</h1>
          {ingredient.type ? <IngredientBadge type={ingredient.type} /> : null}
        </div>
        <Link
          href="/ingredients"
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft className="mr-1" />
          Back
        </Link>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Used in recipes</CardTitle>
          <CardDescription>
            Recipes that include this ingredient.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ingredient.recipeIngredients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recipes currently use this ingredient.
            </p>
          ) : (
            <ul className="space-y-4">
              {ingredient.recipeIngredients.map((recipeIngredient) => (
                <li key={recipeIngredient.recipe.id}>
                  <Link
                    href={`/recipes/${recipeIngredient.recipe.id}`}
                    className="text-base font-semibold text-primary hover:underline"
                  >
                    {recipeIngredient.recipe.title}
                  </Link>
                  {recipeIngredient.recipe.description ? (
                    <p className="text-sm text-muted-foreground">
                      {recipeIngredient.recipe.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
