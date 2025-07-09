import OpenAI from "openai";
import type {
  ExtractedCompanyData,
  ComparableCompany,
  ValuationResults,
} from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// Support for both standard OpenAI and Azure OpenAI
const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY_ENV_VAR ||
    "default_key",
  // Azure OpenAI configuration
  baseURL: process.env.AZURE_OPENAI_ENDPOINT
    ? `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o"}`
    : undefined,
  defaultQuery: process.env.AZURE_OPENAI_ENDPOINT
    ? { "api-version": "2024-02-15-preview" }
    : undefined,
  defaultHeaders: process.env.AZURE_OPENAI_ENDPOINT
    ? {
        "api-key": process.env.OPENAI_API_KEY,
      }
    : undefined,
});

export async function extractCompanyData(
  companyDescription: string,
  analysisDepth: string = "comprehensive",
): Promise<ExtractedCompanyData> {
  try {
    console.log("Azure OpenAI Configuration:");
    console.log("- Endpoint:", process.env.AZURE_OPENAI_ENDPOINT);
    console.log("- Deployment:", process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
    console.log("- Using Azure:", !!process.env.AZURE_OPENAI_ENDPOINT);
    const prompt = `Analyze the following company description and extract key business information. Provide a detailed analysis based on the "${analysisDepth}" depth level.

Company Description:
${companyDescription}

Extract and return the following information in JSON format:
{
  "industry": "Primary industry/sector (be specific, e.g., 'B2B SaaS - Manufacturing Tech')",
  "region": "Primary geographic region or market (e.g., 'North America', 'Europe', 'Global')",
  "revenue": "Revenue information with amount and timeframe (e.g., '$12M ARR', '$50M annually')",
  "businessModel": "Business model type (e.g., 'Subscription SaaS', 'Marketplace', 'Enterprise Software')",
  "growthStage": "Company growth stage with metrics if available (e.g., 'Growth Stage (40% YoY)', 'Early Stage')",
  "strengths": "Key competitive advantages and strengths (concise summary)",
  "marketPosition": "Market position and competitive landscape",
  "competitiveAdvantages": ["List of 3-5 key competitive advantages"],
  "riskFactors": ["List of 3-5 primary risk factors"]
}

Ensure all fields are filled with specific, actionable information based on the company description.`;

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a financial analyst specializing in company valuation and competitive analysis. Provide detailed, investment-grade analysis based on the given company information.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Validate and ensure all required fields are present
    return {
      industry: result.industry || "Unknown Industry",
      region: result.region || "Unknown Region",
      revenue: result.revenue || "Revenue not disclosed",
      businessModel: result.businessModel || "Business model not specified",
      growthStage: result.growthStage || "Growth stage not specified",
      strengths: result.strengths || "Competitive advantages not identified",
      marketPosition:
        result.marketPosition || "Market position analysis pending",
      competitiveAdvantages: Array.isArray(result.competitiveAdvantages)
        ? result.competitiveAdvantages
        : ["Competitive advantages analysis pending"],
      riskFactors: Array.isArray(result.riskFactors)
        ? result.riskFactors
        : ["Risk assessment pending"],
    };
  } catch (error) {
    console.error("OpenAI extraction error:", error);
    throw new Error(
      `Failed to extract company data: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function generateInvestmentAnalysis(
  extractedData: ExtractedCompanyData,
  comparables: ComparableCompany[],
  valuation: ValuationResults,
  originalDescription: string,
  azureInsights?: any,
): Promise<string> {
  try {
    // Calculate comparable statistics for more detailed analysis
    const validComps = comparables.filter(
      (c) => c.evRevenue && c.evRevenue > 0,
    );
    const avgEvRevenue =
      validComps.length > 0
        ? validComps.reduce((sum, c) => sum + (c.evRevenue || 0), 0) /
          validComps.length
        : 0;
    const avgOneYearChange =
      comparables.length > 0
        ? comparables.reduce((sum, c) => sum + c.oneYearChange, 0) /
          comparables.length
        : 0;
    const avgMarketCap =
      comparables.length > 0
        ? comparables.reduce((sum, c) => sum + c.marketCap, 0) /
          comparables.length
        : 0;

    const prompt = `Generate a comprehensive, investment-grade analysis for the following private company based on detailed comparable analysis and multiple valuation methodologies.

COMPANY PROFILE:
Industry: ${extractedData.industry}
Region: ${extractedData.region}
Revenue: ${extractedData.revenue}
Business Model: ${extractedData.businessModel}
Growth Stage: ${extractedData.growthStage}
Market Position: ${extractedData.marketPosition}
Key Strengths: ${extractedData.strengths}
Competitive Advantages: ${extractedData.competitiveAdvantages.join(", ")}
Risk Factors: ${extractedData.riskFactors.join(", ")}

COMPARABLE COMPANIES ANALYSIS:
Total Comparables Identified: ${comparables.length}
${comparables
  .map(
    (comp) =>
      `• ${comp.name} (${comp.ticker}): Market Cap $${(comp.marketCap / 1000000000).toFixed(1)}B, Revenue $${(comp.revenue / 1000000000).toFixed(1)}B, EV/Revenue ${comp.evRevenue?.toFixed(1)}x, P/E ${comp.peRatio?.toFixed(1) || "N/A"}, 1Y Performance ${comp.oneYearChange > 0 ? "+" : ""}${comp.oneYearChange.toFixed(1)}%, Match Score ${comp.matchScore.toFixed(0)}%`,
  )
  .join("\n")}

COMPARABLE METRICS SUMMARY:
- Average EV/Revenue Multiple: ${avgEvRevenue.toFixed(1)}x
- Average Market Cap: $${(avgMarketCap / 1000000000).toFixed(1)}B
- Average 1-Year Performance: ${avgOneYearChange > 0 ? "+" : ""}${avgOneYearChange.toFixed(1)}%
- Median EV/Revenue Applied: ${valuation.revenueMultiple.median.toFixed(1)}x

VALUATION METHODOLOGY & RESULTS:
1. Revenue Multiple Approach: $${(valuation.revenueMultiple.valuation / 1000000).toFixed(1)}M
   - Multiple Applied: ${valuation.revenueMultiple.median.toFixed(1)}x (median of comparables)
   - Confidence Level: ${(valuation.revenueMultiple.confidence * 100).toFixed(0)}%
   - Valuation Range: $${(valuation.revenueMultiple.range.min / 1000000).toFixed(0)}M - $${(valuation.revenueMultiple.range.max / 1000000).toFixed(0)}M

2. Growth-Adjusted Valuation: $${(valuation.growthAdjusted.valuation / 1000000).toFixed(1)}M
   - Growth Premium Applied: +${(valuation.growthAdjusted.premium * 100).toFixed(0)}%
   - Confidence Level: ${(valuation.growthAdjusted.confidence * 100).toFixed(0)}%
   - Adjusted Range: $${(valuation.growthAdjusted.range.min / 1000000).toFixed(0)}M - $${(valuation.growthAdjusted.range.max / 1000000).toFixed(0)}M

3. Risk-Adjusted Final Valuation: $${(valuation.riskAdjusted.valuation / 1000000).toFixed(1)}M
   - Liquidity/Size Discount: -${(valuation.riskAdjusted.discount * 100).toFixed(0)}%
   - Final Confidence Level: ${(valuation.riskAdjusted.confidence * 100).toFixed(0)}%
   - Final Range: $${(valuation.riskAdjusted.range.min / 1000000).toFixed(0)}M - $${(valuation.riskAdjusted.range.max / 1000000).toFixed(0)}M

${
  azureInsights
    ? `
ADDITIONAL MARKET INTELLIGENCE (Azure Search):
${azureInsights.summary}

Market Insights:
${azureInsights.marketData.length > 0 ? azureInsights.marketData.map((insight: string) => `• ${insight}`).join("\n") : "• No specific market data found"}

Competitive Intelligence:
${azureInsights.competitiveIntel.length > 0 ? azureInsights.competitiveIntel.map((intel: string) => `• ${intel}`).join("\n") : "• No specific competitive intelligence found"}

Additional Risk Factors:
${azureInsights.riskFactors.length > 0 ? azureInsights.riskFactors.map((risk: string) => `• ${risk}`).join("\n") : "• No additional risk factors identified"}

Key Insights:
${azureInsights.insights.length > 0 ? azureInsights.insights.map((insight: string) => `• ${insight}`).join("\n") : "• No additional insights available"}
`
    : ""
}

Generate a detailed, professional investment analysis structured as follows:

**EXECUTIVE SUMMARY**
Provide a 2-3 sentence high-level investment thesis and valuation conclusion.

**INVESTMENT THESIS**
Detail the strategic rationale for investing, including market opportunity, competitive positioning, and growth potential. Reference specific comparable companies where relevant.

**VALUATION ASSESSMENT**
Analyze the valuation methodology, explain the choice of multiples, discuss the reasonableness of the valuation relative to comparables, and provide supporting rationale for adjustments made. Include discussion of why certain companies were selected as comparables.

**COMPETITIVE LANDSCAPE ANALYSIS**
Compare and contrast this company with the identified public comparables, highlighting key differentiators, market position, and competitive advantages or disadvantages.

**KEY INVESTMENT HIGHLIGHTS**
List 4-5 specific positive factors supporting the investment case, with detailed explanations.

**RISK ANALYSIS & MITIGATION**
Identify and analyze primary risks, compare risk profile to public comparables, and discuss potential mitigation strategies.

**VALUATION SUMMARY & RECOMMENDATION**
Provide final valuation recommendation with supporting rationale, discuss confidence levels, and suggest any additional due diligence areas.

Format as HTML with appropriate paragraph tags, bold headings, and bullet points where helpful. Write in a professional, institutional-quality tone suitable for investment committee presentations. Be specific with numbers and provide detailed supporting rationale for all conclusions.`;

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a managing director at a top-tier investment bank with 20+ years of experience in private company valuations and M&A. Generate institutional-quality investment analysis with detailed supporting rationale, specific comparable analysis, and comprehensive risk assessment. Your analysis will be used for investment committee decisions involving significant capital deployment.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });

    let result = response.choices[0].message.content || "Analysis generation failed.";
    // Remove leading/trailing code block markers (```html, ```)
    result = result.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    return result;
  } catch (error) {
    console.error("OpenAI analysis generation error:", error);
    throw new Error(
      `Failed to generate investment analysis: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
