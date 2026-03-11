import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maximum payload size: 10MB in base64 (approximately 7.5MB decoded)
const MAX_BASE64_SIZE = 10 * 1024 * 1024;

// Validate base64 string format
function isValidBase64(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  // Remove data URL prefix if present
  const base64Data = str.includes(',') ? str.split(',')[1] : str;
  if (!base64Data) return false;
  // Check for valid base64 characters
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(base64Data);
}

// Extract and validate image MIME type from data URL
function getImageMimeType(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  if (!match) return null;
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  return validTypes.includes(match[1]) ? match[1] : null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Authenticate user ────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.7.1");
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { image } = await req.json();

    // Validate image data exists
    if (!image) {
      console.log('No image data provided');
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate payload size
    if (image.length > MAX_BASE64_SIZE) {
      console.log('Image payload too large:', image.length);
      return new Response(
        JSON.stringify({ error: 'Image size exceeds maximum allowed (10MB)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate MIME type for data URLs
    if (image.startsWith('data:')) {
      const mimeType = getImageMimeType(image);
      if (!mimeType) {
        console.log('Invalid image MIME type');
        return new Response(
          JSON.stringify({ error: 'Invalid image format. Supported: PNG, JPEG, GIF, WebP' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate base64 format
    if (!isValidBase64(image)) {
      console.log('Invalid base64 format');
      return new Response(
        JSON.stringify({ error: 'Invalid image encoding' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing handwriting recognition request');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a handwriting recognition expert. Your task is to transcribe handwritten text from images accurately. Preserve the original formatting, including line breaks and paragraphs. If the handwriting is unclear, make your best attempt and indicate uncertain words with [unclear]. Only output the transcribed text, no explanations.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please transcribe the handwritten text in this image:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image.startsWith('data:') ? image : `data:image/png;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to process image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const recognizedText = data.choices[0]?.message?.content || '';

    console.log('Handwriting recognition completed successfully');

    return new Response(
      JSON.stringify({ text: recognizedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handwriting-recognition function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
