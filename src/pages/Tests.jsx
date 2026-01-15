import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TestTube } from "lucide-react";

export default function Tests() {
  const [recipeResult, setRecipeResult] = useState(null);
  const [storyResult, setStoryResult] = useState(null);
  const [mealResult, setMealResult] = useState(null);
  const [loading, setLoading] = useState({ recipe: false, story: false, meal: false });

  const testCreateRecipe = async () => {
    setLoading({ ...loading, recipe: true });
    try {
      const result = await base44.entities.Recipe.create({
        title: "Test Recipe " + Date.now(),
        shortDescription: "A test recipe",
        fullInstructions: "Step 1: Test\nStep 2: Done",
        ingredients: [
          { name: "Test Ingredient", quantity: 1, unit: "cup" }
        ],
        categories: ["test"],
        difficultyLevel: 3,
        estimatedTime: 30,
        servings: 4
      });
      setRecipeResult({ success: true, data: result });
    } catch (error) {
      setRecipeResult({ success: false, error: error.message });
    }
    setLoading({ ...loading, recipe: false });
  };

  const testCreateStory = async () => {
    setLoading({ ...loading, story: true });
    try {
      // First get a recipe to attach the story to
      const recipes = await base44.entities.Recipe.list();
      if (recipes.length === 0) {
        setStoryResult({ success: false, error: "No recipes found. Create a recipe first." });
        setLoading({ ...loading, story: false });
        return;
      }
      
      const result = await base44.entities.RecipeStory.create({
        recipeId: recipes[0].id,
        text: "Test story created at " + new Date().toLocaleString(),
        authorName: "Test Author"
      });
      setStoryResult({ success: true, data: result });
    } catch (error) {
      setStoryResult({ success: false, error: error.message });
    }
    setLoading({ ...loading, story: false });
  };

  const testCreateMeal = async () => {
    setLoading({ ...loading, meal: true });
    try {
      const result = await base44.entities.Meal.create({
        name: "Test Meal " + Date.now(),
        description: "A test meal collection",
        recipeIds: []
      });
      setMealResult({ success: true, data: result });
    } catch (error) {
      setMealResult({ success: false, error: error.message });
    }
    setLoading({ ...loading, meal: false });
  };

  const ResultDisplay = ({ result }) => {
    if (!result) return null;
    
    return (
      <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="font-semibold mb-2">
          {result.success ? '✅ Success' : '❌ Error'}
        </div>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(result.success ? result.data : result.error, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TestTube className="w-8 h-8 text-amber-600" />
          <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
            Tests
          </h1>
        </div>
        <p className="text-gray-600">Test entity creation functionality</p>
      </div>

      <div className="space-y-6">
        {/* Test Recipe Creation */}
        <Card className="border-amber-100">
          <CardHeader>
            <CardTitle>Test Recipe Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testCreateRecipe}
              disabled={loading.recipe}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              {loading.recipe ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Create Test Recipe
            </Button>
            <ResultDisplay result={recipeResult} />
          </CardContent>
        </Card>

        {/* Test Story Creation */}
        <Card className="border-amber-100">
          <CardHeader>
            <CardTitle>Test Recipe Story Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testCreateStory}
              disabled={loading.story}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              {loading.story ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Create Test Story
            </Button>
            <ResultDisplay result={storyResult} />
          </CardContent>
        </Card>

        {/* Test Meal Creation */}
        <Card className="border-amber-100">
          <CardHeader>
            <CardTitle>Test Meal Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testCreateMeal}
              disabled={loading.meal}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              {loading.meal ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Create Test Meal
            </Button>
            <ResultDisplay result={mealResult} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}