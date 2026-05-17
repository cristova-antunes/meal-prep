import { currentUser } from "@clerk/nextjs/server";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RecipesPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">
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
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, type: true },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 space-y-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">My Recipes</h1>
        <Link
          href="/create-recipe"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
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
        <ul className="grid grid-cols-1 gap-4">
          {recipes.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-md border border-border bg-card p-4"
            >
              <div>
                <div className="text-lg font-medium">{r.title}</div>
                <div className="text-sm text-muted-foreground">{r.type}</div>
              </div>
              <Link
                href={`/recipes/${r.id}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
