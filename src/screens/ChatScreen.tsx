import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React, { useEffect, useRef, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { MOCK_MESSAGES } from '../mocks';
import { Message } from '../types';
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';
import { COLORS } from '../constants/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChatScreenProps = StackScreenProps<RootStackParamList, 'Chat'>;

export const ChatScreen: React.FC<ChatScreenProps> = ({
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
            item.isMine
              ? styles.myMessageContainer
              : styles.otherMessageContainer,
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
              colors={[COLORS.transparent, COLORS.blackTransparent]}
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
          item.isMine
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
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
          onPress={() =>
            navigation.navigate('ProfileDetail', { userId: otherUser.id })
          }
          activeOpacity={0.8}
        >
          <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{otherUser.name}</Text>
            <View style={styles.trustBadge}>
              <Icon name="shield-check" size={12} color={COLORS.white} />
              <Text style={styles.trustScore}>
                {otherUser.trustScore}% Trust
              </Text>
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
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleAttachProof}
          >
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
  attachButton: {
    marginRight: LAYOUT.padding / 2,
    padding: LAYOUT.padding / 2,
  },
  avatar: {
    borderColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    width: 40,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: VALUES.borderRadius,
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    maxHeight: 100,
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding,
  },
  inputContainer: {
    alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding,
  },
  messageBubble: {
    borderRadius: VALUES.borderRadius,
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding,
  },
  messageContainer: {
    marginBottom: LAYOUT.padding * 1.5,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  messagesList: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 2,
  },
  moreButton: {
    padding: LAYOUT.padding / 2,
  },
  myMessage: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  myMessageText: {
    color: COLORS.white,
  },
  myProofMessage: {
    // Additional styles if needed
  },
  myTimestamp: {
    textAlign: 'right',
  },
  otherMessage: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  otherMessageText: {
    color: COLORS.text,
  },
  otherProofMessage: {
    // Additional styles if needed
  },
  otherTimestamp: {
    textAlign: 'left',
  },
  proofAction: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  proofActionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginRight: LAYOUT.padding / 4,
  },
  proofImage: {
    height: '100%',
    width: '100%',
  },
  proofMessage: {
    borderRadius: VALUES.borderRadius,
    height: 200,
    overflow: 'hidden',
    position: 'relative',
    width: 250,
  },
  proofOverlay: {
    bottom: 0,
    left: 0,
    padding: LAYOUT.padding,
    position: 'absolute',
    right: 0,
  },
  proofTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 2,
  },
  proofTypeBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.whiteTransparent,
    borderRadius: VALUES.borderRadius / 4,
    flexDirection: 'row',
    marginBottom: LAYOUT.padding / 2,
    paddingHorizontal: LAYOUT.padding / 2,
    paddingVertical: LAYOUT.padding / 4,
  },
  proofTypeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: LAYOUT.padding / 4,
    textTransform: 'uppercase',
  },
  sendButton: {
    borderRadius: 22,
    marginLeft: LAYOUT.padding / 2,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  timestamp: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: LAYOUT.padding / 2,
  },
  trustBadge: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  trustScore: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: LAYOUT.padding / 4,
  },
  userDetails: {
    marginLeft: LAYOUT.padding,
  },
  userInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginLeft: LAYOUT.padding,
  },
  userName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 4,
  },
});
