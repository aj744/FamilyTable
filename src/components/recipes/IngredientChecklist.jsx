import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingBasket } from "lucide-react";

export default function IngredientChecklist({ ingredients }) {
  const [checked, setChecked] = useState({});

  const toggleCheck = (index) => {
    setChecked(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Card className="border-amber-100 sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-serif">
          <ShoppingBasket className="w-5 h-5 text-amber-600" />
          Ingredients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ingredients.length === 0 ? (
          <p className="text-gray-500 text-sm">No ingredients listed</p>
        ) : (
          ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
              onClick={() => toggleCheck(index)}
            >
              <Checkbox
                checked={checked[index] || false}
                onCheckedChange={() => toggleCheck(index)}
                className="mt-1"
              />
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    checked[index] ? "line-through text-gray-400" : "text-gray-900"
                  }`}
                >
                  {ingredient.name}
                </p>
                <p className="text-sm text-gray-500">
                  {ingredient.quantity} {ingredient.unit}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}