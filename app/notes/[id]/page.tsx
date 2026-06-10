import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteNoteForm from "../DeleteNoteForm";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

async function deleteNote(formData: FormData) {
  "use server";

  const user = await currentUser();

  if (!user) {
    throw new Error("You must be signed in to delete notes.");
  }

  const noteId = formData.get("noteId")?.toString();

  if (!noteId) {
    throw new Error("Note id is required.");
  }

  await prisma.note.deleteMany({
    where: {
      id: noteId,
      clerkId: user.id,
    },
  });

  redirect("/notes");
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  const resolvedParams = await params;

  if (!user) {
    notFound();
  }

  const note = await prisma.note.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!note || note.clerkId !== user.id) {
    notFound();
  }

  return (
    <main>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{note.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Updated{" "}
            {new Intl.DateTimeFormat("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            }).format(note.updatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/notes"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to notes
          </Link>
          <Link
            href="/create-note"
            className={buttonVariants({ variant: "default" })}
          >
            Create another note
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Note details</CardTitle>
          <CardDescription>
            Review your saved note or copy it for meal prep planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="prose max-w-none wrap-break-word text-sm"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </CardContent>
        <CardFooter className="justify-end items-center gap-4">
          <Link
            href={`/notes/${note.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            Edit note
          </Link>
          <DeleteNoteForm noteId={note.id} deleteAction={deleteNote} />
        </CardFooter>
      </Card>
    </main>
  );
}
