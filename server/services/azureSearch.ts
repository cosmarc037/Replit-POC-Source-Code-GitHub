import { ExtractedCompanyData } from "@shared/schema";

export interface AzureSearchResult {
  id: string;
  content: string;
  title?: string;
  companyName?: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

export interface AzureSearchInsights {
  insights: string[];
  marketData: string[];
  competitiveIntel: string[];
  riskFactors: string[];
  summary: string;
}

export class AzureSearchService {
  private endpoint: string;
  private apiKey: string;
  private indexName: string;

  constructor() {
    this.endpoint = process.env.AZURE_SEARCH_ENDPOINT || "";
    this.apiKey = process.env.AZURE_SEARCH_KEY || "";
    this.indexName = process.env.AZURE_SEARCH_INDEX_NAME || "";

    if (!this.endpoint || !this.apiKey || !this.indexName) {
      throw new Error(
        "Azure Search configuration missing. Please provide AZURE_SEARCH_ENDPOINT, AZURE_SEARCH_KEY, and AZURE_SEARCH_INDEX_NAME",
      );
    }
  }

  async searchCompanyInformation(
    extractedData: ExtractedCompanyData,
    companyDescription: string,
  ): Promise<AzureSearchResult[]> {
    try {
      const searchTerms = this.buildSearchQuery(
        extractedData,
        companyDescription,
      );
      const searchUrl = `${this.endpoint}/indexes/${this.indexName}/docs/search?api-version=2023-11-01`;

      const searchBody = {
        search: searchTerms,
        searchMode: "any",
        queryType: "full",
        top: 10,
        select: "*",
        searchFields: "content/content",
        //filter: this.buildFilter(extractedData),
        orderby: "search.score() desc",
      };

      const response = await fetch(searchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify(searchBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Azure Search API error:", response.status, errorText);
        throw new Error(
          `Azure Search request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      return (
        data.value?.map((item: any) => ({
          id: item["@search.id"] || item.id,
          content: item.content || "",
          title: item.title || "",
          companyName: item.companyName || "",
          region: item.region || "",
          relevanceScore: item["@search.score"] || 0,
          metadata: item,
        })) || []
      );
    } catch (error) {
      console.error("Error searching Azure Cognitive Search:", error);
      throw error;
    }
  }

  private buildSearchQuery(
    extractedData: ExtractedCompanyData,
    description: string,
  ): string {
    const terms = [];

    // Extract key terms from description
    const descriptionTerms = description
      .toLowerCase()
      .split(/[^\w\s]/)
      .join(" ")
      .split(/\s+/)
      .filter((term) => term.length > 3)
      .slice(0, 10);
    terms.push(...descriptionTerms);

    // Add structured data terms as general keywords only
    if (extractedData.industry)
      (
        [
          "valuation",
          "growth strategy",
          "market expansion",
          "investment strategy",
          "competitive advantage",
          "strategic partnership",
        ].join(" OR "),
      );
    if (extractedData.region) terms.push(extractedData.region);

    if (extractedData.businessModel) {
      const modelTerms = extractedData.businessModel
        .split(/\s+/)
        .filter((t) => t.length > 2);
      terms.push(...modelTerms);
    }

    return terms.join(" ");
  }

  // private buildFilter(extractedData: ExtractedCompanyData): string {
  //   const filters = [];

  //   if (extractedData.industry) {
  //     // Search for exact industry match or related industries
  //     filters.push(
  //       `(industry eq '${extractedData.industry}' or search.ismatch('${extractedData.industry}', 'industry,content'))`,
  //     );
  //   }

  //   if (extractedData.region) {
  //     filters.push(
  //       `(region eq '${extractedData.region}' or search.ismatch('${extractedData.region}', 'region,content'))`,
  //     );
  //   }

  //   return filters.length > 0 ? filters.join(" and ") : "";
  // }

  async generateInsightsSummary(
    searchResults: AzureSearchResult[],
    extractedData: ExtractedCompanyData,
  ): Promise<AzureSearchInsights> {
    if (searchResults.length === 0) {
      return {
        insights: [],
        marketData: [],
        competitiveIntel: [],
        riskFactors: [],
        summary: "No additional information found in Azure Search index.",
      };
    }

    // Sort by relevance and take top results
    const topResults = searchResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    // Categorize insights
    const insights: string[] = [];
    const marketData: string[] = [];
    const competitiveIntel: string[] = [];
    const riskFactors: string[] = [];

    for (const result of topResults) {
      const rawContent =
        typeof result.content === "string"
          ? result.content
          : Array.isArray(result.content)
            ? result.content.map((c) => c.content).join(" ")
            : JSON.stringify(result.content || "");

      const content = rawContent.toLowerCase();
      const snippet = this.extractRelevantSnippet(
        result.content,
        extractedData,
      );

      if (
        content.includes("market") ||
        content.includes("trend") ||
        content.includes("growth")
      ) {
        marketData.push(snippet);
      } else if (
        content.includes("competitor") ||
        content.includes("competitive") ||
        content.includes("market share")
      ) {
        competitiveIntel.push(snippet);
      } else if (
        content.includes("risk") ||
        content.includes("challenge") ||
        content.includes("threat")
      ) {
        riskFactors.push(snippet);
      } else {
        insights.push(snippet);
      }
    }

    // Generate summary
    const summary = this.generateSummaryFromResults(topResults, extractedData);

    return {
      insights: insights.slice(0, 5),
      marketData: marketData.slice(0, 5),
      competitiveIntel: competitiveIntel.slice(0, 5),
      riskFactors: riskFactors.slice(0, 5),
      summary,
    };
  }

  private extractRelevantSnippet(
    content: string,
    extractedData: ExtractedCompanyData,
    maxLength: number = 1000,
  ): string {
    // Find sentences that contain relevant keywords
    const rawContent =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map((c) => c.content).join(" ")
          : JSON.stringify(content || "");

    const sentences = rawContent.split(/[.!?]+/);
    const keywords = [
      "valuation",
      "growth strategy",
      "market expansion",
      "investment strategy",
      "competitive advantage",
      "strategic partnership",
      extractedData.industry?.toLowerCase(),
      extractedData.region?.toLowerCase(),
      ...(extractedData.businessModel?.toLowerCase().split(/\s+/) || []),
    ].filter(Boolean);

    const relevantSentences = sentences.filter((sentence) => {
      const lowerSentence = sentence.toLowerCase();
      return keywords.some((keyword) => lowerSentence.includes(keyword));
    });

    let snippet = relevantSentences.slice(0, 3).join(".").trim();

    if (snippet.length > maxLength) {
      snippet = snippet.substring(0, maxLength) + "...";
    }

    return snippet.trim();
  }

  private generateSummaryFromResults(
    results: AzureSearchResult[],
    extractedData: ExtractedCompanyData,
  ): string {
    const totalResults = results.length;
    const avgScore =
      results.reduce((sum, r) => sum + r.relevanceScore, 0) / totalResults;

    const industryMatches = extractedData.industry
      ? results.filter((r) => {
          const content =
            typeof r.content === "string"
              ? r.content
              : Array.isArray(r.content)
                ? r.content.map((c) => c.content).join(" ")
                : JSON.stringify(r.content || "");

          return content
            .toLowerCase()
            .includes(extractedData.industry!.toLowerCase());
        }).length
      : 0;

    const regionMatches = extractedData.region
      ? results.filter((r) => {
          const content =
            typeof r.content === "string"
              ? r.content
              : Array.isArray(r.content)
                ? r.content.map((c) => c.content).join(" ")
                : JSON.stringify(r.content || "");

          return content
            .toLowerCase()
            .includes(extractedData.region!.toLowerCase());
        }).length
      : 0;

    return `We found ${totalResults} relevant documents from the internal knowledge database using the company’s profile (industry, region, and business model). These documents are sourced from our curated internal corpus, particularly from annual reports. \n

           The average relevance score is ${avgScore.toFixed(2)}, indicating how well the documents match the extracted company context. \n
           These findings provide insights that may influence valuation—such as growth trends, competitive dynamics, and potential risks. The insights below are categorized to help users quickly digest this supporting context.`;
  }
}

export const azureSearchService = new AzureSearchService();
