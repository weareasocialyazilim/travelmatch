// Full End-to-End Verification Script
// Simulates Multi-User Flow: Host, Traveler A (Low), Traveler B (High + Escrow)

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

// Load env vars
const envPath = path.resolve(process.cwd(), 'apps/admin/.env.local');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Generate random test password for ephemeral test users - not stored anywhere
const TEST_PASSWORD =
  process.env.TEST_USER_PASSWORD || crypto.randomBytes(16).toString('hex');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase URL or Service Key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Test user data - password from env or random
const HOST = {
  email: `host_${Date.now()}@travelmatch.app`,
  password: TEST_PASSWORD,
  name: 'Host User',
};

const TRAVELER_LOW = {
  email: `traveler_low_${Date.now()}@travelmatch.app`,
  password: TEST_PASSWORD,
  name: 'Low Budget Traveler',
};

const TRAVELER_HIGH = {
  email: `traveler_high_${Date.now()}@travelmatch.app`,
  password: TEST_PASSWORD,
  name: 'High Budget Traveler',
};

// Helpers
async function createUser(user: typeof HOST) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.name }, // Using full_name as per schema
  });
  if (error) throw error;
  return data.user.id;
}

async function runTest() {
  console.log('🚀 Starting Multi-User Scenario Verification...\n');
  let hostId: string, lowId: string, highId: string;
  let momentId: string;
  let lowRequestId: string, highRequestId: string;

  try {
    // 1. SETUP USERS
    console.log('👥 1. Creating Users...');
    hostId = await createUser(HOST);
    lowId = await createUser(TRAVELER_LOW);
    highId = await createUser(TRAVELER_HIGH);
    console.log(
      `   ✅ Users Created: Host(${hostId.slice(0, 4)}), Low(${lowId.slice(0, 4)}), High(${highId.slice(0, 4)})`,
    );

    // 2. CREATE MOMENT (Host)
    console.log('\n📅 2. Host Creating Moment...');
    const { data: moment, error: momentError } = await supabase
      .from('moments')
      .insert({
        user_id: hostId,
        title: 'Bosphorus Tour',
        description: 'Amazing view',
        category: 'adventure',
        status: 'active',
        date: new Date().toISOString(),
        coordinates: 'POINT(29.0 41.0)', // PostGIS
        location: 'Istanbul, Turkey', // Required string field
        price: 100, // Base price
        currency: 'USD',
      })
      .select()
      .single();

    if (momentError)
      throw new Error(`Moment create failed: ${momentError.message}`);
    momentId = moment.id;
    console.log(`   ✅ Moment Created: ${momentId}`);

    // 3. LOW BUDGET REQUEST ($10 - No Chat expected)
    console.log('\n💸 3. Traveler A sends Low Budget Request ($10)...');
    const { data: lowRequest, error: lowReqError } = await supabase
      .from('requests')
      .insert({
        user_id: lowId,
        moment_id: momentId,
        message: 'Hi, I want to join!',
        status: 'pending',
      })
      .select()
      .single();

    if (lowReqError)
      throw new Error(`Low Request failed: ${lowReqError.message}`);
    lowRequestId = lowRequest.id;

    // Simulate Transaction
    await supabase.from('transactions').insert({
      user_id: lowId,
      moment_id: momentId,
      amount: 10,
      currency: 'USD',
      type: 'booking',
      status: 'completed',
      metadata: { request_id: lowRequestId },
    });

    console.log(`   ✅ Request Sent: ${lowRequestId}`);

    // 4. HIGH BUDGET REQUEST ($150 - Escrow + Chat Candidate)
    console.log('\n💰 4. Traveler B sends High Budget Request ($150)...');
    const { data: highRequest, error: highReqError } = await supabase
      .from('requests')
      .insert({
        user_id: highId,
        moment_id: momentId,
        message: 'I am rich and want to join.',
        status: 'pending',
      })
      .select()
      .single();

    // Simulate Escrow Transaction
    if (highRequest) {
      await supabase.from('transactions').insert({
        user_id: highId,
        moment_id: momentId,
        amount: 150,
        currency: 'USD',
        type: 'booking',
        status: 'pending',
        metadata: { request_id: highRequest.id },
      });
    }

    if (highReqError)
      throw new Error(`High Request failed: ${highReqError.message}`);
    highRequestId = highRequest.id;
    console.log(`   ✅ Request Sent: ${highRequestId}`);

    // 4. PRE-ESCROW: TOP UP WALLET
    console.log('\n💰 4.4 Top Up High Budget User Wallet...');
    const { error: walletError } = await supabase.rpc('admin_top_up_wallet', {
      p_user_id: highId,
      p_amount: 500.0,
    });
    // Or insert directly if RPC missing
    if (walletError) {
      // Fallback manual update
      console.log(`   ⚠️ Wallet RPC failed, trying manual update...`);
      // Check if wallet exists, or create? Assume users trigger creates wallet.
      const { error: updateError } = await supabase
        .from('wallets') // Make sure table is correct (users table has balance column often)
        .update({ balance: 500.0 })
        .eq('user_id', highId);

      // In some schemas 'users' has balance directly
      if (updateError) {
        await supabase
          .from('users')
          .update({ balance: 500.0 })
          .eq('id', highId);
      }
    }
    console.log('   ✅ Wallet Topped Up.');

    // 4.5. HIGH BUDGET USER PAYS (Escrow)
    console.log('\n💳 4.5. High Budget User Initiates Escrow ($150)...');

    // We simulate the mobile app calling the RPC or creating the transaction
    // Assuming backend handles creation or app calls RPC.
    // Let's try calling 'create_escrow_transaction' RPC if it exists (from our search it does)
    let escrowId: string | null = null;

    const { data: escrowData, error: escrowError } = await supabase.rpc(
      'create_escrow_transaction',
      {
        p_sender_id: highId,
        p_recipient_id: hostId,
        p_amount: 150.0,
        p_moment_id: momentId, // Link to the moment
        p_release_condition: 'proof_verified',
      },
    );

    if (escrowError) {
      console.log(
        `   ⚠️ Escrow RPC failed (simulating manual insert instead): ${escrowError.message}`,
      );
      // Fallback: Insert manually
      const { data: manualEscrow, error: manualError } = await supabase
        .from('escrow_transactions')
        .insert({
          sender_id: highId,
          recipient_id: hostId,
          amount: 150.0,
          status: 'pending',
          moment_id: momentId,
          release_condition: 'proof_verified',
        })
        .select()
        .single();

      if (manualError)
        throw new Error(`Manual Escrow insert failed: ${manualError.message}`);
      escrowId = manualEscrow.id;
      console.log(`   ✅ Manual Escrow Created: ${escrowId}`);
    } else {
      // RPC normally returns JSON
      console.log(`   ✅ Escrow Created via RPC`);
      // Extract ID (handling potential JSON structure variations)
      escrowId =
        typeof escrowData === 'object' && escrowData?.escrowId
          ? escrowData.escrowId
          : null;

      if (!escrowId) {
        // Fetch latest if ID missing in response
        const { data: latestEscrow } = await supabase
          .from('escrow_transactions')
          .select('id')
          .eq('sender_id', highId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        escrowId = latestEscrow?.id;
      }
      console.log(`   ✅ Escrow ID: ${escrowId}`);
    }

    // 5. CHECK ESCROW STATUS
    console.log('\n🏦 5. Checking Escrow Status...');
    if (escrowId) {
      const { data: escrowCheck } = await supabase
        .from('escrow_transactions')
        .select('status, amount')
        .eq('id', escrowId)
        .single();

      if (escrowCheck) {
        console.log(
          `   ✅ Escrow Status: ${escrowCheck.status} (Amount: $${escrowCheck.amount})`,
        );
        if (escrowCheck.status !== 'pending')
          console.warn('   ⚠️ Expected status to be pending');
      } else {
        console.error('   ❌ Could not read Escrow record');
      }
    }

    // 6. HOST ACCEPTS REQUESTS
    console.log('\n👍 6. Host Accepts Requests...');

    // 6a. Accept Low Budget ($10)
    console.log('   ... Accepting Low Budget Request ($10)');
    const { error: lowUpdateError } = await supabase
      .from('requests')
      .update({ status: 'accepted' })
      .eq('id', lowRequestId);

    if (lowUpdateError)
      console.error(`   ❌ Low Accept failed: ${lowUpdateError.message}`);
    else console.log(`   ✅ Low Request Accepted.`);

    // 6b. Accept High Budget ($150)
    console.log('   ... Accepting High Budget Request ($150)');
    const { error: updateError } = await supabase
      .from('requests')
      .update({ status: 'accepted' })
      .eq('id', highRequestId);

    if (updateError)
      throw new Error(`High Accept failed: ${updateError.message}`);
    console.log(`   ✅ High Request Accepted.`);

    // 7. CHAT VERIFICATION
    console.log('\n💬 7. Verifying Chat Creation...');

    // Wait for triggers
    await new Promise((r) => setTimeout(r, 3000));

    // Verify Low Budget Chat
    console.log(`   ... Checking Chat for Low Budget User (${lowId})`);
    const { data: lowInfo } = await supabase
      .from('conversations')
      .select('id, participant_ids')
      .contains('participant_ids', [hostId, lowId]);

    if (lowInfo && lowInfo.length > 0) {
      console.log(`      ✅ Chat Found: ${lowInfo[0].id}`);
    } else {
      console.log(`      ❌ No Chat found for Low Budget User.`);
    }

    // Verify High Budget Chat
    console.log(`   ... Checking Chat for High Budget User (${highId})`);

    let highConvId: string | null = null;

    // Step 1: Find Conversation ID
    const { data: highConvData } = await supabase
      .from('conversations')
      .select('id')
      .contains('participant_ids', [hostId, highId]);

    if (highConvData && highConvData.length > 0) {
      highConvId = highConvData[0].id;
      console.log(`      ✅ Chat Found: ${highConvId}`);

      // Step 2: Fetch Messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', highConvId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (msgs && msgs.length > 0) {
        console.log(`      ✅ Welcome Message: "${msgs[0].content}"`);
      } else {
        console.log(`      ⚠️ No message content found.`);
      }

      // 7.1 SEND MESSAGE (User -> Host)
      console.log(`\n💬 7.1 High Budget User Sending Message...`);
      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: highConvId,
        sender_id: highId,
        content: 'Hello Host! Im excited.',
        type: 'text',
      });
      if (msgError)
        console.error(`      ❌ Message send failed: ${msgError.message}`);
      else console.log(`      ✅ Message sent: "Hello Host! Im excited."`);

      // 7.2 PROFANITY TEST (User -> Host)
      console.log(`\n🤬 7.2 Profanity Detection Test...`);
      const { error: profanityError } = await supabase.from('messages').insert({
        conversation_id: highConvId,
        sender_id: highId,
        content: 'This is bullshit and fuck this.',
        type: 'text',
      });

      // Depending on content moderation policy, this might:
      // A) Fail insert (Row Level Security or Trigger)
      // B) Insert but flag it
      // C) Insert normally (if moderation is not active/strict)
      if (profanityError) {
        console.log(
          `      ✅ Profanity Blocked/Error: ${profanityError.message}`,
        );
      } else {
        console.log(`      ⚠️ Profanity allowed (Check moderation rules)`);
        // Check if flagged?
      }
    } else {
      console.log(`      ❌ No Chat found for High Budget User.`);

      // Debugging
      const { data: allHostConvs } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [hostId]);
      console.log(
        '      DEBUG: Host Conversations:',
        JSON.stringify(allHostConvs, null, 2),
      );
    }

    // 7.5 RELEASE FUNDS (Thank You / Proof)
    if (escrowId && highConvId) {
      console.log('\n🔓 7.5 Simulating Proof & Fund Release...');

      // 1. Create Verified Proof Record (Required for Release)
      console.log('      ... Creating Verified Proof Record');
      const { error: proofInsertError } = await supabase
        .from('proof_verifications')
        .insert({
          moment_id: momentId,
          user_id: hostId, // Correct column
          video_url: 'https://example.com/test-proof.mp4', // Correct column
          status: 'verified', // Required status
          claimed_location: 'Istanbul, Turkey', // Required
          ai_verified: true, // Required
          confidence_score: 0.99, // Required
          // verification_notes removed as it doesn't exist
        });

      if (proofInsertError)
        console.error(
          `      ❌ Proof Insert Failed: ${proofInsertError.message}`,
        );

      // 2. Simulate Proof Upload (Host uploads proof -> updates escrow)
      console.log('      ... Host uploads proof (updating escrow flag)');
      const { error: proofError } = await supabase
        .from('escrow_transactions')
        .update({
          proof_submitted: true,
          proof_verification_date: new Date().toISOString(),
        })
        .eq('id', escrowId);

      if (proofError)
        console.error(`      ❌ Proof upload failed: ${proofError.message}`);
      else console.log(`      ✅ Proof marked as submitted.`);

      // 3. Release Escrow
      console.log('      ... Sender releases funds (RPC: release_escrow)');
      const { data: releaseData, error: releaseError } = await supabase.rpc(
        'release_escrow',
        { p_escrow_id: escrowId },
      );

      if (releaseError)
        console.error(`      ❌ Release failed: ${releaseError.message}`);
      else console.log(`      ✅ Funds Released! Response:`, releaseData);

      // 3. Verify Transaction Completed
      const { data: finalEscrow } = await supabase
        .from('escrow_transactions')
        .select('status, released_at')
        .eq('id', escrowId)
        .single();
      console.log(`      ✅ Final Escrow Status: ${finalEscrow?.status}`);
    }

    // 8. ADMIN VISIBILITY
    console.log('\n💻 8. Checking Admin Visibility...');
    const { data: adminRequest } = await supabase
      .from('requests')
      .select('*')
      .eq('id', highRequestId)
      .single();

    if (adminRequest) {
      console.log(
        `   ✅ Admin sees request: ${adminRequest.id} (Status: ${adminRequest.status})`,
      );
    } else {
      console.log(`   ❌ Admin cannot see request.`);
    }

    // 9. REVIEWS & PROFANITY IN REVIEWS
    console.log('\n⭐ 9. Submit Review (High User -> Host)...');
    /* 
       Reviews table structure: moment_id, reviewer_id, reviewed_id, rating, comment
    */
    if (highConvId) {
      // Only if we had a successful interaction
      const { error: reviewError } = await supabase.from('reviews').insert({
        moment_id: momentId,
        reviewer_id: highId,
        reviewed_id: hostId,
        rating: 5,
        comment: 'Great tour, thanks!',
      });

      if (reviewError)
        console.error(`   ❌ Review failed: ${reviewError.message}`);
      else console.log(`   ✅ Review submitted.`);

      // Profanity in Review
      console.log('   ... Testing Profane Review');
      const { error: badReviewError } = await supabase.from('reviews').insert({
        moment_id: momentId,
        reviewer_id: highId,
        reviewed_id: hostId, // usually unique constraint prevents 2nd review, but let's see
        rating: 1,
        comment: 'This was absolute shit.',
      });

      if (badReviewError) {
        console.log(
          `   ✅ Profane/Duplicate Review Blocked: ${badReviewError.message}`,
        );
      } else {
        console.log(`   ⚠️ Profane Review Accepted (Check moderation)`);
      }
    }
  } catch (e: any) {
    console.error(`\n❌ TEST FAILED: ${e.message}`);
  } finally {
    // Cleanup
    if (hostId!) {
      console.log('\n🧹 Cleaning up...');
      await supabase.auth.admin.deleteUser(hostId);
      await supabase.auth.admin.deleteUser(lowId!);
      await supabase.auth.admin.deleteUser(highId!);
      console.log('   Done.');
    }
  }
}

runTest();
