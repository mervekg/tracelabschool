import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RubricRequest {
  assignmentContent?: string;
  gradeLevel: string;
  subject: string;
  customInstructions?: string;
  questionType?: "initial" | "followup";
  previousAnswers?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      assignmentContent, 
      gradeLevel, 
      subject, 
      customInstructions,
      questionType = "initial",
      previousAnswers 
    }: RubricRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // If this is an initial request with assignment content, first ask clarifying questions
    if (questionType === "initial" && assignmentContent) {
      const questionPrompt = `You are an expert educator helping teachers create rubrics. Based on this assignment/worksheet content for ${gradeLevel} ${subject}, generate 2-3 clarifying questions to help create a better rubric.

Assignment Content:
${assignmentContent}

Generate questions about:
1. Learning objectives or skills being assessed
2. Any specific criteria the teacher wants to emphasize
3. Whether they prefer analytic (detailed categories) or holistic rubric style

Return a JSON object with this exact structure:
{
  "questions": [
    { "id": "q1", "question": "What is the main learning objective?", "type": "text" },
    { "id": "q2", "question": "Which skills should be weighted more heavily?", "options": ["Content", "Organization", "Mechanics"], "type": "multiselect" }
  ]
}`;

      const questionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are an expert educator. Return only valid JSON." },
            { role: "user", content: questionPrompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!questionResponse.ok) {
        const errorText = await questionResponse.text();
        console.error("AI question generation error:", questionResponse.status, errorText);
        
        if (questionResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (questionResponse.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("Failed to generate questions");
      }

      const questionData = await questionResponse.json();
      const content = questionData.choices?.[0]?.message?.content;
      
      // Parse JSON from response (handle markdown code blocks)
      let questions;
      try {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : content;
        questions = JSON.parse(jsonStr.trim());
      } catch {
        // Fallback questions if parsing fails
        questions = {
          questions: [
            { id: "q1", question: "What is the primary learning objective for this assignment?", type: "text" },
            { id: "q2", question: "Which aspects should be weighted most heavily in grading?", type: "text" },
          ]
        };
      }

      return new Response(JSON.stringify({ type: "questions", data: questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate the rubric
    const rubricPrompt = `You are an expert educator creating a comprehensive grading rubric for ${gradeLevel} ${subject}.

${assignmentContent ? `Assignment/Worksheet Content:\n${assignmentContent}\n` : ""}
${customInstructions ? `Teacher's Instructions: ${customInstructions}\n` : ""}
${previousAnswers ? `Teacher's Preferences:\n${Object.entries(previousAnswers).map(([q, a]) => `- ${q}: ${a}`).join('\n')}\n` : ""}

Create a detailed, age-appropriate rubric with:
1. 4-6 evaluation categories appropriate for the assignment
2. Clear, measurable criteria for each category
3. Point values that total 100 points
4. Grade-level appropriate language and expectations

For ${gradeLevel}:
- Use vocabulary and complexity suitable for the grade
- Consider developmental stages and common learning standards
- Align with typical ${subject} curriculum expectations

Return a JSON object with this exact structure:
{
  "name": "Rubric Title",
  "categories": [
    {
      "name": "Category Name",
      "maxScore": 25,
      "description": "Brief description of what this category measures",
      "criteria": {
        "excellent": "Description for full points",
        "good": "Description for most points",
        "developing": "Description for partial points",
        "needs_improvement": "Description for minimal points"
      }
    }
  ],
  "totalPoints": 100,
  "notes": "Any additional notes for the teacher"
}`;

    const rubricResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert educator who creates comprehensive, age-appropriate rubrics. Return only valid JSON." },
          { role: "user", content: rubricPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!rubricResponse.ok) {
      const errorText = await rubricResponse.text();
      console.error("AI rubric generation error:", rubricResponse.status, errorText);
      
      if (rubricResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (rubricResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Failed to generate rubric");
    }

    const rubricData = await rubricResponse.json();
    const rubricContent = rubricData.choices?.[0]?.message?.content;

    // Parse JSON from response
    let rubric;
    try {
      const jsonMatch = rubricContent.match(/```json\s*([\s\S]*?)\s*```/) || rubricContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rubricContent;
      rubric = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error("Failed to parse rubric JSON:", e, rubricContent);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ type: "rubric", data: rubric }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-rubric error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
