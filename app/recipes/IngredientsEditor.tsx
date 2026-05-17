"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ingredient } from "../generated/prisma/client";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { recipeIngredient } from "./types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

function IngredientSelect({
  allIngredients,
}: {
  allIngredients: Ingredient[];
}) {
  const defaultId = allIngredients[0]?.id ?? "";
  const [value, setValue] = useState<string>(defaultId);

  return (
    <div className="flex items-center gap-2">
      <input type="hidden" name="ingredientId" value={value} />
      <Select value={value} onValueChange={(v) => setValue(v)}>
        <SelectTrigger>
          <SelectValue placeholder={allIngredients[0]?.name ?? "Select"} />
        </SelectTrigger>
        <SelectContent>
          {allIngredients.map((ing) => (
            <SelectItem key={ing.id} value={ing.id}>
              {ing.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function IngredientsEditor({
  recipeId,
  recipeIngredients,
  allIngredients,
  addAction,
  removeAction,
  updateAction,
}: {
  recipeId: string;
  recipeIngredients: recipeIngredient[];
  allIngredients: Ingredient[];
  addAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
          <CardDescription>
            {recipeIngredients.length} ingredient
            {recipeIngredients.length === 1 ? "" : "s"}
          </CardDescription>
          <CardAction>
            {" "}
            {isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Done
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recipeIngredients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ingredients yet.
              </p>
            ) : (
              recipeIngredients.map((ri) => (
                <Card size="sm" key={ri.ingredientId}>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="flex gap-2">
                        <p className="font-medium">
                          {ri.ingredient?.name ?? ri.ingredientId}
                        </p>
                        {!isEditing ? (
                          <p className="text-sm text-muted-foreground">
                            Qty: {ri.quantity}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isEditing ? (
                          <form
                            action={updateAction}
                            className="flex items-center gap-2"
                          >
                            <Input
                              type="hidden"
                              name="recipeId"
                              value={recipeId}
                            />
                            <Input
                              type="hidden"
                              name="ingredientId"
                              value={ri.ingredientId}
                            />
                            <Input
                              name="quantity"
                              defaultValue={ri.quantity}
                              className="rounded-md border px-2 py-1 w-20"
                            />
                            <Button type="submit" size="sm">
                              Update
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                    {isEditing ? (
                      <form action={removeAction} className="inline">
                        <Input type="hidden" name="recipeId" value={recipeId} />
                        <Input
                          type="hidden"
                          name="ingredientId"
                          value={ri.ingredientId}
                        />
                        <Button type="submit" variant="destructive" size="sm">
                          Remove
                        </Button>
                      </form>
                    ) : null}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter>
          <form action={addAction} className="flex items-center gap-2 w-full">
            <input type="hidden" name="recipeId" value={recipeId} />
            {/* Ingredient Select (shadcn) with hidden input for form submission */}
            <IngredientSelect allIngredients={allIngredients} />
            <Input
              name="quantity"
              defaultValue="1"
              className="rounded-md border px-2 py-1 w-20"
            />
            <Button type="submit">Add</Button>
          </form>
        </CardFooter>
      </Card>
    </section>
  );
}
