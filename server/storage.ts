import { 
  users, 
  analyses, 
  publicCompanies,
  type User, 
  type InsertUser, 
  type Analysis, 
  type InsertAnalysis,
  type PublicCompany 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  updateAnalysis(id: number, data: Partial<Analysis>): Promise<Analysis | undefined>;
  
  getPublicCompanies(): Promise<PublicCompany[]>;
  getComparableCompanies(industry: string, region: string, limit?: number): Promise<PublicCompany[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private analyses: Map<number, Analysis>;
  private publicCompanies: Map<number, PublicCompany>;
  private currentUserId: number;
  private currentAnalysisId: number;
  private currentCompanyId: number;

  constructor() {
    this.users = new Map();
    this.analyses = new Map();
    this.publicCompanies = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
    this.currentCompanyId = 1;
    
    // Initialize with some public companies data
    this.initializePublicCompanies();
  }

  private initializePublicCompanies() {
    const companies = [
      // B2B SaaS Companies
      { ticker: "CRM", name: "Salesforce", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Cloud Software Platform" },
      { ticker: "NOW", name: "ServiceNow", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Enterprise Workflow Platform" },
      { ticker: "MNDY", name: "Monday.com", industry: "B2B SaaS", sector: "Technology", region: "Global", description: "Work Management Platform" },
      { ticker: "ASAN", name: "Asana", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Team Collaboration Software" },
      { ticker: "SMAR", name: "Smartsheet", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Enterprise Work Management" },
      { ticker: "TEAM", name: "Atlassian", industry: "B2B SaaS", sector: "Technology", region: "Global", description: "Team Collaboration and Productivity" },
      { ticker: "ZM", name: "Zoom", industry: "B2B SaaS", sector: "Technology", region: "Global", description: "Video Communications Platform" },
      { ticker: "DDOG", name: "Datadog", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Monitoring and Analytics Platform" },
      { ticker: "SNOW", name: "Snowflake", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Cloud Data Platform" },
      { ticker: "CRWD", name: "CrowdStrike", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Cybersecurity Platform" },
      { ticker: "OKTA", name: "Okta", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Identity and Access Management" },
      { ticker: "WDAY", name: "Workday", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Enterprise HR and Finance Software" },
      { ticker: "VEEV", name: "Veeva Systems", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Life Sciences Cloud Software" },
      { ticker: "HUBS", name: "HubSpot", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Marketing and Sales Platform" },
      
      // Manufacturing Technology 
      { ticker: "PTC", name: "PTC", industry: "Manufacturing Tech", sector: "Technology", region: "North America", description: "Industrial IoT and CAD Software" },
      { ticker: "ADSK", name: "Autodesk", industry: "Manufacturing Tech", sector: "Technology", region: "North America", description: "Design and Engineering Software" },
      { ticker: "ANSS", name: "ANSYS", industry: "Manufacturing Tech", sector: "Technology", region: "North America", description: "Engineering Simulation Software" },
      { ticker: "CDNS", name: "Cadence Design", industry: "Manufacturing Tech", sector: "Technology", region: "North America", description: "Electronic Design Automation" },
      { ticker: "SNPS", name: "Synopsys", industry: "Manufacturing Tech", sector: "Technology", region: "North America", description: "Electronic Design Automation" },
      
      // E-commerce & Marketplace
      { ticker: "SHOP", name: "Shopify", industry: "E-commerce", sector: "Technology", region: "North America", description: "E-commerce Platform" },
      { ticker: "ETSY", name: "Etsy", industry: "E-commerce", sector: "Technology", region: "North America", description: "Online Marketplace" },
      { ticker: "EBAY", name: "eBay", industry: "E-commerce", sector: "Technology", region: "Global", description: "Online Marketplace" },
      
      // Fintech
      { ticker: "SQ", name: "Block (Square)", industry: "Fintech", sector: "Financial Services", region: "North America", description: "Payment Processing Platform" },
      { ticker: "PYPL", name: "PayPal", industry: "Fintech", sector: "Financial Services", region: "Global", description: "Digital Payments Platform" },
      { ticker: "ADYEN", name: "Adyen", industry: "Fintech", sector: "Financial Services", region: "Europe", description: "Payment Processing Platform" },
      
      // Healthcare Tech
      { ticker: "TDOC", name: "Teladoc", industry: "Healthcare Tech", sector: "Healthcare", region: "North America", description: "Telemedicine Platform" },
      { ticker: "DOCU", name: "DocuSign", industry: "B2B SaaS", sector: "Technology", region: "North America", description: "Electronic Signature Platform" },
      
      // AI/Data Analytics
      { ticker: "PLTR", name: "Palantir", industry: "Data Analytics", sector: "Technology", region: "North America", description: "Big Data Analytics Platform" },
      { ticker: "AI", name: "C3.ai", industry: "AI Software", sector: "Technology", region: "North America", description: "Enterprise AI Software" }
    ];

    companies.forEach(company => {
      const id = this.currentCompanyId++;
      this.publicCompanies.set(id, { ...company, id, marketCap: null, revenue: null, employees: null });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.currentAnalysisId++;
    const analysis: Analysis = { 
      id,
      companyDescription: insertAnalysis.companyDescription,
      analysisDepth: insertAnalysis.analysisDepth || "comprehensive",
      valuationMethods: insertAnalysis.valuationMethods || "all",
      extractedData: null,
      comparableCompanies: null,
      valuationResults: null,
      aiAnalysis: null,
      createdAt: new Date()
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async updateAnalysis(id: number, data: Partial<Analysis>): Promise<Analysis | undefined> {
    const existing = this.analyses.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...data };
    this.analyses.set(id, updated);
    return updated;
  }

  async getPublicCompanies(): Promise<PublicCompany[]> {
    return Array.from(this.publicCompanies.values());
  }

  async getComparableCompanies(industry: string, region: string, limit: number = 10): Promise<PublicCompany[]> {
    const companies = Array.from(this.publicCompanies.values());
    
    // Enhanced matching algorithm with multiple factors
    const scored = companies.map(company => {
      let score = 0;
      
      // Industry matching (most important factor)
      if (this.exactIndustryMatch(company.industry, industry)) {
        score += 100;
      } else if (this.partialIndustryMatch(company.industry, industry)) {
        score += 70;
      } else if (this.sectorMatch(company.sector, industry)) {
        score += 40;
      }
      
      // Region matching
      if (this.exactRegionMatch(company.region, region)) {
        score += 30;
      } else if (company.region === "Global") {
        score += 25;
      } else if (this.partialRegionMatch(company.region, region)) {
        score += 15;
      }
      
      // Business model similarity (inferred from description)
      if (company.description && this.businessModelMatch(company.description, industry)) {
        score += 20;
      }
      
      // Add randomness to break ties and provide variety
      score += Math.random() * 5;
      
      return { ...company, matchScore: Math.min(score, 100) };
    });

    return scored
      .filter(company => company.matchScore > 30) // Higher threshold for quality
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  private exactIndustryMatch(companyIndustry: string, targetIndustry: string): boolean {
    return companyIndustry.toLowerCase() === targetIndustry.toLowerCase();
  }

  private partialIndustryMatch(companyIndustry: string, targetIndustry: string): boolean {
    const companyTerms = companyIndustry.toLowerCase().split(/[\s-]+/);
    const targetTerms = targetIndustry.toLowerCase().split(/[\s-]+/);
    
    // Check for overlapping key terms
    const keyTerms = ['saas', 'software', 'tech', 'technology', 'manufacturing', 'fintech', 'healthcare', 'ai', 'data', 'analytics'];
    
    for (const term of keyTerms) {
      if (companyTerms.some(t => t.includes(term)) && targetTerms.some(t => t.includes(term))) {
        return true;
      }
    }
    
    // Check for any overlapping significant terms
    return companyTerms.some(ct => targetTerms.some(tt => 
      (ct.length > 3 && tt.length > 3) && (ct.includes(tt) || tt.includes(ct))
    ));
  }

  private sectorMatch(companySector: string, targetIndustry: string): boolean {
    const sectorMap: Record<string, string[]> = {
      'Technology': ['tech', 'software', 'saas', 'ai', 'data', 'digital', 'platform'],
      'Financial Services': ['fintech', 'finance', 'payment', 'banking'],
      'Healthcare': ['healthcare', 'medical', 'health', 'pharma'],
      'Manufacturing': ['manufacturing', 'industrial', 'automation']
    };
    
    const targetLower = targetIndustry.toLowerCase();
    const relevantTerms = sectorMap[companySector] || [];
    
    return relevantTerms.some(term => targetLower.includes(term));
  }

  private exactRegionMatch(companyRegion: string, targetRegion: string): boolean {
    return companyRegion.toLowerCase() === targetRegion.toLowerCase();
  }

  private partialRegionMatch(companyRegion: string, targetRegion: string): boolean {
    const regionAliases: Record<string, string[]> = {
      'north america': ['usa', 'us', 'america', 'canada', 'north american'],
      'europe': ['european', 'eu', 'uk', 'britain', 'germany', 'france'],
      'asia': ['asian', 'china', 'japan', 'singapore', 'india'],
      'global': ['worldwide', 'international', 'multinational']
    };
    
    const companyLower = companyRegion.toLowerCase();
    const targetLower = targetRegion.toLowerCase();
    
    // Check direct aliases
    for (const [region, aliases] of Object.entries(regionAliases)) {
      if ((companyLower.includes(region) || aliases.some(a => companyLower.includes(a))) &&
          (targetLower.includes(region) || aliases.some(a => targetLower.includes(a)))) {
        return true;
      }
    }
    
    return false;
  }

  private businessModelMatch(companyDescription: string, targetIndustry: string): boolean {
    const modelTerms = {
      'platform': ['platform', 'marketplace', 'network'],
      'saas': ['saas', 'software', 'cloud', 'subscription'],
      'automation': ['automation', 'workflow', 'process'],
      'analytics': ['analytics', 'data', 'insights', 'intelligence']
    };
    
    const descLower = companyDescription.toLowerCase();
    const industryLower = targetIndustry.toLowerCase();
    
    for (const [model, terms] of Object.entries(modelTerms)) {
      if (terms.some(term => industryLower.includes(term)) &&
          terms.some(term => descLower.includes(term))) {
        return true;
      }
    }
    
    return false;
  }
}

export const storage = new MemStorage();
