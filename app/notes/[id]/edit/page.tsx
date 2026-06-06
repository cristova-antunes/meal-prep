import "ckeditor5/ckeditor5.css";
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

  const CK_KEY = process.env.CK_EDITOR_KEY;
  if (!CK_KEY || CK_KEY === "") {
    return null;
  }

  return <EditNoteForm note={note} ckEditorKey={CK_KEY} />;
}
