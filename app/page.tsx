import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { buttonVariants } from "@/components/ui/button";

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
        <h1 className="text-3xl font-semibold">
          Sign in to view your meal prep weeks
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Your meal prep weeks are stored per Clerk user.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Meal prep weeks</h1>
        <Link
          href="/create-meal-prep"
          className={buttonVariants({ variant: "default" })}
        >
          Create new week
        </Link>
      </header>
    </div>
  );
}
