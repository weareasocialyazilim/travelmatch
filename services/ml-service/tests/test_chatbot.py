"""
Tests for AI Chatbot Model

Tests cover:
- Intent classification
- Dialogue management
- Response generation
- Gift advisor flow
- Turkish language support
"""

import pytest
from unittest.mock import MagicMock, patch

import sys
sys.path.insert(0, '..')

from app.models.chatbot import (
    IntentClassifier,
    DialogueManager,
    ResponseGenerator,
    GiftAdvisor,
    ChatbotModel,
)


class TestIntentClassifier:
    """Tests for intent classification"""

    @pytest.fixture
    def classifier(self):
        return IntentClassifier()

    def test_greeting_intent(self, classifier):
        """Should detect greeting intent"""
        greetings = [
            "Merhaba",
            "Selam",
            "İyi günler",
            "Hey",
        ]

        for text in greetings:
            result = classifier.classify(text)
            assert result['intent'] == 'greeting'
            assert result['confidence'] > 0.7

    def test_gift_search_intent(self, classifier):
        """Should detect gift search intent"""
        search_texts = [
            "Hediye arıyorum",
            "Bir şey bulmak istiyorum",
            "Balon turu hediyesi var mı?",
            "Ne önerirsiniz?",
        ]

        for text in search_texts:
            result = classifier.classify(text)
            assert result['intent'] in ['search', 'gift_search', 'recommendation']
            assert result['confidence'] > 0.5

    def test_price_inquiry_intent(self, classifier):
        """Should detect price inquiry"""
        price_texts = [
            "Fiyatı ne kadar?",
            "Bu kaça?",
            "Ne kadar tutar?",
            "Bütçem 2000 TL",
        ]

        for text in price_texts:
            result = classifier.classify(text)
            assert result['intent'] in ['price_inquiry', 'budget']
            assert result['confidence'] > 0.5

    def test_help_intent(self, classifier):
        """Should detect help/support intent"""
        help_texts = [
            "Yardım lazım",
            "Nasıl yapabilirim?",
            "Anlamadım",
            "Bana yardımcı olur musunuz?",
        ]

        for text in help_texts:
            result = classifier.classify(text)
            assert result['intent'] in ['help', 'support', 'faq']

    def test_entity_extraction_with_intent(self, classifier):
        """Should extract entities along with intent"""
        result = classifier.classify(
            "Kapadokya'da balon turu hediyesi arıyorum, bütçem 2500 TL"
        )

        assert 'entities' in result
        # Should extract location, category, and budget
        entity_types = [e['type'] for e in result['entities']]
        assert 'location' in entity_types or 'budget' in entity_types


class TestDialogueManager:
    """Tests for conversation management"""

    @pytest.fixture
    def manager(self):
        return DialogueManager()

    def test_new_conversation(self, manager):
        """Should start new conversation"""
        session = manager.create_session('user-1')

        assert session['user_id'] == 'user-1'
        assert session['state'] == 'initial'
        assert len(session['history']) == 0

    def test_state_transition(self, manager):
        """Should track conversation state"""
        session_id = manager.create_session('user-1')['session_id']

        # User asks about gifts
        manager.process_turn(session_id, {
            'intent': 'gift_search',
            'entities': []
        })

        session = manager.get_session(session_id)
        assert session['state'] != 'initial'

    def test_context_retention(self, manager):
        """Should retain context across turns"""
        session_id = manager.create_session('user-1')['session_id']

        # First turn: set location
        manager.process_turn(session_id, {
            'intent': 'gift_search',
            'entities': [{'type': 'location', 'value': 'istanbul'}]
        })

        # Second turn: ask about price (should remember location)
        manager.process_turn(session_id, {
            'intent': 'price_inquiry',
            'entities': []
        })

        session = manager.get_session(session_id)
        assert session['context'].get('location') == 'istanbul'

    def test_conversation_history(self, manager):
        """Should maintain conversation history"""
        session_id = manager.create_session('user-1')['session_id']

        manager.process_turn(session_id, {'intent': 'greeting', 'entities': []})
        manager.process_turn(session_id, {'intent': 'gift_search', 'entities': []})
        manager.process_turn(session_id, {'intent': 'price_inquiry', 'entities': []})

        session = manager.get_session(session_id)
        assert len(session['history']) == 3


class TestResponseGenerator:
    """Tests for response generation"""

    @pytest.fixture
    def generator(self):
        return ResponseGenerator()

    def test_greeting_response(self, generator):
        """Should generate appropriate greeting"""
        response = generator.generate(
            intent='greeting',
            context={}
        )

        assert 'message' in response
        assert len(response['message']) > 0
        # Should be in Turkish
        assert any(word in response['message'].lower()
                  for word in ['merhaba', 'hoş', 'selam', 'günaydın'])

    def test_response_suggestions(self, generator):
        """Should include quick reply suggestions"""
        response = generator.generate(
            intent='gift_search',
            context={}
        )

        assert 'suggestions' in response
        assert isinstance(response['suggestions'], list)
        assert len(response['suggestions']) > 0

    def test_personalized_response(self, generator):
        """Should personalize based on context"""
        response = generator.generate(
            intent='recommendation',
            context={
                'user_name': 'Ahmet',
                'preferred_category': 'balon_turu'
            }
        )

        # Should include user name or category reference
        message_lower = response['message'].lower()
        assert 'ahmet' in message_lower or 'balon' in message_lower

    def test_error_handling_response(self, generator):
        """Should handle unknown intents gracefully"""
        response = generator.generate(
            intent='unknown_intent',
            context={}
        )

        assert 'message' in response
        # Should ask for clarification
        assert any(word in response['message'].lower()
                  for word in ['anlamadım', 'yardım', 'tekrar', 'açıklar'])


class TestGiftAdvisor:
    """Tests for gift advisor flow"""

    @pytest.fixture
    def advisor(self):
        return GiftAdvisor()

    def test_start_advisory(self, advisor):
        """Should start gift advisory flow"""
        result = advisor.start_session('user-1')

        assert 'session_id' in result
        assert 'first_question' in result
        # Should ask about recipient
        assert any(word in result['first_question'].lower()
                  for word in ['kim', 'hediye', 'kime'])

    def test_collect_recipient_info(self, advisor):
        """Should collect recipient information"""
        session_id = advisor.start_session('user-1')['session_id']

        # Answer: giving to mother
        result = advisor.process_answer(session_id, {
            'answer': 'Anneme hediye alacağım'
        })

        assert result['collected'].get('relationship') == 'anne' or \
               result['collected'].get('recipient_type') == 'anne'
        assert 'next_question' in result

    def test_budget_collection(self, advisor):
        """Should collect budget information"""
        session_id = advisor.start_session('user-1')['session_id']

        result = advisor.process_answer(session_id, {
            'answer': 'Bütçem 2000-3000 TL arası'
        })

        if 'budget' in result['collected']:
            assert result['collected']['budget']['min'] >= 2000
            assert result['collected']['budget']['max'] <= 3000

    def test_generate_suggestions(self, advisor):
        """Should generate gift suggestions"""
        session_id = advisor.start_session('user-1')['session_id']

        # Complete the flow
        advisor.process_answer(session_id, {'answer': 'Anneme'})
        advisor.process_answer(session_id, {'answer': 'Spa ve wellness sever'})
        advisor.process_answer(session_id, {'answer': '2000 TL bütçem var'})

        suggestions = advisor.get_suggestions(session_id)

        assert 'suggestions' in suggestions
        assert len(suggestions['suggestions']) > 0
        assert 'reasoning' in suggestions

    def test_gift_analysis(self, advisor):
        """Should analyze a gift choice"""
        result = advisor.analyze_gift(
            moment_id='moment-spa',
            recipient_info={
                'relationship': 'anne',
                'age': 55,
                'interests': ['spa', 'wellness']
            }
        )

        assert 'matchScore' in result
        assert 'pros' in result
        assert 'cons' in result


class TestChatbotModel:
    """Integration tests for full chatbot"""

    @pytest.fixture
    def chatbot(self):
        return ChatbotModel()

    def test_simple_conversation(self, chatbot):
        """Should handle simple conversation"""
        response = chatbot.chat(
            message="Merhaba",
            user_id='user-1'
        )

        assert 'message' in response
        assert 'intent' in response
        assert 'confidence' in response

    def test_multi_turn_conversation(self, chatbot):
        """Should handle multi-turn conversation"""
        # Turn 1
        response1 = chatbot.chat(
            message="Hediye arıyorum",
            user_id='user-1'
        )

        # Turn 2
        response2 = chatbot.chat(
            message="Kapadokya'da bir şey olsun",
            user_id='user-1',
            conversation_history=[
                {'role': 'user', 'content': "Hediye arıyorum"},
                {'role': 'assistant', 'content': response1['message']}
            ]
        )

        # Should remember context
        assert 'kapadokya' in response2['message'].lower() or \
               any('kapadokya' in s.lower() for s in response2.get('suggestions', []))

    def test_quick_actions(self, chatbot):
        """Should provide context-aware quick actions"""
        actions = chatbot.get_quick_actions('user-1')

        assert isinstance(actions, list)
        for action in actions:
            assert 'id' in action
            assert 'label' in action
            assert 'action' in action

    def test_fallback_handling(self, chatbot):
        """Should handle unrecognized input gracefully"""
        response = chatbot.chat(
            message="asdfghjkl random text",
            user_id='user-1'
        )

        assert 'message' in response
        # Should not crash, should ask for clarification


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
