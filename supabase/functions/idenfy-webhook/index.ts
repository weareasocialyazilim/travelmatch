// @ts-nocheck
/**
 * iDenfy Webhook Handler
 * Receives verification results from iDenfy and updates user profiles
 * SECURITY: HMAC-SHA256 signature verification prevents spoofing
 */
import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'

const IDENFY_API_SECRET = Deno.env.get('IDENFY_API_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-idenfy-signature",
};

/**
 * Verify HMAC-SHA256 signature from iDenfy
 */
async function verifySignature(body: string, signature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(IDENFY_API_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return signature === expectedSignature;
  } catch (error) {
    console.error("[iDenfy] Signature verification error:", error);
    return false;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-idenfy-signature");
    const body = await req.text();

    // 1. Verify HMAC-SHA256 signature
    if (!signature || !(await verifySignature(body, signature))) {
      console.error("[iDenfy] SECURITY ALERT: Invalid signature detected!");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse payload
    const payload = JSON.parse(body);
    const {
      status, // 'APPROVED', 'DENIED', 'SUSPECTED', 'REVIEWING'
      clientId, // Our user_id (externalId)
      scanRef, // iDenfy scan reference for logging
      idenfyRef,
    } = payload.final || payload;

    const userId = clientId || payload.externalId;

    console.log(`[iDenfy] Received webhook: status=${status}, userId=${userId}, scanRef=${scanRef}`);

    // 3. Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 4. Update user profile based on verification status
    if (status === "APPROVED") {
      const { error } = await supabase
        .from("users")
        .update({
          verified: true,
          trust_score: 100, // Initial boost for KYC
          kyc_status: "Verified",
          idenfy_status: "APPROVED",
          idenfy_scan_ref: scanRef || idenfyRef,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("[iDenfy] Profile update error:", error);
        throw error;
      }

      // Log verification success
      await supabase.from("moderation_logs").insert({
        user_id: userId,
        action: "KYC_APPROVED",
        details: { scanRef, provider: "iDenfy" },
        severity: "info",
      });

      console.log(`[iDenfy] User ${userId} verified successfully`);

    } else if (status === "DENIED" || status === "SUSPECTED") {
      const { error } = await supabase
        .from("users")
        .update({
          verified: false,
          kyc_status: status,
          idenfy_status: status,
          idenfy_scan_ref: scanRef || idenfyRef,
        })
        .eq("id", userId);

      if (error) {
        console.error("[iDenfy] Profile update error:", error);
        throw error;
      }

      // Log verification failure
      await supabase.from("moderation_logs").insert({
        user_id: userId,
        action: status === "DENIED" ? "KYC_DENIED" : "KYC_SUSPECTED",
        details: { scanRef, provider: "iDenfy", reason: payload.denyReason || "N/A" },
        severity: status === "DENIED" ? "warning" : "high",
      });

      console.log(`[iDenfy] User ${userId} verification ${status}`);
    }

    return new Response(
      JSON.stringify({ received: true, status }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[iDenfy] Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
