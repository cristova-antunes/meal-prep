"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";

type AddResult = { ok: boolean; error?: string };

export default function AddToGroceryButton({
  ingredientId,
  onAdd,
}: {
  ingredientId: string;
  onAdd?: (ingredientId: string) => Promise<AddResult>;
}) {
  const [isPending, startTransition] = useTransition();

  const defaultAdd = async (ingredientId: string): Promise<AddResult> => {
    try {
      const res = await fetch("/api/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredientId }),
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) return { ok: true };
      return { ok: false, error: data?.error ?? "request-failed" };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  };

  const handle = () => {
    startTransition(async () => {
      try {
        const result = await (onAdd
          ? onAdd(ingredientId)
          : defaultAdd(ingredientId));

        if (result.ok) {
          toast.success("Added to grocery");
        } else {
          toast.error("Couldn't add to grocery");
        }
      } catch (e) {
        toast.error("Add failed");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={isPending}
      className={buttonVariants({ variant: "secondary" })}
    >
      {isPending ? "Adding..." : "Add to grocery"}
    </button>
  );
}
