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

export default async function RecipesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
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
  const qParam = Array.isArray(searchParams?.q)
    ? searchParams?.q[0]
    : searchParams?.q;
  const typeParam = Array.isArray(searchParams?.type)
    ? searchParams?.type[0]
    : searchParams?.type;
  const customOnly =
    (Array.isArray(searchParams?.customOnly)
      ? searchParams?.customOnly[0]
      : searchParams?.customOnly) === "on";
  const instagramOnly =
    (Array.isArray(searchParams?.instagramOnly)
      ? searchParams?.instagramOnly[0]
      : searchParams?.instagramOnly) === "on";
  const neverCooked =
    (Array.isArray(searchParams?.neverCooked)
      ? searchParams?.neverCooked[0]
      : searchParams?.neverCooked) === "on";

  const where: Prisma.RecipeWhereInput = { clerkId: user.id };

  if (qParam && typeof qParam === "string" && qParam.trim() !== "") {
    where.title = { contains: qParam.trim(), mode: "insensitive" };
  }

  if (typeParam && typeof typeParam === "string" && typeParam !== "") {
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

      <form method="get" className="mb-6 flex flex-col gap-3">
        <div className="flex gap-2 items-center">
          <input
            name="q"
            placeholder="Search title"
            defaultValue={typeof qParam === "string" ? qParam : ""}
            className="input input-bordered w-full"
          />
          <select
            name="type"
            defaultValue={typeof typeParam === "string" ? typeParam : ""}
            className="select select-bordered"
          >
            <option value="">All types</option>
            <option value="MEAT">Meat</option>
            <option value="FISH">Fish</option>
            <option value="VEGETARIAN">Vegetarian</option>
            <option value="DESSERT">Dessert</option>
            <option value="SNACK">Snack</option>
          </select>
          <button className={buttonVariants({ variant: "default" })}>
            Filter
          </button>
        </div>

        <div className="flex gap-4 items-center text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="customOnly"
              defaultChecked={customOnly}
              className="checkbox"
            />
            Custom only
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="instagramOnly"
              defaultChecked={instagramOnly}
              className="checkbox"
            />
            Instagram only
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="neverCooked"
              defaultChecked={neverCooked}
              className="checkbox"
            />
            Never cooked
          </label>
        </div>
      </form>

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
              <Card>
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
                  </CardDescription>
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
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
