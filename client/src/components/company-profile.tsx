import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExtractedCompanyData } from "@shared/schema";

interface CompanyProfileProps {
  extractedData: ExtractedCompanyData;
}

export default function CompanyProfile({ extractedData }: CompanyProfileProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900">
            AI-Extracted Company Profile
          </CardTitle>
          <Badge variant="default" className="bg-primary text-white">
            <i className="fas fa-robot mr-1"></i>AI Analyzed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-secondary mb-2">Industry</h4>
            <p className="text-lg font-semibold text-gray-900">{extractedData.industry}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-secondary mb-2">Region</h4>
            <p className="text-lg font-semibold text-gray-900">{extractedData.region}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-secondary mb-2">Revenue</h4>
            <p className="text-lg font-semibold text-gray-900">{extractedData.revenue}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-secondary mb-2">Business Model</h4>
            <p className="text-lg font-semibold text-gray-900">{extractedData.businessModel}</p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-secondary mb-2">Growth Stage</h4>
            <p className="text-base text-gray-900">{extractedData.growthStage}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-secondary mb-2">Key Strengths</h4>
            <p className="text-base text-gray-900">{extractedData.strengths}</p>
          </div>
        </div>

        {extractedData.competitiveAdvantages && extractedData.competitiveAdvantages.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-secondary mb-3">Competitive Advantages</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {extractedData.competitiveAdvantages.map((advantage, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-accent mr-2"></i>
                  {advantage}
                </div>
              ))}
            </div>
          </div>
        )}

        {extractedData.riskFactors && extractedData.riskFactors.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-secondary mb-3">Risk Factors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {extractedData.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-exclamation-triangle text-error mr-2"></i>
                  {risk}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
