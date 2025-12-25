import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function InstructionsView({ instructions }) {
  // Split instructions by newlines and filter empty lines
  const steps = instructions
    .split('\n')
    .filter(line => line.trim())
    .map((line, index) => {
      // Remove step numbering if present (e.g., "1.", "Step 1:", etc.)
      const cleaned = line.replace(/^\s*(\d+\.?|Step\s+\d+:?)\s*/i, '');
      return cleaned;
    });

  return (
    <Card className="border-amber-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-serif">
          <BookOpen className="w-6 h-6 text-amber-600" />
          Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <p className="flex-1 text-gray-700 leading-relaxed pt-1">
                {step}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}