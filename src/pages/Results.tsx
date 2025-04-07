
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Share2, ArrowLeft } from "lucide-react";
import ContentAnalysisResult from "@/components/ContentAnalysisResult";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        
        // First check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Please sign in to view results");
          navigate("/auth", { state: { returnTo: `/results/${id}` } });
          return;
        }

        // Fetch the specific analysis record
        const { data, error } = await supabase
          .from("virality_analysis")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          toast.error("Analysis not found");
          navigate("/");
          return;
        }

        setAnalysis({
          viralityScore: data.virality_score,
          emotionalTone: data.emotional_tone,
          suggestions: data.suggestions,
          originalText: data.original_text
        });
      } catch (error) {
        console.error("Error fetching analysis:", error);
        toast.error("Failed to load analysis results");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalysis();
    }
  }, [id, navigate]);

  const handleDownload = () => {
    if (!analysis) return;
    
    const analysisText = `
Content Insight Edge - Analysis Results

Original Content:
${analysis.originalText}

Virality Score: ${analysis.viralityScore}%
Emotional Tone: ${analysis.emotionalTone}

Suggestions:
${analysis.suggestions.map(s => `- ${s}`).join('\n')}

Generated on: ${new Date().toLocaleString()}
    `.trim();
    
    const blob = new Blob([analysisText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Analysis downloaded");
  };

  const handleShare = async () => {
    if (!analysis) return;
    
    const shareData = {
      title: 'Content Insight Edge Analysis',
      text: `Check out my content analysis! Virality Score: ${analysis.viralityScore}%, Emotional Tone: ${analysis.emotionalTone}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share");
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

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
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Analysis Results</CardTitle>
            <CardDescription>
              Your content has been analyzed for virality and engagement potential
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : analysis ? (
              <>
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Original Content:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{analysis.originalText}</p>
                </div>
                
                <ContentAnalysisResult result={analysis} />
                
                <div className="flex flex-wrap gap-4 mt-6">
                  <Button
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Analysis
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-red-500">Analysis not found or unavailable</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Results;
