import { useState } from "react";
import AnalysisForm from "@/components/analysis-form";
import LoadingState from "@/components/loading-state";
import AnalysisResults from "@/components/analysis-results";
import type { AnalysisResult } from "@/lib/types";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsLoading(false);
  };

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setAnalysisResult(null);
  };

  const handleClear = () => {
    setAnalysisResult(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 w-full space-x-4 min-w-0">
            {/* Left: Logo and subtitle */}
            <div className="flex flex-col flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">CompAnalyzer</h1>
              <p className="text-xs text-secondary leading-tight">Private Company Valuation Platform</p>
            </div>
            {/* Center: Disclaimer */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-500 whitespace-normal break-words text-left">
                This is a proof of concept (POC) designed solely to demonstrate the rapid development capabilities of Replit and Azure. It is not intended for use in actual valuation engagements. PwC assumes no liability for any decisions made based on this tool.
              </p>
            </div>
            {/* Right: Status indicators */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-secondary">System Healthy</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary">
                <i className="fas fa-cloud"></i>
                <span>Azure Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalysisForm 
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          onClear={handleClear}
        />
        
        {isLoading && <LoadingState />}
        
        {analysisResult && !isLoading && (
          <AnalysisResults result={analysisResult} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-secondary">
              <p>&copy; 2024 CompAnalyzer. Powered by OpenAI GPT-4 and Yahoo Finance APIs.</p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-secondary">
              <span className="flex items-center">
                <i className="fas fa-shield-alt mr-1"></i>
                Enterprise Grade Security
              </span>
              <span className="flex items-center">
                <i className="fas fa-clock mr-1"></i>
                Real-time Data
              </span>
              <span className="flex items-center">
                <i className="fab fa-microsoft mr-1"></i>
                Azure Hosted
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
