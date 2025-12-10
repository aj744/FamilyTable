import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function RecipeFilters({ filters, onFilterChange, user }) {
  const categories = [
    "all",
    "vegan",
    "vegetarian",
    "gluten-free",
    "dairy-free",
    "dessert",
    "main-course",
    "appetizer",
    "soup",
    "salad",
    "breakfast"
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-amber-100">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters:</span>
          </div>

          {user && (
            <Select
              value={filters.showMine || "all"}
              onValueChange={(value) => onFilterChange({ ...filters, showMine: value })}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Show" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recipes</SelectItem>
                <SelectItem value="mine">My Recipes</SelectItem>
                <SelectItem value="others">Community</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select
            value={filters.category}
            onValueChange={(value) => onFilterChange({ ...filters, category: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.difficulty}
            onValueChange={(value) => onFilterChange({ ...filters, difficulty: value })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="1">Easy (1⭐)</SelectItem>
              <SelectItem value="2">Simple (2⭐)</SelectItem>
              <SelectItem value="3">Medium (3⭐)</SelectItem>
              <SelectItem value="4">Hard (4⭐)</SelectItem>
              <SelectItem value="5">Expert (5⭐)</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy}
            onValueChange={(value) => onFilterChange({ ...filters, sortBy: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="time">Cook Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}