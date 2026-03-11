import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maximum payload size: 25MB in base64 (OpenAI limit is 25MB for audio)
const MAX_BASE64_SIZE = 25 * 1024 * 1024;

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

// Extract and validate audio MIME type from data URL
function getAudioMimeType(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:(audio\/[a-zA-Z0-9.+-]+);base64,/);
  if (!match) return null;
  const validTypes = [
    'audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 
    'audio/wav', 'audio/ogg', 'audio/flac', 'audio/m4a'
  ];
  return validTypes.includes(match[1]) ? match[1] : null;
}

// Process base64 in chunks to prevent memory issues
function processBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  // Remove data URL prefix if present
  const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Return a new ArrayBuffer by copying the data
  return bytes.buffer.slice(0) as ArrayBuffer;
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

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audio = typeof body.audio === 'string' ? body.audio : null;

    // Validate audio data exists
    if (!audio) {
      console.log('No audio data provided');
      return new Response(
        JSON.stringify({ error: 'Audio data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate payload size
    if (audio.length > MAX_BASE64_SIZE) {
      console.log('Audio payload too large:', audio.length);
      return new Response(
        JSON.stringify({ error: 'Audio size exceeds maximum allowed (25MB)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine MIME type
    let mimeType = 'audio/webm';
    if (audio.startsWith('data:')) {
      const detectedType = getAudioMimeType(audio);
      if (!detectedType) {
        console.log('Invalid audio MIME type');
        return new Response(
          JSON.stringify({ error: 'Invalid audio format. Supported: WebM, MP3, WAV, OGG, FLAC, M4A' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      mimeType = detectedType;
    }

    // Validate base64 format
    if (!isValidBase64(audio)) {
      console.log('Invalid base64 format');
      return new Response(
        JSON.stringify({ error: 'Invalid audio encoding' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing speech-to-text request');

    // Convert base64 to ArrayBuffer
    const audioBuffer = processBase64ToArrayBuffer(audio);
    const audioBlob = new Blob([audioBuffer], { type: mimeType });

    // Create form data for OpenAI API
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to process audio' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    console.log('Speech-to-text completed successfully');

    return new Response(
      JSON.stringify({ text: data.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in speech-to-text function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
