import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, Loader2, Filter, X } from "lucide-react";
import RecipeCard from "../components/recipes/RecipeCard";

export default function Search() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("title"); // title, ingredient, or category
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
    };
    checkAuth();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: allRecipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      return await base44.entities.Recipe.list("-created_date");
    },
    initialData: []
  });

  // Filter recipes based on search
  const filteredRecipes = allRecipes.filter(recipe => {
    if (!debouncedQuery.trim()) return true;

    const query = debouncedQuery.toLowerCase();

    if (searchBy === "title") {
      return recipe.title?.toLowerCase().includes(query);
    } else if (searchBy === "ingredient") {
      return recipe.ingredients?.some(ing => 
        ing.name?.toLowerCase().includes(query)
      );
    } else if (searchBy === "category") {
      return recipe.categories?.some(cat => 
        cat.toLowerCase().includes(query)
      );
    }

    return false;
  });

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const searchByOptions = [
    { value: "title", label: "Recipe Name" },
    { value: "ingredient", label: "Ingredient" },
    { value: "category", label: "Category" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
            <SearchIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-3">
            Search Recipes
          </h1>
          <p className="text-gray-600 text-lg">
            Explore {allRecipes.length} community recipes by name, ingredient, or category
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8 border-amber-100 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search by ${searchByOptions.find(o => o.value === searchBy)?.label.toLowerCase()}...`}
                  className="pl-12 pr-12 h-14 text-lg border-2 border-amber-100 focus:border-amber-300"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search Type Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Search by:</span>
                {searchByOptions.map(option => (
                  <Badge
                    key={option.value}
                    onClick={() => setSearchBy(option.value)}
                    className={`cursor-pointer transition-all ${
                      searchBy === option.value
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : (
          <div>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredRecipes.length === allRecipes.length ? (
                  <>Showing all {allRecipes.length} recipes</>
                ) : (
                  <>
                    Found <span className="font-semibold text-amber-700">{filteredRecipes.length}</span> of {allRecipes.length} recipes
                  </>
                )}
              </p>
            </div>

            {/* Results Grid */}
            {filteredRecipes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <SearchIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                  No recipes found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `No recipes match "${searchQuery}"`
                    : "Start searching to find recipes"}
                </p>
                {searchQuery && (
                  <Button
                    onClick={handleClearSearch}
                    variant="outline"
                    className="border-amber-300"
                  >
                    Clear Search
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
                      onDelete={() => {}}
                      currentUser={user}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}

        {/* Search Tips */}
        {!searchQuery && (
          <Card className="mt-12 border-blue-100 bg-blue-50/50">
            <CardContent className="p-6">
              <h3 className="font-serif font-bold text-lg mb-3 text-blue-900">
                Search Tips
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Use <strong>Recipe Name</strong> to find recipes by their title</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Use <strong>Ingredient</strong> to find recipes containing specific ingredients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Use <strong>Category</strong> to filter by tags like "vegan", "dessert", etc.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}