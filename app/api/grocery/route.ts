import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { ingredientId?: string } = {};
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ingredientId = body.ingredientId;
  if (!ingredientId) return NextResponse.json({ ok: false }, { status: 400 });

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

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
