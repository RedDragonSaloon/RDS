import { RecipeDetailClient } from "./client";
import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'recipes.json');
    const recipes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return recipes?.map((recipe: any) => ({
      id: recipe.id,
    })) || [];
  } catch (error) {
    console.warn('Could not load recipes for static params:', error);
    return [];
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  return <RecipeDetailClient recipeId={id} />;
}