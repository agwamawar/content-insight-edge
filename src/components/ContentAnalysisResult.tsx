
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

  const getScoreDescription = (score: number) => {
    if (score >= 80) return "Excellent virality potential";
    if (score >= 60) return "Good virality potential";
    if (score >= 40) return "Average virality potential";
    return "Low virality potential";
  };

  return (
    <div className="space-y-6">      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-700 mb-2">Virality Score</h3>
            <div className="flex items-center gap-4 mb-2">
              <Progress 
                value={result.viralityScore} 
                className={`h-2 ${getScoreColor(result.viralityScore)}`}
              />
              <span className="text-lg font-bold">{result.viralityScore}%</span>
            </div>
            <p className="text-sm text-gray-600">{getScoreDescription(result.viralityScore)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-700 mb-2">Emotional Tone</h3>
            <p className="text-lg font-medium mb-2">{result.emotionalTone}</p>
            <p className="text-sm text-gray-600">The emotional impact your content may have on viewers</p>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Improvement Suggestions</h3>
        <div className="bg-gray-50 rounded-md p-4">
          <ul className="list-disc pl-5 space-y-2">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="text-gray-700">{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContentAnalysisResult;
