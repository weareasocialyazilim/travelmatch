/**
 * Example: Profile Verification with AI Quality Scoring
 */

import React from 'react';
import { View, Text, Image, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAIQualityScoring, ProofType } from '../services/aiQualityScorer';
import { QualityScoreIndicator } from '../services/aiQualityScorer';

export function ProfileVerificationScreen({ userId }: { userId: string }) {
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const { scoreProof, isScoring, score, reset, getTips, interpretScore } = useAIQualityScoring();

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (result.assets && result.assets[0]) {
      const uri = result.assets[0].uri!;
      setImageUri(uri);
      
      // Score image immediately
      await scoreProof(uri, ProofType.SELFIE_WITH_ID, userId);
    }
  };

  const handleRetake = () => {
    setImageUri(null);
    reset();
  };

  const handleSubmit = async () => {
    // Submit verification
    if (score && score.approved) {
      // Auto-approved
      await submitVerification(imageUri!, score);
    } else {
      // Manual review required
      await submitForManualReview(imageUri!, score);
    }
  };

  const tips = getTips(ProofType.SELFIE_WITH_ID);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Profile</Text>
      <Text style={styles.subtitle}>
        Take a selfie holding your ID next to your face
      </Text>

      {/* Quality Tips */}
      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Tips for best results:</Text>
        {tips.map((tip) => (
          <Text key={tip} style={styles.tip}>• {tip}</Text>
        ))}
      </View>

      {/* Image Preview */}
      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      {/* Scoring Indicator */}
      {isScoring && (
        <View style={styles.scoring}>
          <ActivityIndicator size="large" />
          <Text>Analyzing image quality...</Text>
        </View>
      )}

      {/* Quality Score */}
      {score && interpretScore && (
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreBar, { backgroundColor: QualityScoreIndicator({ score }).color }]}>
            <Text style={styles.scoreText}>{score.overall}/100</Text>
          </View>
          
          <Text style={[styles.status, { color: QualityScoreIndicator({ score }).color }]}>
            {interpretScore.status.toUpperCase()}
          </Text>
          
          <Text style={styles.message}>{interpretScore.message}</Text>

          {/* Breakdown */}
          <View style={styles.breakdown}>
            <ScoreItem
              label="Face Detected"
              value={score.breakdown.faceDetected}
              score={score.breakdown.faceQuality}
            />
            <ScoreItem
              label="ID Detected"
              value={score.breakdown.idDetected}
              score={score.breakdown.idQuality}
            />
            <ScoreItem
              label="Image Quality"
              value={true}
              score={score.breakdown.imageQuality}
            />
            <ScoreItem
              label="Match Score"
              value={true}
              score={score.breakdown.matchScore}
            />
          </View>

          {/* Issues */}
          {score.issues.length > 0 && (
            <View style={styles.issues}>
              <Text style={styles.issuesTitle}>Issues Found:</Text>
              {score.issues.map((issue) => (
                <Text key={issue} style={styles.issue}>⚠️ {issue}</Text>
              ))}
            </View>
          )}

          {/* Suggestions */}
          {score.suggestions.length > 0 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              {score.suggestions.map((suggestion) => (
                <Text key={suggestion} style={styles.suggestion}>💡 {suggestion}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {!imageUri ? (
          <Button title="Take Photo" onPress={handleSelectImage} />
        ) : (
          <>
            <Button
              title="Retake"
              onPress={handleRetake}
              color="#EF4444"
            />
            <Button
              title={score?.approved ? 'Submit' : 'Submit for Review'}
              onPress={handleSubmit}
              disabled={!score}
              color={score?.approved ? '#10B981' : '#F59E0B'}
            />
          </>
        )}
      </View>
    </View>
  );
}

function ScoreItem({
  label,
  value,
  score,
}: {
  label: string;
  value: boolean;
  score: number;
}) {
  return (
    <View style={styles.scoreItem}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreValue}>
        <Text>{value ? '✅' : '❌'}</Text>
        <Text style={styles.scoreNumber}>{score}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  tips: {
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0369A1',
  },
  tip: {
    fontSize: 14,
    color: '#0C4A6E',
    marginBottom: 4,
  },
  imageContainer: {
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scoring: {
    alignItems: 'center',
    padding: 20,
  },
  scoreContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  scoreBar: {
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  breakdown: {
    gap: 12,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#374151',
  },
  scoreValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  issues: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
  },
  issue: {
    fontSize: 12,
    color: '#B91C1C',
    marginBottom: 4,
  },
  suggestions: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 12,
    color: '#B45309',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});
