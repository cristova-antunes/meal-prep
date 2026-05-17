import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MealPrepPlanner, { PrepSlot } from "./MealPrepPlanner";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatSlotLabel(date: Date) {
  return `${dayNames[date.getDay()]}, ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

function getUpcomingSunday(today: Date) {
  const current = new Date(today);
  current.setHours(0, 0, 0, 0);
  const offset = (7 - current.getDay()) % 7;
  current.setDate(current.getDate() + offset);
  return current;
}

function buildPrepSlots(start: Date, recipeIds: string[]): PrepSlot[] {
  return Array.from({ length: 7 }, (_, index) => {
    const dinnerDate = new Date(start);
    dinnerDate.setDate(start.getDate() + index);
    const lunchDate = new Date(start);
    lunchDate.setDate(start.getDate() + index + 1);

    return {
      id: `slot-${index + 1}`,
      dinnerLabel: `${formatSlotLabel(dinnerDate)} dinner`,
      lunchLabel: `${formatSlotLabel(lunchDate)} lunch`,
      recipeId:
        recipeIds.length > 0 ? recipeIds[index % recipeIds.length] : null,
    };
  });
}

export default async function MealPrepPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Sign in to plan your meals</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Your recipes are stored per Clerk user, and your upcoming week will
            be prepared from them.
          </p>
        </div>
      </main>
    );
  }

  const recipes = await prisma.recipe.findMany({
    where: { clerkId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      recipeIngredients: {
        select: {
          ingredient: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  const recipeItems = recipes.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    type: recipe.type,
    ingredients: recipe.recipeIngredients.map((item) => item.ingredient),
  }));

  const sunday = getUpcomingSunday(new Date());
  const weekStartLabel = formatSlotLabel(sunday);
  const weekEnd = new Date(sunday);
  weekEnd.setDate(sunday.getDate() + 6);
  const weekEndLabel = formatSlotLabel(weekEnd);

  if (recipeItems.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">No recipes yet</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Create recipes first, then return to populate your week of dinner +
            lunch slots.
          </p>
          <Link
            href="/create-recipe"
            className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create your first recipe
          </Link>
        </div>
      </main>
    );
  }

  const recipeIds = recipeItems.map((recipe) => recipe.id);
  const prepSlots = buildPrepSlots(sunday, recipeIds);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <MealPrepPlanner
        slots={prepSlots}
        recipes={recipeItems}
        weekStartLabel={weekStartLabel}
        weekEndLabel={weekEndLabel}
      />
    </main>
  );
}
