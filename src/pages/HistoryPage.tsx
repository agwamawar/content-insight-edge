
import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, ArrowRight } from "lucide-react";

type AnalysisRecord = {
  id: string;
  video_url: string;
  virality_score: number;
  emotional_tone: string;
  created_at: string;
};

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('video_analysis')
          .select('id, video_url, virality_score, emotional_tone, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setAnalyses(data as AnalysisRecord[]);
      } catch (error) {
        console.error("Error fetching analyses:", error);
        toast({
          title: "Error",
          description: "Failed to load your analysis history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [navigate]);

  const getViralityColorClass = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-green-400";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.pathname !== "/" ? urlObj.pathname : "");
    } catch (e) {
      return url.length > 50 ? url.substring(0, 50) + "..." : url;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analysis History</h1>
        <Button onClick={() => navigate('/')}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Analysis
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="w-full">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analyses.length > 0 ? (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="w-full">
              <CardContent className="p-0">
                <button 
                  onClick={() => navigate(`/results/${analysis.id}`)}
                  className="w-full text-left p-6 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                      </p>
                      <p className="font-medium truncate max-w-md">
                        {formatUrl(analysis.video_url)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Virality Score</p>
                        <p className={`font-bold ${getViralityColorClass(analysis.virality_score)}`}>
                          {analysis.virality_score}/100
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No Analyses Yet</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">You haven't analyzed any content yet.</p>
            <Button onClick={() => navigate('/')}>Analyze Your First Content</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
