
# Content Analysis Edge Function

This Supabase Edge Function analyzes text content using Google's Vertex AI to provide:
- Virality score
- Emotional tone analysis
- Content improvement suggestions

## Deployment Steps

### Prerequisites
1. Install the Supabase CLI
2. Create a Google Cloud service account with Vertex AI API access
3. Generate and download the service account key JSON file

### Steps to Deploy

1. Log in to Supabase CLI:
```bash
supabase login
```

2. Link your project:
```bash
supabase link --project-ref YOUR_SUPABASE_PROJECT_ID
```

3. Set the Google Cloud service account key as a secret:
```bash
supabase secrets set GOOGLE_CLOUD_KEY='{"type":"service_account","project_id":"YOUR_GCP_PROJECT_ID",...}'
```

4. Deploy the Edge Function:
```bash
supabase functions deploy analyze-content
```

5. Update the frontend code with your Supabase project URL

## Usage

Send a POST request to the Edge Function endpoint with the following payload:
```json
{
  "text": "Your content to analyze"
}
```

The response will be JSON in this format:
```json
{
  "viralityScore": 78,
  "emotionalTone": "Excitement",
  "suggestions": ["Use more relatable language", "Add a call-to-action"]
}
```
