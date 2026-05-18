import { RecipeType } from "@/app/generated/prisma/enums";
import { Badge } from "../ui/badge";
import { recipeTypes } from "@/types/types";

export default function RecipeTypeBadge({ type }: { type: RecipeType }) {
  const colors =
    recipeTypes.find((t) => t.value === type)?.colors ||
    "bg-gray-100 text-gray-800";

  const typeLabel = recipeTypes.find((t) => t.value === type)?.label || type;

  return <Badge className={colors}>{typeLabel}</Badge>;
}
