import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyMenuWithRecipes } from "@/types/prisma";

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
        <h1 className="text-3xl font-semibold">
          Sign in to view your meal prep weeks
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Your meal prep weeks are stored per Clerk user.
        </p>
      </div>
    );
  }

  const weeks = (await prisma.weeklyMenu.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      clerkId: user.id,
    },
    take: 3,
    cacheStrategy: { ttl: 60, swr: 10 },
    include: {
      recipes: {
        include: {
          recipes: true,
        },
      },
    },
  })) as WeeklyMenuWithRecipes;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Meal prep weeks</h1>
        <Link
          href="/create-meal-prep"
          className={buttonVariants({ variant: "default" })}
        >
          Create new week
        </Link>
      </header>

      {weeks.length === 0 ? (
        <p>No meal prep weeks yet. Create your first one.</p>
      ) : (
        <ul className="space-y-3 grid sm:grid-cols-2 md:grid-cols-3 gap-4 ">
          {weeks.map((w) => (
            <li key={w.id}>
              <Card className="full-height">
                <CardHeader>
                  <CardTitle>
                    <Link href={`/meal-prep/${w.id}`}>
                      {w.label || ""} {w.year}
                    </Link>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {w.recipes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No recipes logged yet.
                      </p>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {(() => {
                            const allRecipes = w.recipes.flatMap(
                              (daily) => daily.recipes,
                            );
                            const meatCount = allRecipes.filter(
                              (r) => r.type === "MEAT",
                            ).length;
                            const fishCount = allRecipes.filter(
                              (r) => r.type === "FISH",
                            ).length;
                            const vegetarianCount = allRecipes.filter(
                              (r) => r.type === "VEGETARIAN",
                            ).length;

                            return (
                              <>
                                {meatCount > 0 && (
                                  <div className="bg-yellow-50 rounded-lg p-2 text-center">
                                    <div className="text-lg font-semibold text-yellow-900">
                                      {meatCount}
                                    </div>
                                    <div className="text-xs text-yellow-700">
                                      Meat
                                    </div>
                                  </div>
                                )}
                                {fishCount > 0 && (
                                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                                    <div className="text-lg font-semibold text-blue-900">
                                      {fishCount}
                                    </div>
                                    <div className="text-xs text-blue-700">
                                      Fish
                                    </div>
                                  </div>
                                )}
                                {vegetarianCount > 0 && (
                                  <div className="bg-green-50 rounded-lg p-2 text-center">
                                    <div className="text-lg font-semibold text-green-900">
                                      {vegetarianCount}
                                    </div>
                                    <div className="text-xs text-green-700">
                                      Vegetarian
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Recipes made:
                        </div>
                        <ul className="space-y-1 text-sm">
                          {Array.from(
                            new Set(
                              w.recipes.flatMap((daily) =>
                                daily.recipes.map((recipe) => recipe.title),
                              ),
                            ),
                          ).map((title) => (
                            <li key={title}>{title}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
