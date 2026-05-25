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

export default async function IngredientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await currentUser();

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
      id: params.id,
      clerkId: user.id,
    },
    select: {
      id: true,
      name: true,
      recipes: {
        where: { clerkId: user.id },
        orderBy: { title: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
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
        <div>
          <h1 className="text-3xl font-semibold">{ingredient.name}</h1>
          <p className="text-sm text-muted-foreground">Ingredient details</p>
        </div>
        <Link
          href="/ingredients"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to ingredients
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingredient</CardTitle>
          <CardDescription>
            This ingredient is stored in your personal ingredient list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ingredient ID: {ingredient.id}
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Used in recipes</CardTitle>
          <CardDescription>
            Recipes that include this ingredient.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ingredient.recipes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recipes currently use this ingredient.
            </p>
          ) : (
            <ul className="space-y-4">
              {ingredient.recipes.map((recipe) => (
                <li key={recipe.id}>
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="text-base font-semibold text-primary hover:underline"
                  >
                    {recipe.title}
                  </Link>
                  {recipe.description ? (
                    <p className="text-sm text-muted-foreground">
                      {recipe.description}
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
