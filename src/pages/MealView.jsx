import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X, Loader2, Search } from "lucide-react";
import RecipeCard from "../components/recipes/RecipeCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MealView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const mealId = urlParams.get("id");
  const [user, setUser] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin(createPageUrl("Meals"));
        return;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    checkAuth();
  }, []);

  const { data: meal, isLoading } = useQuery({
    queryKey: ['meal', mealId],
    queryFn: async () => {
      const meals = await base44.entities.Meal.filter({ id: mealId });
      return meals[0] || null;
    },
    enabled: !!mealId
  });

  const { data: allRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      return await base44.entities.Recipe.list("-created_date");
    },
    initialData: []
  });

  const updateMealMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Meal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal', mealId] });
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    }
  });

  const handleAddRecipe = (recipeId) => {
    const updatedRecipeIds = [...(meal.recipeIds || []), recipeId];
    updateMealMutation.mutate({
      id: mealId,
      data: { ...meal, recipeIds: updatedRecipeIds }
    });
  };

  const handleRemoveRecipe = (recipeId) => {
    const updatedRecipeIds = (meal.recipeIds || []).filter(id => id !== recipeId);
    updateMealMutation.mutate({
      id: mealId,
      data: { ...meal, recipeIds: updatedRecipeIds }
    });
  };

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
          Meal not found
        </h2>
        <Button onClick={() => navigate(createPageUrl("Meals"))}>
          Back to Meals
        </Button>
      </div>
    );
  }

  const mealRecipes = allRecipes.filter(r => meal.recipeIds?.includes(r.id));
  const availableRecipes = allRecipes.filter(r => !meal.recipeIds?.includes(r.id));
  const filteredAvailable = availableRecipes.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Meals"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Meals
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">
            {meal.name}
          </h1>
          {meal.description && (
            <p className="text-gray-600 text-lg">{meal.description}</p>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Recipes ({mealRecipes.length})
          </h2>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Recipe
          </Button>
        </div>

        {mealRecipes.length === 0 ? (
          <Card className="border-dashed border-2 border-amber-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">No recipes in this meal yet</p>
              <Button
                onClick={() => setIsAddOpen(true)}
                variant="outline"
                className="border-amber-300 hover:bg-amber-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Recipe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealRecipes.map((recipe) => (
              <div key={recipe.id} className="relative">
                <RecipeCard recipe={recipe} onDelete={() => {}} currentUser={user} />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 left-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white shadow-lg z-10"
                  onClick={() => handleRemoveRecipe(recipe.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Add Recipe to {meal.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="mb-4">
                <Input
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="overflow-y-auto max-h-96 pr-2">
                {filteredAvailable.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    {availableRecipes.length === 0 ? "All recipes added!" : "No recipes found"}
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredAvailable.map((recipe) => (
                      <Card
                        key={recipe.id}
                        className="cursor-pointer hover:shadow-lg transition-all border-amber-100"
                        onClick={() => {
                          handleAddRecipe(recipe.id);
                          setIsAddOpen(false);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {recipe.mediaUrls?.[0] && (
                              <img
                                src={recipe.mediaUrls[0]}
                                alt={recipe.title}
                                className="w-16 h-16 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 line-clamp-2">
                                {recipe.title}
                              </h4>
                              {recipe.shortDescription && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {recipe.shortDescription}
                                </p>
                              )}
                            </div>
                            <Plus className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}