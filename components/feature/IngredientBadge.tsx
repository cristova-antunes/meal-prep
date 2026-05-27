import { IngredientType } from "@/app/generated/prisma/enums";
import { Badge } from "../ui/badge";
import { ingredientType } from "@/types/types";

export default function IngredientBadge({ type }: { type: IngredientType }) {
  const colors =
    ingredientType.find((t) => t.value === type)?.colors ||
    "bg-gray-100 text-gray-800";

  const typeLabel = ingredientType.find((t) => t.value === type)?.label || type;

  return <Badge className={colors}>{typeLabel}</Badge>;
}
