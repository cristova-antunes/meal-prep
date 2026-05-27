import { IngredientType } from "@/app/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RecipeIngredientWithIngredient = {
  ingredient: {
    id: string;
    name: string;
    type?: IngredientType | null;
  };
  quantity: string;
};

type Props = {
  recipeIngredients: RecipeIngredientWithIngredient[];
};

function getHealthAnalyis(recipeIngredients: RecipeIngredientWithIngredient[]) {
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

  const hasProteinOrLegumes = proteinOrLegumes >= 1;
  const hasCarbs = carbs >= 1;
  const hasVegetalOrFruit = vegetalOrFruit >= 1 && vegetalOrFruit <= 2;
  const hasTooManyVegetalOrFruit = vegetalOrFruit > 2;

  let status: "good" | "almost" | "needs-improvement" = "needs-improvement";
  if (hasProteinOrLegumes && hasCarbs && hasVegetalOrFruit) {
    status = "good";
  } else if (hasProteinOrLegumes && hasCarbs && vegetalOrFruit >= 1) {
    status = "almost";
  }

  const badgeVariant: "default" | "secondary" | "destructive" =
    status === "good"
      ? "default"
      : status === "almost"
        ? "secondary"
        : "destructive";

  const message =
    status === "good"
      ? "This recipe is balanced by the healthiness rules."
      : status === "almost"
        ? "This recipe is close to balanced. Adjust the vegetable/fruit count to match the ideal range."
        : "This recipe needs better balance. Add or adjust ingredients to meet the healthiness rules.";

  const suggestions: string[] = [];
  if (!hasProteinOrLegumes) {
    suggestions.push("Add at least one Protein or Legumes ingredient.");
  }
  if (!hasCarbs) {
    suggestions.push("Add at least one Carbs ingredient.");
  }
  if (!hasVegetalOrFruit) {
    suggestions.push("Add one or two Vegetable or Fruit ingredients.");
  } else if (hasTooManyVegetalOrFruit) {
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

export default function RecipeHealthAnalyzer({ recipeIngredients }: Props) {
  const analysis = getHealthAnalyis(recipeIngredients);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recipe health analyzer</CardTitle>
        <CardDescription>
          Evaluates the recipe against the target ingredient balance for a
          healthy meal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={analysis.badgeVariant}
            className="uppercase tracking-[0.08em]"
          >
            {analysis.status === "good"
              ? "Good"
              : analysis.status === "almost"
                ? "Almost there"
                : "Needs improvement"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {analysis.message}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Protein / Legumes
            </p>
            <p className="mt-2 text-xl font-semibold">
              {analysis.proteinOrLegumes}
            </p>
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Carbs
            </p>
            <p className="mt-2 text-xl font-semibold">{analysis.carbs}</p>
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Vegetable / Fruit
            </p>
            <p className="mt-2 text-xl font-semibold">
              {analysis.vegetalOrFruit}
            </p>
          </div>
        </div>

        {analysis.suggestions.length > 0 ? (
          <div className="mt-4 space-y-2 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            {analysis.suggestions.map((suggestion) => (
              <p key={suggestion}>• {suggestion}</p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
