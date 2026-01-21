// @ts-nocheck
/**
 * Get iDenfy Token
 * Generates a single-use auth token for iDenfy SDK session
 */
import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'

const IDENFY_API_KEY = Deno.env.get("IDENFY_API_KEY")!;
const IDENFY_API_SECRET = Deno.env.get("IDENFY_API_SECRET")!;
const IDENFY_BASE_URL = "https://ivs.idenfy.com/api/v2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Get user profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // 3. Create iDenfy verification session
    const credentials = btoa(`${IDENFY_API_KEY}:${IDENFY_API_SECRET}`);
    
    const idenfyResponse = await fetch(`${IDENFY_BASE_URL}/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: user.id, // Our internal user ID
        firstName: profile?.full_name?.split(" ")[0] || "",
        lastName: profile?.full_name?.split(" ").slice(1).join(" ") || "",
        // Callback URL for webhook
        callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/idenfy-webhook`,
        // Optional: country restrictions
        // country: "TR",
      }),
    });

    if (!idenfyResponse.ok) {
      const errorData = await idenfyResponse.text();
      console.error("[iDenfy] Token creation failed:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to create verification session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await idenfyResponse.json();

    // 4. Log verification attempt
    await supabase.from("moderation_logs").insert({
      user_id: user.id,
      action: "KYC_INITIATED",
      details: { scanRef: tokenData.scanRef, provider: "iDenfy" },
      severity: "info",
    });

    console.log(`[iDenfy] Token generated for user ${user.id}`);

    return new Response(
      JSON.stringify({
        authToken: tokenData.authToken,
        scanRef: tokenData.scanRef,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[iDenfy] Token generation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
