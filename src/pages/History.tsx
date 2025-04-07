
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, ChevronDown, ChevronUp } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisRecord {
  id: string;
  created_at: string;
  original_text: string;
  virality_score: number;
  emotional_tone: string;
  suggestions: string[];
}

const History = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchAnalyses = async () => {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Please sign in to view your history");
          navigate("/auth", { state: { returnTo: "/history" } });
          return;
        }
        
        await fetchAnalyses();
      } catch (error) {
        console.error("Error checking auth:", error);
        toast.error("An error occurred while loading your history");
      }
    };

    checkAuthAndFetchAnalyses();
  }, [navigate]);

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

  const handleViewAnalysis = (id: string) => {
    navigate(`/results/${id}`);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="mb-6 flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h2 className="text-2xl font-semibold mb-6">Your Analysis History</h2>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 mb-4">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={handleBackToHome}
          className="mb-6 flex items-center gap-2 text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Your Analysis History</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalyses}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>

        {analyses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No previous analyses found. Try analyzing some content!
          </p>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="p-4 bg-white shadow-sm">
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
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(analysis.id)}
                      className="p-1 h-8 w-8"
                    >
                      {expandedId === analysis.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAnalysis(analysis.id)}
                    >
                      View
                    </Button>
                  </div>
                </div>

                {expandedId === analysis.id && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Original Text:</h4>
                      <p className="mt-1 text-sm bg-gray-50 p-3 rounded border">{analysis.original_text}</p>
                    </div>
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
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
