import AddGroceryItemForm from "./AddGroceryItemForm";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import IngredientBadge from "@/components/feature/IngredientBadge";
import { Button } from "@/components/ui/button";
import { ingredientType } from "@/types/types";
import { redirect } from "next/navigation";
import type { IngredientType as IngredientTypeEnum } from "@/app/generated/prisma/client";
import {
  clearCompletedGroceryItems,
  toggleGroceryItemCompleted,
} from "@/app/actions/grocery";
import GroceryItemCompletedToggle from "./GroceryItemCompletedToggle";

const categoryOrder = [
  ...ingredientType.map((item) => item.value),
  "Other",
] as const;

type GroceryCategory = (typeof categoryOrder)[number];

type GroceryItemWithIngredient = {
  id: string;
  quantity: number;
  customName: string | null;
  customType: IngredientTypeEnum | null;
  ingredientId: string | null;
  isCompleted: boolean;
  ingredient?: {
    id: string;
    name: string;
    type: IngredientTypeEnum | null;
  } | null;
};

async function addGroceryItem(formData: FormData) {
  "use server";

  const user = await currentUser();

  if (!user) {
    throw new Error("You must be signed in to add grocery items.");
  }

  const customName = formData.get("customName")?.toString().trim();
  const customType = formData.get("customType")?.toString().trim();

  if (!customName) {
    throw new Error("Item name is required.");
  }

  const hasCustomType = customType && customType !== "Other";

  await prisma.groceryItem.create({
    data: {
      clerkId: user.id,
      customName,
      ...(hasCustomType
        ? { customType: customType as IngredientTypeEnum }
        : {}),
    },
  });

  redirect("/grocery");
}

function getCategoryLabel(category: GroceryCategory) {
  if (category === "Other") {
    return "Other";
  }

  return (
    ingredientType.find((option) => option.value === category)?.label ??
    category
  );
}

function sortCategories(a: GroceryCategory, b: GroceryCategory) {
  if (a === "Other") return 1;
  if (b === "Other") return -1;

  return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
}

export default async function GroceryPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div>
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">
            Sign in to view your grocery list
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Your grocery list is stored per Clerk user.
          </p>
        </div>
      </div>
    );
  }

  const groceryItems = (await prisma.groceryItem.findMany({
    where: { clerkId: user.id },
    orderBy: [{ customName: "asc" }, { quantity: "desc" }],
    cacheStrategy: { ttl: 60, swr: 10 },
    select: {
      id: true,
      quantity: true,
      customName: true,
      customType: true,
      isCompleted: true,
      ingredient: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  })) as GroceryItemWithIngredient[];

  const groupedItems = groceryItems.reduce((acc, item) => {
    const category = item.customName
      ? (item.customType ?? "Other")
      : (item.ingredient?.type ?? "Other");

    const groupItems = acc.get(category) ?? [];
    groupItems.push(item as GroceryItemWithIngredient);
    acc.set(category, groupItems);
    return acc;
  }, new Map<GroceryCategory, GroceryItemWithIngredient[]>());

  const sortedCategories = Array.from(groupedItems.keys()).sort(sortCategories);
  const completedCount = groceryItems.filter((item) => item.isCompleted).length;

  return (
    <main>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Grocery List</h1>
            <p className="text-sm text-muted-foreground">
              Your grocery items are grouped by ingredient type. Manual items
              are shown under Other unless you select a type.
            </p>
          </div>

          <form action={clearCompletedGroceryItems} className="sm:ml-auto">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={completedCount === 0}
            >
              Clear completed
            </Button>
          </form>
        </div>

        <AddGroceryItemForm action={addGroceryItem} />
      </div>

      {groceryItems.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            Your grocery list is empty. Add a manual item or populate it from
            recipes.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((category) => {
            const items = groupedItems.get(category) ?? [];

            return (
              <section
                key={category}
                className="rounded-3xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {getCategoryLabel(category)}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  {category !== "Other" && category !== undefined ? (
                    <IngredientBadge type={category as IngredientTypeEnum} />
                  ) : (
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      Other
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {items.map((item) => {
                    const label =
                      item.customName ??
                      item.ingredient?.name ??
                      "Unknown item";
                    const subtitle = item.customName
                      ? item.customType
                        ? item.customType
                        : "Manual item"
                      : item.ingredient?.name;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-border bg-background px-4 py-3 sm:flex sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <GroceryItemCompletedToggle
                            itemId={item.id}
                            isCompleted={item.isCompleted}
                            toggleCompleted={toggleGroceryItemCompleted}
                          />
                          <div>
                            <p
                              className={`font-medium ${
                                item.isCompleted
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {label}
                            </p>
                            {subtitle ? (
                              <p
                                className={`text-sm ${
                                  item.isCompleted
                                    ? "text-muted-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {subtitle}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <span className="mt-3 inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:mt-0">
                          Qty {item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
