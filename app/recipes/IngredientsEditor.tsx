"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { recipeIngredient } from "@/types/types";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

function IngredientSelect({
  allIngredients,
}: {
  allIngredients: Ingredient[];
}) {
  return (
    <div className="flex items-center gap-2">
      <Combobox
        items={allIngredients.map((ingredient) => ingredient.name)}
        name="ingredientId"
      >
        <ComboboxInput placeholder="Select an ingredient" />
        <ComboboxContent>
          <ComboboxEmpty>No ingredients yet</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
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
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  async function handleAddIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await addAction(formData);
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleUpdateIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await updateAction(formData);
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleRemoveIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await removeAction(formData);
    startTransition(() => {
      router.refresh();
    });
  }

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
                            onSubmit={handleUpdateIngredient}
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
                            <Button
                              type="submit"
                              size="sm"
                              disabled={isPending}
                            >
                              Update
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                    {isEditing ? (
                      <form
                        onSubmit={handleRemoveIngredient}
                        className="inline"
                      >
                        <Input type="hidden" name="recipeId" value={recipeId} />
                        <Input
                          type="hidden"
                          name="ingredientId"
                          value={ri.ingredientId}
                        />
                        <Button
                          type="submit"
                          variant="destructive"
                          size="sm"
                          disabled={isPending}
                        >
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
          <form
            onSubmit={handleAddIngredient}
            className="flex items-center gap-2 w-full"
          >
            <input type="hidden" name="recipeId" value={recipeId} />
            {/* Ingredient Select (shadcn) with hidden input for form submission */}
            <IngredientSelect allIngredients={allIngredients} />
            <Input
              name="quantity"
              defaultValue="1"
              className="rounded-md border px-2 py-1 w-20"
            />
            <Button type="submit" disabled={isPending}>
              Add
            </Button>
          </form>
        </CardFooter>
      </Card>
    </section>
  );
}
