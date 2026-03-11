import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  zh: "Chinese (Simplified)",
  fr: "French",
  tr: "Turkish",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Authenticate user ────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.7.1");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let reqBody: Record<string, unknown>;
    try {
      reqBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const text = typeof reqBody.text === 'string' ? reqBody.text : undefined;
    const texts = Array.isArray(reqBody.texts) ? reqBody.texts.filter((t: unknown) => typeof t === 'string') as string[] : undefined;
    const targetLanguage = typeof reqBody.targetLanguage === 'string' ? reqBody.targetLanguage : '';

    if (!targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'targetLanguage is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

    // Handle batch translation
    if (texts && Array.isArray(texts)) {
      const prompt = `Translate the following texts to ${targetLangName}. Return ONLY a JSON array of translated strings, in the same order as the input. Do not include any explanation or markdown formatting.

Input texts:
${JSON.stringify(texts, null, 2)}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a professional translator. Translate text accurately while preserving meaning, tone, and formatting. For educational content, use age-appropriate vocabulary. Return only the translation without any explanations.`,
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "[]";
      
      // Parse the JSON array from the response
      let translatedTexts: string[];
      try {
        // Remove markdown code blocks if present
        const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
        translatedTexts = JSON.parse(cleanContent);
      } catch {
        console.error("Failed to parse batch translation:", content);
        translatedTexts = texts; // Return original on parse error
      }

      return new Response(JSON.stringify({ translatedTexts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle single text translation
    if (!text) {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate text accurately to ${targetLangName} while preserving meaning, tone, and formatting. For educational content, use age-appropriate vocabulary. Return ONLY the translated text without any explanations, quotes, or additional formatting.`,
          },
          {
            role: "user",
            content: `Translate to ${targetLangName}: ${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim() || text;

    return new Response(JSON.stringify({ translatedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
