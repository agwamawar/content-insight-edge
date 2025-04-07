
// This file is a template for your Supabase Edge Function
// You'll need to create this function using the Supabase CLI

// Supabase Edge Functions use Deno, but support npm packages via esm.sh
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Define the handler for the edge function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    // Parse the request body
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text content is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get the Google Cloud service account key from Supabase secrets
    // In production, you would store this as a Supabase secret
    const GOOGLE_CLOUD_KEY = Deno.env.get('GOOGLE_CLOUD_KEY');
    
    if (!GOOGLE_CLOUD_KEY) {
      console.error('Missing Google Cloud credentials');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Parse the service account key
    const serviceAccountKey = JSON.parse(GOOGLE_CLOUD_KEY);

    // Get an access token from Google
    const tokenResponse = await fetch(
      `https://oauth2.googleapis.com/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: generateJWT(serviceAccountKey),
        }),
      }
    );

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('Token Error:', tokenError);
      throw new Error('Failed to get access token');
    }

    const { access_token } = await tokenResponse.json();

    // Call the Vertex AI API
    const PROJECT_ID = serviceAccountKey.project_id;
    const LOCATION = 'us-central1';
    const MODEL = 'text-bison';  // or whichever model you want to use

    const vertexResponse = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              content: `Analyze the following social media content and provide:
              1. A virality score from 0-100
              2. The emotional tone (e.g., Excitement, Sadness, Humor)
              3. 2-3 suggestions to improve engagement
              
              Content: "${text}"
              
              Format your response as a valid JSON object with fields: viralityScore, emotionalTone, suggestions (array)`,
            },
          ],
          parameters: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            topK: 40,
            topP: 0.8,
          },
        }),
      }
    );

    if (!vertexResponse.ok) {
      const vertexError = await vertexResponse.text();
      console.error('Vertex AI Error:', vertexError);
      throw new Error('Failed to call Vertex AI');
    }

    const vertexData = await vertexResponse.json();
    
    // Parse the response
    // The response format depends on the model, so we need to do some processing
    let analysisResult;
    
    try {
      // Try to extract the JSON from the model response
      const modelOutput = vertexData.predictions[0].content;
      
      // Find the JSON part in the string (assuming the model follows our instructions)
      const jsonMatch = modelOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // If we can't find properly formatted JSON, create a default structure
        analysisResult = {
          viralityScore: 50, // Default score
          emotionalTone: "Neutral",
          suggestions: ["Couldn't parse suggestions from the model output"]
        };
      }
    } catch (error) {
      console.error('Error parsing model output:', error);
      // Fallback response
      analysisResult = {
        viralityScore: 50,
        emotionalTone: "Neutral",
        suggestions: ["Failed to analyze content properly"]
      };
    }

    // Return the analysis result
    return new Response(JSON.stringify(analysisResult), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

// Helper function to generate a JWT for Google authentication
function generateJWT(serviceAccountKey) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccountKey.client_email,
    sub: serviceAccountKey.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600, // 1 hour
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  };

  // In Deno, you would use the built-in crypto or a JWT library
  // This is simplified - in production you'd use a proper JWT library
  const encodedHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signInput = `${encodedHeader}.${encodedPayload}`;
  
  // For the actual signing, you would need to use the crypto API with the private key
  // This is a placeholder - in real code, you would use proper JWT signing
  const signature = "PLACEHOLDER-FOR-ACTUAL-SIGNATURE";
  
  return `${signInput}.${signature}`;
}
