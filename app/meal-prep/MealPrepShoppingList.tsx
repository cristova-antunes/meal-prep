"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export type MealPrepShoppingListItem = {
  ingredientId: string;
  name: string;
  type: string;
  quantity: number;
  recipeCount: number;
};

type MealPrepShoppingListProps = {
  items: MealPrepShoppingListItem[];
};

export default function MealPrepShoppingList({
  items,
}: MealPrepShoppingListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const groupedItems = useMemo(() => {
    return items.reduce<Record<string, MealPrepShoppingListItem[]>>(
      (acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = [];
        }
        acc[item.type].push(item);
        return acc;
      },
      {},
    );
  }, [items]);

  const toggleSelection = (ingredientId: string) => {
    setSelectedIds((previous) =>
      previous.includes(ingredientId)
        ? previous.filter((id) => id !== ingredientId)
        : [...previous, ingredientId],
    );
  };

  const handleAddSelected = () => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      const results = await Promise.all(
        selectedIds.map(async (ingredientId) => {
          try {
            const response = await fetch("/api/grocery", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ingredientId }),
              cache: "no-store",
            });

            if (!response.ok) {
              return false;
            }

            const data = await response.json().catch(() => ({ ok: false }));
            return data?.ok === true;
          } catch {
            return false;
          }
        }),
      );

      const successCount = results.filter(Boolean).length;
      const failedIds = selectedIds.filter((_, index) => !results[index]);

      if (successCount === selectedIds.length) {
        toast.success(
          `Added ${successCount} ingredient${successCount === 1 ? "" : "s"} to grocery`,
        );
        setSelectedIds([]);
        return;
      }

      if (successCount > 0) {
        toast.success(
          `Added ${successCount} of ${selectedIds.length} selected ingredient${selectedIds.length === 1 ? "" : "s"}`,
        );
        setSelectedIds(failedIds);
        return;
      }

      toast.error("Couldn't add selected ingredients to grocery");
    });
  };

  const totalSelected = selectedIds.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopping list</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Select ingredients and add them to your grocery list.
            </p>
            <p className="text-sm text-muted-foreground">
              Selected: {totalSelected}
            </p>
          </div>
          <button
            type="button"
            disabled={!totalSelected || isPending}
            onClick={handleAddSelected}
            className={buttonVariants({ variant: "secondary" })}
          >
            {isPending
              ? "Adding..."
              : totalSelected > 0
                ? `Add ${totalSelected} selected`
                : "Add selected to grocery"}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(groupedItems)
            .sort(([aType], [bType]) => aType.localeCompare(bType))
            .map(([type, items]) => (
              <div key={type}>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                  {type}
                </h3>
                <ul className="space-y-2 text-sm">
                  {items
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((item) => {
                      const itemId = `ingredient-${item.ingredientId}`;
                      const isChecked = selectedIds.includes(item.ingredientId);

                      return (
                        <li key={item.ingredientId}>
                          <label
                            htmlFor={itemId}
                            className="flex items-center gap-3 rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition hover:border-primary"
                          >
                            <Checkbox
                              id={itemId}
                              checked={isChecked}
                              onCheckedChange={() =>
                                toggleSelection(item.ingredientId)
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">
                                {item.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.quantity} unit
                                {item.quantity === 1 ? "" : "s"} from{" "}
                                {item.recipeCount} recipe
                                {item.recipeCount === 1 ? "" : "s"}
                              </div>
                            </div>
                          </label>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
