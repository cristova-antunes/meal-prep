import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { title?: string; content?: string } = {};
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { title, content } = body;
  if (!title || !content)
    return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const note = await prisma.note.create({
      data: { title, content, clerkId: user.id },
    });

    try {
      revalidatePath("/notes");
    } catch (e) {
      // ignore revalidation errors
    }

    return NextResponse.json({ ok: true, id: note.id });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { id?: string; title?: string; content?: string } = {};
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { id, title, content } = body;
  if (!id || !title || !content)
    return NextResponse.json({ ok: false }, { status: 400 });

  const note = await prisma.note.findUnique({
    where: { id },
  });

  if (!note || note.clerkId !== user.id) {
    return NextResponse.json(
      { ok: false, error: "Note not found" },
      { status: 404 },
    );
  }

  try {
    await prisma.note.update({
      where: { id },
      data: { title, content },
    });

    try {
      revalidatePath(`/notes/${id}`);
      revalidatePath("/notes");
    } catch (e) {
      // ignore revalidation errors
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
