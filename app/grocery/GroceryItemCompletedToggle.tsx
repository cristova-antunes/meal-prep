"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

export default function GroceryItemCompletedToggle({
  itemId,
  isCompleted,
  toggleCompleted,
  label,
}: {
  itemId: string;
  isCompleted: boolean;
  label: string;
  toggleCompleted: (
    formData: FormData,
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = React.useState(isCompleted);

  // keep local state in sync with server-provided prop
  React.useEffect(() => {
    // perform the update as a low-priority transition and use a
    // functional updater so we don't reference `checked` here.
    startTransition(() => {
      setChecked((prev) => (prev !== isCompleted ? isCompleted : prev));
    });
  }, [isCompleted, startTransition]);

  // optimistic UI: show local state immediately
  const displayedChecked = checked;

  async function handleChange(checkedValue: boolean | "indeterminate") {
    const nextChecked = checkedValue === true;
    const previous = checked;
    setChecked(nextChecked);

    const formData = new FormData();
    formData.set("itemId", itemId);
    formData.set("isCompleted", nextChecked ? "true" : "false");

    try {
      const res = await toggleCompleted(formData as FormData);
      if (res.ok === false) {
        console.error("toggleCompleted returned error:", res.error);
        setChecked(previous);
        return;
      }
    } catch (err) {
      // revert optimistic update on error
      console.error("toggleCompleted failed:", err);
      setChecked(previous);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Checkbox
        id={itemId}
        checked={displayedChecked}
        onCheckedChange={handleChange}
        disabled={isPending}
      />
      <label
        aria-label={`Mark ${label} as completed"`}
        htmlFor={itemId}
        className={`font-medium ${
          isCompleted ? "line-through text-muted-foreground" : ""
        }`}
      >
        {label}
      </label>
    </div>
  );
}
