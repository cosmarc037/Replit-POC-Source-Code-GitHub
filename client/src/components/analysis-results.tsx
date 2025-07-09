import CompanyProfile from "./company-profile";
import ComparableCompanies from "./comparable-companies";
import ValuationAnalysis from "./valuation-analysis";
import AIAnalysis from "./ai-analysis";
import AzureInsights from "./azure-insights";
import type { AnalysisResult } from "@/lib/types";

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  return (
    <div className="space-y-8">
      <CompanyProfile extractedData={result.extractedData} />
      
      <ComparableCompanies 
        companies={result.comparableCompanies}
        analysisId={result.analysisId}
      />
      
      <ValuationAnalysis 
        extractedData={result.extractedData}
        valuationResults={result.valuationResults}
      />

      {result.azureInsights && (
        <AzureInsights insights={result.azureInsights} />
      )}
      
      <AIAnalysis analysis={result.aiAnalysis} />
    </div>
  );
}
