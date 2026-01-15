"""
AI Chatbot Assistant

Intelligent conversational assistant for Lovendo platform.

Provides:
- Gift selection assistance
- FAQ answering
- Proof submission guidance
- Dispute resolution support
- Personalized recommendations
"""

from app.core.base_model import BaseModel
from app.core.redis_client import get_redis
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from enum import Enum
import logging
import json
import re
import hashlib

logger = logging.getLogger(__name__)


class IntentType(str, Enum):
    """User intent categories"""
    GIFT_RECOMMENDATION = "gift_recommendation"
    PROOF_HELP = "proof_help"
    PAYMENT_INQUIRY = "payment_inquiry"
    DISPUTE_SUPPORT = "dispute_support"
    ACCOUNT_HELP = "account_help"
    GENERAL_FAQ = "general_faq"
    GREETING = "greeting"
    FEEDBACK = "feedback"
    UNKNOWN = "unknown"


class EntityType(str, Enum):
    """Named entity types in conversation"""
    PRICE = "price"
    CATEGORY = "category"
    LOCATION = "location"
    DATE = "date"
    PERSON = "person"
    MOMENT = "moment"


class ConversationState(str, Enum):
    """Conversation flow states"""
    IDLE = "idle"
    GATHERING_PREFERENCES = "gathering_preferences"
    SHOWING_RECOMMENDATIONS = "showing_recommendations"
    CONFIRMING_SELECTION = "confirming_selection"
    PROVIDING_HELP = "providing_help"
    COLLECTING_FEEDBACK = "collecting_feedback"


class IntentClassifier:
    """
    Classifies user intents from Turkish text.

    Uses keyword matching and pattern recognition.
    In production, would use fine-tuned BERT model.
    """

    INTENT_PATTERNS = {
        IntentType.GIFT_RECOMMENDATION: [
            r"(hediye|öneri|tavsiye|ne alayım|ne yapsam)",
            r"(doğum günü|yıldönümü|sürpriz).*hediye",
            r"(arayış|arıyorum|bakmak).*deneyim",
            r"(bütçe|fiyat).*uygun",
        ],
        IntentType.PROOF_HELP: [
            r"(kanıt|proof|fotoğraf|belge).*yükle",
            r"(nasıl|neden).*kanıt",
            r"(reddedildi|onaylanmadı).*kanıt",
            r"deneyim.*tamamla",
        ],
        IntentType.PAYMENT_INQUIRY: [
            r"(ödeme|para|ücret|fiyat)",
            r"(iade|geri|iptal)",
            r"(kredi kartı|havale|eft)",
            r"(hesap|bakiye|cüzdan)",
        ],
        IntentType.DISPUTE_SUPPORT: [
            r"(sorun|problem|şikayet)",
            r"(anlaşamadık|anlaşmazlık)",
            r"(iptal|vazgeç)",
            r"(memnun değil|hayal kırıklığı)",
        ],
        IntentType.ACCOUNT_HELP: [
            r"(hesap|profil|şifre|giriş)",
            r"(kayıt|üyelik)",
            r"(bilgi|güncelle|değiştir)",
        ],
        IntentType.GREETING: [
            r"^(merhaba|selam|hey|hi|hello)",
            r"(günaydın|iyi akşamlar|iyi günler)",
        ],
        IntentType.FEEDBACK: [
            r"(teşekkür|sağol|eyv)",
            r"(güzel|harika|süper)",
            r"(kötü|berbat|rezalet)",
        ],
    }

    FAQ_DATABASE = {
        "nasıl_çalışır": {
            "keywords": ["nasıl çalış", "ne işe yarar", "sistem nasıl"],
            "answer": """Lovendo 3 adımda çalışır:

1️⃣ **Moment Oluştur**: Hediye etmek istediğin seyahat deneyimini seç
2️⃣ **Gönder**: Alıcıya gönder, para emanet hesapta tutulur
3️⃣ **Kanıt Yükle**: Alıcı deneyimi yaşadığını kanıtlar, para otomatik aktarılır

Sorularınız için buradayım! 🎁""",
        },
        "kanıt_nedir": {
            "keywords": ["kanıt ne", "nasıl kanıtla", "proof nedir"],
            "answer": """Kanıt, deneyimin gerçekten yaşandığını gösteren belgedir:

📸 **Fotoğraf**: Deneyim sırasında çekilmiş fotoğraf
📍 **Konum**: GPS ile doğrulanmış konum
🧾 **Fiş/Fatura**: Harcama belgesi

AI sistemimiz kanıtları otomatik doğrular. Çoğu kanıt dakikalar içinde onaylanır!""",
        },
        "para_güvenliği": {
            "keywords": ["param güvende", "emanet", "iade"],
            "answer": """Paranız %100 güvende! 🔒

💰 Para, deneyim tamamlanana kadar emanet hesapta tutulur
✅ Kanıt onaylandığında otomatik aktarılır
↩️ Sorun yaşanırsa koşullarla iade edilir

Emanet sistemi sayesinde hem gönderen hem alan korunur.""",
        },
        "ücret": {
            "keywords": ["komisyon", "ücret ne", "kaç para"],
            "answer": """Lovendo ücretlendirmesi:

🆓 **Ücretsiz**: Hesap oluşturma, gezinme
💎 **Gönderen**: İşlem ücreti %5-8 (üyelik tipine göre)
🎁 **Alan**: Ücretsiz!

Premium üyeliklerle komisyon oranları düşer.""",
        },
    }

    def classify(self, text: str) -> Tuple[IntentType, float]:
        """
        Classify user intent from text.

        Returns:
            Tuple of (intent, confidence)
        """
        text_lower = text.lower()

        # Check each intent pattern
        intent_scores = {}

        for intent, patterns in self.INTENT_PATTERNS.items():
            score = 0
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    score += 1

            if score > 0:
                intent_scores[intent] = score / len(patterns)

        if not intent_scores:
            return IntentType.UNKNOWN, 0.5

        # Get highest scoring intent
        best_intent = max(intent_scores, key=intent_scores.get)
        confidence = min(0.95, intent_scores[best_intent] + 0.3)

        return best_intent, confidence

    def get_faq_answer(self, text: str) -> Optional[Dict[str, Any]]:
        """Find matching FAQ answer"""
        text_lower = text.lower()

        for faq_id, faq in self.FAQ_DATABASE.items():
            for keyword in faq["keywords"]:
                if keyword in text_lower:
                    return {
                        "faq_id": faq_id,
                        "answer": faq["answer"],
                        "confidence": 0.9,
                    }

        return None


class DialogueManager:
    """
    Manages conversation flow and state.

    Handles:
    - Multi-turn conversations
    - Context tracking
    - State transitions
    """

    def __init__(self):
        self.sessions: Dict[str, Dict] = {}

    async def get_session(
        self,
        user_id: str,
        redis,
    ) -> Dict[str, Any]:
        """Get or create conversation session"""
        session_key = f"chat_session:{user_id}"

        # Try cache first
        cached = await redis.get(session_key)
        if cached:
            return json.loads(cached)

        # Create new session
        session = {
            "user_id": user_id,
            "state": ConversationState.IDLE.value,
            "context": {},
            "history": [],
            "preferences": {},
            "created_at": datetime.utcnow().isoformat(),
        }

        await self._save_session(session, redis)
        return session

    async def update_session(
        self,
        user_id: str,
        updates: Dict[str, Any],
        redis,
    ):
        """Update session with new data"""
        session = await self.get_session(user_id, redis)
        session.update(updates)
        await self._save_session(session, redis)

    async def add_to_history(
        self,
        user_id: str,
        role: str,
        message: str,
        redis,
    ):
        """Add message to conversation history"""
        session = await self.get_session(user_id, redis)

        session["history"].append({
            "role": role,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
        })

        # Keep last 20 messages
        session["history"] = session["history"][-20:]

        await self._save_session(session, redis)

    async def _save_session(self, session: Dict, redis):
        """Save session to Redis"""
        session_key = f"chat_session:{session['user_id']}"
        await redis.setex(session_key, 3600, json.dumps(session))  # 1 hour TTL


class ResponseGenerator:
    """
    Generates natural language responses.

    Uses templates and dynamic content generation.
    """

    TEMPLATES = {
        IntentType.GREETING: [
            "Merhaba! 👋 Lovendo'ya hoş geldiniz. Size nasıl yardımcı olabilirim?",
            "Selam! Ben Lovendo asistanı. Bugün size nasıl yardımcı olabilirim?",
            "Merhaba! Hediye seçimi, kanıt yükleme veya başka konularda yardımcı olabilirim. 🎁",
        ],
        IntentType.GIFT_RECOMMENDATION: [
            "Harika! Size özel deneyim önerileri bulayım. 🎁\n\nBirkaç soru sormama izin verin:\n1. Kime hediye ediyorsunuz? (eş, arkadaş, aile)\n2. Bütçeniz ne kadar?\n3. Tercih ettiğiniz kategori var mı? (macera, lüks, yemek, doğa)",
        ],
        IntentType.PROOF_HELP: [
            "Kanıt yükleme konusunda yardımcı olayım! 📸\n\nGeçerli kanıtlar:\n• Deneyim sırasında çekilmiş selfie\n• Konum paylaşımı açık fotoğraf\n• Harcama belgesi/fişi\n\nHangi konuda sorun yaşıyorsunuz?",
        ],
        IntentType.PAYMENT_INQUIRY: [
            "Ödeme ile ilgili bilgi vereyim! 💳\n\nNe öğrenmek istersiniz?\n• Ödeme yöntemleri\n• İade politikası\n• Komisyon oranları\n• Cüzdan bakiyesi",
        ],
        IntentType.DISPUTE_SUPPORT: [
            "Bir sorun yaşadığınızı duyduğuma üzüldüm. 😔\n\nSize yardımcı olmak istiyorum. Lütfen şunları belirtin:\n• Hangi moment ile ilgili?\n• Ne tür bir sorun yaşıyorsunuz?\n• Karşı tarafla iletişim kurdunuz mu?",
        ],
        IntentType.UNKNOWN: [
            "Anlayamadım, başka türlü sorar mısınız? 🤔\n\nŞu konularda yardımcı olabilirim:\n• 🎁 Hediye önerileri\n• 📸 Kanıt yükleme\n• 💳 Ödeme bilgileri\n• 🆘 Sorun çözümü",
        ],
    }

    RECOMMENDATION_TEMPLATES = [
        "Sizin için {count} öneri buldum! 🎉\n\n{recommendations}",
        "İşte size özel {count} deneyim! ✨\n\n{recommendations}",
    ]

    def generate_response(
        self,
        intent: IntentType,
        context: Dict[str, Any] = None,
    ) -> str:
        """Generate response based on intent"""
        import random

        templates = self.TEMPLATES.get(intent, self.TEMPLATES[IntentType.UNKNOWN])
        response = random.choice(templates)

        # Apply context variables if provided
        if context:
            for key, value in context.items():
                response = response.replace(f"{{{key}}}", str(value))

        return response

    def format_recommendations(
        self,
        recommendations: List[Dict],
    ) -> str:
        """Format recommendation list for display"""
        lines = []

        for i, rec in enumerate(recommendations[:5], 1):
            emoji = ["🌟", "💫", "✨", "🎯", "🎁"][i - 1]
            title = rec.get("title", "Deneyim")
            price = rec.get("price", 0)
            reason = rec.get("reason", "")

            lines.append(f"{emoji} **{title}**")
            lines.append(f"   💰 ₺{price:,}")
            if reason:
                lines.append(f"   💡 {reason}")
            lines.append("")

        return "\n".join(lines)


class GiftAdvisor:
    """
    Specialized gift recommendation advisor.

    Provides conversational gift selection flow.
    """

    OCCASION_SUGGESTIONS = {
        "birthday": {
            "categories": ["adventure", "wellness", "luxury"],
            "message": "Doğum günü için macera dolu veya rahatlatıcı deneyimler çok tercih ediliyor!",
        },
        "anniversary": {
            "categories": ["romantic", "luxury", "food"],
            "message": "Yıldönümü için romantik ve özel deneyimler harika olur!",
        },
        "thank_you": {
            "categories": ["food", "wellness", "culture"],
            "message": "Teşekkür hediyesi olarak gurme deneyimler veya spa çok beğeniliyor!",
        },
        "just_because": {
            "categories": ["adventure", "nature", "food"],
            "message": "Sürpriz hediyeler için eğlenceli ve farklı deneyimler öneriyorum!",
        },
    }

    BUDGET_SUGGESTIONS = {
        "low": {"range": (200, 800), "message": "Bu bütçede şehir turları, yemek atölyeleri öne çıkıyor."},
        "medium": {"range": (800, 2500), "message": "Orta bütçe ile harika deneyimler mümkün!"},
        "high": {"range": (2500, 5000), "message": "Premium deneyimler için geniş seçenekler var."},
        "luxury": {"range": (5000, 25000), "message": "VIP ve özel deneyimler için sınır yok!"},
    }

    async def get_suggestions(
        self,
        preferences: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Get gift suggestions based on gathered preferences"""
        occasion = preferences.get("occasion", "just_because")
        budget = preferences.get("budget", "medium")
        recipient_type = preferences.get("recipient_type", "friend")

        # Get occasion-based categories
        occasion_info = self.OCCASION_SUGGESTIONS.get(
            occasion,
            self.OCCASION_SUGGESTIONS["just_because"]
        )

        # Get budget range
        budget_info = self.BUDGET_SUGGESTIONS.get(
            budget,
            self.BUDGET_SUGGESTIONS["medium"]
        )

        # Generate mock recommendations (in production, call recommendation engine)
        recommendations = [
            {
                "moment_id": f"moment-{i}",
                "title": f"Önerilen Deneyim {i}",
                "category": occasion_info["categories"][i % len(occasion_info["categories"])],
                "price": budget_info["range"][0] + (i * 200),
                "reason": occasion_info["message"],
            }
            for i in range(5)
        ]

        return {
            "recommendations": recommendations,
            "occasion_tip": occasion_info["message"],
            "budget_tip": budget_info["message"],
        }


class ChatbotModel(BaseModel):
    """
    Main chatbot model orchestrating all components.

    Provides end-to-end conversational AI.
    """

    def __init__(self):
        super().__init__()
        self.intent_classifier = IntentClassifier()
        self.dialogue_manager = DialogueManager()
        self.response_generator = ResponseGenerator()
        self.gift_advisor = GiftAdvisor()

    async def load(self):
        """Load chatbot components"""
        logger.info("Loading Chatbot model...")

        # In production, load:
        # - Intent classification model
        # - NER model
        # - Response generation model (GPT-like)

        self.loaded = True
        logger.info("✓ Chatbot model loaded")

    async def predict(self, **kwargs) -> Dict[str, Any]:
        """Alias for chat method"""
        return await self.chat(**kwargs)

    async def chat(
        self,
        user_id: str,
        message: str,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Process user message and generate response.

        Args:
            user_id: User identifier
            message: User's message
            session_id: Optional session identifier

        Returns:
            Chatbot response with metadata
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")

        redis = await get_redis()

        # Get or create session
        session = await self.dialogue_manager.get_session(user_id, redis)

        # Add user message to history
        await self.dialogue_manager.add_to_history(
            user_id, "user", message, redis
        )

        # Classify intent
        intent, intent_confidence = self.intent_classifier.classify(message)

        # Check for FAQ match
        faq_answer = self.intent_classifier.get_faq_answer(message)

        # Generate response based on intent and context
        response = await self._generate_contextual_response(
            intent=intent,
            intent_confidence=intent_confidence,
            message=message,
            session=session,
            faq_answer=faq_answer,
        )

        # Add bot response to history
        await self.dialogue_manager.add_to_history(
            user_id, "assistant", response["message"], redis
        )

        # Update session state if needed
        if response.get("new_state"):
            await self.dialogue_manager.update_session(
                user_id,
                {"state": response["new_state"]},
                redis,
            )

        return {
            "message": response["message"],
            "intent": intent.value,
            "intent_confidence": round(intent_confidence, 3),
            "suggestions": response.get("suggestions", []),
            "quick_replies": response.get("quick_replies", []),
            "recommendations": response.get("recommendations"),
            "session_id": session_id or f"session-{user_id}",
        }

    async def _generate_contextual_response(
        self,
        intent: IntentType,
        intent_confidence: float,
        message: str,
        session: Dict,
        faq_answer: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Generate response based on context"""
        current_state = session.get("state", ConversationState.IDLE.value)

        # Handle FAQ match
        if faq_answer and faq_answer["confidence"] > 0.8:
            return {
                "message": faq_answer["answer"],
                "quick_replies": ["Başka sorum var", "Teşekkürler"],
            }

        # Handle greeting
        if intent == IntentType.GREETING:
            return {
                "message": self.response_generator.generate_response(intent),
                "quick_replies": [
                    "Hediye önerisi istiyorum",
                    "Kanıt yükleme yardımı",
                    "SSS",
                ],
            }

        # Handle gift recommendation flow
        if intent == IntentType.GIFT_RECOMMENDATION:
            if current_state == ConversationState.IDLE.value:
                return {
                    "message": self.response_generator.generate_response(intent),
                    "new_state": ConversationState.GATHERING_PREFERENCES.value,
                    "quick_replies": [
                        "Eş/Sevgili için",
                        "Arkadaş için",
                        "Aile için",
                    ],
                }

        # Handle gathering preferences state
        if current_state == ConversationState.GATHERING_PREFERENCES.value:
            return await self._handle_preference_gathering(message, session)

        # Handle proof help
        if intent == IntentType.PROOF_HELP:
            return {
                "message": self.response_generator.generate_response(intent),
                "quick_replies": [
                    "Kanıtım reddedildi",
                    "Hangi fotoğraf geçerli?",
                    "Konum paylaşımı nasıl?",
                ],
            }

        # Handle payment inquiry
        if intent == IntentType.PAYMENT_INQUIRY:
            return {
                "message": self.response_generator.generate_response(intent),
                "quick_replies": [
                    "Komisyon oranları",
                    "İade politikası",
                    "Ödeme yöntemleri",
                ],
            }

        # Handle dispute support
        if intent == IntentType.DISPUTE_SUPPORT:
            return {
                "message": self.response_generator.generate_response(intent),
                "new_state": ConversationState.PROVIDING_HELP.value,
            }

        # Handle feedback
        if intent == IntentType.FEEDBACK:
            return {
                "message": "Geri bildiriminiz için teşekkürler! 🙏 Başka bir konuda yardımcı olabilir miyim?",
                "quick_replies": ["Evet", "Hayır, teşekkürler"],
            }

        # Default response
        return {
            "message": self.response_generator.generate_response(IntentType.UNKNOWN),
            "quick_replies": [
                "Hediye önerisi",
                "Kanıt yardımı",
                "SSS",
            ],
        }

    async def _handle_preference_gathering(
        self,
        message: str,
        session: Dict,
    ) -> Dict[str, Any]:
        """Handle preference gathering flow"""
        preferences = session.get("preferences", {})
        message_lower = message.lower()

        # Detect recipient type
        if not preferences.get("recipient_type"):
            if any(w in message_lower for w in ["eş", "sevgili", "karı", "koca"]):
                preferences["recipient_type"] = "partner"
                preferences["occasion"] = "anniversary"
            elif any(w in message_lower for w in ["arkadaş", "dost"]):
                preferences["recipient_type"] = "friend"
            elif any(w in message_lower for w in ["anne", "baba", "aile"]):
                preferences["recipient_type"] = "family"
            else:
                preferences["recipient_type"] = "other"

            return {
                "message": f"Harika! {message.title()} için güzel bir hediye bulalım 🎁\n\nBütçeniz ne kadar?",
                "preferences": preferences,
                "quick_replies": [
                    "₺500'e kadar",
                    "₺500-₺1500",
                    "₺1500-₺3000",
                    "₺3000+",
                ],
            }

        # Detect budget
        if not preferences.get("budget"):
            if "500" in message and "kadar" in message_lower:
                preferences["budget"] = "low"
            elif "1500" in message or "orta" in message_lower:
                preferences["budget"] = "medium"
            elif "3000" in message or "yüksek" in message_lower:
                preferences["budget"] = "high"
            else:
                preferences["budget"] = "medium"

            # Get recommendations
            suggestions = await self.gift_advisor.get_suggestions(preferences)

            formatted_recs = self.response_generator.format_recommendations(
                suggestions["recommendations"]
            )

            return {
                "message": f"İşte size özel 5 öneri! ✨\n\n{formatted_recs}\n\n{suggestions['occasion_tip']}",
                "preferences": preferences,
                "recommendations": suggestions["recommendations"],
                "new_state": ConversationState.SHOWING_RECOMMENDATIONS.value,
                "quick_replies": [
                    "Daha fazla göster",
                    "Farklı kategori",
                    "Bütçemi değiştir",
                ],
            }

        return {
            "message": "Tercihlerinizi aldım! Size özel öneriler hazırlıyorum... 🔍",
            "preferences": preferences,
        }

    async def get_quick_actions(
        self,
        user_id: str,
    ) -> List[Dict[str, Any]]:
        """Get contextual quick actions for user"""
        redis = await get_redis()

        # Check user's pending items
        pending_proofs = await redis.get(f"pending_proofs:{user_id}")
        pending_gifts = await redis.get(f"pending_gifts:{user_id}")

        actions = [
            {
                "id": "new_gift",
                "label": "🎁 Yeni Hediye Gönder",
                "action": "open_gift_flow",
            },
        ]

        if pending_proofs:
            actions.insert(0, {
                "id": "upload_proof",
                "label": "📸 Kanıt Yükle",
                "action": "open_proof_upload",
                "badge": len(json.loads(pending_proofs)),
            })

        if pending_gifts:
            actions.append({
                "id": "view_gifts",
                "label": "🎉 Bekleyen Hediyeler",
                "action": "open_gifts",
                "badge": len(json.loads(pending_gifts)),
            })

        actions.append({
            "id": "help",
            "label": "❓ Yardım",
            "action": "open_faq",
        })

        return actions
