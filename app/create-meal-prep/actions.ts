"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type MealPrepAssignments = Record<string, string>; // slotId -> recipeId

function formatWeeklyMenuLabel(start: Date, end: Date) {
  return `${start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} to ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

export async function saveWeeklyMealPrep(
  weeklyMenuId: string,
  assignments: MealPrepAssignments,
  slotDates: Record<string, Date>,
) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get the existing weekly menu to verify ownership
  const weeklyMenu = await prisma.weeklyMenu.findUnique({
    where: { id: weeklyMenuId },
  });

  if (!weeklyMenu || weeklyMenu.clerkId !== user.id) {
    throw new Error("Unauthorized");
  }

  const dates = Object.values(slotDates)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (dates.length === 0) {
    throw new Error("Unable to determine week dates for label");
  }

  dates.sort((a, b) => a.getTime() - b.getTime());
  const label = formatWeeklyMenuLabel(dates[0], dates[dates.length - 1]);

  await prisma.weeklyMenu.update({
    where: { id: weeklyMenuId },
    data: { label },
  });

  // Get existing daily menus for this week to delete them
  const existingDailyMenus = await prisma.dailyMenu.findMany({
    where: {
      weeklyMenus: {
        some: { id: weeklyMenuId },
      },
    },
    select: { id: true },
  });

  // Delete existing daily menus for this week
  if (existingDailyMenus.length > 0) {
    await prisma.dailyMenu.deleteMany({
      where: { id: { in: existingDailyMenus.map((m) => m.id) } },
    });
  }

  // Create new daily menus with recipes
  const dailyMenus = await Promise.all(
    Object.entries(assignments).map(([slotId, recipeId]) => {
      if (!recipeId) return null;

      return prisma.dailyMenu.create({
        data: {
          date: new Date(slotDates[slotId]),
          clerkId: user.id,
          recipes: {
            connect: [{ id: recipeId }],
          },
          weeklyMenus: {
            connect: [{ id: weeklyMenuId }],
          },
        },
      });
    }),
  );

  return {
    success: true,
    weeklyMenuId,
    dailyMenuCount: dailyMenus.filter(Boolean).length,
  };
}

export async function resetWeeklyMealPrep(weeklyMenuId: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get the weekly menu with its daily menus
  const weeklyMenu = await prisma.weeklyMenu.findUnique({
    where: { id: weeklyMenuId },
    include: { recipes: { select: { id: true } } },
  });

  if (!weeklyMenu || weeklyMenu.clerkId !== user.id) {
    throw new Error("Unauthorized");
  }

  // Delete all daily menus for this week
  await prisma.dailyMenu.deleteMany({
    where: { id: { in: weeklyMenu.recipes.map((r) => r.id) } },
  });

  return { success: true, weeklyMenuId };
}

export async function getOrCreateWeeklyMenu(
  week: number,
  year: number,
  weekStart: Date,
  weekEnd: Date,
) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const label = formatWeeklyMenuLabel(weekStart, weekEnd);

  // Try to find existing weekly menu
  let weeklyMenu = await prisma.weeklyMenu.findFirst({
    where: {
      week,
      year,
      clerkId: user.id,
    },
    include: {
      recipes: {
        include: {
          recipes: true,
        },
      },
    },
  });

  // Create if doesn't exist
  if (!weeklyMenu) {
    weeklyMenu = await prisma.weeklyMenu.create({
      data: {
        week,
        year,
        clerkId: user.id,
        label,
      },
      include: {
        recipes: {
          include: {
            recipes: true,
          },
        },
      },
    });
  } else if (weeklyMenu.label !== label) {
    weeklyMenu = await prisma.weeklyMenu.update({
      where: { id: weeklyMenu.id },
      data: { label },
      include: {
        recipes: {
          include: {
            recipes: true,
          },
        },
      },
    });
  }

  return weeklyMenu;
}
