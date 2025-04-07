
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, LogIn, History } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleAnalyzeContent = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content to analyze");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Save content to session storage to resume after auth
        sessionStorage.setItem('pendingAnalysisContent', content);
        // Redirect to auth page
        navigate("/auth", { state: { returnTo: "/" } });
        return;
      }

      // User is logged in, proceed with analysis
      const token = session.access_token;
      
      // Call the Supabase Edge Function
      const response = await fetch(
        "https://mybozyryjekltdgdvots.supabase.co/functions/v1/analyze-content",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ text: content }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.savedRecord) {
        // Redirect to the results page
        navigate(`/results/${data.savedRecord.id}`);
        toast.success("Analysis complete!");
      } else {
        throw new Error("Could not save analysis results");
      }
      
    } catch (err) {
      console.error("Analysis failed:", err);
      toast.error("Failed to analyze content. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to view your history");
      navigate("/auth", { state: { returnTo: "/" } });
      return;
    }
    
    navigate("/history");
  };

  const handleSignIn = () => {
    navigate("/auth", { state: { returnTo: "/" } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Content Insight Edge</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analyze your social media content with AI to maximize engagement and reach
          </p>
        </div>
        
        <Card className="shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              Analyze Your Content
            </CardTitle>
            <CardDescription className="text-center">
              Paste your social media text to get AI-powered engagement insights
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
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              onClick={handleAnalyzeContent} 
              disabled={!content.trim() || isAnalyzing}
              className="bg-indigo-600 hover:bg-indigo-700 w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze My Content"
              )}
            </Button>
            
            <div className="flex w-full gap-4 flex-col sm:flex-row">
              <Button 
                variant="outline" 
                onClick={handleViewHistory}
                className="flex items-center gap-2 w-full"
              >
                <History className="h-4 w-4" />
                View Analysis History
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={handleSignIn}
                className="flex items-center gap-2 w-full"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </div>
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
