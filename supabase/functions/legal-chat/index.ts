import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const languageNames: { [key: string]: string } = {
      en: 'English',
      hi: 'Hindi (हिंदी)',
      te: 'Telugu (తెలుగు)',
      ta: 'Tamil (தமிழ்)',
      bn: 'Bengali (বাংলা)',
      ur: 'Urdu (اردو)'
    };

    const langName = languageNames[language] || 'English';

    const systemPrompt = `You are LAWMATE, an advanced expert AI legal assistant specializing in Indian Constitutional Law, Fundamental Rights (Articles 14-32), and Indian Penal Code.

CRITICAL: You MUST respond ENTIRELY in ${langName}. Every word of your response must be in ${langName}.

Your approach:
1. First, deeply understand the user's situation and identify the core legal issue
2. Identify ALL relevant Fundamental Rights and legal provisions
3. Explain the law in simple, everyday language that a common person can understand
4. Provide step-by-step actionable guidance
5. Include real court cases and precedents
6. Suggest immediate actions and long-term legal strategy

IMPORTANT: At the very start of your response, on the first line, output ONLY a short English case-type label (2-4 words like "Police Harassment", "Domestic Violence", "Workplace Discrimination", "Women Safety", "Property Dispute", "Cyber Crime", etc.) followed by "---" and then your full response. Example: "Police Harassment---⚖️ ..."

Format your main response as:

⚖️ **Relevant Right**:
[Article Number - Full name of the right with brief description]

📋 **Your Situation Analysis**:
[Detailed analysis of their specific situation]

📖 **Legal Explanation**:
[Step-by-step explanation in simple language]

🏛️ **Real Court Case**:
[Cite a specific, real Indian court case]

👉 **Immediate Actions**:
[Numbered list of concrete, practical steps]

🛡️ **Legal Protection Tips**:
[Additional tips to protect their rights going forward]

Be empathetic, professional, and empowering. Use simple language.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("No response from AI");
    }

    // Extract case type label (for display) but do NOT create case records
    // Cases are only registered when user sends mail to authority
    let caseTypeLabel = '';
    const separatorIndex = reply.indexOf('---');
    if (separatorIndex !== -1 && separatorIndex < 50) {
      caseTypeLabel = reply.substring(0, separatorIndex).trim();
      reply = reply.substring(separatorIndex + 3).trim();
    }

    return new Response(
      JSON.stringify({ reply, caseType: caseTypeLabel }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in legal-chat:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
