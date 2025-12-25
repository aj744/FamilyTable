import React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

const COMMON_CATEGORIES = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "dairy-free",
  "dessert",
  "main-course",
  "appetizer",
  "soup",
  "salad",
  "breakfast",
  "lunch",
  "dinner",
  "quick-meal",
  "comfort-food",
  "healthy"
];

export default function CategorySelector({ selected, onChange }) {
  const [customTag, setCustomTag] = React.useState("");

  const toggleCategory = (category) => {
    if (selected.includes(category)) {
      onChange(selected.filter(c => c !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selected.includes(customTag.trim())) {
      onChange([...selected, customTag.trim().toLowerCase()]);
      setCustomTag("");
    }
  };

  const removeTag = (tag) => {
    onChange(selected.filter(c => c !== tag));
  };

  return (
    <div className="space-y-4">
      {/* Selected Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <Badge
              key={tag}
              className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1 hover:bg-amber-200 cursor-pointer"
              onClick={() => removeTag(tag)}
            >
              {tag}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {/* Common Categories */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Common Categories:</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className={`cursor-pointer transition-all ${
                selected.includes(category)
                  ? "bg-amber-500 text-white border-amber-500"
                  : "border-amber-200 hover:border-amber-400"
              }`}
              onClick={() => toggleCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Custom Tag Input */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Add Custom Tag:</p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom tag..."
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCustomTag}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}