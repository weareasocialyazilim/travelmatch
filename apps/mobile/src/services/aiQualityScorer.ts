/**
 * AI Quality Scoring for Profile Proofs
 * 
 * Validates profile verification photos using AI:
 * - Face detection (is there a face?)
 * - ID card detection (is ID visible?)
 * - Image quality (blur, lighting, resolution)
 * - Matching score (does face match ID photo?)
 * - Auto-reject low quality submissions
 */

import React from 'react';
import { supabase } from './supabase';
import { logger } from '../utils/logger';

// Quality score breakdown
export interface QualityScore {
  overall: number; // 0-100
  breakdown: {
    faceDetected: boolean;
    faceQuality: number; // 0-100 (clarity, lighting, angle)
    idDetected: boolean;
    idQuality: number; // 0-100 (readable, not blurry)
    matchScore: number; // 0-100 (face matches ID photo)
    imageQuality: number; // 0-100 (resolution, lighting, blur)
  };
  issues: string[]; // Specific problems found
  suggestions: string[]; // How to improve
  approved: boolean; // Auto-approve if score > 70
}

// Proof types
export enum ProofType {
  SELFIE_WITH_ID = 'selfie_with_id',
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  NATIONAL_ID = 'national_id',
}

// ML service client
class AIQualityScorer {
  private mlServiceUrl = process.env.EXPO_PUBLIC_ML_SERVICE_URL;

  private getMlServiceUrl(): string {
    if (!this.mlServiceUrl) {
      throw new Error('ML Service URL not configured. Set EXPO_PUBLIC_ML_SERVICE_URL environment variable.');
    }
    return this.mlServiceUrl;
  }

  /**
   * Score profile proof photo
   */
  async scoreProof(
    imageUri: string,
    proofType: ProofType,
    userId: string
  ): Promise<QualityScore> {
    try {
      logger.debug('[AI Quality] Scoring proof:', proofType);

      // Upload image to Supabase Storage first
      const imageUrl = await this.uploadImage(imageUri, userId);

      // Call ML service for scoring
      const response = await fetch(`${this.getMlServiceUrl()}/api/score-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          proofType,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`ML service error: ${response.status}`);
      }

      const score = await response.json();

      // Save score to database
      await this.saveScore(userId, proofType, score, imageUrl);

      logger.debug('[AI Quality] Score:', score.overall);

      return score;
    } catch (error) {
      logger.error('[AI Quality] Scoring failed:', error);
      
      // Return fallback score (manual review required)
      return this.fallbackScore();
    }
  }

  /**
   * Batch score multiple images
   */
  async batchScore(
    images: Array<{ uri: string; type: ProofType }>,
    userId: string
  ): Promise<QualityScore[]> {
    const scores = await Promise.all(
      images.map((img) => this.scoreProof(img.uri, img.type, userId))
    );
    return scores;
  }

  /**
   * Get score history for user
   */
  async getScoreHistory(userId: string): Promise<QualityScore[]> {
    // SECURITY: Explicit column selection - never use select('*')
    const { data, error } = await supabase
      .from('proof_quality_scores')
      .select(`
        id,
        user_id,
        proof_type,
        score,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('[AI Quality] Failed to get history:', error);
      return [];
    }

    return data.map((row) => row.score);
  }

  /**
   * Upload image to Supabase Storage
   */
  private async uploadImage(imageUri: string, userId: string): Promise<string> {
    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const fileName = `proof_${userId}_${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('profile-proofs')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-proofs')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  /**
   * Save score to database
   */
  private async saveScore(
    userId: string,
    proofType: ProofType,
    score: QualityScore,
    imageUrl: string
  ) {
    await supabase.from('proof_quality_scores').insert({
      user_id: userId,
      proof_type: proofType,
      score,
      image_url: imageUrl,
      approved: score.approved,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Fallback score when ML service unavailable
   */
  private fallbackScore(): QualityScore {
    return {
      overall: 0,
      breakdown: {
        faceDetected: false,
        faceQuality: 0,
        idDetected: false,
        idQuality: 0,
        matchScore: 0,
        imageQuality: 0,
      },
      issues: ['AI scoring service unavailable - manual review required'],
      suggestions: ['Please try again later'],
      approved: false,
    };
  }

  /**
   * Get quality tips for user
   */
  getQualityTips(proofType: ProofType): string[] {
    const commonTips = [
      'Use good lighting (natural light is best)',
      'Hold camera steady to avoid blur',
      'Make sure photo is in focus',
      'Use a plain background',
    ];

    const typeTips: Record<ProofType, string[]> = {
      [ProofType.SELFIE_WITH_ID]: [
        'Hold your ID next to your face',
        'Make sure your face is clearly visible',
        'Ensure ID text is readable',
        'Look directly at camera',
        ...commonTips,
      ],
      [ProofType.PASSPORT]: [
        'Lay passport flat on table',
        'Make sure all text is readable',
        'Avoid glare on photo page',
        'Capture entire photo page',
        ...commonTips,
      ],
      [ProofType.DRIVERS_LICENSE]: [
        'Lay license flat on table',
        'Make sure all corners are visible',
        'Ensure text and photo are clear',
        'Avoid shadows or glare',
        ...commonTips,
      ],
      [ProofType.NATIONAL_ID]: [
        'Lay ID flat on table',
        'Make sure all text is readable',
        'Capture both front and back if required',
        'Avoid reflections on laminated surface',
        ...commonTips,
      ],
    };

    return typeTips[proofType];
  }

  /**
   * Interpret score and provide feedback
   */
  interpretScore(score: QualityScore): {
    status: 'excellent' | 'good' | 'fair' | 'poor';
    message: string;
    actionRequired: boolean;
  } {
    const { overall } = score;

    if (overall >= 85) {
      return {
        status: 'excellent',
        message: 'Perfect! Your verification photo meets all quality standards.',
        actionRequired: false,
      };
    }

    if (overall >= 70) {
      return {
        status: 'good',
        message: 'Great! Your photo has been approved.',
        actionRequired: false,
      };
    }

    if (overall >= 50) {
      return {
        status: 'fair',
        message: 'Your photo quality is acceptable but could be improved. Please review suggestions below.',
        actionRequired: true,
      };
    }

    return {
      status: 'poor',
      message: 'Please retake your photo following the guidelines below for better quality.',
      actionRequired: true,
    };
  }
}

// Export singleton
export const aiQualityScorer = new AIQualityScorer();

// Hook for React components
export function useAIQualityScoring() {
  const [isScoring, setIsScoring] = React.useState(false);
  const [score, setScore] = React.useState<QualityScore | null>(null);

  const scoreProof = async (
    imageUri: string,
    proofType: ProofType,
    userId: string
  ) => {
    setIsScoring(true);
    try {
      const result = await aiQualityScorer.scoreProof(imageUri, proofType, userId);
      setScore(result);
      return result;
    } finally {
      setIsScoring(false);
    }
  };

  const reset = () => {
    setScore(null);
    setIsScoring(false);
  };

  return {
    scoreProof,
    isScoring,
    score,
    reset,
    getTips: aiQualityScorer.getQualityTips,
    interpretScore: score ? aiQualityScorer.interpretScore(score) : null,
  };
}

// Quality score component for UI
export function QualityScoreIndicator({ score }: { score: QualityScore }) {
  const interpretation = aiQualityScorer.interpretScore(score);
  
  const getColor = () => {
    switch (interpretation.status) {
      case 'excellent': return '#10B981'; // green
      case 'good': return '#3B82F6'; // blue
      case 'fair': return '#F59E0B'; // orange
      case 'poor': return '#EF4444'; // red
    }
  };

  return {
    score: score.overall,
    color: getColor(),
    status: interpretation.status,
    message: interpretation.message,
    issues: score.issues,
    suggestions: score.suggestions,
    breakdown: score.breakdown,
  };
}
