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
    const body = await req.json();
    const { action } = body;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Login
    if (action === "login") {
      const { email, phone, password1, password2 } = body;
      const { data, error } = await supabase
        .from("lawyers")
        .select("id, name, email, phone, district, approved, password1, password2")
        .eq("email", email)
        .eq("phone", phone)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (data.password1 !== password1 || data.password2 !== password2) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid passwords" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!data.approved) {
        return new Response(
          JSON.stringify({ success: false, error: "Your registration is pending approval by the super admin" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          lawyer: { id: data.id, name: data.name, email: data.email, phone: data.phone, district: data.district },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // List all lawyers (for super admin)
    if (action === "list-all") {
      const { data, error } = await supabase
        .from("lawyers")
        .select("id, name, email, phone, district, approved, verification_file_url, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ lawyers: data || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Approve/reject lawyer
    if (action === "approve") {
      const { lawyerId, approved } = body;
      const { error } = await supabase
        .from("lawyers")
        .update({ approved })
        .eq("id", lawyerId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("lawyer-auth error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
