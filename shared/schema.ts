import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  companyDescription: text("company_description").notNull(),
  analysisDepth: text("analysis_depth").notNull().default("comprehensive"),
  valuationMethods: text("valuation_methods").notNull().default("all"),
  extractedData: text("extracted_data"), // JSON string of extracted company data
  comparableCompanies: text("comparable_companies"), // JSON string of comparable companies
  valuationResults: text("valuation_results"), // JSON string of valuation analysis
  aiAnalysis: text("ai_analysis"), // GPT-4 generated analysis
  createdAt: timestamp("created_at").defaultNow(),
});

export const publicCompanies = pgTable("public_companies", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull().unique(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  sector: text("sector").notNull(),
  region: text("region").notNull(),
  marketCap: real("market_cap"),
  revenue: real("revenue"),
  employees: integer("employees"),
  description: text("description"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  companyDescription: true,
  analysisDepth: true,
  valuationMethods: true,
});

export const analysisRequestSchema = z.object({
  companyDescription: z.string().min(50, "Company description must be at least 50 characters"),
  analysisDepth: z.enum(["standard", "comprehensive", "investment-grade"]).default("comprehensive"),
  valuationMethods: z.enum(["all", "revenue-multiple", "earnings-multiple", "custom"]).default("all"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type PublicCompany = typeof publicCompanies.$inferSelect;

// Types for API responses
export interface ExtractedCompanyData {
  industry: string;
  region: string;
  revenue: string;
  businessModel: string;
  growthStage: string;
  strengths: string;
  marketPosition: string;
  competitiveAdvantages: string[];
  riskFactors: string[];
}

export interface ComparableCompany {
  ticker: string;
  name: string;
  description: string;
  marketCap: number;
  revenue: number;
  peRatio: number | null;
  evRevenue: number | null;
  evEbitda: number | null;
  oneYearChange: number;
  matchScore: number;
  industry: string;
}

export interface ValuationResults {
  revenueMultiple: {
    median: number;
    valuation: number;
    range: { min: number; max: number };
    confidence: number;
  };
  growthAdjusted: {
    premium: number;
    valuation: number;
    range: { min: number; max: number };
    confidence: number;
  };
  riskAdjusted: {
    discount: number;
    valuation: number;
    range: { min: number; max: number };
    confidence: number;
  };
}

export interface AzureSearchInsights {
  insights: string[];
  marketData: string[];
  competitiveIntel: string[];
  riskFactors: string[];
  summary: string;
}
