"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

export default function GroceryItemCompletedToggle({
  itemId,
  isCompleted,
  toggleCompleted,
}: {
  itemId: string;
  isCompleted: boolean;
  toggleCompleted: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = React.useState(isCompleted);

  async function handleChange(checkedValue: boolean | "indeterminate") {
    const nextChecked = checkedValue === true;
    setChecked(nextChecked);

    const formData = new FormData();
    formData.set("itemId", itemId);
    formData.set("isCompleted", nextChecked ? "true" : "false");

    await toggleCompleted(formData);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center gap-2">
      <input type="hidden" name="itemId" value={itemId} />
      <input
        type="hidden"
        name="isCompleted"
        value={checked ? "true" : "false"}
      />
      <Checkbox
        checked={checked}
        onCheckedChange={handleChange}
        disabled={isPending}
      />
      <span className="sr-only">Mark grocery item completed</span>
    </div>
  );
}
