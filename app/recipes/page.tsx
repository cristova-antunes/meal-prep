import { currentUser } from "@clerk/nextjs/server";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RecipeTypeBadge from "@/components/feature/RecipeTypeBadge";
import { Badge } from "@/components/ui/badge";

export default async function RecipesPage() {
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
  const recipes = await prisma.recipe.findMany({
    where: { clerkId: user.id },
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
                    {r.thumbnailURL ? (
                      <img
                        src={r.thumbnailURL}
                        alt={`${r.title} thumbnail`}
                        className="object-cover rounded-md border"
                        width={192}
                        height={192}
                      />
                    ) : null}

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
