import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  Users, 
  Edit,
  Trash2,
  Play,
  Loader2,
  Heart,
  MessageCircle
} from "lucide-react";
import IngredientChecklist from "../components/recipes/IngredientChecklist";
import RecipeStories from "../components/recipes/RecipeStories";
import InstructionsView from "../components/recipes/InstructionsView";

export default function RecipeView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get("id");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
    };
    loadUser();
  }, []);

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      const recipes = await base44.entities.Recipe.filter({ id: recipeId });
      return recipes[0] || null;
    },
    enabled: !!recipeId
  });

  const { data: stories } = useQuery({
    queryKey: ['stories', recipeId],
    queryFn: async () => {
      return await base44.entities.RecipeStory.filter({ recipeId }, "-created_date");
    },
    enabled: !!recipeId,
    initialData: []
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: () => base44.entities.Recipe.delete(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      navigate(createPageUrl("Dashboard"));
    }
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      deleteRecipeMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
          Recipe not found
        </h2>
        <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isOwner = user && recipe.created_by === user.email;
  const difficultyStars = Array.from({ length: 5 }, (_, i) => i < (recipe.difficultyLevel || 0));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">
                {recipe.title}
              </h1>
              {recipe.shortDescription && (
                <p className="text-lg text-gray-600">{recipe.shortDescription}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => navigate(createPageUrl("CookingMode") + "?id=" + recipeId)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Cooking Mode
              </Button>
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate(createPageUrl("RecipeEditor") + "?id=" + recipeId)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Image Gallery */}
        {recipe.mediaUrls && recipe.mediaUrls.length > 0 && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={recipe.mediaUrls[0]}
              alt={recipe.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Stats Bar */}
        <Card className="mb-8 border-amber-100">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recipe.estimatedTime && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold text-gray-900">{recipe.estimatedTime} min</p>
                  </div>
                </div>
              )}

              {recipe.servings && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Servings</p>
                    <p className="font-semibold text-gray-900">{recipe.servings}</p>
                  </div>
                </div>
              )}

              {recipe.difficultyLevel && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Difficulty</p>
                    <div className="flex gap-1">
                      {difficultyStars.map((filled, index) => (
                        <Star
                          key={index}
                          className={`w-4 h-4 ${
                            filled ? "fill-amber-400 text-amber-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {stories && stories.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-rose-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stories</p>
                    <p className="font-semibold text-gray-900">{stories.length}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        {recipe.categories && recipe.categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {recipe.categories.map((category, index) => (
              <Badge
                key={index}
                className="bg-amber-100 text-amber-800 border-amber-200 px-4 py-1 text-sm"
              >
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Ingredients */}
          <div className="lg:col-span-1">
            <IngredientChecklist ingredients={recipe.ingredients || []} />
          </div>

          {/* Right Column - Instructions & Stories */}
          <div className="lg:col-span-2 space-y-8">
            <InstructionsView instructions={recipe.fullInstructions} />
            <RecipeStories recipeId={recipeId} stories={stories} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}