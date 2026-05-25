"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import { InputWithDebounce } from "@/components/ui/input-with-debounce";
import { buttonVariants } from "@/components/ui/button";

type IngredientsSearchProps = {
  initialQ?: string;
};

export default function IngredientsSearch({
  initialQ = "",
}: IngredientsSearchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(initialQ);

  const applySearch = useCallback(
    (search: string) => {
      const params = new URLSearchParams();
      if (search.trim() !== "") {
        params.set("q", search.trim());
      }

      const href = params.toString()
        ? `/ingredients?${params.toString()}`
        : "/ingredients";
      startTransition(() => {
        router.replace(href);
      });
    },
    [router, startTransition],
  );

  return (
    <form
      className="flex w-full max-w-sm items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        applySearch(q);
      }}
    >
      <InputWithDebounce
        name="q"
        value={q}
        placeholder="Search name"
        onChange={(event) => setQ(event.target.value)}
        onDebouncedChange={applySearch}
        debounceMs={500}
        className="input input-bordered w-full"
      />
      <button
        type="submit"
        className={buttonVariants({ variant: "default" })}
        disabled={isPending}
      >
        {isPending ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
