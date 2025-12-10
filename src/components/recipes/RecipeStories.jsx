import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Plus, Loader2, Upload, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function RecipeStories({ recipeId, stories }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    text: "",
    authorName: "",
    mediaUrl: ""
  });
  const [uploading, setUploading] = useState(false);

  const createStoryMutation = useMutation({
    mutationFn: (data) => base44.entities.RecipeStory.create({
      recipeId,
      ...data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', recipeId] });
      setFormData({ text: "", authorName: "", mediaUrl: "" });
      setShowForm(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createStoryMutation.mutate(formData);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, mediaUrl: file_url }));
    setUploading(false);
  };

  return (
    <Card className="border-rose-100">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-2xl font-serif">
            <Heart className="w-6 h-6 text-rose-600" />
            Stories Behind This Recipe
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => setShowForm(!showForm)}
            className="border-rose-200 hover:bg-rose-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Story
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Story Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="p-4 rounded-lg bg-rose-50 border border-rose-100 space-y-4"
            >
              <div>
                <Label htmlFor="authorName">Your Name</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="Who's telling this story?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="storyText">Your Story *</Label>
                <Textarea
                  id="storyText"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Share a memory or story about this recipe..."
                  rows={4}
                  required
                  className="mt-1"
                />
              </div>

              {/* Image Upload */}
              <div>
                {formData.mediaUrl ? (
                  <div className="relative">
                    <img
                      src={formData.mediaUrl}
                      alt="Story"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mediaUrl: "" })}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="storyImage"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('storyImage').click()}
                      disabled={uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Add Photo (Optional)
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ text: "", authorName: "", mediaUrl: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createStoryMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
                >
                  {createStoryMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4 mr-2" />
                  )}
                  Share Story
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Stories List */}
        {stories.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No stories yet. Be the first to share a memory!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                    {story.authorName?.charAt(0) || story.created_by?.charAt(0) || "A"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {story.authorName || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(story.created_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {story.text}
                </p>
                {story.mediaUrl && (
                  <img
                    src={story.mediaUrl}
                    alt="Story"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}