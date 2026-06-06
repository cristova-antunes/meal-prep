import { currentUser } from "@clerk/nextjs/server";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function getNotePreview(html: string) {
  const text = html.replace(/<[^>]+>/g, "").trim();
  if (text.length <= 140) {
    return text;
  }
  return `${text.slice(0, 140).trim()}…`;
}

export default async function NotesPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div>
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">Sign in to view your notes</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Your notes are stored per Clerk user.
          </p>
        </div>
      </div>
    );
  }

  const notes = await prisma.note.findMany({
    where: { clerkId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      updatedAt: true,
    },
    cacheStrategy: { ttl: 60, swr: 10 },
  });

  return (
    <main>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">My Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keep quick meal prep reminders and shopping notes handy.
          </p>
        </div>
        <Link
          href="/create-note"
          className={buttonVariants({ variant: "default" })}
        >
          Create Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            You have no notes yet. Start by creating your first note.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li key={note.id}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    <Link href={`/notes/${note.id}`}>{note.title}</Link>
                  </CardTitle>
                  <CardDescription>
                    Updated {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(note.updatedAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {getNotePreview(note.content)}
                  </p>
                </CardContent>
                <CardFooter className="justify-end">
                  <Link
                    href={`/notes/${note.id}`}
                    className={buttonVariants({ variant: "default" })}
                  >
                    Open
                  </Link>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
