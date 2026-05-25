"use client";

import { FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function FavoriteToggle({
  recipeId,
  isFavorite,
  toggleFavorite,
}: {
  recipeId: string;
  isFavorite: boolean;
  toggleFavorite: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await toggleFavorite(formData);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="recipeId" value={recipeId} />
      <input
        type="hidden"
        name="isFavorite"
        value={isFavorite ? "true" : "false"}
      />
      <button
        type="submit"
        disabled={isPending}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Heart
          className={`mr-1 ${
            isFavorite ? "text-amber-500" : "text-muted-foreground"
          }`}
        />
        {isFavorite ? "Unfavorite" : "Favorite"}
      </button>
    </form>
  );
}
