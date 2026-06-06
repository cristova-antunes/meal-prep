"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ingredientType } from "@/types/types";

type AddGroceryItemFormProps = {
  action: (formData: FormData) => Promise<void>;
};

export default function AddGroceryItemForm({
  action,
}: AddGroceryItemFormProps) {
  const [selectedType, setSelectedType] = React.useState<string>("");

  return (
    <Card className="shadow-sm">
      <form action={action} className="space-y-6">
        <CardHeader>
          <CardTitle>Add manual grocery item</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="customName">
                Item name
              </label>
              <input
                id="customName"
                name="customName"
                type="text"
                placeholder="e.g. Paper Towels"
                className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="customType">
                Type (optional)
              </label>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Select onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Optional type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Other">Other</SelectItem>
                    {ingredientType.map((typeOption) => (
                      <SelectItem
                        key={typeOption.value}
                        value={typeOption.value}
                      >
                        {typeOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm">
                  Save
                </Button>
                <input type="hidden" name="customType" value={selectedType} />
              </div>
            </div>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
