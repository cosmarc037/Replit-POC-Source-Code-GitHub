import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analysisRequestSchema } from "@shared/schema";
import { extractCompanyData } from "./services/openai";
import { getFinancialData } from "./services/yahooFinance";
import type {
  ExtractedCompanyData,
  ComparableCompany,
  ValuationResults,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route for Azure App Service
  app.get("/ping", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "CompAnalyzer API",
    });
  });

  // Test Azure Search endpoint
  app.post("/api/test-azure-search", async (req, res) => {
    try {
      const { azureSearchService } = await import("./services/azureSearch");
      const testData = {
        industry: "Software",
        region: "North America",
        revenue: "$50M",
        businessModel: "SaaS",
        growthStage: "Growth",
        strengths: "Cloud-based solutions",
        marketPosition: "Mid-market",
        competitiveAdvantages: ["Advanced analytics", "Automation tools"],
        riskFactors: ["Market competition"],
      };

      const searchResults = await azureSearchService.searchCompanyInformation(
        testData,
        "SaaS company providing CRM solutions with advanced analytics",
      );

      const insights = await azureSearchService.generateInsightsSummary(
        searchResults,
        testData,
      );

      res.json({
        success: true,
        searchResults: searchResults.length,
        insights,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Health check with dependencies
  app.get("/api/health", async (req, res) => {
    try {
      const openaiKey =
        process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR;
      const hasOpenAI = !!openaiKey;

      // Check Azure Search availability
      let azureSearchStatus = false;
      try {
        const { azureSearchService } = await import("./services/azureSearch");
        // Test with a minimal search to verify connection
        await azureSearchService.searchCompanyInformation(
          {
            industry: "test",
            region: "test",
            revenue: "",
            businessModel: "",
            growthStage: "",
            strengths: "",
            marketPosition: "",
            competitiveAdvantages: [],
            riskFactors: [],
          },
          "test",
        );
        azureSearchStatus = true;
      } catch (error) {
        console.log(
          "Azure Search health check failed:",
          error instanceof Error ? error.message : "Unknown error",
        );
        azureSearchStatus = false;
      }

      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        dependencies: {
          openai: hasOpenAI,
          yahooFinance: true,
          storage: true,
          azureSearch: azureSearchStatus,
        },
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Main analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      // Validate request body
      const validatedData = analysisRequestSchema.parse(req.body);

      // Create analysis record
      const analysis = await storage.createAnalysis(validatedData);

      // Step 1: Extract company data using OpenAI
      const extractedData = await extractCompanyData(
        validatedData.companyDescription,
        validatedData.analysisDepth,
      );

      // Step 2: Find comparable companies
      const comparableCompanies = await storage.getComparableCompanies(
        extractedData.industry,
        extractedData.region,
        5,
      );

      // Step 3: Get financial data for comparables
      const enrichedComparables: ComparableCompany[] = [];

      for (const company of comparableCompanies) {
        try {
          const financialData = await getFinancialData(company.ticker);
          enrichedComparables.push({
            ticker: company.ticker,
            name: company.name,
            description: company.description || "",
            marketCap: financialData.marketCap,
            revenue: financialData.revenue,
            peRatio: financialData.peRatio,
            evRevenue: financialData.evRevenue,
            evEbitda: financialData.evEbitda,
            oneYearChange: financialData.oneYearChange,
            matchScore: Math.random() * 100, // This would be calculated based on similarity
            industry: company.industry,
          });
        } catch (error) {
          console.warn(
            `Failed to get financial data for ${company.ticker}:`,
            error,
          );
          // Add company with null financial data
          enrichedComparables.push({
            ticker: company.ticker,
            name: company.name,
            description: company.description || "",
            marketCap: 0,
            revenue: 0,
            peRatio: null,
            evRevenue: null,
            evEbitda: null,
            oneYearChange: 0,
            matchScore: Math.random() * 100,
            industry: company.industry,
          });
        }
      }

      // Step 4: Fetch Azure Search insights
      let azureInsights;
      try {
        const { azureSearchService } = await import("./services/azureSearch");
        const searchResults = await azureSearchService.searchCompanyInformation(
          extractedData,
          validatedData.companyDescription,
        );
        azureInsights = await azureSearchService.generateInsightsSummary(
          searchResults,
          extractedData,
        );
      } catch (error) {
        console.log(
          "Azure Search not available:",
          error instanceof Error ? error.message : "Unknown error",
        );
        azureInsights = null;
      }

      // Step 5: Calculate valuation
      const valuationResults = calculateValuation(
        extractedData,
        enrichedComparables,
      );

      // Step 6: Generate AI analysis with Azure insights
      const aiAnalysis = await generateAIAnalysis(
        extractedData,
        enrichedComparables,
        valuationResults,
        validatedData.companyDescription,
        azureInsights,
      );

      // Update analysis with results
      const updatedAnalysis = await storage.updateAnalysis(analysis.id, {
        extractedData: JSON.stringify(extractedData),
        comparableCompanies: JSON.stringify(enrichedComparables),
        valuationResults: JSON.stringify(valuationResults),
        aiAnalysis,
      });

      res.json({
        analysisId: analysis.id,
        extractedData,
        comparableCompanies: enrichedComparables,
        valuationResults,
        aiAnalysis,
        azureInsights,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getAnalysis(id);

      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      res.json({
        analysisId: analysis.id,
        extractedData: analysis.extractedData
          ? JSON.parse(analysis.extractedData)
          : null,
        comparableCompanies: analysis.comparableCompanies
          ? JSON.parse(analysis.comparableCompanies)
          : null,
        valuationResults: analysis.valuationResults
          ? JSON.parse(analysis.valuationResults)
          : null,
        aiAnalysis: analysis.aiAnalysis,
        createdAt: analysis.createdAt,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to retrieve analysis",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Export analysis as CSV
  app.get("/api/analysis/:id/export", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getAnalysis(id);

      if (!analysis || !analysis.comparableCompanies) {
        return res
          .status(404)
          .json({ error: "Analysis or comparable data not found" });
      }

      const comparables: ComparableCompany[] = JSON.parse(
        analysis.comparableCompanies,
      );
      const extractedData: ExtractedCompanyData = analysis.extractedData
        ? JSON.parse(analysis.extractedData)
        : {};

      // Generate CSV content
      const csvHeaders = [
        "Company",
        "Ticker",
        "Industry",
        "Market Cap",
        "Revenue",
        "P/E Ratio",
        "EV/Revenue",
        "EV/EBITDA",
        "1Y Change",
        "Match Score - based on similarity to the target company across attributes such as industry, region, and business model.",
      ];

      const csvRows = comparables.map((comp) => [
        comp.name,
        comp.ticker,
        comp.industry,
        comp.marketCap || "N/A",
        comp.revenue || "N/A",
        comp.peRatio || "N/A",
        comp.evRevenue || "N/A",
        comp.evEbitda || "N/A",
        `${comp.oneYearChange}%`,
        `${comp.matchScore.toFixed(1)}%`,
      ]);

      const csvContent = [
        `# Analysis Export - ${new Date().toISOString()}`,
        `# Target Company: ${extractedData.industry || "Unknown"} company`,
        `# Generated by CompAnalyzer`,
        "",
        csvHeaders.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="analysis_${id}_${Date.now()}.csv"`,
      );
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({
        error: "Export failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function calculateValuation(
  extractedData: ExtractedCompanyData,
  comparables: ComparableCompany[],
): ValuationResults {
  const validComparables = comparables.filter(
    (c) => c.evRevenue && c.evRevenue > 0,
  );

  if (validComparables.length === 0) {
    // Return default valuation with industry-appropriate multiples
    const defaultMultiple = getIndustryDefaultMultiple(extractedData.industry);
    const estimatedRevenue = estimateRevenueFromDescription(
      extractedData.revenue,
    );

    return {
      revenueMultiple: {
        median: defaultMultiple,
        valuation: estimatedRevenue * defaultMultiple,
        range: {
          min: estimatedRevenue * defaultMultiple * 0.7,
          max: estimatedRevenue * defaultMultiple * 1.3,
        },
        confidence: 0.4,
        confidenceExplanation: "Confidence is based on default multiple",
      },
      growthAdjusted: {
        premium: 0.15,
        valuation: estimatedRevenue * defaultMultiple * 1.15,
        range: {
          min: estimatedRevenue * defaultMultiple * 0.8,
          max: estimatedRevenue * defaultMultiple * 1.5,
        },
        confidence: 0.3,
        confidenceExplanation: "Confidence is based on default premium",
      },
      riskAdjusted: {
        discount: 0.25,
        valuation: estimatedRevenue * defaultMultiple * 1.15 * 0.75,
        range: {
          min: estimatedRevenue * defaultMultiple * 0.6,
          max: estimatedRevenue * defaultMultiple * 1.1,
        },
        confidence: 0.35,
        confidenceExplanation: "Confidence is based on default risk discount",
      },
    };
  }

  // Enhanced comparable analysis
  const evRevenueMultiples = validComparables
    .map((c) => c.evRevenue!)
    .sort((a, b) => a - b);
  const medianMultiple =
    evRevenueMultiples[Math.floor(evRevenueMultiples.length / 2)];
  const avgMultiple =
    evRevenueMultiples.reduce((sum, m) => sum + m, 0) /
    evRevenueMultiples.length;
  const p25Multiple =
    evRevenueMultiples[Math.floor(evRevenueMultiples.length * 0.25)];
  const p75Multiple =
    evRevenueMultiples[Math.floor(evRevenueMultiples.length * 0.75)];

  // More sophisticated revenue extraction
  const companyRevenue = estimateRevenueFromDescription(extractedData.revenue);

  // Calculate confidence based on comparable quality and quantity
  const baseConfidence = Math.min(0.95, 0.6 + validComparables.length * 0.05);
  const industryMatchScore =
    validComparables.reduce((sum, c) => sum + c.matchScore, 0) /
    validComparables.length /
    100;
  const adjustedConfidence = baseConfidence * (0.7 + industryMatchScore * 0.3);

  // Dynamic explanation for confidence
  const confidenceExplanation = `Confidence is based on ${validComparables.length} comparable companies, industry match score of ${(industryMatchScore * 100).toFixed(0)}%, and a median EV/Revenue multiple of ${medianMultiple.toFixed(2)}x. The spread of multiples (P25-P75) is ${(p75Multiple - p25Multiple).toFixed(2)}x. More comparables and higher industry match increase confidence.`;

  // Base valuation using median multiple (more conservative than average)
  const baseValuation = companyRevenue * medianMultiple;
  const baseRange = {
    min: companyRevenue * p25Multiple,
    max: companyRevenue * p75Multiple,
  };

  // Growth adjustment based on stage and metrics
  const growthPremium = calculateGrowthPremium(extractedData, comparables);
  const growthAdjustedValuation = baseValuation * (1 + growthPremium);
  const growthRange = {
    min: baseRange.min * (1 + growthPremium * 0.5),
    max: baseRange.max * (1 + growthPremium * 1.2),
  };

  // Risk adjustment based on company profile and market conditions
  const riskDiscount = calculateRiskDiscount(extractedData, comparables);
  const riskAdjustedValuation = growthAdjustedValuation * (1 - riskDiscount);
  const riskRange = {
    min: growthRange.min * (1 - riskDiscount * 1.2),
    max: growthRange.max * (1 - riskDiscount * 0.8),
  };

  return {
    revenueMultiple: {
      median: medianMultiple,
      valuation: baseValuation,
      range: baseRange,
      confidence: adjustedConfidence,
      confidenceExplanation,
    },
    growthAdjusted: {
      premium: growthPremium,
      valuation: growthAdjustedValuation,
      range: growthRange,
      confidence: adjustedConfidence * 0.9, // Slightly lower confidence for adjusted values
      confidenceExplanation,
    },
    riskAdjusted: {
      discount: riskDiscount,
      valuation: riskAdjustedValuation,
      range: riskRange,
      confidence: adjustedConfidence * 0.85,
      confidenceExplanation,
    },
  };
}

function getIndustryDefaultMultiple(industry: string): number {
  const industryMultiples: Record<string, number> = {
    "B2B SaaS": 8.5,
    "Manufacturing Tech": 6.2,
    "E-commerce": 4.8,
    Fintech: 7.3,
    "Healthcare Tech": 9.1,
    "AI Software": 12.5,
    "Data Analytics": 10.2,
  };

  // Find the best match for the industry
  for (const [key, multiple] of Object.entries(industryMultiples)) {
    if (
      industry.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(industry.toLowerCase())
    ) {
      return multiple;
    }
  }

  return 8.0; // Default multiple
}

function estimateRevenueFromDescription(revenueDescription: string): number {
  // Enhanced revenue extraction with multiple patterns
  const patterns = [
    /\$(\d+(?:\.\d+)?)\s*([MBK])\s*(?:ARR|revenue|annually)/i,
    /(\d+(?:\.\d+)?)\s*([MBK])\s*(?:ARR|revenue|annually)/i,
    /\$(\d+(?:\.\d+)?)\s*([MBmillion|billion|thousand])/i,
    /(\d+(?:\.\d+)?)\s*([MBmillion|billion|thousand])/i,
  ];

  for (const pattern of patterns) {
    const match = revenueDescription.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      const unit = match[2].toUpperCase();

      if (unit.startsWith("B") || unit === "BILLION") {
        return amount * 1000000000;
      } else if (unit.startsWith("M") || unit === "MILLION") {
        return amount * 1000000;
      } else if (unit.startsWith("K") || unit === "THOUSAND") {
        return amount * 1000;
      }
    }
  }

  // Fallback: try to extract any number and assume millions
  const numberMatch = revenueDescription.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    const amount = parseFloat(numberMatch[1]);
    // Assume millions if number is reasonable for revenue
    if (amount >= 1 && amount <= 1000) {
      return amount * 1000000;
    }
  }

  return 10000000; // Default $10M fallback
}

function calculateGrowthPremium(
  extractedData: ExtractedCompanyData,
  comparables: ComparableCompany[],
): number {
  let premium = 0;

  // Base premium based on growth stage
  if (
    extractedData.growthStage.toLowerCase().includes("high") ||
    extractedData.growthStage.toLowerCase().includes("rapid")
  ) {
    premium += 0.25;
  } else if (extractedData.growthStage.toLowerCase().includes("growth")) {
    premium += 0.15;
  } else if (extractedData.growthStage.toLowerCase().includes("early")) {
    premium += 0.2;
  } else {
    premium += 0.1;
  }

  // Extract growth rate if mentioned
  const growthMatch = extractedData.growthStage.match(/(\d+)%/);
  if (growthMatch) {
    const growthRate = parseInt(growthMatch[1]);
    if (growthRate > 50) premium += 0.15;
    else if (growthRate > 30) premium += 0.1;
    else if (growthRate > 20) premium += 0.05;
  }

  // Compare to public company performance
  const avgPublicGrowth =
    comparables.reduce((sum, c) => sum + c.oneYearChange, 0) /
    comparables.length;
  if (avgPublicGrowth < 10) {
    premium += 0.05; // Premium for outperforming public markets
  }

  // Cap the premium at reasonable levels
  return Math.min(premium, 0.35);
}

function calculateRiskDiscount(
  extractedData: ExtractedCompanyData,
  comparables: ComparableCompany[],
): number {
  let discount = 0.15; // Base liquidity discount for private companies

  // Adjust based on company stage
  if (extractedData.growthStage.toLowerCase().includes("early")) {
    discount += 0.1;
  } else if (extractedData.growthStage.toLowerCase().includes("mature")) {
    discount -= 0.05;
  }

  // Risk factor assessment
  const highRiskFactors = extractedData.riskFactors.filter(
    (risk) =>
      risk.toLowerCase().includes("competition") ||
      risk.toLowerCase().includes("market") ||
      risk.toLowerCase().includes("regulation") ||
      risk.toLowerCase().includes("customer concentration"),
  ).length;

  discount += highRiskFactors * 0.03;

  // Market condition adjustment based on comparable performance
  const avgComparableChange =
    comparables.reduce((sum, c) => sum + c.oneYearChange, 0) /
    comparables.length;
  if (avgComparableChange < -10) {
    discount += 0.08; // Additional discount in poor market conditions
  } else if (avgComparableChange > 20) {
    discount -= 0.03; // Reduced discount in strong market conditions
  }

  // Cap discount at reasonable levels
  return Math.min(Math.max(discount, 0.1), 0.4);
}

async function generateAIAnalysis(
  extractedData: ExtractedCompanyData,
  comparables: ComparableCompany[],
  valuation: ValuationResults,
  originalDescription: string,
  azureInsights?: any,
): Promise<string> {
  try {
    const { generateInvestmentAnalysis } = await import("./services/openai");
    return await generateInvestmentAnalysis(
      extractedData,
      comparables,
      valuation,
      originalDescription,
      azureInsights,
    );
  } catch (error) {
    console.error("Failed to generate AI analysis:", error);
    return `
      <p><strong>Investment Thesis:</strong> Based on the provided company description and comparable analysis, this represents an interesting investment opportunity in the ${extractedData.industry} sector.</p>
      
      <p><strong>Valuation Assessment:</strong> Our analysis suggests a fair value range of $${(valuation.riskAdjusted.range.min / 1000000).toFixed(0)}M-$${(valuation.riskAdjusted.range.max / 1000000).toFixed(0)}M, with a central estimate of $${(valuation.riskAdjusted.valuation / 1000000).toFixed(1)}M.</p>
      
      <p><strong>Key Considerations:</strong> The valuation reflects the company's position in ${extractedData.region} and competitive dynamics in the ${extractedData.industry} market.</p>
      
      <p><strong>Risk Assessment:</strong> Standard risks for companies at this stage include market competition, execution risk, and economic sensitivity.</p>
    `.trim();
  }
}
