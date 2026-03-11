import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalysisRequest {
  imageData: string; // Base64 image of the canvas
  questionText: string;
  subject: string;
  gradeLevel: string;
  rubric?: {
    criteria: Array<{
      id: string;
      name: string;
      description: string;
      maxScore: number;
      levels: Array<{
        level: number;
        label: string;
        teacherDescription: string;
      }>;
    }>;
  };
  submissionId?: string;
}

interface ReasoningStep {
  stepNumber: number;
  type: "identification" | "formula" | "calculation" | "diagram" | "conclusion" | "other";
  content: string;
  evaluation: string;
}

interface AnalysisResult {
  parsedSteps: ReasoningStep[];
  overallEvaluation: {
    conceptualUnderstanding: { score: number; maxScore: number; feedback: string };
    problemSolving: { score: number; maxScore: number; feedback: string };
    mathematicalReasoning: { score: number; maxScore: number; feedback: string };
    communication: { score: number; maxScore: number; feedback: string };
  };
  totalScore: number;
  maxScore: number;
  studentFeedback: {
    strengths: string;
    improvements: string;
    nextStep: string;
  };
  teacherNotes: string;
  analyzedAt: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Authenticate user ────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const { imageData, questionText, subject, gradeLevel, rubric, submissionId }: AnalysisRequest = await req.json();

    if (!imageData || !questionText) {
      throw new Error("Missing required fields: imageData, questionText");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the analysis prompt
    const analysisPrompt = `You are an expert ${gradeLevel} ${subject} teacher analyzing a student's handwritten problem-solving work.

QUESTION:
"${questionText}"

TASK:
Analyze the attached image of the student's handwritten work and:

1. **Parse the student's reasoning**: Identify and order the logical steps the student took, even if they're scattered around the page. Look for:
   - Identification of knowns/unknowns
   - Formulas or equations used
   - Diagrams (free-body diagrams, graphs, sketches)
   - Intermediate calculations
   - Final answer(s)

2. **Evaluate each step**: For each identified step, assess if it's correct and explain why.

3. **Grade using these criteria** (each out of 25 points):
   - **Conceptual Understanding**: Does the student understand the underlying concepts?
   - **Problem Solving Strategy**: Is the approach logical and systematic?
   - **Mathematical Reasoning**: Are calculations correct? Are formulas applied properly?
   - **Communication**: Is the work organized and clearly presented?

4. **Provide student feedback**: 
   - One sentence about what they did well
   - One sentence about what to improve
   - One specific next step

Return a JSON object with this EXACT structure:
{
  "parsedSteps": [
    {
      "stepNumber": 1,
      "type": "identification|formula|calculation|diagram|conclusion|other",
      "content": "What the student wrote/drew (transcribed)",
      "evaluation": "Assessment of this step"
    }
  ],
  "overallEvaluation": {
    "conceptualUnderstanding": { "score": 0-25, "maxScore": 25, "feedback": "..." },
    "problemSolving": { "score": 0-25, "maxScore": 25, "feedback": "..." },
    "mathematicalReasoning": { "score": 0-25, "maxScore": 25, "feedback": "..." },
    "communication": { "score": 0-25, "maxScore": 25, "feedback": "..." }
  },
  "totalScore": 0-100,
  "maxScore": 100,
  "studentFeedback": {
    "strengths": "One sentence about what they did well",
    "improvements": "One sentence about what to improve",
    "nextStep": "One specific actionable next step"
  },
  "teacherNotes": "Additional observations for the teacher about the student's understanding"
}

IMPORTANT:
- Reconstruct the logical order of reasoning, even if work is scattered on the page
- Be encouraging but honest in feedback
- Use age-appropriate language for ${gradeLevel}
- Focus on the problem-solving PROCESS, not just the final answer
- Return ONLY valid JSON, no markdown formatting`;

    console.log("Sending analysis request to AI with vision...");

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
            content: "You are an expert educator who analyzes student problem-solving work with care and precision. Return only valid JSON without markdown code blocks."
          },
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              {
                type: "image_url",
                image_url: {
                  url: imageData, // Base64 data URL
                }
              }
            ]
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI analysis error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Failed to analyze solution");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    console.log("AI response received, parsing...");

    // Parse JSON from response
    let analysisResult: AnalysisResult;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysisResult = JSON.parse(jsonStr.trim());
      analysisResult.analyzedAt = new Date().toISOString();
    } catch (e) {
      console.error("Failed to parse analysis JSON:", e, content);
      throw new Error("Failed to parse AI analysis response");
    }

    // If submissionId provided, update the submission in database
    if (submissionId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey) {
        const supabaseClient = createClient(supabaseUrl, supabaseKey);
        
        const { error: updateError } = await supabaseClient
          .from("student_submissions")
          .update({
            ai_scores: analysisResult.overallEvaluation,
            overall_grade: analysisResult.totalScore,
            ai_feedback: JSON.stringify({
              parsedSteps: analysisResult.parsedSteps,
              studentFeedback: analysisResult.studentFeedback,
              teacherNotes: analysisResult.teacherNotes,
            }),
            grading_completed_at: analysisResult.analyzedAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", submissionId);

        if (updateError) {
          console.error("Error updating submission:", updateError);
        } else {
          console.log("Submission updated successfully");
        }
      }
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("analyze-solution error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
