import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GradingRequest {
  submissionId: string;
  studentContent: string;
  rubric: {
    name: string;
    totalPoints: number;
    criteria: Array<{
      id: string;
      name: string;
      description: string;
      weight: number;
      maxScore: number;
      levels: Array<{
        level: number;
        label: string;
        teacherDescription: string;
      }>;
    }>;
  };
  gradeLevel: string;
  subject: string;
}

interface CriterionScore {
  criterionId: string;
  criterionName: string;
  levelAwarded: number;
  score: number;
  maxScore: number;
  aiJustification: string;
}

interface GradingResult {
  scores: CriterionScore[];
  overallGrade: number;
  overallPoints: number;
  totalPoints: number;
  feedback: {
    strengths: string;
    improvements: string;
    nextStep: string;
  };
  gradedAt: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const { submissionId, studentContent, rubric, gradeLevel, subject }: GradingRequest = await req.json();

    if (!studentContent || !rubric || !rubric.criteria?.length) {
      throw new Error("Missing required fields: studentContent, rubric with criteria");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the rubric context for AI
    const rubricContext = rubric.criteria.map(criterion => {
      const levelDescriptions = criterion.levels
        .sort((a, b) => b.level - a.level)
        .map(level => `  Level ${level.level} (${level.label}): ${level.teacherDescription}`)
        .join("\n");
      
      return `
**${criterion.name}** (${criterion.maxScore} points, weight: ${criterion.weight}x)
${criterion.description}
Scoring Levels:
${levelDescriptions}`;
    }).join("\n\n");

    const gradingPrompt = `You are an expert ${gradeLevel} ${subject} teacher grading a student's handwritten work that has been converted to text.

RUBRIC: "${rubric.name}" (${rubric.totalPoints} total points)
${rubricContext}

STUDENT'S WORK:
"""
${studentContent}
"""

GRADING INSTRUCTIONS:
1. For EACH criterion, assign a level (1-4) based on the descriptions provided.
2. Provide a ONE-SENTENCE justification for each score that a student can understand.
3. Calculate scores: (level_awarded / 4) × max_score for each criterion.
4. Apply weights when calculating the overall grade.
5. Generate student feedback: what they did well (1 sentence), what to improve (1 sentence), and a specific next step (1 sentence).

Return a JSON object with this EXACT structure:
{
  "scores": [
    {
      "criterionId": "criterion-id-here",
      "criterionName": "Criterion Name",
      "levelAwarded": 3,
      "score": 18.75,
      "maxScore": 25,
      "aiJustification": "Your paragraph included good details about your weekend activities."
    }
  ],
  "overallGrade": 78.5,
  "overallPoints": 78.5,
  "totalPoints": 100,
  "feedback": {
    "strengths": "You used excellent descriptive vocabulary and included specific details about your experiences.",
    "improvements": "Work on making your opening sentence more engaging to grab the reader's attention.",
    "nextStep": "Try starting your next paragraph with a question or interesting fact."
  }
}

IMPORTANT:
- Use age-appropriate language for ${gradeLevel}
- Be encouraging but honest
- Justifications should be specific to the student's actual work
- Return ONLY valid JSON, no markdown formatting`;

    console.log("Sending grading request to AI...");

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
            content: "You are an expert educator who grades student work fairly and provides constructive feedback. Return only valid JSON without markdown code blocks." 
          },
          { role: "user", content: gradingPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent grading
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI grading error:", response.status, errorText);
      
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
      throw new Error("Failed to grade submission");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    console.log("AI response received, parsing...");

    // Parse JSON from response (handle potential markdown code blocks)
    let gradingResult: GradingResult;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      gradingResult = JSON.parse(jsonStr.trim());
      gradingResult.gradedAt = new Date().toISOString();
    } catch (e) {
      console.error("Failed to parse grading JSON:", e, content);
      throw new Error("Failed to parse AI grading response");
    }

    // Validate the response structure
    if (!gradingResult.scores || !Array.isArray(gradingResult.scores)) {
      throw new Error("Invalid grading response: missing scores array");
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
            ai_scores: gradingResult.scores,
            overall_grade: gradingResult.overallGrade,
            ai_feedback: JSON.stringify(gradingResult.feedback),
            grading_completed_at: gradingResult.gradedAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", submissionId);

        if (updateError) {
          console.error("Error updating submission:", updateError);
          // Don't throw - we still want to return the grading result
        } else {
          console.log("Submission updated successfully");
        }
      }
    }

    return new Response(JSON.stringify(gradingResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("grade-submission error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
