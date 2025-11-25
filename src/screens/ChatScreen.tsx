import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import { Message } from '../types';
import { MOCK_MESSAGES } from '../mocks';

export const ChatScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const otherUser = route.params?.otherUser || {
    name: 'Sarah Johnson',
    avatar: 'https://via.placeholder.com/100',
    trustScore: 95,
  };

  useEffect(() => {
    // Scroll to bottom on mount
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isMine: true,
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAttachProof = () => {
    // Navigate to proof selection
    navigation.navigate('ProofWallet');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.proofPreview) {
      return (
        <View
          style={[
            styles.messageContainer,
            item.isMine ? styles.myMessageContainer : styles.otherMessageContainer,
          ]}
        >
          <TouchableOpacity
            style={[
              styles.proofMessage,
              item.isMine ? styles.myProofMessage : styles.otherProofMessage,
            ]}
            onPress={() =>
              navigation.navigate('ProofDetail', { proofId: item.proofId })
            }
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: item.proofPreview.image }}
              style={styles.proofImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.proofOverlay}
            >
              <View style={styles.proofTypeBadge}>
                <Icon
                  name={
                    item.proofPreview.type === 'micro-kindness'
                      ? 'hand-heart'
                      : 'check-decagram'
                  }
                  size={14}
                  color={COLORS.white}
                />
                <Text style={styles.proofTypeText}>
                  {item.proofPreview.type === 'micro-kindness'
                    ? 'Micro Kindness'
                    : 'Verified Experience'}
                </Text>
              </View>
              <Text style={styles.proofTitle}>{item.proofPreview.title}</Text>
              <View style={styles.proofAction}>
                <Text style={styles.proofActionText}>View Proof</Text>
                <Icon name="arrow-right" size={16} color={COLORS.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <Text
            style={[
              styles.timestamp,
              item.isMine ? styles.myTimestamp : styles.otherTimestamp,
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.isMine ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            item.isMine ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.isMine ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
        <Text
          style={[
            styles.timestamp,
            item.isMine ? styles.myTimestamp : styles.otherTimestamp,
          ]}
        >
          {item.timestamp}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => navigation.navigate('ProfileDetail', { userId: otherUser.id })}
          activeOpacity={0.8}
        >
          <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{otherUser.name}</Text>
            <View style={styles.trustBadge}>
              <Icon name="shield-check" size={12} color={COLORS.white} />
              <Text style={styles.trustScore}>{otherUser.trustScore}% Trust</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            // Show options menu
          }}
        >
          <Icon name="dots-vertical" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachProof}>
            <Icon name="plus-circle" size={28} color={COLORS.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                inputText.trim()
                  ? [COLORS.primary, COLORS.accent]
                  : [COLORS.border, COLORS.border]
              }
              style={styles.sendButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="send" size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: LAYOUT.padding,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userDetails: {
    marginLeft: LAYOUT.padding,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: LAYOUT.padding / 4,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustScore: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: LAYOUT.padding / 4,
  },
  moreButton: {
    padding: LAYOUT.padding / 2,
  },
  messagesList: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 2,
  },
  messageContainer: {
    marginBottom: LAYOUT.padding * 1.5,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding,
    borderRadius: VALUES.borderRadius,
  },
  myMessage: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  myMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: LAYOUT.padding / 2,
  },
  myTimestamp: {
    textAlign: 'right',
  },
  otherTimestamp: {
    textAlign: 'left',
  },
  proofMessage: {
    width: 250,
    height: 200,
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
    position: 'relative',
  },
  myProofMessage: {
    // Additional styles if needed
  },
  otherProofMessage: {
    // Additional styles if needed
  },
  proofImage: {
    width: '100%',
    height: '100%',
  },
  proofOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: LAYOUT.padding,
  },
  proofTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: LAYOUT.padding / 2,
    paddingVertical: LAYOUT.padding / 4,
    borderRadius: VALUES.borderRadius / 4,
    marginBottom: LAYOUT.padding / 2,
  },
  proofTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: LAYOUT.padding / 4,
    textTransform: 'uppercase',
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: LAYOUT.padding / 2,
  },
  proofAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proofActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: LAYOUT.padding / 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  attachButton: {
    padding: LAYOUT.padding / 2,
    marginRight: LAYOUT.padding / 2,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: VALUES.borderRadius,
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding,
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: LAYOUT.padding / 2,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
