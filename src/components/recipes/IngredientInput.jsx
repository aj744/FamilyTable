import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

export default function IngredientInput({ ingredients, onChange }) {
  const addIngredient = () => {
    onChange([...ingredients, { name: "", quantity: 1, unit: "cup" }]);
  };

  const removeIngredient = (index) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {ingredients.map((ingredient, index) => (
        <div key={index} className="flex gap-2 items-start">
          <Input
            placeholder="Ingredient name"
            value={ingredient.name}
            onChange={(e) => updateIngredient(index, "name", e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Qty"
            value={ingredient.quantity}
            onChange={(e) => updateIngredient(index, "quantity", parseFloat(e.target.value))}
            className="w-20"
          />
          <Input
            placeholder="Unit"
            value={ingredient.unit}
            onChange={(e) => updateIngredient(index, "unit", e.target.value)}
            className="w-24"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeIngredient(index)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addIngredient}
        className="w-full border-dashed border-amber-300"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Ingredient
      </Button>
    </div>
  );
}