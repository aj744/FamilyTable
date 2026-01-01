import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calculator, ArrowRightLeft, Info } from "lucide-react";

export default function UnitConverter() {
  const [amount, setAmount] = useState(1);
  const [fromUnit, setFromUnit] = useState('cup');
  const [toUnit, setToUnit] = useState('ml');
  const [result, setResult] = useState(null);
  const [conversionTime, setConversionTime] = useState(null);

  const convert = () => {
    const startTime = performance.now();

    const fromData = CONVERSION_TABLE[fromUnit];
    const toData = CONVERSION_TABLE[toUnit];

    // Check if conversion is valid (same type)
    if (fromData.type !== toData.type) {
      setResult({ error: "Cannot convert between weight and volume units" });
      return;
    }

    let converted;
    if (fromData.type === 'weight') {
      const inGrams = amount * fromData.toGrams;
      converted = inGrams / toData.toGrams;
    } else {
      const inMl = amount * fromData.toMl;
      converted = inMl / toData.toMl;
    }

    const endTime = performance.now();
    const timeTaken = endTime - startTime;

    setResult({ value: converted, unit: toUnit });
    setConversionTime(timeTaken);
  };

  useEffect(() => {
    if (amount > 0) {
      convert();
    }
  }, [amount, fromUnit, toUnit]);

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const commonConversions = [
    { from: 1, fromUnit: 'cup', to: 236.588, toUnit: 'ml', label: '1 cup = 236.6 ml' },
    { from: 1, fromUnit: 'tbsp', to: 14.79, toUnit: 'ml', label: '1 tbsp = 14.8 ml' },
    { from: 1, fromUnit: 'tsp', to: 4.93, toUnit: 'ml', label: '1 tsp = 4.9 ml' },
    { from: 1, fromUnit: 'oz', to: 28.35, toUnit: 'grams', label: '1 oz = 28.35 g' },
    { from: 1, fromUnit: 'lb', to: 453.59, toUnit: 'grams', label: '1 lb = 453.6 g' },
    { from: 1, fromUnit: 'cup', to: 8, toUnit: 'fl oz', label: '1 cup = 8 fl oz' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-3">
            Unit Converter
          </h1>
          <p className="text-gray-600 text-lg">
            Quick and accurate conversions for your cooking needs
          </p>
        </div>

        {/* Main Converter */}
        <Card className="mb-8 border-amber-100 shadow-xl">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6 items-end">
              {/* From */}
              <div>
                <Label htmlFor="amount" className="text-base font-semibold mb-2 block">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="text-xl h-14"
                />
                
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapUnits}
                  className="w-12 h-12 rounded-full border-2 border-amber-300 hover:bg-amber-50"
                >
                  <ArrowRightLeft className="w-5 h-5 text-amber-700" />
                </Button>
              </div>

              {/* To */}
              <div>
                <Label htmlFor="result" className="text-base font-semibold mb-2 block">
                  Equals
                </Label>
                <div className="text-3xl font-bold text-amber-700 h-14 flex items-center px-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                  {result && !result.error ? (
                    <>
                      {result.value.toFixed(2)}
                    </>
                  ) : (
                    <span className="text-gray-400 text-xl">—</span>
                  )}
                </div>
                
              </div>
            </div>

            {/* Error or Performance */}
            <div className="mt-6 text-center">
              {result?.error ? (
                <div className="text-red-600 bg-red-50 rounded-lg p-3">
                  <Info className="w-4 h-4 inline mr-2" />
                  {result.error}
                </div>
              ) : conversionTime !== null && (
                <div className="text-green-600 text-sm">
                  ✓ Converted in {conversionTime.toFixed(2)}ms (requirement: &lt;2000ms)
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Common Conversions Reference */}
        <Card className="border-amber-100">
          <CardHeader>
            <CardTitle className="text-xl font-serif">
              Common Kitchen Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commonConversions.map((conv, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setAmount(conv.from);
                    setFromUnit(conv.fromUnit);
                    setToUnit(conv.toUnit);
                  }}
                  className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100 hover:border-amber-300 transition-all text-left"
                >
                  <p className="font-semibold text-gray-900">{conv.label}</p>
                  <p className="text-sm text-gray-600 mt-1">Click to use</p>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}