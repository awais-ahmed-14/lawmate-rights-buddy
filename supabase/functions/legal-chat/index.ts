import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt with legal expertise and scenario detection
    const languageNames: { [key: string]: string } = {
      en: 'English',
      hi: 'Hindi (हिंदी)',
      te: 'Telugu (తెలుగు)',
      ta: 'Tamil (தமிழ்)',
      bn: 'Bengali (বাংলা)'
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

Format your response as:

⚖️ **Relevant Right / कानूनी अधिकार**:
[Article Number - Full name of the right with brief description]

📋 **Your Situation Analysis / स्थिति विश्लेषण**:
[Detailed analysis of their specific situation - explain what happened in legal terms, why it matters, and how the law views this]

📖 **Legal Explanation / कानूनी व्याख्या**:
[Step-by-step explanation in simple language:
  Step 1: What the law says about this
  Step 2: How it applies to your case
  Step 3: What protections you have
  Step 4: What the other party is legally required to do]

🏛️ **Real Court Case / वास्तविक उदाहरण**:
[Cite a specific, real Indian court case with year, parties, and outcome that is similar to the user's situation]

👉 **Immediate Actions / तुरंत करने योग्य कदम**:
[Numbered list of concrete, practical steps the user should take RIGHT NOW:
  1. First immediate action
  2. Second action
  3. Third action
  4. Where to go / whom to contact
  5. Important helpline numbers]

🛡️ **Legal Protection Tips / कानूनी सुरक्षा सुझाव**:
[Additional tips to protect their rights going forward]

Be empathetic, professional, and empowering. Use simple language. The user may be scared or confused - reassure them that the law is on their side.`;

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
        max_tokens: 1000,
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
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("No response from AI");
    }

    return new Response(
      JSON.stringify({ reply }),
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
