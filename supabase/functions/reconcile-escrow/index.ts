/**
 * Supabase Edge Function: reconcile-escrow
 *
 * Reconciles PayTR payment records with escrow DB state
 * Detects mismatches and creates repair records
 *
 * Run via: pg_cron or manual trigger
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';

interface ReconciliationResult {
  checkedCount: number;
  mismatchesFound: number;
  repairsCreated: number;
  errors: string[];
  details: MismatchDetail[];
}

interface MismatchDetail {
  escrowId: string;
  merchantOid: string;
  dbStatus: string;
  expectedStatus: string;
  repairAction: string;
}

serve(async (req) => {
  const logger = createLogger('reconcile-escrow', req);
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow service role or cron
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.includes('service_role') && req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const result: ReconciliationResult = {
      checkedCount: 0,
      mismatchesFound: 0,
      repairsCreated: 0,
      errors: [],
      details: [],
    };

    // Get all pending/processing escrows
    const { data: escrows, error: fetchError } = await supabase
      .from('escrow_transactions')
      .select('id, merchant_oid, status, amount, created_at')
      .in('status', ['pending', 'processing']);

    if (fetchError) {
      throw new Error(`Failed to fetch escrows: ${fetchError.message}`);
    }

    result.checkedCount = escrows?.length || 0;

    // Check each escrow against PayTR records
    for (const escrow of escrows || []) {
      try {
        // Check if we have PayTR payment record
        const { data: paytrRecord } = await supabase
          .from('paytr_payments')
          .select('status, merchant_oid')
          .eq('merchant_oid', escrow.merchant_oid)
          .single();

        const dbStatus = escrow.status;
        let expectedStatus = 'pending';
        let repairAction = 'none';

        if (paytrRecord) {
          // PayTR says completed but DB says pending
          if (paytrRecord.status === 'completed' && dbStatus === 'pending') {
            expectedStatus = 'released';
            repairAction = 'auto_release';
          }
          // PayTR says failed but DB says pending
          else if (paytrRecord.status === 'failed' && dbStatus === 'pending') {
            expectedStatus = 'refunded';
            repairAction = 'auto_refund';
          }
        }

        // Check for expired escrows
        const expiresAt = new Date(escrow.created_at);
        expiresAt.setDate(expiresAt.getDate() + 7);

        if (expiresAt < new Date() && dbStatus === 'pending') {
          expectedStatus = 'refunded';
          repairAction = 'expired_refund';
        }

        if (dbStatus !== expectedStatus && repairAction !== 'none') {
          result.mismatchesFound++;

          const detail: MismatchDetail = {
            escrowId: escrow.id,
            merchantOid: escrow.merchant_oid || 'none',
            dbStatus,
            expectedStatus,
            repairAction,
          };
          result.details.push(detail);

          // Create repair record
          const { error: repairError } = await supabase
            .from('escrow_repairs')
            .insert({
              escrow_id: escrow.id,
              mismatch_type: `${dbStatus}_to_${expectedStatus}`,
              detected_at: new Date().toISOString(),
              auto_repaired: true,
              repair_action: repairAction,
              metadata: { paytr_status: paytrRecord?.status },
            });

          if (!repairError && repairAction === 'auto_release') {
            await supabase.rpc('release_escrow', { p_escrow_id: escrow.id });
            result.repairsCreated++;
          } else if (!repairError && repairAction === 'auto_refund') {
            await supabase.rpc('refund_escrow', { p_escrow_id: escrow.id });
            result.repairsCreated++;
          } else if (!repairError && repairAction === 'expired_refund') {
            await supabase.rpc('refund_escrow', {
              p_escrow_id: escrow.id,
              p_reason: 'auto_refund_expired',
            });
            result.repairsCreated++;
          }
        }
      } catch (escrowError) {
        result.errors.push(`Escrow ${escrow.id}: ${escrowError}`);
      }
    }

    // Log reconciliation result
    logger.info('Escrow reconciliation completed', {
      checkedCount: result.checkedCount,
      mismatchesFound: result.mismatchesFound,
      repairsCreated: result.repairsCreated,
    });

    return new Response(
      JSON.stringify({
        success: result.errors.length === 0,
        message: `Reconciliation: ${result.checkedCount} checked, ${result.mismatchesFound} mismatches, ${result.repairsCreated} repairs`,
        result,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Reconciliation error', error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
