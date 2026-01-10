/**
 * TravelMatch ML Service Client
 * "Deneyim Asistanı" - ML yeteneklerini web'e bağlar
 *
 * KULLANICI DİLİ: "Deneyim Asistanı" (ML, AI, algorithm yasak)
 */

const ML_SERVICE_URL =
  process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8001';

interface RecommendationRequest {
  userId: string;
  preferences: {
    interests: string[];
    location?: { lat: number; lng: number };
    ageRange?: { min: number; max: number };
  };
}

interface RecommendationResponse {
  suggestions: {
    userId: string;
    matchScore: number;
    commonInterests: string[];
    reason: string; // Kullanıcıya gösterilecek samimi mesaj
  }[];
}

interface ExperienceInsight {
  type: 'match' | 'activity' | 'gift' | 'moment';
  title: string;
  description: string;
  icon: string;
}

/**
 * Deneyim Asistanı - Kişiselleştirilmiş öneriler
 * (Arka planda ML recommendation engine çalışıyor)
 */
export async function getPersonalizedSuggestions(
  userId: string,
  interests: string[],
): Promise<ExperienceInsight[]> {
  try {
    // ML servisi aktif değilse örnek veri döndür
    const isMLServiceAvailable = await checkMLServiceHealth();

    if (!isMLServiceAvailable) {
      return getDefaultInsights();
    }

    const response = await fetch(`${ML_SERVICE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, interests }),
    });

    if (!response.ok) {
      return getDefaultInsights();
    }

    const data = (await response.json()) as RecommendationResponse;

    // ML yanıtını kullanıcı dostu mesajlara dönüştür
    return data.suggestions.map((suggestion) => ({
      type: 'match' as const,
      title: 'Ortak Bir Şeyler Var!',
      description: suggestion.reason,
      icon: '💫',
    }));
  } catch {
    return getDefaultInsights();
  }
}

/**
 * ML servis sağlık kontrolü
 */
async function checkMLServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3 saniye timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Varsayılan öneriler (ML servisi yokken)
 */
function getDefaultInsights(): ExperienceInsight[] {
  return [
    {
      type: 'activity',
      title: 'Bugün Bir Kahve Nasıl?',
      description: 'Yakınında 12 kişi şu an kahve molası veriyor ☕',
      icon: '☕',
    },
    {
      type: 'moment',
      title: 'Anı Paylaşanlar',
      description: 'Senin gibi müzik sevenler şu an aktif 🎵',
      icon: '🎵',
    },
    {
      type: 'gift',
      title: 'İlk Adım Senden',
      description: 'Bir hediye gönder, sohbeti başlat 🎁',
      icon: '🎁',
    },
  ];
}

/**
 * Güvenli profil değerlendirmesi
 * (Arka planda proof scoring çalışıyor - kullanıcıya "Güvenlik Rozeti" olarak göster)
 */
export async function getProfileTrustScore(userId: string): Promise<{
  score: number;
  badges: string[];
  message: string;
}> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/trust-score/${userId}`);

    if (!response.ok) {
      return getDefaultTrustScore();
    }

    const data = await response.json();

    return {
      score: data.score,
      badges: translateBadges(data.verifications || []),
      message: getTrustMessage(data.score),
    };
  } catch {
    return getDefaultTrustScore();
  }
}

function getDefaultTrustScore() {
  return {
    score: 0,
    badges: [],
    message: 'Profilini tamamla ve güvenilirlik rozetleri kazan!',
  };
}

function translateBadges(verifications: string[]): string[] {
  const badgeMap: Record<string, string> = {
    photo_verified: '📸 Fotoğraf Onaylı',
    id_verified: '🪪 Kimlik Onaylı',
    phone_verified: '📱 Telefon Onaylı',
    social_connected: '🔗 Sosyal Bağlantılı',
  };

  return verifications.map((v) => badgeMap[v]).filter(Boolean) as string[];
}

function getTrustMessage(score: number): string {
  if (score >= 90) return 'Tam güvenilir profil! ⭐⭐⭐⭐⭐';
  if (score >= 70) return 'Güvenilir profil ⭐⭐⭐⭐';
  if (score >= 50) return 'Doğrulanmış profil ⭐⭐⭐';
  if (score >= 30) return 'Profilini tamamla ⭐⭐';
  return 'Başlangıç aşamasında ⭐';
}

export type {
  RecommendationRequest,
  RecommendationResponse,
  ExperienceInsight,
};
