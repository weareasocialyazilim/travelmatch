/**
 * Proof Verification Service
 *
 * AI-powered proof verification for gift experiences.
 * This is a placeholder for future ML implementation.
 *
 * Current implementation: Rule-based verification
 * Future: Computer Vision + ML models
 *
 * @module services/proof
 */

export type ProofType =
  | 'experience_photo' // Photo at the location/experience
  | 'receipt' // Receipt or ticket
  | 'location_check' // GPS verification
  | 'video_proof'; // Video proof (future)

export type ProofStatus =
  | 'pending' // Awaiting verification
  | 'approved' // Verified successfully
  | 'rejected' // Verification failed
  | 'manual_review'; // Needs human review

export interface ProofVerificationRequest {
  /** Proof submission ID */
  proofId: string;
  /** User who submitted the proof */
  userId: string;
  /** Associated gift/escrow ID */
  giftId: string;
  /** Type of proof */
  proofType: ProofType;
  /** URL of the proof image/file */
  fileUrl: string;
  /** Expected location (for location-based verification) */
  expectedLocation?: {
    lat: number;
    lng: number;
    radiusKm: number;
  };
  /** EXIF data extracted from image (if available) */
  exifData?: {
    lat?: number;
    lng?: number;
    timestamp?: string;
    deviceModel?: string;
  };
  /** Moment/experience category */
  category?: string;
  /** Additional context */
  metadata?: Record<string, unknown>;
}

export interface ProofVerificationResult {
  /** Verification status */
  status: ProofStatus;
  /** Overall confidence score (0-100) */
  overallScore: number;
  /** Breakdown of individual scores */
  breakdown: {
    /** Image quality score */
    imageQuality: number;
    /** Location match score (if applicable) */
    locationMatch?: number;
    /** Timestamp freshness score */
    timestampScore?: number;
    /** Content relevance score */
    contentRelevance?: number;
  };
  /** Issues found during verification */
  issues: string[];
  /** Suggestions for improvement */
  suggestions: string[];
  /** Verification timestamp */
  verifiedAt: string;
  /** Reason for status (especially for rejections) */
  reason?: string;
}

/**
 * Proof Verification Service
 *
 * TODO: Implement ML-based verification
 * - Landmark detection (is user at the claimed location?)
 * - Object detection (relevant objects in photo?)
 * - Image authenticity (manipulation detection)
 * - EXIF validation
 *
 * @example
 * ```typescript
 * const result = await proofVerificationService.verify({
 *   proofId: 'proof_123',
 *   userId: 'user_456',
 *   giftId: 'gift_789',
 *   proofType: 'experience_photo',
 *   fileUrl: 'https://storage.../proof.jpg',
 *   expectedLocation: { lat: 41.0082, lng: 28.9784, radiusKm: 1 },
 * });
 * ```
 */
export const proofVerificationService = {
  /**
   * Verify a proof submission
   *
   * Current: Basic rule-based checks
   * Future: ML model integration
   */
  async verify(
    request: ProofVerificationRequest,
  ): Promise<ProofVerificationResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const breakdown: ProofVerificationResult['breakdown'] = {
      imageQuality: 0,
    };

    // === 1. Basic validation ===
    if (!request.fileUrl) {
      return {
        status: 'rejected',
        overallScore: 0,
        breakdown,
        issues: ['No file URL provided'],
        suggestions: ['Please upload a valid proof image'],
        verifiedAt: new Date().toISOString(),
        reason: 'missing_file',
      };
    }

    // === 2. Image quality check (placeholder) ===
    // TODO: Implement actual image quality analysis
    // - Resolution check
    // - Blur detection
    // - Lighting analysis
    breakdown.imageQuality = 80; // Placeholder

    // === 3. Location verification ===
    if (
      request.expectedLocation &&
      request.exifData?.lat &&
      request.exifData?.lng
    ) {
      const distance = calculateDistance(
        request.expectedLocation.lat,
        request.expectedLocation.lng,
        request.exifData.lat,
        request.exifData.lng,
      );

      if (distance <= request.expectedLocation.radiusKm) {
        breakdown.locationMatch = 100;
      } else if (distance <= request.expectedLocation.radiusKm * 2) {
        breakdown.locationMatch = 70;
        issues.push('Location is slightly outside expected area');
      } else {
        breakdown.locationMatch = 30;
        issues.push('Location does not match expected area');
      }
    } else if (request.expectedLocation) {
      breakdown.locationMatch = 50;
      suggestions.push('Enable location services for better verification');
    }

    // === 4. Timestamp verification ===
    if (request.exifData?.timestamp) {
      const photoTime = new Date(request.exifData.timestamp);
      const now = new Date();
      const hoursAgo = (now.getTime() - photoTime.getTime()) / (1000 * 60 * 60);

      if (hoursAgo <= 24) {
        breakdown.timestampScore = 100;
      } else if (hoursAgo <= 72) {
        breakdown.timestampScore = 80;
      } else if (hoursAgo <= 168) {
        // 1 week
        breakdown.timestampScore = 60;
        suggestions.push('Proof was taken more than 3 days ago');
      } else {
        breakdown.timestampScore = 30;
        issues.push('Proof photo is older than 1 week');
      }
    }

    // === 5. Content relevance (placeholder) ===
    // TODO: Implement ML-based content analysis
    // - Category-specific object detection
    // - Landmark recognition
    // - Scene classification
    breakdown.contentRelevance = 75; // Placeholder

    // === Calculate overall score ===
    const scores = Object.values(breakdown).filter(
      (v) => v !== undefined,
    ) as number[];
    const overallScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );

    // === Determine status ===
    let status: ProofStatus;
    let reason: string | undefined;

    if (overallScore >= 70 && issues.length === 0) {
      status = 'approved';
    } else if (overallScore >= 50 || issues.length > 0) {
      status = 'manual_review';
      reason = 'Requires human verification';
    } else {
      status = 'rejected';
      reason = issues.join('; ') || 'Low verification score';
    }

    return {
      status,
      overallScore,
      breakdown,
      issues,
      suggestions,
      verifiedAt: new Date().toISOString(),
      reason,
    };
  },

  /**
   * Check if a proof is a duplicate
   * TODO: Implement image fingerprinting/perceptual hashing
   */
  async checkDuplicate(
    _fileUrl: string,
    _userId: string,
  ): Promise<{
    isDuplicate: boolean;
    originalProofId?: string;
  }> {
    // Placeholder - implement perceptual hashing
    return { isDuplicate: false };
  },
};

/**
 * Calculate distance between two coordinates in km (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
