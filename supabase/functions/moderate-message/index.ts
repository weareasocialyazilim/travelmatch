/**
 * Supabase Edge Function: moderate-message
 *
 * Comprehensive content moderation for messages including:
 * - Text toxicity analysis
 * - Off-platform contact detection
 * - Harassment/coercion detection
 * - Manipulation pattern detection
 * - PII redaction
 *
 * Returns structured moderation result with allow/block/warn decision.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';

interface ModerateMessageRequest {
  content: string;
  conversationId: string;
  messageType: 'text' | 'image' | 'short_video' | 'emoji';
  context?: {
    previousMessages?: string[];
    userHistory?: string[];
  };
}

interface ModerationResult {
  allowed: boolean;
  decision: 'allow' | 'block' | 'warn' | 'review';
  reasons: string[];
  confidence: number;
  flags: ModerationFlag[];
  redactedContent?: string;
  suggestions?: string[];
}

interface ModerationFlag {
  type: 'toxicity' | 'harassment' | 'coercion' | 'manipulation' | 'pii' | 'off_platform' | 'spam';
  severity: 'low' | 'medium' | 'high' | 'critical';
  matched?: string;
  confidence: number;
}

// P2 FIX: Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const RETRYABLE_ERRORS = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];

serve(async (req) => {
  const logger = createLogger('moderate-message', req);
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const body: ModerateMessageRequest = await req.json();
    const { content, conversationId, messageType, context } = body;

    if (!content || !conversationId) {
      return new Response(
        JSON.stringify({ error: 'content and conversationId are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // P2 FIX: Implement retry mechanism for moderation failures
    let result: ModerationResult | null = null;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Run moderation
        result = await moderateContent(content, context);
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        const isRetryable = RETRYABLE_ERRORS.some(
          (code) => error.message.includes(code) || lastError?.name?.includes(code)
        );

        if (!isRetryable) {
          // Non-retryable error, throw immediately
          throw error;
        }

        if (attempt < MAX_RETRIES) {
          // Retry with exponential backoff
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          logger.warn(`Moderation attempt ${attempt} failed, retrying in ${delay}ms`, {
            error: error.message,
            userId: user.id,
            conversationId,
          });
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (!result) {
      throw lastError || new Error('Moderation failed after all retries');
    }

    // Log moderation result
    await logModerationResult(supabase, user.id, conversationId, content, result);

    logger.info('Message moderated', {
      userId: user.id,
      conversationId,
      decision: result.decision,
      flagsCount: result.flags.length,
    });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Moderation failed', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function moderateContent(
  content: string,
  context?: { previousMessages?: string[]; userHistory?: string[] }
): Promise<ModerationResult> {
  const flags: ModerationFlag[] = [];
  const reasons: string[] = [];
  let overallConfidence = 0;

  // 1. Off-platform detection (high confidence, always block)
  const offPlatformFlags = detectOffPlatform(content);
  if (offPlatformFlags.length > 0) {
    flags.push(...offPlatformFlags);
    reasons.push('Off-platform contact information detected');
    overallConfidence = Math.max(overallConfidence, 0.95);
  }

  // 2. Toxicity detection
  const toxicityFlags = detectToxicity(content);
  if (toxicityFlags.length > 0) {
    flags.push(...toxicityFlags);
    reasons.push('Inappropriate language detected');
    overallConfidence = Math.max(overallConfidence, 0.85);
  }

  // 3. Harassment detection
  const harassmentFlags = detectHarassment(content);
  if (harassmentFlags.length > 0) {
    flags.push(...harassmentFlags);
    reasons.push('Harassment or targeted attacks detected');
    overallConfidence = Math.max(overallConfidence, 0.9);
  }

  // 4. Coercion/manipulation detection
  const coercionFlags = detectCoercion(content);
  if (coercionFlags.length > 0) {
    flags.push(...coercionFlags);
    reasons.push('Coercive or manipulative language detected');
    overallConfidence = Math.max(overallConfidence, 0.88);
  }

  // 5. Manipulation patterns
  const manipulationFlags = detectManipulationPatterns(content);
  if (manipulationFlags.length > 0) {
    flags.push(...manipulationFlags);
    reasons.push('Suspicious manipulation patterns detected');
    overallConfidence = Math.max(overallConfidence, 0.75);
  }

  // 6. PII detection
  const piiFlags = detectPII(content);
  if (piiFlags.length > 0) {
    flags.push(...piiFlags);
    reasons.push('Personal information detected');
    overallConfidence = Math.max(overallConfidence, 0.8);
  }

  // 7. Spam detection
  const spamFlags = detectSpam(content);
  if (spamFlags.length > 0) {
    flags.push(...spamFlags);
    reasons.push('Spam-like content detected');
    overallConfidence = Math.max(overallConfidence, 0.7);
  }

  // Determine overall decision
  const hasCritical = flags.some(f => f.severity === 'critical');
  const hasHigh = flags.some(f => f.severity === 'high');
  const hasMedium = flags.some(f => f.severity === 'medium');
  const hasLow = flags.some(f => f.severity === 'low');

  let decision: ModerationResult['decision'];
  let allowed: boolean;

  if (hasCritical) {
    decision = 'block';
    allowed = false;
  } else if (hasHigh) {
    decision = 'block';
    allowed = false;
  } else if (hasMedium) {
    decision = 'review';
    allowed = false; // Require human review
  } else if (hasLow) {
    decision = 'warn';
    allowed = true;
  } else {
    decision = 'allow';
    allowed = true;
  }

  // Generate redacted content for flagged messages
  let redactedContent: string | undefined;
  if (flags.length > 0) {
    redactedContent = redactContent(content, flags);
  }

  // Generate suggestions
  const suggestions = generateSuggestions(flags);

  return {
    allowed,
    decision,
    reasons,
    confidence: overallConfidence,
    flags,
    redactedContent,
    suggestions,
  };
}

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================
// Leetspeak and text normalization for obfuscation detection
// FIXED: Added to prevent bypass via character substitution

const LEETSPEAK_MAP: Record<string, string> = {
  '4': 'a', '@': 'a', '3': 'e', '1': 'i', '!': 'i', '!': 'l',
  '0': 'o', '5': 's', '$': 's', '9': 'g', '7': 't',
  '2': 'z', '6': 'b', '8': 'b',
};

function normalizeText(text: string): string {
  let normalized = text.toLowerCase();

  // Replace leetspeak characters
  for (const [leet, char] of Object.entries(LEETSPEAK_MAP)) {
    normalized = normalized.split(leet).join(char);
  }

  // Normalize Turkish characters
  normalized = normalized
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

  // Remove zero-width characters that might hide content
  normalized = normalized.replace(/[\u200B-\u200F\uFEFF]/g, '');

  // Normalize spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

function containsObfuscatedPhone(content: string): boolean {
  // Check for spoken phone numbers (e.g., "beş beş beş bir iki üç dört beş altı yedi sekiz")
  const spokenDigits: Record<string, string> = {
    'sıfır': '0', 'bir': '1', 'iki': '2', 'üç': '3', 'dört': '4',
    'beş': '5', 'altı': '6', 'yedi': '7', 'sekiz': '8', 'dokuz': '9',
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
  };

  const normalized = normalizeText(content);
  const words = normalized.split(/\s+/);
  let consecutiveDigits = 0;

  for (const word of words) {
    if (Object.keys(spokenDigits).includes(word)) {
      consecutiveDigits++;
      if (consecutiveDigits >= 7) {
        return true; // Likely a spoken phone number
      }
    } else {
      consecutiveDigits = 0;
    }
  }

  return false;
}

// ============================================================================

function detectOffPlatform(content: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];
  const lowerContent = content.toLowerCase();

  // Phone patterns (Turkey)
  const phonePatterns = [
    /\+?90[5-7][0-9]{8}/g,
    /05[0-9]{2}[-\s]?[0-9]{3}[-\s]?[0-9]{4}/g,
    /\(?0[0-9]{3}\)?[-\s]?[0-9]{3}[-\s]?[0-9]{4}/g,
  ];

  phonePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      flags.push({
        type: 'off_platform',
        severity: 'critical',
        matched: matches[0],
        confidence: 0.95,
      });
    }
  });

  // FIXED: Check for obfuscated/spoken phone numbers
  if (containsObfuscatedPhone(content)) {
    flags.push({
      type: 'off_platform',
      severity: 'high',
      matched: '[OBFUSCATED_PHONE]',
      confidence: 0.8,
    });
  }

  // Email
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = content.match(emailPattern);
  if (emails) {
    flags.push({
      type: 'off_platform',
      severity: 'critical',
      matched: emails[0],
      confidence: 0.98,
    });
  }

  // Social handles
  const socialPatterns = [
    /@[a-zA-Z0-9_.]{3,30}/g,
    /instagram\.com\/[a-zA-Z0-9_.]+/gi,
    /twitter\.com\/[a-zA-Z0-9_]+/gi,
    /tiktok\.com\/@[a-zA-Z0-9_.]+/gi,
  ];

  socialPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      flags.push({
        type: 'off_platform',
        severity: 'critical',
        matched: matches[0],
        confidence: 0.92,
      });
    }
  });

  // Messaging app links
  const appPatterns = [
    /t\.me\/[a-zA-Z0-9_]+/gi,
    /wa\.me\/[0-9]+/gi,
    /whatsapp\.com\/[a-zA-Z0-9]+/gi,
  ];

  appPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      flags.push({
        type: 'off_platform',
        severity: 'critical',
        matched: matches[0],
        confidence: 0.95,
      });
    }
  });

  // URLs
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlPattern);
  if (urls) {
    flags.push({
      type: 'off_platform',
      severity: 'high',
      matched: urls[0],
      confidence: 0.9,
    });
  }

  return flags;
}

function detectToxicity(content: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];

  // Turkish profanity patterns (abusive language)
  const toxicPatterns = [
    { pattern: /\b(siktir|sik|amk|oç|sikt|yarak|piç|pezevenk|hıyar|şerefsiz|orospu|bok|çük|dick|fuck|shit|ass|bitch)\b/gi, severity: 'high' as const },
    { pattern: /\b(seni|senin).{0,15}(sikeyim|öldürecek|bıçak|siktir)\b/gi, severity: 'critical' as const },
    { pattern: /\b(ağzına|gotün|siktir|göt)\b.{0,15}(sok|yala)\b/gi, severity: 'critical' as const },
  ];

  // Check original content
  toxicPatterns.forEach(({ pattern, severity }) => {
    const match = content.match(pattern);
    if (match) {
      flags.push({
        type: 'toxicity',
        severity,
        matched: match[0],
        confidence: 0.9,
      });
    }
  });

  // FIXED: Also check normalized content for leetspeak bypass
  const normalizedContent = normalizeText(content);
  const normalizedToxicPatterns = [
    /\b(siktir|sik|amk|oc|sikt|yarak|pic|pezevenk|hiyar|serefsiz|orospu|bok|cuk|dick|fuck|shit|ass|bitch)\b/gi,
  ];

  normalizedToxicPatterns.forEach((pattern) => {
    const match = normalizedContent.match(pattern);
    if (match) {
      // Check if this wasn't caught in original (leetspeak bypass)
      const alreadyDetected = flags.some(f => normalizedContent.includes(f.matched?.toLowerCase()));
      if (!alreadyDetected) {
        flags.push({
          type: 'toxicity',
          severity: 'high',
          matched: `[OBFUSCATED] ${match[0]}`,
          confidence: 0.85,
        });
      }
    }
  });

  return flags;
}

function detectHarassment(content: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];
  const lowerContent = content.toLowerCase();

  // Physical threats
  if (/\b(öldürecek|bıçaklayacak|kaçıracak|tecavüz|zarar)\b/i.test(content)) {
    flags.push({
      type: 'harassment',
      severity: 'critical',
      confidence: 0.95,
    });
  }

  // Stalking behavior
  const stalkingPatterns = [
    /seni.{0,20}biliyorum/i,
    /nerede.{0,20}oturuyorsun/i,
    /.{0,10}takip ediyorum/i,
  ];

  stalkingPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push({
        type: 'harassment',
        severity: 'high',
        confidence: 0.85,
      });
    }
  });

  // Doxing threats
  if (/adres|bilgi|fotoğraf|resim|şifre/i.test(content)) {
    const threats = [
      /adresini.{0,20}bul/i,
      /bilgilerini.{0,20}paylaş/i,
      /herkes.{0,20}göstereceğim/i,
    ];

    threats.forEach(pattern => {
      if (pattern.test(content)) {
        flags.push({
          type: 'harassment',
          severity: 'high',
          confidence: 0.88,
        });
      }
    });
  }

  return flags;
}

function detectCoercion(content: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];

  // Financial coercion
  const financialPatterns = [
    /para.{0,20}gönder/i,
    /borç.{0,20}ver/i,
    /kredi.{0,20}kart/i,
    /hesab.{0,20}paylaş/i,
    /invest/i,
    /kripto/i,
  ];

  financialPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push({
        type: 'coercion',
        severity: 'high',
        confidence: 0.8,
      });
    }
  });

  // Emotional manipulation
  const manipulationPatterns = [
    /eğer.{0,20}seviyorsan/i,
    /bana.{0,20}güven/i,
    /bunu.{0,20}yaparsan/i,
    /sana.{0,20}bağlı/i,
  ];

  manipulationPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push({
        type: 'coercion',
        severity: 'medium',
        confidence: 0.7,
      });
    }
  });

  // Ultimatums
  const ultimatumPatterns = [
    /ya.{0,20}ya.{0,20}/i,
    /ya.{0,20}ya da/i,
    /istemiyorsan.{0,20}/i,
  ];

  ultimatumPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push({
        type: 'coercion',
        severity: 'medium',
        confidence: 0.75,
      });
    }
  });

  return flags;
}

function detectManipulationPatterns(content: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];

  // Excessive punctuation (gaslighting indicator)
  if (/{3,}/.test(content)) {
    flags.push({
      type: 'manipulation',
      severity: 'low',
      matched: 'excessive punctuation',
      confidence: 0.6,
    });
  }

  // All caps sentences (aggressive)
  const allCapsSentences = content.match(/[A-Z\s]{10,}[.!?]/g);
  if (allCapsSentences && allCapsSentences.length > 1) {
    flags.push({
      type: 'manipulation',
      severity: 'low',
      matched: 'ALL CAPS',
      confidence: 0.65,
    });
  }

  // Love bombing patterns
  const loveBombing = [
    /seni.{0,15}seviyorum.{0,15}evleneceğiz/i,
    /hayatımın anlamısın/i,
    /sensiz.{0,15}yaşayamam/i,
    /tanıştığımızdan beri.{0,15}düşünüyorum/i,
  ];

  loveBombing.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push({
        type: 'manipulation',
        severity: 'medium',
        confidence: 0.7,
      });
    }
  });

  // Guilt tripping
  const guiltTrip = [
    /bana.{0,15}zaman.{0,15}ayırmıyorsun/i,
    /beni.{0,15}hiç.{0,15}önemse/i,
    /sana.{0,15}ne.{0,15}kadar.{0,15}zaman/i,
  ];

  guiltTrip.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push({
        type: 'manipulation',
        severity: 'low',
        confidence: 0.65,
      });
    }
  });

  return flags;
}

function detectPII(content: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];

  // TC Kimlik (Turkish ID) pattern
  if (/\b[0-9]{11}\b/.test(content)) {
    flags.push({
      type: 'pii',
      severity: 'high',
      matched: 'TC Kimlik',
      confidence: 0.9,
    });
  }

  // Credit card pattern
  if (/\b[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}\b/.test(content)) {
    flags.push({
      type: 'pii',
      severity: 'critical',
      matched: 'Credit Card',
      confidence: 0.95,
    });
  }

  // Password/credential hints
  if (/\b(şifre|parola|password|pin|kod)\b.{0,20}[a-zA-Z0-9]/i.test(content)) {
    flags.push({
      type: 'pii',
      severity: 'high',
      matched: 'Credential reference',
      confidence: 0.8,
    });
  }

  return flags;
}

function detectSpam(content: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];

  // Repetitive messages
  const words = content.toLowerCase().split(/\s+/);
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });

  const repetitiveWords = Object.entries(wordCounts).filter(([_, count]) => count > 5);
  if (repetitiveWords.length > 0) {
    flags.push({
      type: 'spam',
      severity: 'medium',
      matched: 'repetitive content',
      confidence: 0.7,
    });
  }

  // Promotional patterns
  const promoPatterns = [
    /kazan.{0,20}para/i,
    /bedava/i,
    /indirim/i,
    /şimdi.{0,20}al/i,
    /tıkla/i,
  ];

  promoPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push({
        type: 'spam',
        severity: 'low',
        confidence: 0.6,
      });
    }
  });

  return flags;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function redactContent(content: string, flags: ModerationFlag[]): string {
  let redacted = content;

  flags.forEach(flag => {
    if (flag.matched) {
      const escaped = flag.matched.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      redacted = redacted.replace(new RegExp(escaped, 'gi'), '[REDACTED]');
    }
  });

  return redacted;
}

function generateSuggestions(flags: ModerationFlag[]): string[] {
  const suggestions: string[] = [];

  const hasOffPlatform = flags.some(f => f.type === 'off_platform');
  const hasToxicity = flags.some(f => f.type === 'toxicity');
  const hasHarassment = flags.some(f => f.type === 'harassment');
  const hasCoercion = flags.some(f => f.type === 'coercion');

  if (hasOffPlatform) {
    suggestions.push('Please keep conversations within the app for your safety.');
  }

  if (hasToxicity) {
    suggestions.push('Please use respectful language.');
  }

  if (hasHarassment) {
    suggestions.push('Threats or harassment are not tolerated.');
  }

  if (hasCoercion) {
    suggestions.push('Financial requests and manipulation are not allowed.');
  }

  return suggestions;
}

async function logModerationResult(
  supabase: any,
  userId: string,
  conversationId: string,
  content: string,
  result: ModerationResult
): Promise<void> {
  try {
    await supabase.from('message_moderation_logs').insert({
      user_id: userId,
      conversation_id: conversationId,
      content_hash: hashContent(content),
      decision: result.decision,
      flags: result.flags,
      reasons: result.reasons,
      confidence: result.confidence,
    });
  } catch (error) {
    console.error('Failed to log moderation result:', error);
  }
}

function hashContent(content: string): string {
  // Simple hash for logging - in production use proper crypto
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}
