"use client";

import { FormEvent, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Pencil, X, Check } from "lucide-react";

export default function EditRecipeForm({
  recipeId,
  title,
  description,
  updateAction,
}: {
  recipeId: string;
  title: string;
  description: string | null;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newDescription, setNewDescription] = useState(description || "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await updateAction(formData);

    startTransition(() => {
      router.refresh();
      setIsEditing(false);
    });
  }

  if (!isEditing) {
    return (
      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
        <Pencil className="mr-1 h-4 w-4" />
        Edit
      </Button>
    );
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="recipeId" value={recipeId} />

        <div>
          <label className="text-sm font-medium">Recipe Name</label>
          <Input
            name="title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Recipe name"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            name="description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Recipe description (optional)"
            disabled={isPending}
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isPending || !newTitle.trim()}
            size="sm"
          >
            <Check className="mr-1 h-4 w-4" />
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              setNewTitle(title);
              setNewDescription(description || "");
            }}
            disabled={isPending}
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
