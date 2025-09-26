"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { staticData } from "@/lib/static-data";
import { exportRecipeToPDF } from "@/lib/utils/export";
import {
  ArrowLeft,
  ChefHat,
  Clock,
  DollarSign,
  Star,
  Utensils,
  AlertTriangle,
  Wine,
  Coffee,
  Beef,
  Download
} from "lucide-react";


interface RecipeIngredient {
  id: string;
  recipeId: string;
  itemId: string;
  quantity: number;
  unitOverride?: string;
  item: {
    name: string;
    buyPrice: number;
    unit: string;
  };
}

interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: number;
  stepsMarkdown?: string;
  imageUrl?: string;
  isActive: boolean;
  ingredients: RecipeIngredient[];
  calculatedCost: number;
  suggestedSellPrice: number;
  suggestedMargin: number;
}

const getDifficultyLabel = (difficulty: number) => {
  switch (difficulty) {
    case 1: return "Easy";
    case 2: return "Medium";
    case 3: return "Hard";
    case 4: return "Expert";
    case 5: return "Master";
    default: return "Unknown";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'cocktails': return Wine;
    case 'non-alcoholic': return Coffee;
    case 'food': return Beef;
    default: return Utensils;
  }
};

interface Props {
  recipeId: string;
}

export function RecipeDetailClient({ recipeId }: Props) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const recipes = await staticData.getRecipes();
        if (recipes) {
          const foundRecipe = recipes.find(r => r.id === recipeId);
          if (foundRecipe) {
            setRecipe(foundRecipe);
          } else {
            setNotFound(true);
          }
        }
      } catch (error) {
        console.error("Failed to load recipe:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      loadRecipe();
    }
  }, [recipeId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (notFound || !recipe) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Recipe Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The recipe you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/recipes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Button>
        </div>
      </MainLayout>
    );
  }

  const IconComponent = getCategoryIcon(recipe.category);
  const steps = recipe.stepsMarkdown?.split('\\n').filter(step => step.trim()) || [];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Back Button and Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/recipes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Button>
          <Button variant="outline" onClick={() => exportRecipeToPDF(recipe)}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Recipe Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>
                      <h1 className="text-3xl font-bold font-serif">{recipe.name}</h1>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(recipe.difficulty)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                    {[...Array(5 - recipe.difficulty)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-muted-foreground" />
                    ))}
                  </div>
                </div>
                <CardDescription className="text-base">
                  {recipe.description || "A delicious recipe from our collection"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{getDifficultyLabel(recipe.difficulty)}</div>
                    <div className="text-sm text-muted-foreground">Difficulty</div>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Utensils className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{recipe.ingredients.length}</div>
                    <div className="text-sm text-muted-foreground">Ingredients</div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recipe Image Placeholder */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg flex items-center justify-center">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <IconComponent className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">No image available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Ingredients
            </CardTitle>
            <CardDescription>
              Everything you need to make this recipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipe.ingredients.map((ingredient) => {
                    const unit = ingredient.unitOverride || ingredient.item.unit;
                    const totalCost = ingredient.quantity * ingredient.item.buyPrice;

                    return (
                      <TableRow key={ingredient.id}>
                        <TableCell className="font-medium">
                          {ingredient.item.name}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {ingredient.quantity}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {unit}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

          </CardContent>
        </Card>

        {/* Instructions */}
        {recipe.stepsMarkdown && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Instructions
              </CardTitle>
              <CardDescription>
                Step-by-step preparation guide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const cleanStep = step.replace(/^\\d+\\.\\s*/, '').trim();
                  if (!cleanStep) return null;

                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground">{cleanStep}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </MainLayout>
  );
}