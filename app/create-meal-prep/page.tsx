import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MealPrepPlanner, { PrepSlot } from "./MealPrepPlanner";
import WeekPicker from "./WeekPicker";

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

function getWeekNumber(date: Date): { week: number; year: number } {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return { week, year: d.getUTCFullYear() };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildPrepSlots(
  start: Date,
  existingDailyMenus: { id: string; date: Date; recipes: { id: string }[] }[],
): PrepSlot[] {
  const slots = Array.from({ length: 7 }, (_, index) => {
    const dinnerDate = addDays(start, index);
    const lunchDate = addDays(start, index + 1);

    const existingMenu = existingDailyMenus.find((menu) => {
      const menuDate = new Date(menu.date);
      menuDate.setHours(0, 0, 0, 0);
      return menuDate.getTime() === dinnerDate.getTime();
    });

    const recipeId =
      existingMenu && existingMenu.recipes.length > 0
        ? existingMenu.recipes[0].id
        : null;

    return {
      id: `slot-${index + 1}`,
      dinnerLabel: `${formatSlotLabel(dinnerDate)} dinner`,
      lunchLabel: `${formatSlotLabel(lunchDate)} lunch`,
      recipeId,
      date: dinnerDate,
    };
  });

  return slots;
}

function buildWeekLabel(start: Date) {
  const weekEnd = addDays(start, 6);
  return `${formatSlotLabel(start)} to ${formatSlotLabel(weekEnd)}`;
}

function getSundayForWeekYear(week: number, year: number) {
  const simple = new Date(Date.UTC(year, 0, 1));
  const dayOfWeek = simple.getUTCDay() || 7;
  const isoWeekStart = new Date(simple);
  isoWeekStart.setUTCDate(simple.getUTCDate() + 4 - dayOfWeek + (week - 1) * 7);
  isoWeekStart.setUTCHours(0, 0, 0, 0);

  const sunday = addDays(isoWeekStart, -1);
  sunday.setUTCHours(0, 0, 0, 0);
  return sunday;
}

function getWeekStartForWeeklyMenu(weeklyMenu: {
  week: number;
  year: number;
  recipes: { date: Date }[];
}) {
  const dates = weeklyMenu.recipes.map((menu) => new Date(menu.date));
  if (dates.length > 0) {
    const earliest = new Date(Math.min(...dates.map((date) => date.getTime())));
    earliest.setHours(0, 0, 0, 0);
    return earliest;
  }

  return getSundayForWeekYear(weeklyMenu.week, weeklyMenu.year);
}

function buildCandidateWeeks(
  start: Date,
  weeklyMenus: Array<{
    id: string;
    week: number;
    year: number;
    label: string;
    recipes: { id: string; date: Date; recipes: { id: string }[] }[];
  }>,
  count = 5,
) {
  return Array.from({ length: count }, (_, index) => {
    const weekStart = addDays(start, index * 7);
    const { week, year } = getWeekNumber(weekStart);
    const existing = weeklyMenus.find(
      (menu) => menu.week === week && menu.year === year,
    );
    return {
      weekStart,
      weekEnd: addDays(weekStart, 6),
      week,
      year,
      label: buildWeekLabel(weekStart),
      existing,
    };
  });
}

type CreateMealPrepPageProps = {
  searchParams: Promise<{
    weekId?: string;
    week?: string;
    year?: string;
  }>;
};

export default async function MealPrepPage({
  searchParams,
}: CreateMealPrepPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await currentUser();

  if (!user) {
    return (
      <main>
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">Sign in to plan your meals</h1>
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
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      type: true,
      recipeIngredients: {
        select: {
          ingredient: {
            select: { id: true, name: true, type: true },
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
  const weeklyMenus = await prisma.weeklyMenu.findMany({
    where: { clerkId: user.id },
    include: {
      recipes: {
        include: {
          recipes: true,
        },
      },
    },
  });

  const candidates = buildCandidateWeeks(sunday, weeklyMenus, 6);

  const selectedWeekId = resolvedSearchParams?.weekId;
  const selectedWeekParam = resolvedSearchParams?.week;
  const selectedYearParam = resolvedSearchParams?.year;

  const selectedMenuById = selectedWeekId
    ? candidates.find((candidate) => candidate.existing?.id === selectedWeekId)
    : undefined;

  const selectedWeeklyMenuById =
    selectedWeekId && !selectedMenuById
      ? await prisma.weeklyMenu.findUnique({
          where: { id: selectedWeekId },
          include: {
            recipes: {
              include: {
                recipes: true,
              },
            },
          },
        })
      : undefined;

  const selectedCandidateFromQuery = !selectedWeekId
    ? candidates.find(
        (candidate) =>
          !candidate.existing &&
          `${candidate.week}` === selectedWeekParam &&
          `${candidate.year}` === selectedYearParam,
      )
    : undefined;

  const nextAvailableCandidate =
    candidates.find((candidate) => !candidate.existing) ?? candidates[0];
  const selectedCandidate =
    selectedMenuById ?? selectedCandidateFromQuery ?? nextAvailableCandidate;

  // Do not create a weekly menu just for viewing. Only read existing one.
  const weeklyMenu =
    selectedMenuById?.existing ??
    selectedWeeklyMenuById ??
    (await prisma.weeklyMenu.findFirst({
      where: {
        week: selectedCandidate.week,
        year: selectedCandidate.year,
        clerkId: user.id,
      },
      include: {
        recipes: {
          include: {
            recipes: true,
          },
        },
      },
    }));

  const selectedValue = selectedWeekId
    ? `id:${selectedWeekId}`
    : selectedCandidate.existing
      ? `id:${selectedCandidate.existing.id}`
      : `week:${selectedCandidate.week}:${selectedCandidate.year}`;

  const weekOptions = candidates.map((candidate, index) => ({
    value: candidate.existing
      ? `id:${candidate.existing.id}`
      : `week:${candidate.week}:${candidate.year}`,
    label: candidate.label,
    description: candidate.existing
      ? `Existing week ${candidate.week} — ${candidate.year}`
      : index === 0
        ? `Next available week to create`
        : `Create week ${candidate.week} — ${candidate.year}`,
  }));

  const extraSelectedWeekOption = selectedWeeklyMenuById
    ? {
        value: `id:${selectedWeeklyMenuById.id}`,
        label: selectedWeeklyMenuById.label,
        description: `Selected existing week ${selectedWeeklyMenuById.week} — ${selectedWeeklyMenuById.year}`,
      }
    : selectedMenuById
      ? {
          value: `id:${selectedMenuById.existing!.id}`,
          label: selectedMenuById.existing!.label,
          description: `Selected existing week ${selectedMenuById.existing!.week} — ${selectedMenuById.existing!.year}`,
        }
      : undefined;

  if (
    extraSelectedWeekOption &&
    !weekOptions.some(
      (option) => option.value === extraSelectedWeekOption.value,
    )
  ) {
    weekOptions.unshift(extraSelectedWeekOption);
  }

  if (recipeItems.length === 0) {
    return (
      <main>
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">No recipes yet</h1>
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

  const prepSlots = buildPrepSlots(
    selectedWeeklyMenuById
      ? getWeekStartForWeeklyMenu(selectedWeeklyMenuById)
      : selectedCandidate.weekStart,
    weeklyMenu?.recipes ?? [],
  );

  const [weekStartLabel, weekEndLabel] = selectedWeeklyMenuById
    ? selectedWeeklyMenuById.label.split(" to ")
    : selectedCandidate.label.split(" to ");

  return (
    <main>
      <div className="space-y-6">
        <WeekPicker options={weekOptions} selectedValue={selectedValue} />
        <MealPrepPlanner
          slots={prepSlots}
          recipes={recipeItems}
          weekStartLabel={weekStartLabel}
          weekEndLabel={weekEndLabel}
          weeklyMenuId={
            weeklyMenu
              ? weeklyMenu.id
              : `week:${selectedCandidate.week}:${selectedCandidate.year}`
          }
        />
      </div>
    </main>
  );
}
