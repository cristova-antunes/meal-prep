import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        <ul className="space-y-3">
          {weeks.map((w) => (
            <li key={w.id}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    Week {w.week} — {w.year}
                  </CardTitle>
                  <CardDescription>
                    Created {new Date(w.createdAt).toLocaleDateString()}
                  </CardDescription>
                  <CardAction>
                    <Link href={`/meal-prep/${w.id}`}>
                      <Button variant="secondary">Open</Button>
                    </Link>
                  </CardAction>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Recipes made:
                    </div>
                    {w.recipes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No recipes logged yet.
                      </p>
                    ) : (
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
