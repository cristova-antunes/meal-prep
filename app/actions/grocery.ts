import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addToGrocery(ingredientId: string) {
  "use server";

  const user = await currentUser();
  if (!user) return { ok: false };

  try {
    await prisma.groceryItem.upsert({
      where: { ingredientId },
      update: { updatedAt: new Date() },
      create: { clerkId: user.id, ingredientId },
    });

    try {
      revalidatePath("/grocery");
    } catch (e) {
      // ignore
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function toggleGroceryItemCompleted(formData: FormData) {
  "use server";

  const user = await currentUser();
  if (!user) return { ok: false, error: "unauthenticated" };

  const itemId = formData.get("itemId")?.toString();
  const isCompletedValue = formData.get("isCompleted")?.toString();

  if (!itemId || !isCompletedValue) {
    return { ok: false, error: "missing parameters" };
  }

  const groceryItem = await prisma.groceryItem.findUnique({
    where: { id: itemId },
    select: { clerkId: true },
  });

  if (!groceryItem || groceryItem.clerkId !== user.id) {
    return { ok: false, error: "not found or unauthorized" };
  }

  try {
    await prisma.groceryItem.update({
      where: { id: itemId },
      data: { isCompleted: isCompletedValue === "true" },
    });

    try {
      revalidatePath("/grocery");
    } catch (e) {
      // ignore
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function clearCompletedGroceryItems() {
  "use server";

  const user = await currentUser();
  if (!user) return;

  await prisma.groceryItem.deleteMany({
    where: { clerkId: user.id, isCompleted: true },
  });

  try {
    revalidatePath("/grocery");
  } catch (e) {
    // ignore
  }
}
