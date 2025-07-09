import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { ComparableCompany } from "@shared/schema";

interface ComparableCompaniesProps {
  companies: ComparableCompany[];
  analysisId: number;
}

export default function ComparableCompanies({ companies, analysisId }: ComparableCompaniesProps) {
  const { toast } = useToast();

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/analysis/${analysisId}/export`);
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis_${analysisId}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "CSV file has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export CSV",
        variant: "destructive"
      });
    }
  };

  const formatNumber = (num: number | null, suffix: string = "", prefix: string = "") => {
    if (num === null || num === undefined) return "N/A";
    
    if (suffix === "B" || suffix === "M") {
      const value = suffix === "B" ? num / 1000000000 : num / 1000000;
      return `${prefix}${value.toFixed(1)}${suffix}`;
    }
    
    if (suffix === "x") {
      return `${num.toFixed(1)}${suffix}`;
    }
    
    if (suffix === "%") {
      return `${prefix}${num > 0 ? "+" : ""}${num.toFixed(1)}${suffix}`;
    }
    
    return `${prefix}${num.toFixed(1)}${suffix}`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "bg-accent text-white";
    return "bg-error text-white";
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return "bg-accent";
    if (score >= 70) return "bg-warning";
    return "bg-secondary";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Comparable Public Companies Analysis
          </CardTitle>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-secondary">
              {companies.length} matches found
            </span>
            <Button 
              onClick={handleExportCSV}
              variant="secondary" 
              size="sm"
              className="text-sm"
            >
              <i className="fas fa-download mr-1"></i>Export CSV
            </Button>
          </div>
        </div>
        
        {/* Summary Statistics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div style={{ background: '#F5F7F8', borderRadius: '0.5rem', padding: '0.75rem' }}>
            <h4 style={{ color: '#000000', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Median EV/Revenue</h4>
            <p style={{ color: '#FD5108', fontSize: '1.125rem', fontWeight: 700 }}>
              {companies.filter(c => c.evRevenue).length > 0 ? 
                (companies.filter(c => c.evRevenue).map(c => c.evRevenue!).sort((a, b) => a - b)[Math.floor(companies.filter(c => c.evRevenue).length / 2)].toFixed(1) + 'x') : 
                'N/A'}
            </p>
          </div>
          <div style={{ background: '#F5F7F8', borderRadius: '0.5rem', padding: '0.75rem' }}>
            <h4 style={{ color: '#000000', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Avg Market Cap</h4>
            <p style={{ color: '#FD5108', fontSize: '1.125rem', fontWeight: 700 }}>
              {`$${(companies.reduce((sum, c) => sum + c.marketCap, 0) / companies.length / 1000000000).toFixed(1)}B`}
            </p>
          </div>
          <div style={{ background: '#F5F7F8', borderRadius: '0.5rem', padding: '0.75rem' }}>
            <h4 style={{ color: '#000000', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Avg 1Y Performance</h4>
            <p style={{ color: '#FD5108', fontSize: '1.125rem', fontWeight: 700 }}>
              {`${companies.reduce((sum, c) => sum + c.oneYearChange, 0) / companies.length > 0 ? '+' : ''}${(companies.reduce((sum, c) => sum + c.oneYearChange, 0) / companies.length).toFixed(1)}%`}
            </p>
          </div>
          <div style={{ background: '#F5F7F8', borderRadius: '0.5rem', padding: '0.75rem' }}>
            <h4 style={{ color: '#000000', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Avg Match Score based on similarity to the target company across attributes such as industry, region, and business model</h4>
            <p style={{ color: '#FD5108', fontSize: '1.125rem', fontWeight: 700 }}>
              {`${(companies.reduce((sum, c) => sum + c.matchScore, 0) / companies.length).toFixed(0)}%`}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Market Cap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  P/E Ratio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  EV/Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  EV/EBITDA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  1Y Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Match Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.name} ({company.ticker})
                        </div>
                        <div className="text-sm text-secondary">
                          {company.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(company.marketCap, "B", "$")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(company.revenue, "B", "$")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(company.peRatio)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(company.evRevenue, "x")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(company.evEbitda, "x")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      className={`${getChangeColor(company.oneYearChange)} text-xs font-medium`}
                    >
                      {formatNumber(company.oneYearChange, "%")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`${getMatchScoreColor(company.matchScore)} h-2 rounded-full`}
                          style={{ width: `${company.matchScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {company.matchScore.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
