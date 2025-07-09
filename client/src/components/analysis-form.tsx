import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AnalysisResult } from "@/lib/types";

interface AnalysisFormProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onClear: () => void;
}

export default function AnalysisForm({ onAnalysisStart, onAnalysisComplete, onClear }: AnalysisFormProps) {
  const [companyDescription, setCompanyDescription] = useState(
    "TechFlow Solutions is a B2B SaaS company based in San Francisco that provides workflow automation software for mid-market manufacturing companies. Founded in 2019, the company has grown to $12M ARR with 40% year-over-year growth. Their platform integrates with existing ERP systems to optimize supply chain operations, reduce manual processes, and provide real-time analytics. The company serves 150+ customers across North America and Europe, with an average contract value of $80K annually. Key competitive advantages include proprietary AI algorithms, strong customer retention (95% net revenue retention), and deep domain expertise in manufacturing workflows."
  );
  const [analysisDepth, setAnalysisDepth] = useState("comprehensive");
  const [valuationMethods, setValuationMethods] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company description",
        variant: "destructive"
      });
      return;
    }

    if (companyDescription.trim().length < 50) {
      toast({
        title: "Error", 
        description: "Company description must be at least 50 characters",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    onAnalysisStart();

    try {
      const response = await apiRequest("POST", "/api/analyze", {
        companyDescription,
        analysisDepth,
        valuationMethods
      });

      const result = await response.json();
      onAnalysisComplete(result);
      
      toast({
        title: "Analysis Complete",
        description: "Company analysis has been successfully generated"
      });
      
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      onClear();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setCompanyDescription("");
    setAnalysisDepth("comprehensive");
    setValuationMethods("all");
    onClear();
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Company Analysis Input</CardTitle>
        <p className="text-sm text-secondary mt-1">
          Enter a detailed company description including business model, industry, geography, revenue information, growth stage, competitive advantages, and any other relevant details for accurate comparable analysis...
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="companyDescription" className="text-sm font-medium text-gray-700 mb-2">
              Company Description <span className="text-error">*</span>
            </Label>
            <Textarea
              id="companyDescription"
              name="companyDescription"
              rows={8}
              className="w-full mt-2 resize-none"
              placeholder="Enter a detailed company description including business model, industry, geography, revenue information, growth stage, competitive advantages, and any other relevant details for accurate comparable analysis..."
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="analysisDepth" className="text-sm font-medium text-gray-700 mb-2">
                Analysis Depth
              </Label>
              <Select value={analysisDepth} onValueChange={setAnalysisDepth}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Analysis</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                  <SelectItem value="investment-grade">Investment Grade Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="valuationMethods" className="text-sm font-medium text-gray-700 mb-2">
                Valuation Methods
              </Label>
              <Select value={valuationMethods} onValueChange={setValuationMethods}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods (P/E, EV/Revenue, EV/EBITDA)</SelectItem>
                  <SelectItem value="revenue-multiple">Revenue Multiple Focus</SelectItem>
                  <SelectItem value="earnings-multiple">Earnings Multiple Focus</SelectItem>
                  <SelectItem value="custom">Custom Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                type="submit" 
                className="bg-primary text-white px-6 py-3 hover:bg-orange-700 font-medium"
                disabled={isSubmitting}
              >
                <i className="fas fa-chart-line mr-2"></i>
                {isSubmitting ? "Analyzing..." : "Analyze Company"}
              </Button>
              <Button 
                type="button" 
                variant="ghost"
                className="text-secondary hover:bg-gray-400 px-4 py-3 font-medium"
                onClick={handleClear}
                disabled={isSubmitting}
              >
                Clear Form
              </Button>
            </div>
            <div className="text-sm text-secondary">
              <i className="fas fa-info-circle mr-1"></i>
              Analysis takes 30-60 seconds
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
