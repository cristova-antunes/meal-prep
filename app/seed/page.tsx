import { IngredientType } from "../generated/prisma/enums";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  // Map your Portuguese ingredients to your exact Prisma IngredientType enum values
  const ingredientMap: { name: string; type: IngredientType }[] = [
    // Protein
    { name: "Atum", type: IngredientType.Protein },
    { name: "Carne picada", type: IngredientType.Protein },
    { name: "Fiambre", type: IngredientType.Protein },
    { name: "Frango/Perú", type: IngredientType.Protein },
    { name: "Ovo", type: IngredientType.Protein },
    { name: "Salmão fumado", type: IngredientType.Protein },
    { name: "Seitan", type: IngredientType.Protein },
    { name: "Tofu", type: IngredientType.Protein },

    // Carbs
    { name: "Arroz", type: IngredientType.Carbs },
    { name: "Arroz (risotto)", type: IngredientType.Carbs },
    { name: "Base pizza", type: IngredientType.Carbs },
    { name: "Batata", type: IngredientType.Carbs },
    { name: "Batata palha", type: IngredientType.Carbs },
    { name: "Couscous", type: IngredientType.Carbs },
    { name: "Esparguete", type: IngredientType.Carbs },
    { name: "Farinha", type: IngredientType.Carbs },
    { name: "Gnocci", type: IngredientType.Carbs },
    { name: "Maizena", type: IngredientType.Carbs },
    { name: "Massa (mais grossa)", type: IngredientType.Carbs },
    { name: "Massa bagos", type: IngredientType.Carbs },
    { name: "Pão sandwich", type: IngredientType.Carbs },
    { name: "Pão wrap", type: IngredientType.Carbs },
    { name: "Quinoa", type: IngredientType.Carbs },
    { name: "Raviolli", type: IngredientType.Carbs },

    // Legumes
    { name: "Edamame", type: IngredientType.Legumes },
    { name: "Ervilhas", type: IngredientType.Legumes },
    { name: "Feijão cozido", type: IngredientType.Legumes },
    { name: "Feijão preto", type: IngredientType.Legumes },
    { name: "Feijão verde", type: IngredientType.Legumes },
    { name: "Grão", type: IngredientType.Legumes },
    { name: "Hummus grão", type: IngredientType.Legumes },
    { name: "Lentilhas", type: IngredientType.Legumes },

    // Vegetable
    { name: "Alface", type: IngredientType.Vegetable },
    { name: "Alho francês", type: IngredientType.Vegetable },
    { name: "Bróculos", type: IngredientType.Vegetable },
    { name: "Cebola", type: IngredientType.Vegetable },
    { name: "Cebola roxa", type: IngredientType.Vegetable },
    { name: "Cenoura", type: IngredientType.Vegetable },
    { name: "Cogumelos", type: IngredientType.Vegetable },
    { name: "Courgette", type: IngredientType.Vegetable },
    { name: "Courgette (zoodle)", type: IngredientType.Vegetable },
    { name: "Couve", type: IngredientType.Vegetable },
    { name: "Couve coração de boi", type: IngredientType.Vegetable },
    { name: "Couve-flor", type: IngredientType.Vegetable },
    { name: "Espargos", type: IngredientType.Vegetable },
    { name: "Espinafres", type: IngredientType.Vegetable },
    { name: "Milho", type: IngredientType.Vegetable },
    { name: "Pepino", type: IngredientType.Vegetable },
    { name: "Pimento", type: IngredientType.Vegetable },
    { name: "Rabanete", type: IngredientType.Vegetable },
    { name: "Tomate", type: IngredientType.Vegetable },
    { name: "Tomate cherry", type: IngredientType.Vegetable },

    // Fruit
    { name: "Ananás", type: IngredientType.Fruit },
    { name: "Lima", type: IngredientType.Fruit },
    { name: "Limão", type: IngredientType.Fruit },
    { name: "Manga", type: IngredientType.Fruit },

    // FatsAndDairy
    { name: "Abacate", type: IngredientType.FatsAndDairy },
    { name: "Azeite", type: IngredientType.FatsAndDairy },
    { name: "Bacon aos cubos", type: IngredientType.FatsAndDairy },
    { name: "Bebida de soja", type: IngredientType.FatsAndDairy },
    { name: "Caju", type: IngredientType.FatsAndDairy },
    { name: "Frutos secos e sementes", type: IngredientType.FatsAndDairy },
    { name: "Iogurte grego", type: IngredientType.FatsAndDairy },
    { name: "Leite de coco", type: IngredientType.FatsAndDairy },
    { name: "Manteiga de amendoim", type: IngredientType.FatsAndDairy },
    { name: "Margarina", type: IngredientType.FatsAndDairy },
    { name: "Molho de tomate", type: IngredientType.FatsAndDairy },
    { name: "Natas", type: IngredientType.FatsAndDairy },
    { name: "Pesto", type: IngredientType.FatsAndDairy },
    { name: "Pistachio", type: IngredientType.FatsAndDairy },
    { name: "Queijo Philadelphia", type: IngredientType.FatsAndDairy },
    { name: "Queijo feta", type: IngredientType.FatsAndDairy },
    { name: "Queijo mozzarella", type: IngredientType.FatsAndDairy },
    { name: "Queijo parmesão", type: IngredientType.FatsAndDairy },
    { name: "Queijo ralado", type: IngredientType.FatsAndDairy },
    { name: "Tomate seco", type: IngredientType.FatsAndDairy },
    { name: "Óleo", type: IngredientType.FatsAndDairy },
    { name: "Óleo sésamo", type: IngredientType.FatsAndDairy },

    // Condiments
    { name: "Alho", type: IngredientType.Condiments },
    { name: "Açúcar", type: IngredientType.Condiments },
    { name: "Caril em pó", type: IngredientType.Condiments },
    { name: "Cebolinho", type: IngredientType.Condiments },
    { name: "Coentros", type: IngredientType.Condiments },
    { name: "Cominho em pó", type: IngredientType.Condiments },
    { name: "Cominhos", type: IngredientType.Condiments },
    { name: "Ervas aromáticas", type: IngredientType.Condiments },
    { name: "Louro", type: IngredientType.Condiments },
    { name: "Malagueta", type: IngredientType.Condiments },
    { name: "Manjericão", type: IngredientType.Condiments },
    { name: "Molho de ostras", type: IngredientType.Condiments },
    { name: "Molho de soja", type: IngredientType.Condiments },
    { name: "Mostarda dijon", type: IngredientType.Condiments },
    { name: "Noz moscada em pó", type: IngredientType.Condiments },
    { name: "Paprika", type: IngredientType.Condiments },
    { name: "Pimenta preta moída", type: IngredientType.Condiments },
    {
      name: "Pimentão fumado / Massa pimentão",
      type: IngredientType.Condiments,
    },
    { name: "Ramo tomilho fresco", type: IngredientType.Condiments },
    { name: "Sal", type: IngredientType.Condiments },
    { name: "Salsa", type: IngredientType.Condiments },
    { name: "Vinho branco", type: IngredientType.Condiments },

    // ReadyMeals
    { name: "Sopa (complemento de refeição)", type: IngredientType.ReadyMeals },
  ];

  const user = await currentUser();

  if (user) {
    for (const item of ingredientMap) {
      // Look for an existing ingredient by name for this system seed user
      const existing = await prisma.ingredient.findFirst({
        where: {
          name: item.name,
          clerkId: user?.id,
        },
      });

      if (existing) {
        // Update type if it already exists to avoid duplicates
        await prisma.ingredient.update({
          where: { id: existing.id },
          data: { type: item.type },
        });
      } else {
        // Create new ingredient entry
        await prisma.ingredient.create({
          data: {
            name: item.name,
            type: item.type,
            clerkId: user?.id,
          },
        });
      }
    }
  }

  return <div>Page</div>;
}
