
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";

interface AnalysisRecord {
  id: string;
  created_at: string;
  original_text: string;
  virality_score: number;
  emotional_tone: string;
  suggestions: string[];
}

const AnalysisHistory = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("virality_analysis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAnalyses(data || []);
    } catch (error: any) {
      console.error("Error fetching analyses:", error);
      toast.error("Failed to load analysis history");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Your Analysis History</h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Your Analysis History</h2>
        <p className="text-gray-500 mt-2">No previous analyses found. Try analyzing some content!</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Analysis History</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalyses}
          className="text-xs"
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {analyses.map((analysis) => (
          <div key={analysis.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Score: {analysis.virality_score}%
                  </span>
                  <span className="text-gray-500">•</span>
                  <span>{analysis.emotional_tone}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(analysis.created_at)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(analysis.id)}
              >
                {expandedId === analysis.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {expandedId === analysis.id && (
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Original Text:</h4>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded border">{analysis.original_text}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Suggestions:</h4>
                  <ul className="list-disc ml-5 mt-1 text-sm space-y-1">
                    {analysis.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisHistory;
