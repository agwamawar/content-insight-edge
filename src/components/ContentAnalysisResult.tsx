
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalysisResult {
  viralityScore: number;
  emotionalTone: string;
  suggestions: string[];
}

const ContentAnalysisResult = ({ result }: { result: AnalysisResult }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6 my-6">
      <h2 className="text-xl font-semibold">Analysis Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-700 mb-2">Virality Score</h3>
            <div className="flex items-center gap-4">
              <Progress 
                value={result.viralityScore} 
                className={`h-2 ${getScoreColor(result.viralityScore)}`}
              />
              <span className="text-lg font-bold">{result.viralityScore}%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-700 mb-2">Emotional Tone</h3>
            <p className="text-lg font-medium">{result.emotionalTone}</p>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Improvement Suggestions</h3>
        <ul className="list-disc pl-5 space-y-1">
          {result.suggestions.map((suggestion, index) => (
            <li key={index} className="text-gray-700">{suggestion}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ContentAnalysisResult;
