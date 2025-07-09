# CompAnalyzer - Private Company Valuation Platform

A comprehensive Node.js financial analysis platform that provides investment-grade competitive analysis and detailed valuation recommendations with supporting rationale.

## Features

- **AI-Powered Company Analysis**: Uses OpenAI GPT-4 to extract comprehensive company metadata from descriptions
- **Comparable Companies Matching**: Advanced algorithm to find 3-5 highly relevant public comparables
- **Real-Time Financial Data**: Yahoo Finance integration for comprehensive financial metrics
- **Investment-Grade Valuation**: Multiple valuation methodologies with confidence intervals
- **Professional Analysis**: GPT-4 generated investment thesis and risk assessment
- **CSV Export**: Full analysis data export capability
- **Azure Ready**: Optimized for Azure App Service deployment

## Tech Stack

### Backend
- **Express.js** - Web application framework
- **OpenAI API** - GPT-4 for company analysis and investment recommendations
- **Yahoo Finance 2** - Real-time financial data for public companies
- **TypeScript** - Type safety and better development experience
- **Drizzle ORM** - Database schema and type generation

### Frontend
- **React** - User interface framework
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **Wouter** - Lightweight client-side routing
- **TanStack Query** - Data fetching and state management

### Development Tools
- **Vite** - Fast build tool and development server
- **TypeScript** - Static type checking
- **ESBuild** - Fast JavaScript bundler

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd companalyzer
   