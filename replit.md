# CompAnalyzer - Private Company Valuation Platform

## Overview

CompAnalyzer is a comprehensive Node.js financial analysis platform that provides investment-grade competitive analysis and detailed valuation recommendations with supporting rationale. The application leverages AI-powered analysis to extract company metadata, find comparable public companies, and generate professional investment-grade valuations.

## System Architecture

### Backend Architecture
- **Express.js** - RESTful API server with middleware for request logging and error handling
- **TypeScript** - Full type safety across server and shared modules
- **Modular Service Layer** - Separated concerns for OpenAI integration, Yahoo Finance data fetching, and storage operations
- **Memory-based Storage** - In-memory storage implementation with interface for future database migration
- **Drizzle ORM** - Database schema definition and type generation ready for PostgreSQL integration

### Frontend Architecture
- **React** - Component-based UI with functional components and hooks
- **Vite** - Fast development server and build tool with HMR support
- **Client-side Routing** - Wouter for lightweight routing
- **State Management** - TanStack Query for server state and data fetching
- **Design System** - Shadcn/ui components with Tailwind CSS for consistent styling

### Build and Development
- **Monorepo Structure** - Shared types and schemas between client and server
- **TypeScript Configuration** - Unified tsconfig with path aliases for clean imports
- **Development Workflow** - Hot reload for both client and server in development mode
- **Production Build** - Optimized client bundle with ESBuild server compilation

## Key Components

### Data Extraction and Analysis
- **AI-Powered Company Analysis** - OpenAI GPT-4 integration for extracting structured company data from descriptions
- **Financial Data Integration** - Yahoo Finance 2 API for real-time public company financial metrics
- **Comparable Company Matching** - Algorithm to identify 3-5 relevant public comparables based on industry, sector, and region
- **Valuation Engine** - Multiple valuation methodologies including revenue multiples and earnings multiples

### User Interface Components
- **Analysis Form** - Input form with validation for company descriptions and analysis parameters
- **Loading States** - Progressive loading indicators showing analysis pipeline stages
- **Results Display** - Comprehensive results showing company profile, comparables, valuation analysis, and AI insights
- **Export Functionality** - CSV export capability for complete analysis data

### API Endpoints
- **Health Check** - System health monitoring with dependency status
- **Analysis Endpoint** - Main analysis processing with request validation
- **Export Endpoint** - CSV data export functionality

## Data Flow

1. **Input Processing** - User submits company description through validated form
2. **AI Extraction** - OpenAI GPT-4 extracts structured company metadata (industry, region, revenue, business model)
3. **Comparable Search** - Algorithm searches public companies database for industry and regional matches
4. **Azure Search Intelligence** - Azure Cognitive Search retrieves additional company-specific market intelligence and insights
5. **Financial Data Retrieval** - Yahoo Finance API fetches real-time financial metrics for comparable companies
6. **Valuation Calculation** - Multiple valuation models applied using comparable company multiples
7. **AI Analysis Generation** - GPT-4 generates investment thesis and risk assessment enhanced with Azure Search insights
8. **Results Compilation** - All analysis components combined into comprehensive report with market intelligence
9. **Data Export** - Optional CSV export of complete analysis data

## External Dependencies

### Core Dependencies
- **OpenAI API** - GPT-4 for company analysis and investment recommendations
- **Yahoo Finance 2** - Real-time financial data for public companies
- **Azure Cognitive Search** - Enhanced market intelligence and company-specific insights
- **Neon Database** - PostgreSQL database service integration ready

### UI and Styling
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Consistent icon library
- **Font Awesome** - Additional icon support

### Development Tools
- **ESLint/Prettier** - Code quality and formatting
- **PostCSS** - CSS processing with Tailwind
- **TypeScript** - Static type checking

## Deployment Strategy

### Azure App Service Ready
- **Environment Configuration** - Environment variables for API keys and database connections
- **Health Monitoring** - Dedicated health endpoints for Azure health checks
- **Production Optimization** - Optimized build process for Azure deployment
- **Static Asset Serving** - Efficient static file serving in production

### Development Environment
- **Replit Integration** - Configured for Replit development environment
- **Hot Reload** - Full stack hot reload for development efficiency
- **Port Configuration** - Configured for port 5000 with external port mapping

### Database Strategy
- **Drizzle ORM Configuration** - Ready for PostgreSQL connection
- **Schema Management** - Defined schemas for users, analyses, and public companies
- **Migration Support** - Database migration configuration ready
- **Memory Storage Fallback** - In-memory storage for development without database

Changelog:
- June 27, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.