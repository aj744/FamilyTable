import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Utensils, Trash2, Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Meals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: "", description: "" });

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

  const { data: meals, isLoading } = useQuery({
    queryKey: ['meals'],
    queryFn: async () => {
      return await base44.entities.Meal.list("-created_date");
    },
    initialData: []
  });

  const { data: allRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      return await base44.entities.Recipe.list("-created_date");
    },
    initialData: []
  });

  const createMealMutation = useMutation({
    mutationFn: (data) => base44.entities.Meal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      setIsCreateOpen(false);
      setNewMeal({ name: "", description: "" });
    }
  });

  const deleteMealMutation = useMutation({
    mutationFn: (id) => base44.entities.Meal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    }
  });

  const handleCreateMeal = () => {
    if (newMeal.name.trim()) {
      createMealMutation.mutate(newMeal);
    }
  };

  const handleDeleteMeal = (id) => {
    if (window.confirm("Delete this meal?")) {
      deleteMealMutation.mutate(id);
    }
  };

  const getRecipesForMeal = (meal) => {
    return allRecipes.filter(r => meal.recipeIds?.includes(r.id));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const myMeals = meals.filter(m => m.created_by === user.email);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
              My Meals
            </h1>
            <p className="text-gray-600 mt-2">Group your recipes together</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                <Plus className="w-5 h-5 mr-2" />
                New Meal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Meal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Meal Name</label>
                  <Input
                    placeholder="e.g., Friday Dinner, Healthy Lunch"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
                  <Textarea
                    placeholder="What's this meal about?"
                    value={newMeal.description}
                    onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateMeal}
                  disabled={!newMeal.name.trim() || createMealMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  {createMealMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Meal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : myMeals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Utensils className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
              No meals yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first meal collection
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Meal
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {myMeals.map((meal) => {
                const recipes = getRecipesForMeal(meal);
                return (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 border-amber-100">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                              <Utensils className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg line-clamp-2">{meal.name}</CardTitle>
                              {meal.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {meal.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
                          </Badge>
                        </div>
                        {recipes.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {recipes.slice(0, 3).map((recipe) => (
                              <div
                                key={recipe.id}
                                className="text-sm text-gray-700 flex items-center gap-2"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {recipe.title}
                              </div>
                            ))}
                            {recipes.length > 3 && (
                              <div className="text-sm text-gray-500">
                                +{recipes.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(createPageUrl("MealView") + "?id=" + meal.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View & Edit
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}