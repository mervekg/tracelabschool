import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Types ────────────────────────────────────────────────────────────────

interface GradeRequest {
  submissionId: string;
  subject: string;
  gradeLevel: string;
  taskType: string;
  taskPrompt: string;
  rubricText: string;
  markScheme?: string;
  maxPoints: number;
}

interface DimensionScore {
  dimension: string;
  level: string;
  points: number;
  max_points: number;
  teacher_rationale: string;
  student_feedback: string;
}

interface GradeResult {
  per_dimension_scores: DimensionScore[];
  overall: {
    total_points: number;
    max_points: number;
    percent: number;
    summary_for_teacher: string;
    summary_for_student: string;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────

function buildGradingPrompt({
  subject,
  gradeLevel,
  taskType,
  taskPrompt,
  rubricText,
  markScheme,
  studentResponseText,
  maxPoints,
}: {
  subject: string;
  gradeLevel: string;
  taskType: string;
  taskPrompt: string;
  rubricText: string;
  markScheme?: string;
  studentResponseText: string;
  maxPoints: number;
}): string {
  return `
You are an experienced teacher and assessment expert.
You grade student work using the rubric and mark scheme provided by the teacher.
You must be strictly rubric-aligned, transparent, and fair.

CONTEXT
- Subject: ${subject}
- Grade level: ${gradeLevel}
- Task type: ${taskType}

TASK GIVEN TO STUDENTS
${taskPrompt}

OFFICIAL RUBRIC / MARK SCHEME
${rubricText}

Additional marking details (if any):
${markScheme || "None provided."}

TEACHER PREFERENCES
- Prioritize conceptual understanding and reasoning over minor arithmetic or language errors.
- Do not reward correct answers with flawed reasoning.
- For essays, focus on idea clarity, structure, evidence, and audience-appropriate language more than spelling/grammar, unless the rubric says otherwise.
- Be conservative but not harsh: stay within the rubric and avoid inflating scores.
- Never invent facts or assume work that is not shown.

STUDENT RESPONSE (already transcribed from handwriting or file)
${studentResponseText}

YOUR JOB
1. For each rubric dimension, assign a level (e.g., 0–4) and points, and explain why.
2. Compute an overall score out of ${maxPoints} and a percentage.
3. Write teacher-facing rationale and student-facing feedback.

OUTPUT FORMAT
Return ONLY valid JSON in this exact structure, no extra text:
{
  "per_dimension_scores": [
    {
      "dimension": "NAME OF DIMENSION",
      "level": "LEVEL (e.g., 0–4)",
      "points": 0,
      "max_points": 0,
      "teacher_rationale": "Short explanation for the teacher.",
      "student_feedback": "One–two sentences addressed to the student for this dimension."
    }
  ],
  "overall": {
    "total_points": 0,
    "max_points": ${maxPoints},
    "percent": 0,
    "summary_for_teacher": "1–3 sentences explaining the overall judgement and key evidence.",
    "summary_for_student": "2–4 sentences of holistic feedback in student-friendly language."
  }
}
`;
}

/**
 * Normalize an image or PDF into plain text via Mathpix Convert API.
 * Falls back gracefully with a clear error message.
 */
async function normalizeWithMathpix(fileUrl: string): Promise<string> {
  const appId = Deno.env.get("MATHPIX_APP_ID");
  const appKey = Deno.env.get("MATHPIX_APP_KEY");

  if (!appId || !appKey) {
    throw new Error("Mathpix credentials are not configured. Cannot process image/file.");
  }

  console.log("Calling Mathpix for OCR...");

  // Step 1: Submit conversion request
  const submitRes = await fetch("https://api.mathpix.com/v3/text", {
    method: "POST",
    headers: {
      "app_id": appId,
      "app_key": appKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      src: fileUrl,
      formats: ["text"],
      ocr: ["math", "text"],
    }),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text();
    console.error("Mathpix error:", submitRes.status, errText);
    throw new Error(`Mathpix OCR failed (${submitRes.status}). Please try again or paste the text manually.`);
  }

  const result = await submitRes.json();
  const text = result.text || result.latex_styled || "";

  if (!text.trim()) {
    throw new Error("Mathpix could not extract any text from the submitted file. Please paste the text manually.");
  }

  console.log(`Mathpix extracted ${text.length} characters.`);
  return text.trim();
}

// ── Main handler ─────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const body: GradeRequest = await req.json();
    const { submissionId, subject, gradeLevel, taskType, taskPrompt, rubricText, markScheme, maxPoints } = body;

    if (!submissionId) throw new Error("submissionId is required");
    if (!rubricText) throw new Error("rubricText is required");
    if (!maxPoints || maxPoints <= 0) throw new Error("maxPoints must be a positive number");

    // ── Initialize Supabase (service role for DB writes) ─────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Look up submission ───────────────────────────────────────────
    const { data: submission, error: fetchErr } = await supabase
      .from("student_submissions")
      .select("id, student_id, assignment_id, response_text, content, handwriting_image_url, file_url")
      .eq("id", submissionId)
      .single();

    if (fetchErr || !submission) {
      return new Response(JSON.stringify({ error: "Submission not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Normalize to response_text ───────────────────────────────────
    let responseText = submission.response_text || submission.content || "";

    if (!responseText.trim()) {
      const fileSource = submission.handwriting_image_url || submission.file_url;
      if (fileSource) {
        responseText = await normalizeWithMathpix(fileSource);
        // Persist the normalized text
        await supabase
          .from("student_submissions")
          .update({ response_text: responseText })
          .eq("id", submissionId);
      } else {
        return new Response(
          JSON.stringify({ error: "No student content available to grade. The student has not submitted any work." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Call OpenAI GPT-4o ───────────────────────────────────────────
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const gradingPrompt = buildGradingPrompt({
      subject: subject || "General",
      gradeLevel: gradeLevel || "Middle School",
      taskType: taskType || "Assignment",
      taskPrompt: taskPrompt || "Complete the assignment as instructed.",
      rubricText,
      markScheme,
      studentResponseText: responseText,
      maxPoints,
    });

    console.log("Sending grading request to OpenAI GPT-4o...");

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You are an expert educator who grades student work fairly and provides constructive feedback. Return only valid JSON matching the requested schema.",
          },
          { role: "user", content: gradingPrompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("OpenAI error:", openaiRes.status, errText);

      if (openaiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI grading service is temporarily unavailable. Please try again.");
    }

    const aiData = await openaiRes.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) throw new Error("Empty response from AI grading service");

    // ── Parse & validate ─────────────────────────────────────────────
    let gradeResult: GradeResult;
    try {
      // Handle possible markdown code blocks
      const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) || rawContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rawContent;
      gradeResult = JSON.parse(jsonStr.trim());
    } catch {
      console.error("Failed to parse AI JSON response");
      throw new Error("AI returned an invalid grading response. Please try again.");
    }

    if (!gradeResult.per_dimension_scores || !Array.isArray(gradeResult.per_dimension_scores)) {
      throw new Error("Invalid grading response: missing per_dimension_scores");
    }
    if (!gradeResult.overall || typeof gradeResult.overall.total_points !== "number") {
      throw new Error("Invalid grading response: missing overall scores");
    }

    // ── Persist results ──────────────────────────────────────────────
    const { error: updateErr } = await supabase
      .from("student_submissions")
      .update({
        ai_grade_json: gradeResult as unknown as Record<string, unknown>,
        overall_grade: gradeResult.overall.total_points,
        ai_feedback: gradeResult.overall.summary_for_student,
        status: "graded",
        grading_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (updateErr) {
      console.error("Error updating submission:", updateErr);
      // Don't throw – still return result to teacher
    }

    // ── Create student notification ──────────────────────────────────
    // Fetch assignment title for friendly message
    let shortTitle = "your assignment";
    const { data: assignment } = await supabase
      .from("assignments")
      .select("title")
      .eq("id", submission.assignment_id)
      .single();

    if (assignment?.title) {
      shortTitle = assignment.title.length > 40 ? assignment.title.slice(0, 40) + "…" : assignment.title;
    }

    const { error: notifErr } = await supabase.from("notifications").insert({
      student_id: submission.student_id,
      assignment_id: submission.assignment_id,
      message: `Your work on "${shortTitle}" has been graded.`,
      read: false,
    });

    if (notifErr) {
      console.error("Error creating notification:", notifErr);
    }

    console.log("Grading complete. Score:", gradeResult.overall.total_points, "/", gradeResult.overall.max_points);

    return new Response(JSON.stringify(gradeResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("grade-submission error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
