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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { WeeklyMenuWithRecipesAndIngredients } from "@/types/prisma";
import MealPrepCookedToggle from "../MealPrepCookedToggle";
import MealPrepShoppingList, {
  MealPrepShoppingListItem,
} from "../MealPrepShoppingList";
import { currentUser } from "@clerk/nextjs/server";

async function updateDailyMenuCooked(formData: FormData) {
  "use server";

  const dailyMenuId = formData.get("dailyMenuId");

  if (!dailyMenuId || typeof dailyMenuId !== "string") {
    return;
  }

  const cooked = formData.has("cooked");

  await prisma.dailyMenu.update({
    where: { id: dailyMenuId },
    data: { cooked },
  });
}

export default async function MealPrepDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await currentUser();

  if (!user) {
    notFound();
  }

  const weeklyMenu = (await prisma.weeklyMenu.findUnique({
    where: { id, clerkId: user.id },
    cacheStrategy: { ttl: 60, swr: 10 },
    include: {
      recipes: {
        orderBy: { date: "asc" },
        include: {
          recipes: {
            include: {
              recipeIngredients: {
                include: {
                  ingredient: true,
                },
                orderBy: {
                  ingredient: {
                    name: "asc",
                  },
                },
              },
            },
          },
        },
      },
    },
  })) as WeeklyMenuWithRecipesAndIngredients;

  if (!weeklyMenu) {
    notFound();
  }
  const shoppingListItems = Object.values(
    weeklyMenu.recipes.reduce<Record<string, MealPrepShoppingListItem>>(
      (acc, daily) => {
        daily.recipes.forEach((recipe) => {
          recipe.recipeIngredients.forEach((ri) => {
            const ingredient = ri.ingredient;

            if (!ingredient) {
              return;
            }

            if (!acc[ingredient.id]) {
              acc[ingredient.id] = {
                ingredientId: ingredient.id,
                name: ingredient.name,
                type: ingredient.type || "Other",
                quantity: 0,
                recipeCount: 0,
              };
            }

            acc[ingredient.id].quantity += Number(ri.quantity || 0);
            acc[ingredient.id].recipeCount += 1;
          });
        });

        return acc;
      },
      {},
    ),
  );

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Group daily menus by day of week based on their actual date
  const recipesByDayIndex = weeklyMenu.recipes.reduce<
    Record<number, (typeof weeklyMenu.recipes)[0]>
  >((acc, recipe) => {
    const dayIndex = new Date(recipe.date).getDay();
    acc[dayIndex] = recipe;
    return acc;
  }, {});

  const dailyMenusByDay = daysOfWeek.map((day, index) => {
    const dailyMenu = recipesByDayIndex[index];
    return {
      day,
      dailyMenu,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Week {weeklyMenu.week} — {weeklyMenu.year}
          </h1>
          <p className="text-muted-foreground mt-1">
            {weeklyMenu.label ||
              `Created ${new Date(weeklyMenu.createdAt).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/meal-prep"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="mr-1" />
            Back
          </Link>
          <Link
            href={`/create-meal-prep?weekId=${weeklyMenu.id}`}
            className={buttonVariants({ variant: "default" })}
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Summary */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Days Planned
              </p>
              <p className="text-3xl font-bold">
                {weeklyMenu.recipes.filter((d) => d.recipes.length > 0).length}{" "}
                / 7
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Recipes</p>
              <p className="text-3xl font-bold">
                {weeklyMenu.recipes.reduce(
                  (sum, d) => sum + d.recipes.length,
                  0,
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {new Date(weeklyMenu.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium">
                {new Date(weeklyMenu.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Menus Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {dailyMenusByDay.map(({ day, dailyMenu }) => (
          <Card key={day} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{day}</CardTitle>
              {dailyMenu && (
                <CardDescription>
                  {new Date(dailyMenu.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </CardDescription>
              )}
            </CardHeader>
            {dailyMenu && (
              <div className="px-6 pb-4">
                <MealPrepCookedToggle
                  dailyMenuId={dailyMenu.id}
                  initialCooked={dailyMenu.cooked}
                  toggleCooked={updateDailyMenuCooked}
                />
              </div>
            )}
            <CardContent className="flex-1">
              {!dailyMenu || dailyMenu.recipes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recipes planned
                </p>
              ) : (
                <div className="space-y-4">
                  {dailyMenu.recipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="border-l-2 border-primary pl-3"
                    >
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {recipe.title}
                      </Link>
                      {recipe.type && (
                        <div className="mt-2">
                          <Badge variant="outline" className="capitalize">
                            {recipe.type.toLowerCase()}
                          </Badge>
                        </div>
                      )}
                      {recipe.recipeIngredients.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Ingredients:
                          </p>
                          <ul className="text-xs space-y-1">
                            {recipe.recipeIngredients.map((ri) => (
                              <li
                                key={ri.ingredientId}
                                className="flex justify-between"
                              >
                                <span>{ri.ingredient.name}</span>
                                <span className="text-muted-foreground">
                                  {ri.quantity}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <MealPrepShoppingList items={shoppingListItems} />
    </div>
  );
}
