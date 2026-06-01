"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Checkbox } from "@/components/ui/checkbox";

export default function MealPrepCookedToggle({
  dailyMenuId,
  initialCooked,
  toggleCooked,
}: {
  dailyMenuId: string;
  initialCooked: boolean;
  toggleCooked: (formData: FormData) => Promise<void>;
}) {
  const [checked, setChecked] = useState(initialCooked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleCheckedChange(nextChecked: boolean | "indeterminate") {
    const cooked = nextChecked === true;
    setChecked(cooked);

    const formData = new FormData();
    formData.set("dailyMenuId", dailyMenuId);
    if (cooked) {
      formData.set("cooked", "true");
    }

    await toggleCooked(formData);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox
        checked={checked}
        disabled={isPending}
        onCheckedChange={handleCheckedChange}
      />
      <span>{checked ? "Cooked" : "Mark as cooked"}</span>
    </label>
  );
}
