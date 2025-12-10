import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Loader2,
  ChefHat
} from "lucide-react";

export default function CookingMode() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get("id");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      const recipes = await base44.entities.Recipe.filter({ id: recipeId });
      return recipes[0] || null;
    },
    enabled: !!recipeId
  });

  // Prevent screen sleep
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Parse instructions into steps
  const steps = recipe.fullInstructions
    .split('\n')
    .filter(line => line.trim())
    .map((line) => line.replace(/^\s*(\d+\.?|Step\s+\d+:?)\s*/i, ''));

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleStepComplete = () => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentStep)) {
        newSet.delete(currentStep);
      } else {
        newSet.add(currentStep);
      }
      return newSet;
    });
  };

  const handleExit = () => {
    navigate(createPageUrl("RecipeView") + "?id=" + recipeId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'Escape') {
      handleExit();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/40 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ChefHat className="w-6 h-6 text-amber-400" />
              <div>
                <h1 className="text-white font-serif font-bold text-lg">
                  {recipe.title}
                </h1>
                <p className="text-gray-400 text-sm">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExit}
              className="text-white hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="h-full flex items-center justify-center px-4 py-24">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Step Number Badge */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-3xl mb-8 shadow-2xl">
                {currentStep + 1}
              </div>

              {/* Step Content */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
                <p className="text-white text-2xl md:text-4xl leading-relaxed font-medium">
                  {steps[currentStep]}
                </p>

                {/* Complete Checkbox */}
                <div className="mt-8">
                  <Button
                    onClick={toggleStepComplete}
                    variant="outline"
                    className={`border-2 ${
                      completedSteps.has(currentStep)
                        ? "bg-green-500 border-green-400 text-white hover:bg-green-600"
                        : "border-white/30 text-white hover:bg-white/10"
                    }`}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    {completedSteps.has(currentStep) ? "Completed" : "Mark as Complete"}
                  </Button>
                </div>
              </div>

              {/* Ingredients Reference (if first step) */}
              {currentStep === 0 && recipe.ingredients && recipe.ingredients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 bg-amber-900/30 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/30"
                >
                  <h3 className="text-amber-300 font-semibold mb-3 text-lg">
                    You'll need:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {recipe.ingredients.slice(0, 6).map((ing, idx) => (
                      <div key={idx} className="text-white/80">
                        • {ing.name}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-8 left-0 right-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleExit}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl"
              >
                <Check className="w-6 h-6 mr-2" />
                Finish Cooking
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-2xl"
              >
                Next
                <ChevronRight className="w-6 h-6 ml-2" />
              </Button>
            )}
          </div>

          {/* Keyboard Hints */}
          <p className="text-center text-gray-400 text-sm mt-4">
            Use arrow keys or space to navigate • ESC to exit
          </p>
        </div>
      </div>
    </div>
  );
}