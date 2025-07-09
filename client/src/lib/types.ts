import type { ExtractedCompanyData, ComparableCompany, ValuationResults, AzureSearchInsights } from "@shared/schema";

export interface AnalysisResult {
  analysisId: number;
  extractedData: ExtractedCompanyData;
  comparableCompanies: ComparableCompany[];
  valuationResults: ValuationResults;
  aiAnalysis: string;
  azureInsights?: AzureSearchInsights;
}

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  dependencies?: {
    openai: boolean;
    yahooFinance: boolean;
    storage: boolean;
    azureSearch?: boolean;
  };
  error?: string;
}
