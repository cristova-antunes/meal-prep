import { IngredientType } from "@/app/generated/prisma/enums";

export type RecipeHealthStatus = "good" | "almost" | "needs-improvement";
export type PrismaRecipeHealthStatus = "GOOD" | "ALMOST" | "NEEDS_IMPROVEMENT";

export type RecipeIngredientWithIngredient = {
  ingredient: {
    id: string;
    name: string;
    type?: IngredientType | null;
  };
  quantity: string;
};

const statusBadgeVariant: Record<
  RecipeHealthStatus,
  "default" | "secondary" | "destructive"
> = {
  good: "default",
  almost: "secondary",
  "needs-improvement": "destructive",
};

const statusMessage: Record<RecipeHealthStatus, string> = {
  good: "This recipe is balanced by the healthiness rules.",
  almost:
    "This recipe is close to balanced. Adjust the vegetable/fruit count to match the ideal range.",
  "needs-improvement":
    "This recipe needs better balance. Add or adjust ingredients to meet the healthiness rules.",
};

export function getRecipeHealthStatus(
  recipeIngredients: RecipeIngredientWithIngredient[],
): RecipeHealthStatus {
  const ingredientTypes = new Map<string, IngredientType | null>();

  recipeIngredients.forEach(({ ingredient }) => {
    if (!ingredientTypes.has(ingredient.id)) {
      ingredientTypes.set(ingredient.id, ingredient.type ?? null);
    }
  });

  let proteinOrLegumes = 0;
  let carbs = 0;
  let vegetalOrFruit = 0;

  Array.from(ingredientTypes.values()).forEach((type) => {
    if (type === "Protein" || type === "Legumes") {
      proteinOrLegumes += 1;
    }
    if (type === "Carbs") {
      carbs += 1;
    }
    if (type === "Vegetable" || type === "Fruit") {
      vegetalOrFruit += 1;
    }
  });

  const hasProteinOrLegumes = proteinOrLegumes >= 1;
  const hasCarbs = carbs >= 1;
  const hasVegetalOrFruit = vegetalOrFruit >= 1 && vegetalOrFruit <= 2;

  if (hasProteinOrLegumes && hasCarbs && hasVegetalOrFruit) {
    return "good";
  }

  if (hasProteinOrLegumes && hasCarbs && vegetalOrFruit >= 1) {
    return "almost";
  }

  return "needs-improvement";
}

export function getRecipeHealthAnalysis(
  recipeIngredients: RecipeIngredientWithIngredient[],
) {
  const ingredientTypes = new Map<string, IngredientType | null>();

  recipeIngredients.forEach(({ ingredient }) => {
    if (!ingredientTypes.has(ingredient.id)) {
      ingredientTypes.set(ingredient.id, ingredient.type ?? null);
    }
  });

  let proteinOrLegumes = 0;
  let carbs = 0;
  let vegetalOrFruit = 0;
  let missingType = 0;

  Array.from(ingredientTypes.values()).forEach((type) => {
    if (type === "Protein" || type === "Legumes") {
      proteinOrLegumes += 1;
    }
    if (type === "Carbs") {
      carbs += 1;
    }
    if (type === "Vegetable" || type === "Fruit") {
      vegetalOrFruit += 1;
    }
    if (type == null) {
      missingType += 1;
    }
  });

  const status = getRecipeHealthStatus(recipeIngredients);
  const badgeVariant = statusBadgeVariant[status];
  const message = statusMessage[status];

  const suggestions: string[] = [];
  if (proteinOrLegumes === 0) {
    suggestions.push("Add at least one Protein or Legumes ingredient.");
  }
  if (carbs === 0) {
    suggestions.push("Add at least one Carbs ingredient.");
  }
  if (vegetalOrFruit === 0) {
    suggestions.push("Add one or two Vegetable or Fruit ingredients.");
  } else if (vegetalOrFruit > 2) {
    suggestions.push(
      "Reduce Vegetable/Fruit ingredients to one or two for the healthiest balance.",
    );
  }
  if (missingType > 0) {
    suggestions.push(
      `There are ${missingType} ingredient${missingType === 1 ? "" : "s"} without a type. Type them to improve the analysis.`,
    );
  }

  return {
    status,
    badgeVariant,
    message,
    proteinOrLegumes,
    carbs,
    vegetalOrFruit,
    missingType,
    suggestions,
  };
}

const recipeHealthStatusToPrisma: Record<
  RecipeHealthStatus,
  PrismaRecipeHealthStatus
> = {
  good: "GOOD",
  almost: "ALMOST",
  "needs-improvement": "NEEDS_IMPROVEMENT",
};

export function toPrismaRecipeHealthStatus(
  status: RecipeHealthStatus,
): PrismaRecipeHealthStatus {
  return recipeHealthStatusToPrisma[status];
}
