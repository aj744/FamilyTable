import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, Loader2, Users } from "lucide-react";
import RecipeCard from "../components/recipes/RecipeCard";
import RecipeFilters from "../components/recipes/RecipeFilters";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    category: "all",
    difficulty: "all",
    sortBy: "recent",
    showMine: "all" // all, mine, others
  });

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin(createPageUrl("Dashboard"));
        return;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    checkAuth();
  }, []);

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      return await base44.entities.Recipe.list("-created_date");
    },
    initialData: []
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });

  const handleDeleteRecipe = async (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      deleteRecipeMutation.mutate(id);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    // Filter by ownership
    if (filters.showMine === "mine" && recipe.created_by !== user?.email) {
      return false;
    }
    if (filters.showMine === "others" && recipe.created_by === user?.email) {
      return false;
    }

    // Filter by category
    if (filters.category !== "all" && !recipe.categories?.includes(filters.category)) {
      return false;
    }

    // Filter by difficulty
    if (filters.difficulty !== "all" && recipe.difficultyLevel !== parseInt(filters.difficulty)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === "recent") {
      return new Date(b.created_date) - new Date(a.created_date);
    } else if (filters.sortBy === "difficulty") {
      return (a.difficultyLevel || 0) - (b.difficultyLevel || 0);
    } else if (filters.sortBy === "time") {
      return (a.estimatedTime || 0) - (b.estimatedTime || 0);
    }
    return 0;
  });

  const myRecipesCount = recipes.filter(r => r.created_by === user?.email).length;
  const communityRecipesCount = recipes.filter(r => r.created_by !== user?.email).length;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
              Community Recipes
            </h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{recipes.length} total recipes</span>
              </div>
              <span className="text-gray-400">•</span>
              <span>{myRecipesCount} by you</span>
              <span className="text-gray-400">•</span>
              <span>{communityRecipesCount} from community</span>
            </div>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("RecipeEditor"))}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Recipe
          </Button>
        </div>

        <RecipeFilters filters={filters} onFilterChange={setFilters} user={user} />
      </motion.div>

      {/* Recipes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : filteredRecipes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
            <Plus className="w-12 h-12 text-amber-600" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            {recipes.length === 0 ? "No recipes yet" : "No recipes match your filters"}
          </h3>
          <p className="text-gray-600 mb-6">
            {recipes.length === 0 
              ? "Be the first to share a recipe with the community!"
              : "Try adjusting your filters"}
          </p>
          {recipes.length === 0 && (
            <Button
              onClick={() => navigate(createPageUrl("RecipeEditor"))}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Recipe
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={handleDeleteRecipe}
                currentUser={user}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}