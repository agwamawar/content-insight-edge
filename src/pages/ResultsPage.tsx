
import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Share2, Download, Save, ArrowLeft } from "lucide-react";

type AnalysisResult = {
  id: string;
  video_url: string;
  vision_analysis: string;
  transcript: string;
  virality_score: number;
  emotional_tone: string;
  suggestions: string[];
  created_at: string;
};

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        if (!id) return;

        const { data, error } = await supabase
          .from('video_analysis')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setResult(data as AnalysisResult);
      } catch (error: any) {
        console.error("Error fetching result:", error);
        toast({
          title: "Error",
          description: "Failed to load analysis result",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const handleShare = async () => {
    try {
      if (navigator.share && result) {
        await navigator.share({
          title: 'My Content Analysis Result',
          text: `Check out my content analysis: ${result.emotional_tone} with a virality score of ${result.virality_score}/100`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support navigator.share
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Result URL copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const fileContent = JSON.stringify(result, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `analysis-${result.id.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getViralityColorClass = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-green-400";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        onClick={() => navigate('/history')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
      </Button>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full max-w-sm" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : result ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Content Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-2">Virality Score</h3>
                  <div className="flex items-center">
                    <span className={`text-5xl font-bold ${getViralityColorClass(result.virality_score)}`}>
                      {result.virality_score}
                    </span>
                    <span className="text-xl ml-1">/100</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Emotional Tone</h3>
                  <span className="text-xl font-medium">{result.emotional_tone}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Suggested Improvements</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              {result.vision_analysis && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Visual Analysis</h3>
                  <p className="text-muted-foreground">{result.vision_analysis}</p>
                </div>
              )}

              {result.video_url && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Analyzed Content</h3>
                  <a 
                    href={result.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    {result.video_url}
                  </a>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Result Not Found</h2>
          <p className="text-muted-foreground mb-6">The analysis result you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      )}
    </div>
  );
}
