import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

const loadingSteps = [
  { message: "Extracting company metadata using AI...", progress: 25 },
  { message: "Searching comparable companies database...", progress: 45 },
  { message: "Fetching real-time financial data...", progress: 65 },
  { message: "Running valuation models...", progress: 85 },
  { message: "Generating AI-powered analysis...", progress: 100 }
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const currentStepData = loadingSteps[currentStep];

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Analyzing Company...</h3>
            <p className="text-sm text-secondary">{currentStepData.message}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${currentStepData.progress}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-secondary">
            <span>Processing...</span>
            <span>{currentStepData.progress}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
