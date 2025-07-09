import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIAnalysisProps {
  analysis: string;
}

export default function AIAnalysis({ analysis }: AIAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900">
            AI Investment Analysis
          </CardTitle>
          <Badge variant="secondary" className="bg-primary text-white">
            <i className="fas fa-brain mr-1"></i>GPT-4 Generated
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="prose max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: analysis }}
        />
      </CardContent>
    </Card>
  );
}
