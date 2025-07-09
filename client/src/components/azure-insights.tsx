import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AzureSearchInsights } from "@shared/schema";

interface AzureInsightsProps {
  insights: AzureSearchInsights;
}

export default function AzureInsights({ insights }: AzureInsightsProps) {
  const hasContent = insights.insights.length > 0 || 
                    insights.marketData.length > 0 || 
                    insights.competitiveIntel.length > 0 || 
                    insights.riskFactors.length > 0;

  if (!hasContent) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Market Intelligence
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <i className="fas fa-search mr-1"></i> From our internal knowledge base
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
            <p>{insights.summary}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Market Intelligence
          </CardTitle>
          <Badge variant="secondary" className="bg-primary text-white">
            <i className="fas fa-search mr-1"></i> Our internal knowledge base
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">{insights.summary}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Market Data */}
          {insights.marketData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-orange-700 mb-3 flex items-center">
                <i className="fas fa-chart-line mr-2"></i>Market Insights
              </h4>
              <ul className="space-y-2">
                {insights.marketData.map((data, index) => (
                  <li key={index} className="text-sm text-gray-700 bg-orange-50 rounded-lg p-3 border-l-4 border-orange-200">
                    {data}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Competitive Intelligence */}
          {insights.competitiveIntel.length > 0 && (
            <div>
              <Separator />
              <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center mt-4">
                <i className="fas fa-users mr-2"></i>Competitive Intelligence
              </h4>
              <ul className="space-y-2">
                {insights.competitiveIntel.map((intel, index) => (
                  <li key={index} className="text-sm text-gray-700 bg-green-50 rounded-lg p-3 border-l-4 border-green-200">
                    {intel}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Factors */}
          {insights.riskFactors.length > 0 && (
            <div>
              <Separator />
              <h4 className="text-sm font-medium text-red-700 mb-3 flex items-center mt-4">
                <i className="fas fa-exclamation-triangle mr-2"></i>Additional Risk Factors
              </h4>
              <ul className="space-y-2">
                {insights.riskFactors.map((risk, index) => (
                  <li key={index} className="text-sm text-gray-700 bg-red-50 rounded-lg p-3 border-l-4 border-red-200">
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* General Insights */}
          {insights.insights.length > 0 && (
            <div>
              <Separator />
              <h4 className="text-sm font-medium text-purple-700 mb-3 flex items-center mt-4">
                <i className="fas fa-lightbulb mr-2"></i>Key Insights
              </h4>
              <ul className="space-y-2">
                {insights.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-700 bg-purple-50 rounded-lg p-3 border-l-4 border-purple-200">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
