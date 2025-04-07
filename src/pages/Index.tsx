
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import ContentAnalysisResult from "@/components/ContentAnalysisResult";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Get the session token when the component mounts
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
      }
    };
    
    getSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setToken(session.access_token);
      } else {
        setToken(null);
      }
    });
    
    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAnalyzeContent = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    setError("");
    
    try {
      // Call the Supabase Edge Function with the project ID
      const response = await fetch(
        "https://mybozyryjekltdgdvots.supabase.co/functions/v1/analyze-content",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ text: content }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
      
      if (data.savedRecord) {
        toast.success("Analysis saved to your account");
      } else if (token) {
        toast.warning("Couldn't save analysis to your account");
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze content. Please try again later.");
      toast.error("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              Content Insight Edge
            </CardTitle>
            <CardDescription>
              Analyze your social media content to maximize engagement and reach
              {!token && (
                <p className="mt-2 text-amber-600">
                  <strong>Note:</strong> Sign in to save your analysis results.
                </p>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Paste your tweet, caption, or post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] text-base"
              />
              
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              {analysisResult && (
                <ContentAnalysisResult result={analysisResult} />
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleAnalyzeContent} 
              disabled={!content.trim() || isAnalyzing}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Content"
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      <footer className="container mx-auto p-4 text-center text-gray-500 text-sm">
        <p>Powered by Vertex AI and Supabase Edge Functions</p>
      </footer>
    </div>
  );
};

export default Index;
