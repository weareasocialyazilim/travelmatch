"""
Tests for Turkish NLP Model

Tests cover:
- Sentiment analysis (Turkish)
- Entity extraction
- Content moderation
- Title enhancement
- Hashtag generation
"""

import pytest
from unittest.mock import MagicMock, patch

import sys
sys.path.insert(0, '..')

from app.models.turkish_nlp import TurkishNLPModel, TextEnhancer


class TestTurkishSentiment:
    """Tests for Turkish sentiment analysis"""

    @pytest.fixture
    def model(self):
        return TurkishNLPModel()

    def test_positive_sentiment(self, model):
        """Positive Turkish text should be detected"""
        positive_texts = [
            "Bu deneyim harikaydı, çok beğendim!",
            "Mükemmel bir hediye, teşekkür ederim!",
            "Harika bir gün geçirdik, süper!",
        ]

        for text in positive_texts:
            result = model.analyze_sentiment(text)
            assert result['label'] == 'positive'
            assert result['score'] > 0.5

    def test_negative_sentiment(self, model):
        """Negative Turkish text should be detected"""
        negative_texts = [
            "Çok kötü bir deneyimdi, hayal kırıklığı.",
            "Berbat bir hizmet, asla tavsiye etmem.",
            "Korkunç bir gündü, pişman oldum.",
        ]

        for text in negative_texts:
            result = model.analyze_sentiment(text)
            assert result['label'] == 'negative'
            assert result['score'] < 0.5

    def test_neutral_sentiment(self, model):
        """Neutral Turkish text should be detected"""
        neutral_texts = [
            "Bugün hava güneşliydi.",
            "Saat 15:00'te buluştuk.",
            "İstanbul'da bir restoran.",
        ]

        for text in neutral_texts:
            result = model.analyze_sentiment(text)
            # Neutral should be around 0.5
            assert 0.3 <= result['score'] <= 0.7

    def test_sentiment_confidence(self, model):
        """Sentiment should include confidence"""
        result = model.analyze_sentiment("Çok güzel bir hediye!")
        assert 'confidence' in result
        assert 0 <= result['confidence'] <= 1


class TestEntityExtraction:
    """Tests for named entity recognition"""

    @pytest.fixture
    def model(self):
        return TurkishNLPModel()

    def test_location_extraction(self, model):
        """Should extract Turkish locations"""
        text = "Kapadokya'da balon turu yaptık, sonra İstanbul'a döndük."

        result = model.extract_entities(text)
        locations = [e for e in result if e['type'] == 'location']

        assert len(locations) >= 2
        location_texts = [l['text'].lower() for l in locations]
        assert any('kapadokya' in t for t in location_texts)
        assert any('istanbul' in t for t in location_texts)

    def test_price_extraction(self, model):
        """Should extract prices in Turkish format"""
        text = "Bu tur 1.500 TL, diğeri ise 2000₺'dir."

        result = model.extract_entities(text)
        prices = [e for e in result if e['type'] == 'price']

        assert len(prices) >= 1

    def test_date_extraction(self, model):
        """Should extract Turkish date formats"""
        text = "15 Ocak 2024 tarihinde, Cuma günü buluşalım."

        result = model.extract_entities(text)
        dates = [e for e in result if e['type'] == 'date']

        assert len(dates) >= 1

    def test_category_extraction(self, model):
        """Should extract experience categories"""
        text = "Balon turu ve spa deneyimi harika kombinasyon."

        result = model.extract_entities(text)
        categories = [e for e in result if e['type'] == 'category']

        assert len(categories) >= 1


class TestContentModeration:
    """Tests for Turkish content moderation"""

    @pytest.fixture
    def model(self):
        return TurkishNLPModel()

    def test_clean_content_approved(self, model):
        """Clean content should be approved"""
        clean_texts = [
            "Güzel bir balon turu deneyimi için hediye alıyorum.",
            "Anneme doğum günü sürprizi yapmak istiyorum.",
            "İstanbul'da romantik bir akşam yemeği.",
        ]

        for text in clean_texts:
            result = model.moderate_content(text)
            assert result['approved'] == True
            assert len(result['flags']) == 0

    def test_spam_detection(self, model):
        """Spam content should be flagged"""
        spam_texts = [
            "KAZANDIN!!! Hemen tıkla www.fake.com",
            "Ücretsiz iPhone 15!!! Acele et!",
            "BU FIRSATI KAÇIRMA!!! %99 İNDİRİM!!!",
        ]

        for text in spam_texts:
            result = model.moderate_content(text)
            assert result['approved'] == False
            assert 'spam' in result['flags'] or 'suspicious' in result['flags']

    def test_offensive_content_flagged(self, model):
        """Offensive content should be flagged"""
        # Note: Using mild examples that represent the pattern
        result = model.moderate_content("Bu çok saçma ve aptalca bir şey")

        # Should at least be reviewed
        assert result['toxicityScore'] > 0

    def test_pii_detection(self, model):
        """Personal info should be flagged"""
        text = "Telefon numaram 0532 123 45 67, TC kimlik: 12345678901"

        result = model.moderate_content(text)
        assert 'pii' in result['flags'] or 'personal_info' in result['flags']

    def test_moderation_with_suggestions(self, model):
        """Moderation should suggest edits when possible"""
        text = "Bu ŞOK fiyata SON 1 SAAT!!!"

        result = model.moderate_content(text)
        if not result['approved']:
            assert 'suggestedEdit' in result or 'suggestions' in result


class TestTitleEnhancement:
    """Tests for title enhancement and SEO"""

    @pytest.fixture
    def enhancer(self):
        return TextEnhancer()

    def test_title_enhancement(self, enhancer):
        """Title should be enhanced for better engagement"""
        original = "balon turu"

        result = enhancer.enhance_title(original, category='balon_turu')

        assert 'enhancedTitle' in result
        assert len(result['enhancedTitle']) > len(original)
        assert result['enhancedTitle'] != original.lower()

    def test_title_seo_score(self, enhancer):
        """Enhanced title should have SEO score"""
        result = enhancer.enhance_title(
            "Kapadokya Balon Turu - Gün Doğumu",
            category='balon_turu'
        )

        assert 'seoScore' in result
        assert 0 <= result['seoScore'] <= 100

    def test_title_suggestions(self, enhancer):
        """Should provide improvement suggestions"""
        result = enhancer.enhance_title(
            "tur",
            category='kultur'
        )

        assert 'suggestions' in result
        assert len(result['suggestions']) > 0


class TestHashtagGeneration:
    """Tests for Turkish hashtag generation"""

    @pytest.fixture
    def model(self):
        return TurkishNLPModel()

    def test_hashtag_generation(self, model):
        """Should generate relevant hashtags"""
        result = model.generate_hashtags(
            title="Kapadokya Balon Turu",
            description="Gün doğumunda muhteşem manzara",
            category="balon_turu"
        )

        assert isinstance(result, list)
        assert len(result) > 0
        assert all(tag.startswith('#') for tag in result)

    def test_hashtags_relevant_to_content(self, model):
        """Hashtags should be relevant to content"""
        result = model.generate_hashtags(
            title="İstanbul Boğaz Turu",
            category="gezi"
        )

        # Should include Istanbul-related hashtags
        hashtags_lower = [h.lower() for h in result]
        assert any('istanbul' in h for h in hashtags_lower) or \
               any('boğaz' in h for h in hashtags_lower)

    def test_hashtag_limit(self, model):
        """Should respect hashtag limit"""
        result = model.generate_hashtags(
            title="Test",
            max_hashtags=5
        )

        assert len(result) <= 5

    def test_no_duplicate_hashtags(self, model):
        """Should not have duplicate hashtags"""
        result = model.generate_hashtags(
            title="Kapadokya Kapadokya Balon Turu",
            category="balon_turu"
        )

        # Lowercase comparison for uniqueness
        lowercase_tags = [h.lower() for h in result]
        assert len(lowercase_tags) == len(set(lowercase_tags))


class TestKeywordExtraction:
    """Tests for keyword extraction"""

    @pytest.fixture
    def model(self):
        return TurkishNLPModel()

    def test_keyword_extraction(self, model):
        """Should extract meaningful keywords"""
        text = """
        Kapadokya'da muhteşem bir balon turu deneyimi yaşadık.
        Gün doğumunda gökyüzüne yükselmek inanılmazdı.
        Peri bacalarını yukarıdan görmek çok etkileyiciydi.
        """

        result = model.extract_keywords(text)

        assert isinstance(result, list)
        assert len(result) > 0
        # Should extract relevant keywords
        keywords_lower = [k.lower() for k in result]
        assert any('kapadokya' in k or 'balon' in k for k in keywords_lower)

    def test_stopword_filtering(self, model):
        """Turkish stopwords should be filtered"""
        text = "Bu bir deneyim ve çok güzeldi ama da ile için"

        result = model.extract_keywords(text)

        # Common stopwords should not be in keywords
        stopwords = ['bu', 've', 'bir', 'ama', 'da', 'ile', 'için']
        for keyword in result:
            assert keyword.lower() not in stopwords


class TestLanguageDetection:
    """Tests for language detection"""

    @pytest.fixture
    def model(self):
        return TurkishNLPModel()

    def test_turkish_detection(self, model):
        """Should detect Turkish text"""
        turkish_text = "Merhaba, bugün çok güzel bir gün."

        result = model.detect_language(turkish_text)
        assert result == 'tr'

    def test_english_detection(self, model):
        """Should detect English text"""
        english_text = "Hello, today is a beautiful day."

        result = model.detect_language(english_text)
        assert result == 'en'


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
