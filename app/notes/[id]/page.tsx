import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function NotePage({ params }: { params: { id: string } }) {
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
        <Link href="/notes" className={buttonVariants({ variant: "outline" })}>
          Back to notes
        </Link>
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
        <CardFooter className="justify-between">
          <Link
            href={`/notes/${note.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            Edit note
          </Link>
          <Link
            href="/create-note"
            className={buttonVariants({ variant: "default" })}
          >
            Create another note
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
