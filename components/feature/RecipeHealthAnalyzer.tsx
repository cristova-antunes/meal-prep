import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRecipeHealthAnalysis } from "@/lib/recipe-health";
import type { RecipeIngredientWithIngredient } from "@/lib/recipe-health";

type Props = {
  recipeIngredients: RecipeIngredientWithIngredient[];
};

export default function RecipeHealthAnalyzer({ recipeIngredients }: Props) {
  const analysis = getRecipeHealthAnalysis(recipeIngredients);

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
