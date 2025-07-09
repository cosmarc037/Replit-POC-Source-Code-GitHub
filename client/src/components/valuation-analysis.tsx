import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExtractedCompanyData, ValuationResults } from "@shared/schema";

interface ValuationAnalysisProps {
  extractedData: ExtractedCompanyData;
  valuationResults: ValuationResults;
}

export default function ValuationAnalysis({ extractedData, valuationResults }: ValuationAnalysisProps) {
  const formatCurrency = (amount: number) => {
    return `$${(amount / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  };

  const formatRange = (range: { min: number; max: number }) => {
    return `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Valuation Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Valuation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-secondary mb-3">
                Revenue Multiple Valuation
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Median EV/Revenue:</span>
                  <span className="text-sm font-medium">
                    {valuationResults.revenueMultiple.median.toFixed(1)}x
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Applied Valuation:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(valuationResults.revenueMultiple.valuation)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-secondary">
                  <span>Range: {formatRange(valuationResults.revenueMultiple.range)}</span>
                  <span>Confidence: {formatPercentage(valuationResults.revenueMultiple.confidence)}</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-secondary mb-3">
                Growth-Adjusted Valuation
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Growth Premium:</span>
                  <span className="text-sm font-medium">
                    +{formatPercentage(valuationResults.growthAdjusted.premium)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Adjusted Valuation:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(valuationResults.growthAdjusted.valuation)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-secondary">
                  <span>Range: {formatRange(valuationResults.growthAdjusted.range)}</span>
                  <span>Confidence: {formatPercentage(valuationResults.growthAdjusted.confidence)}</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-secondary mb-3">
                Risk-Adjusted Estimate
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Size/Liquidity Discount:</span>
                  <span className="text-sm font-medium">
                    -{formatPercentage(valuationResults.riskAdjusted.discount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Final Valuation:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(valuationResults.riskAdjusted.valuation)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-secondary">
                  <span>Range: {formatRange(valuationResults.riskAdjusted.range)}</span>
                  <span>Confidence: {formatPercentage(valuationResults.riskAdjusted.confidence)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Key Insights & Risks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {extractedData.competitiveAdvantages && extractedData.competitiveAdvantages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-accent mb-2">
                  <i className="fas fa-arrow-up mr-1"></i>Positive Factors
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {extractedData.competitiveAdvantages.slice(0, 4).map((advantage, index) => (
                    <li key={index}>• {advantage}</li>
                  ))}
                </ul>
              </div>
            )}

            {extractedData.riskFactors && extractedData.riskFactors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-error mb-2">
                  <i className="fas fa-exclamation-triangle mr-1"></i>Risk Factors
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {extractedData.riskFactors.slice(0, 4).map((risk, index) => (
                    <li key={index}>• {risk}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-secondary mb-2">
                <i className="fas fa-chart-bar mr-1"></i>Market Positioning
              </h4>
              <p className="text-sm text-gray-700">
                {extractedData.marketPosition || 
                 `Company operates in the ${extractedData.industry} sector within ${extractedData.region}, positioned as a ${extractedData.businessModel} business with ${extractedData.growthStage.toLowerCase()} characteristics.`}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-secondary mb-2">Valuation Methodology</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Base Multiple (Median):</span>
                  <span className="font-medium">{valuationResults.revenueMultiple.median.toFixed(1)}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth Premium based on stated growth stage, <br />
                  presence of specific growth rate indicators, and <br />
                    comparison against the average 1-year performance 
                    <br />of comparable public companies:</span>
                  <span className="font-medium text-accent">+{formatPercentage(valuationResults.growthAdjusted.premium)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Liquidity Discount influenced by the company stage, <br />
                    presence of key risk disclosures, and current market <br /> 
                    sentiment inferred from comparable companies 1-year performance:</span>
                  <span className="font-medium text-error">-{formatPercentage(valuationResults.riskAdjusted.discount)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Net Multiple Applied:</span>
                    <span className="font-bold">{(valuationResults.revenueMultiple.median * (1 + valuationResults.growthAdjusted.premium) * (1 - valuationResults.riskAdjusted.discount)).toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primary mb-2">
                <i className="fas fa-info-circle mr-1"></i>Supporting Rationale
              </h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Multiple derived from {valuationResults.revenueMultiple.confidence > 0.8 ? 'high-quality' : 'moderate-quality'} comparable analysis</li>
                <li>• Growth premium reflects {extractedData.growthStage.toLowerCase()} market position</li>
                <li>• Risk discount accounts for private company liquidity constraints</li>
                <li>• Final confidence: {formatPercentage(valuationResults.riskAdjusted.confidence)}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
