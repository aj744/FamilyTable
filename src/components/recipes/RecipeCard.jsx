import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Star, 
  Edit, 
  Trash2,
  ChefHat,
  User
} from "lucide-react";

export default function RecipeCard({ recipe, onDelete, currentUser }) {
  const navigate = useNavigate();
  const isOwner = currentUser && recipe.created_by === currentUser.email;

  const difficultyStars = Array.from({ length: 5 }, (_, i) => i < (recipe.difficultyLevel || 0));

  // Extract first name or email prefix for display
  const getAuthorDisplay = () => {
    if (!recipe.created_by) return "Anonymous";
    return recipe.created_by.split('@')[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border border-amber-100 bg-white/80 backdrop-blur-sm h-full flex flex-col">
        {/* Image */}
        <div 
          className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100 cursor-pointer"
          onClick={() => navigate(createPageUrl("RecipeView") + "?id=" + recipe.id)}
        >
          {recipe.mediaUrls && recipe.mediaUrls.length > 0 ? (
            <img
              src={recipe.mediaUrls[0]}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-16 h-16 text-amber-300" />
            </div>
          )}

          {/* Author Badge */}
          <div className="absolute top-2 left-2">
            <Badge 
              className={`${
                isOwner 
                  ? "bg-green-500 text-white border-green-400" 
                  : "bg-white/90 text-gray-700 border-gray-200"
              } border backdrop-blur-sm`}
            >
              <User className="w-3 h-3 mr-1" />
              {isOwner ? "You" : getAuthorDisplay()}
            </Badge>
          </div>

          {/* Action Buttons - Only show for owner */}
          {isOwner && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white/90 hover:bg-white shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(createPageUrl("RecipeEditor") + "?id=" + recipe.id);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white/90 hover:bg-white shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recipe.id);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col">
          <h3 
            className="text-xl font-serif font-bold text-gray-900 mb-2 hover:text-amber-700 cursor-pointer transition-colors line-clamp-2"
            onClick={() => navigate(createPageUrl("RecipeView") + "?id=" + recipe.id)}
          >
            {recipe.title}
          </h3>
          
          {recipe.shortDescription && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
              {recipe.shortDescription}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            {recipe.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{recipe.estimatedTime} min</span>
              </div>
            )}
            {recipe.difficultyLevel && (
              <div className="flex items-center gap-1">
                {difficultyStars.map((filled, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      filled ? "fill-amber-400 text-amber-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          {recipe.categories && recipe.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.categories.slice(0, 3).map((category, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border-amber-200 text-xs"
                >
                  {category}
                </Badge>
              ))}
              {recipe.categories.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-600 text-xs"
                >
                  +{recipe.categories.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}