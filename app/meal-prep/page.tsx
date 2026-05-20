import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page() {
  const weeks = await prisma.weeklyMenu.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      recipes: {
        include: {
          recipes: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 container mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Meal prep weeks</h1>
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
              <Card>
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
                                <div className="bg-yellow-50 rounded-lg p-2 text-center">
                                  <div className="text-lg font-semibold text-yellow-900">
                                    {meatCount}
                                  </div>
                                  <div className="text-xs text-yellow-700">
                                    Meat
                                  </div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-2 text-center">
                                  <div className="text-lg font-semibold text-blue-900">
                                    {fishCount}
                                  </div>
                                  <div className="text-xs text-blue-700">
                                    Fish
                                  </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-2 text-center">
                                  <div className="text-lg font-semibold text-green-900">
                                    {vegetarianCount}
                                  </div>
                                  <div className="text-xs text-green-700">
                                    Vegetarian
                                  </div>
                                </div>
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
                            <li key={title} className="list-disc pl-5">
                              {title}
                            </li>
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
