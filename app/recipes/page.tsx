import { currentUser } from "@clerk/nextjs/server";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma, RecipeType } from "@/app/generated/prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RecipeTypeBadge from "@/components/feature/RecipeTypeBadge";
import { Badge } from "@/components/ui/badge";
import RecipeFilters from "./RecipeFilters";
import { Heart } from "lucide-react";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await currentUser();

  if (!user) {
    return (
      <div>
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">
            Sign in to view your recipes
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Your recipes are stored per Clerk user.
          </p>
        </div>
      </div>
    );
  }
  // Build filters from `searchParams` (GET query string)
  const searchParamsResolved = await searchParams;

  const qParam = Array.isArray(searchParamsResolved?.q)
    ? searchParamsResolved?.q[0]
    : searchParamsResolved?.q;
  const typeParam = Array.isArray(searchParamsResolved?.type)
    ? searchParamsResolved?.type[0]
    : searchParamsResolved?.type;
  const customOnly =
    (Array.isArray(searchParamsResolved?.customOnly)
      ? searchParamsResolved?.customOnly[0]
      : searchParamsResolved?.customOnly) === "on";
  const instagramOnly =
    (Array.isArray(searchParamsResolved?.instagramOnly)
      ? searchParamsResolved?.instagramOnly[0]
      : searchParamsResolved?.instagramOnly) === "on";
  const neverCooked =
    (Array.isArray(searchParamsResolved?.neverCooked)
      ? searchParamsResolved?.neverCooked[0]
      : searchParamsResolved?.neverCooked) === "on";

  const where: Prisma.RecipeWhereInput = { clerkId: user.id };

  if (qParam && typeof qParam === "string" && qParam.trim() !== "") {
    where.title = { contains: qParam.trim(), mode: "insensitive" };
  }

  if (typeParam && typeof typeParam === "string" && typeParam !== "ALL") {
    where.type = typeParam as RecipeType;
  }

  if (customOnly) {
    where.isCustom = true;
  }

  if (instagramOnly) {
    where.instagramURL = { not: null };
  }

  if (neverCooked) {
    // Recipe is never in any WeeklyMenu -> it must NOT have dailyMenus that belong to a weeklyMenu
    where.NOT = { dailyMenus: { some: { weeklyMenus: { some: {} } } } };
  }

  const recipes = await prisma.recipe.findMany({
    where,
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      type: true,
      isCustom: true,
      instagramURL: true,
      thumbnailURL: true,
      description: true,
      isFavorite: true,
      _count: {
        select: { recipeFeedbacks: true },
      },
    },
  });

  return (
    <main>
      <div className="mb-4 space-y-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">My Recipes</h1>
        <Link
          href="/create-recipe"
          className={buttonVariants({ variant: "default" })}
        >
          Create Recipe
        </Link>
      </div>

      <RecipeFilters
        initialQ={typeof qParam === "string" ? qParam : ""}
        initialType={typeof typeParam === "string" ? typeParam : "ALL"}
        initialCustomOnly={customOnly}
        initialInstagramOnly={instagramOnly}
        initialNeverCooked={neverCooked}
      />

      {recipes.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            You have no recipes yet.
          </p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recipes.map((r) => (
            <li key={r.id}>
              <Card className="h-full justify-between">
                <CardHeader>
                  <CardTitle>
                    <Link href={`/recipes/${r.id}`}>{r.title}</Link>
                  </CardTitle>
                  <CardDescription>
                    <RecipeTypeBadge type={r.type} />
                    {r.isCustom && (
                      <Badge variant="outline" className="ml-2">
                        Custom
                      </Badge>
                    )}
                    {r._count.recipeFeedbacks > 0 && (
                      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 ml-2">
                        Feedback
                      </Badge>
                    )}
                    {r.isFavorite && (
                      <div className="inline-flex items-center ml-2 ">
                        <Heart
                          fill="currentColor"
                          className="mr-1 text-amber-500"
                        />
                        <span className="text-sm">Favorite</span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {r.description ? (
                    <p className="text-sm text-muted-foreground">
                      {r.description}
                    </p>
                  ) : null}

                  {r.instagramURL ? (
                    <Link
                      href={r.instagramURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View on Instagram
                    </Link>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
