
import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a video URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if user is logged in
      const { data: sessionData } = await supabase.auth.getSession();
      
      // If not logged in, save URL in localStorage and redirect to login
      if (!sessionData?.session) {
        localStorage.setItem('pendingVideoUrl', videoUrl);
        navigate('/login');
        return;
      }

      // User is logged in, proceed with analysis
      await analyzeVideo(videoUrl, sessionData.session.access_token);
      
    } catch (error) {
      console.error("Error submitting video:", error);
      toast({
        title: "Error",
        description: "Failed to analyze video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeVideo = async (url: string, token: string) => {
    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("video-analysis", {
        body: { videoUrl: url },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.savedRecord?.id) {
        navigate(`/results/${data.savedRecord.id}`);
      } else {
        toast({
          title: "Success",
          description: "Video analyzed, but no record ID was returned",
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Content Virality Analyzer
          </h1>
          <p className="text-xl text-muted-foreground">
            Upload your content and get AI-powered insights on its viral potential.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analyze Your Content</CardTitle>
            <CardDescription>
              Paste a link to your video to discover its viral potential
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Paste video URL (YouTube, Vimeo, etc.)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Analyzing..." : "Analyze My Content"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
