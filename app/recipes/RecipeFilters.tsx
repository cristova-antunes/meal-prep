"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import { InputWithDebounce } from "@/components/ui/input-with-debounce";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RecipeFiltersProps = {
  initialQ?: string;
  initialType?: string;
  initialCustomOnly?: boolean;
  initialInstagramOnly?: boolean;
  initialNeverCooked?: boolean;
};

function buildQueryUrl({
  q,
  type,
  customOnly,
  instagramOnly,
  neverCooked,
}: {
  q: string;
  type: string;
  customOnly: boolean;
  instagramOnly: boolean;
  neverCooked: boolean;
}) {
  const params = new URLSearchParams();

  if (q.trim() !== "") {
    params.set("q", q.trim());
  }

  if (type !== "ALL") {
    params.set("type", type);
  }

  if (customOnly) {
    params.set("customOnly", "on");
  }

  if (instagramOnly) {
    params.set("instagramOnly", "on");
  }

  if (neverCooked) {
    params.set("neverCooked", "on");
  }

  return params.toString() ? `/recipes?${params.toString()}` : "/recipes";
}

export default function RecipeFilters({
  initialQ,
  initialType,
  initialCustomOnly,
  initialInstagramOnly,
  initialNeverCooked,
}: RecipeFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(initialQ ?? "");
  const [type, setType] = useState(initialType ?? "ALL");
  const [customOnly, setCustomOnly] = useState(!!initialCustomOnly);
  const [instagramOnly, setInstagramOnly] = useState(!!initialInstagramOnly);
  const [neverCooked, setNeverCooked] = useState(!!initialNeverCooked);

  const applyFilters = useCallback(
    ({
      q: nextQ = q,
      type: nextType = type,
      customOnly: nextCustomOnly = customOnly,
      instagramOnly: nextInstagramOnly = instagramOnly,
      neverCooked: nextNeverCooked = neverCooked,
    }: {
      q?: string;
      type?: string;
      customOnly?: boolean;
      instagramOnly?: boolean;
      neverCooked?: boolean;
    }) => {
      const href = buildQueryUrl({
        q: nextQ,
        type: nextType,
        customOnly: nextCustomOnly,
        instagramOnly: nextInstagramOnly,
        neverCooked: nextNeverCooked,
      });

      startTransition(() => {
        router.replace(href);
      });
    },
    [customOnly, instagramOnly, neverCooked, q, router, type],
  );

  const updateNow = useCallback(
    (changes: {
      q?: string;
      type?: string;
      customOnly?: boolean;
      instagramOnly?: boolean;
      neverCooked?: boolean;
    }) => {
      applyFilters(changes);
    },
    [applyFilters],
  );

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <InputWithDebounce
          name="q"
          value={q}
          placeholder="Search title"
          onChange={(event) => {
            const nextQ = event.target.value;
            setQ(nextQ);
          }}
          onDebouncedChange={(nextQ) => applyFilters({ q: nextQ })}
          debounceMs={500}
          className="input input-bordered w-full"
        />

        <Select
          value={type}
          onValueChange={(value) => {
            setType(value);
            updateNow({ type: value });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="MEAT">Meat</SelectItem>
              <SelectItem value="FISH">Fish</SelectItem>
              <SelectItem value="VEGETARIAN">Vegetarian</SelectItem>
              <SelectItem value="DESSERT">Dessert</SelectItem>
              <SelectItem value="SNACK">Snack</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() =>
            updateNow({
              q,
              type,
              customOnly,
              instagramOnly,
              neverCooked,
            })
          }
          className={buttonVariants({ variant: "default" })}
          disabled={isPending}
        >
          {isPending ? "Filtering..." : "Filter"}
        </button>
      </div>

      <div className="flex gap-4 items-center text-sm">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={customOnly}
            onCheckedChange={(checked) => {
              const nextChecked = Boolean(checked);
              setCustomOnly(nextChecked);
              updateNow({ customOnly: nextChecked });
            }}
            className="mr-0"
          />
          Custom only
        </label>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={instagramOnly}
            onCheckedChange={(checked) => {
              const nextChecked = Boolean(checked);
              setInstagramOnly(nextChecked);
              updateNow({ instagramOnly: nextChecked });
            }}
            className="mr-0"
          />
          Instagram only
        </label>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={neverCooked}
            onCheckedChange={(checked) => {
              const nextChecked = Boolean(checked);
              setNeverCooked(nextChecked);
              updateNow({ neverCooked: nextChecked });
            }}
            className="mr-0"
          />
          Never cooked
        </label>
      </div>
    </div>
  );
}
