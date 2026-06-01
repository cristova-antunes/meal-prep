import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Prisma } from "@/app/generated/prisma/client";
import IngredientsSearch from "./IngredientsSearch";
import IngredientBadge from "@/components/feature/IngredientBadge";

export default async function IngredientsPage({
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
            Sign in to view your ingredients
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Your ingredients are stored per Clerk user.
          </p>
        </div>
      </div>
    );
  }

  const searchParamsResolved = await searchParams;

  const qParam = Array.isArray(searchParamsResolved?.q)
    ? searchParamsResolved?.q[0]
    : searchParamsResolved?.q;

  const where: Prisma.IngredientWhereInput = {
    clerkId: user.id,
  };

  if (qParam && typeof qParam === "string" && qParam.trim() !== "") {
    where.name = { contains: qParam.trim(), mode: "insensitive" };
  }

  const ingredients = await prisma.ingredient.findMany({
    where,
    orderBy: { name: "asc" },
    cacheStrategy: { ttl: 60, swr: 10 },
    select: {
      id: true,
      name: true,
      type: true,
    },
  });

  return (
    <main>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Ingredients</h1>
          <p className="text-sm text-muted-foreground">
            Search your ingredient list by name.
          </p>
        </div>

        <IngredientsSearch
          initialQ={typeof qParam === "string" ? qParam : ""}
        />
      </div>

      {ingredients.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No ingredients match your search.
          </p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    <Link
                      href={`/ingredients/${ingredient.id}`}
                      className="hover:underline"
                    >
                      {ingredient.name}
                    </Link>
                  </CardTitle>

                  {ingredient.type && (
                    <CardDescription>
                      <IngredientBadge type={ingredient.type} />
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/ingredients/${ingredient.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View ingredient
                  </Link>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
