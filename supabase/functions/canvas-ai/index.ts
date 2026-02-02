import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AIAction = "write" | "improve" | "expand" | "summarize" | "fix";

interface RequestBody {
  action: AIAction;
  content?: string;
  prompt?: string;
  blockType?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content, prompt, blockType } = (await req.json()) as RequestBody;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompts: Record<AIAction, string> = {
      write: `You are a business strategist helping create content for a "${blockType || "Business Canvas"}" section. Write clear, actionable, and professional content based on the user's request. Use markdown formatting where appropriate (bold, lists, headings). Be concise but comprehensive.`,
      improve: `You are a business writing expert. Improve the following business canvas content. Make it clearer, more professional, and more actionable while preserving the core message. Use markdown formatting for better readability. Maintain a professional business tone.`,
      expand: `You are a business strategist. Expand on the following business canvas content with more detail, examples, and actionable insights. Add relevant context and considerations. Use markdown formatting with headings and bullet points for clarity.`,
      summarize: `You are a business writer. Summarize the following business canvas content into a concise, impactful statement. Capture the key points in a clear and memorable way. Keep it brief but comprehensive.`,
      fix: `You are an editor. Fix any grammar, spelling, or punctuation errors in the following text while preserving the meaning and tone. Only correct errors, do not change the content or style significantly.`,
    };

    const userContent = action === "write" ? prompt : content;

    if (!userContent) {
      return new Response(
        JSON.stringify({ error: "No content or prompt provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const messages = [
      { role: "system", content: systemPrompts[action] },
      { role: "user", content: userContent },
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Canvas AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
