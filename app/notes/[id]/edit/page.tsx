import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditNoteForm from "./EditNoteForm";

export default async function EditNotePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await currentUser();
  if (!user) {
    notFound();
  }

  const note = await prisma.note.findUnique({
    where: { id: params.id },
  });

  if (!note || note.clerkId !== user.id) {
    notFound();
  }

  return <EditNoteForm note={note} />;
}
