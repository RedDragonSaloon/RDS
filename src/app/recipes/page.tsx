"use client";

import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { staticData } from "@/lib/static-data";
import Link from "next/link";
import {
  Search,
  Filter,
  ChefHat,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Utensils,
  Wine,
  Coffee,
  Beef
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

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await staticData.getRecipes();
        if (data) {
          setRecipes(data);
        }
      } catch (error) {
        console.error("Failed to load recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(recipes.map(recipe => recipe.category))).sort();
  }, [recipes]);

  const difficulties = useMemo(() => {
    return Array.from(new Set(recipes.map(recipe => recipe.difficulty))).sort();
  }, [recipes]);

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || recipe.difficulty.toString() === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort recipes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "difficulty":
          return a.difficulty - b.difficulty;
        case "category":
          return a.category.localeCompare(b.category);
        case "cost":
          return a.calculatedCost - b.calculatedCost;
        default:
          return 0;
      }
    });

    return filtered;
  }, [recipes, searchTerm, selectedCategory, selectedDifficulty, sortBy]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  const avgCost = recipes.length > 0
    ? recipes.reduce((sum, recipe) => sum + recipe.calculatedCost, 0) / recipes.length
    : 0;

  const avgDifficulty = recipes.length > 0
    ? recipes.reduce((sum, recipe) => sum + recipe.difficulty, 0) / recipes.length
    : 0;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif flex items-center gap-3">
              <ChefHat className="h-8 w-8 text-primary" />
              Recipe Collection
            </h1>
            <p className="text-muted-foreground mt-2">
              Cocktail recipes, food preparations, and cooking instructions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recipes.length}</div>
              <p className="text-xs text-muted-foreground">
                Available recipes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                Recipe types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Cost to make
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Difficulty</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgDifficulty.toFixed(1)}/5</div>
              <p className="text-xs text-muted-foreground">
                Skill level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="">All Levels</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty.toString()}>
                      {getDifficultyLabel(difficulty)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Name</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="category">Category</option>
                  <option value="cost">Cost</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRecipes.map((recipe) => {
            const IconComponent = getCategoryIcon(recipe.category);

            return (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="secondary">{recipe.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(recipe.difficulty)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                        ))}
                        {[...Array(5 - recipe.difficulty)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-muted-foreground" />
                        ))}
                      </div>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {recipe.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {recipe.description || "A delicious recipe from our collection"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {getDifficultyLabel(recipe.difficulty)}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Utensils className="h-3 w-3" />
                          {recipe.ingredients.length} ingredients
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredAndSortedRecipes.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}