"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNote(title: string, content: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  try {
    const note = await prisma.$transaction(async (tx) => {
      return tx.note.create({
        data: { title, content, clerkId: user.id },
      });
    });

    revalidatePath("/notes");
    return note;
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Failed to create note",
    );
  }
}
