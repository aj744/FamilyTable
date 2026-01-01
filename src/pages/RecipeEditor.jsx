import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Upload, X, Plus } from "lucide-react";
import IngredientInput from "../components/recipes/IngredientInput";
import CategorySelector from "../components/recipes/CategorySelector";

export default function RecipeEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get("id");
  const isEditing = !!recipeId;

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullInstructions: "",
    ingredients: [],
    categories: [],
    difficultyLevel: 3,
    estimatedTime: 30,
    servings: 4,
    mediaUrls: []
  });
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);

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

  const { data: recipe } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      if (!recipeId) return null;
      const recipes = await base44.entities.Recipe.filter({ id: recipeId });
      return recipes[0] || null;
    },
    enabled: !!recipeId
  });

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || "",
        shortDescription: recipe.shortDescription || "",
        fullInstructions: recipe.fullInstructions || "",
        ingredients: recipe.ingredients || [],
        categories: recipe.categories || [],
        difficultyLevel: recipe.difficultyLevel || 3,
        estimatedTime: recipe.estimatedTime || 30,
        servings: recipe.servings || 4,
        mediaUrls: recipe.mediaUrls || []
      });
    }
  }, [recipe]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return await base44.entities.Recipe.update(recipeId, data);
      } else {
        return await base44.entities.Recipe.create(data);
      }
    },
    onSuccess: (savedRecipe) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      navigate(createPageUrl("RecipeView") + "?id=" + savedRecipe.id);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
    }

    setFormData(prev => ({
      ...prev,
      mediaUrls: [...prev.mediaUrls, ...uploadedUrls]
    }));
    setUploading(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index)
    }));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-8">
          {isEditing ? "Edit Recipe" : "Create New Recipe"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Recipe Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Grandma's Apple Pie"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="A brief description of the recipe..."
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedTime">Time (minutes)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min="1"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="difficultyLevel">Difficulty (1-5)</Label>
                  <Input
                    id="difficultyLevel"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <IngredientInput
                ingredients={formData.ingredients}
                onChange={(ingredients) => setFormData({ ...formData, ingredients })}
              />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Instructions *</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.fullInstructions}
                onChange={(e) => setFormData({ ...formData, fullInstructions: e.target.value })}
                placeholder="Step 1: Preheat the oven...&#10;Step 2: Mix ingredients...&#10;Step 3: Bake for 30 minutes..."
                rows={10}
                required
                className="font-mono"
              />
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Categories & Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <CategorySelector
                selected={formData.categories}
                onChange={(categories) => setFormData({ ...formData, categories })}
              />
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.mediaUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Recipe ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-amber-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('imageUpload').click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-amber-300 hover:border-amber-500"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload Images
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? "Update Recipe" : "Create Recipe"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}