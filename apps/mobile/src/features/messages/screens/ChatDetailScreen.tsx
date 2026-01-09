import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants/colors';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useScreenSecurity } from '@/hooks/useScreenSecurity';
import { logger } from '@/utils/logger';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { LiquidTextInput } from '@/components/ui/LiquidTextInput';
import { showAlert } from '@/stores/modalStore';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  otherUserAvatar?: string;
  onRetry?: (message: Message) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar,
  otherUserAvatar,
  onRetry,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View
      style={[
        styles.messageBubbleContainer,
        isOwnMessage
          ? styles.ownMessageContainer
          : styles.otherMessageContainer,
      ]}
    >
      {!isOwnMessage && showAvatar && (
        <Image
          source={{ uri: otherUserAvatar }}
          style={styles.messageAvatar}
          contentFit="cover"
        />
      )}
      {!isOwnMessage && !showAvatar && (
        <View style={styles.avatarPlaceholder} />
      )}

      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={isOwnMessage ? 40 : 20}
            tint={isOwnMessage ? 'light' : 'dark'}
            style={styles.messageBubbleContent}
          >
            <Text style={styles.messageText}>{message.content}</Text>
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>
                {formatTime(message.createdAt)}
              </Text>
              {isOwnMessage && message.status !== 'error' && (
                <MaterialCommunityIcons
                  name={
                    message.status === 'read'
                      ? 'check-all'
                      : message.status === 'delivered'
                        ? 'check-all'
                        : 'check'
                  }
                  size={14}
                  color={
                    message.status === 'read' ? '#3B82F6' : COLORS.text.muted
                  }
                  style={styles.statusIcon}
                />
              )}
              {isOwnMessage && message.status === 'error' && onRetry && (
                <TouchableOpacity
                  onPress={() => onRetry(message)}
                  style={styles.retryButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={16}
                    color="#FF4444"
                  />
                  <Text style={styles.retryText}>Tekrar Dene</Text>
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        ) : (
          <View style={styles.messageBubbleContent}>
            <Text style={styles.messageText}>{message.content}</Text>
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>
                {formatTime(message.createdAt)}
              </Text>
              {isOwnMessage && (
                <MaterialCommunityIcons
                  name={
                    message.status === 'read'
                      ? 'check-all'
                      : message.status === 'delivered'
                        ? 'check-all'
                        : 'check'
                  }
                  size={14}
                  color={
                    message.status === 'read' ? '#3B82F6' : COLORS.text.muted
                  }
                  style={styles.statusIcon}
                />
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const ChatDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ChatDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const { t } = useTranslation();

  // Security: Prevent screenshots in private conversations
  useScreenSecurity();

  const { conversationId, otherUser: routeOtherUser } = route.params;

  // Provide default fallback for otherUser to prevent undefined errors
  const otherUser = routeOtherUser || {
    id: '',
    name: 'Unknown User',
    avatarUrl: null,
  };

  const { user: currentUser } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const {
    sendMessage,
    loadMessages: loadConversationMessages,
    messages: hookMessages,
    markAsRead,
  } = useMessages();

  // Load messages on mount with cleanup
  useEffect(() => {
    let isMounted = true;

    if (conversationId) {
      const fetchMessages = async () => {
        if (isMounted) {
          await loadConversationMessages(conversationId);
          markAsRead(conversationId);
        }
      };
      fetchMessages();
    }

    return () => {
      isMounted = false;
    };
  }, [conversationId, loadConversationMessages, markAsRead]);

  // Sync messages from hook
  useEffect(() => {
    if (hookMessages.length > 0) {
      setMessages(hookMessages as Message[]);
    }
  }, [hookMessages]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !conversationId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const tempId = Date.now().toString();
    const newMessage: Message = {
      id: tempId,
      content: messageText.trim(),
      senderId: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setMessages((prev) => [newMessage, ...prev]);
    setMessageText('');

    try {
      await sendMessage({
        conversationId,
        content: messageText.trim(),
        type: 'text',
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'sent' } : m)),
      );
    } catch (error) {
      logger.error('[Chat] Failed to send message:', error);
      // CRITICAL FIX: Mark message as failed with error status
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'error' } : m)),
      );
      // Show error toast
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [messageText, conversationId, currentUser, sendMessage]);

  // Retry failed message
  const handleRetry = useCallback(
    async (message: Message) => {
      if (!conversationId) return;

      // Update status to sending
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, status: 'sending' } : m,
        ),
      );

      try {
        await sendMessage({
          conversationId,
          content: message.content,
          type: 'text',
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, status: 'sent' } : m)),
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        logger.error('[Chat] Retry failed:', error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id ? { ...m, status: 'error' } : m,
          ),
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [conversationId, sendMessage],
  );

  // Handle attachment button press - show options for photo/location
  const handleAttachmentPress = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const options = [
      { label: 'Fotoğraf Çek', action: 'camera' },
      { label: 'Galeriden Seç', action: 'gallery' },
      { label: 'Konum Gönder', action: 'location' },
      { label: 'İptal', action: 'cancel' },
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: options.map((o) => o.label),
          cancelButtonIndex: options.length - 1,
        },
        async (buttonIndex) => {
          const action = options[buttonIndex]?.action;
          if (action === 'camera') {
            await handleCameraCapture();
          } else if (action === 'gallery') {
            await handleGalleryPick();
          } else if (action === 'location') {
            handleLocationShare();
          }
        },
      );
    } else {
      // Android: Use Alert with buttons
      showAlert({
        title: 'Ekle',
        message: 'Ne göndermek istiyorsunuz?',
        buttons: [
          { text: 'Fotoğraf Çek', onPress: handleCameraCapture },
          { text: 'Galeriden Seç', onPress: handleGalleryPick },
          { text: 'Konum Gönder', onPress: handleLocationShare },
          { text: 'İptal', style: 'cancel' },
        ],
      });
    }
  }, []);

  // Handle camera capture
  const handleCameraCapture = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'İzin Gerekli',
          message: 'Fotoğraf çekebilmek için kamera izni gerekiyor.',
          buttons: [{ text: 'Tamam' }],
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        // TODO: Upload image and send as message
        logger.info('[Chat] Camera image captured:', result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showAlert({
          title: 'Yakında',
          message: 'Fotoğraf gönderme özelliği yakında aktif olacak!',
          buttons: [{ text: 'Tamam' }],
        });
      }
    } catch (error) {
      logger.error('[Chat] Camera capture failed:', error);
    }
  }, []);

  // Handle gallery pick
  const handleGalleryPick = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'İzin Gerekli',
          message: 'Fotoğraf seçebilmek için galeri izni gerekiyor.',
          buttons: [{ text: 'Tamam' }],
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // TODO: Upload image and send as message
        logger.info('[Chat] Gallery image selected:', result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showAlert({
          title: 'Yakında',
          message: 'Fotoğraf gönderme özelliği yakında aktif olacak!',
          buttons: [{ text: 'Tamam' }],
        });
      }
    } catch (error) {
      logger.error('[Chat] Gallery pick failed:', error);
    }
  }, []);

  // Handle location share
  const handleLocationShare = useCallback(() => {
    // TODO: Implement location sharing
    logger.info('[Chat] Location share requested');
    showAlert({
      title: 'Yakında',
      message: 'Konum gönderme özelliği yakında aktif olacak!',
      buttons: [{ text: 'Tamam' }],
    });
  }, []);

  // Handle more button press - show block/report options
  const handleMorePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const options = [
      { label: 'Profili Görüntüle', action: 'profile' },
      { label: 'Kullanıcıyı Engelle', action: 'block', destructive: true },
      { label: 'Şikayet Et', action: 'report', destructive: true },
      { label: 'İptal', action: 'cancel' },
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: options.map((o) => o.label),
          destructiveButtonIndex: options.findIndex((o) => o.action === 'block'),
          cancelButtonIndex: options.length - 1,
        },
        (buttonIndex) => {
          const action = options[buttonIndex]?.action;
          if (action === 'profile') {
            navigation.navigate('ProfileDetail', { userId: otherUser.id });
          } else if (action === 'block') {
            handleBlockUser();
          } else if (action === 'report') {
            handleReportUser();
          }
        },
      );
    } else {
      // Android: Use Alert
      showAlert({
        title: 'Seçenekler',
        message: `${otherUser.name} için ne yapmak istiyorsunuz?`,
        buttons: [
          {
            text: 'Profili Görüntüle',
            onPress: () => navigation.navigate('ProfileDetail', { userId: otherUser.id }),
          },
          {
            text: 'Kullanıcıyı Engelle',
            style: 'destructive',
            onPress: handleBlockUser,
          },
          {
            text: 'Şikayet Et',
            style: 'destructive',
            onPress: handleReportUser,
          },
          { text: 'İptal', style: 'cancel' },
        ],
      });
    }
  }, [navigation, otherUser]);

  // Handle block user
  const handleBlockUser = useCallback(() => {
    showAlert({
      title: 'Kullanıcıyı Engelle',
      message: `${otherUser.name} adlı kullanıcıyı engellemek istediğinizden emin misiniz? Bu kullanıcı size mesaj gönderemeyecek ve sizi göremeyecek.`,
      buttons: [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Engelle',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement block user API call
              logger.info('[Chat] Blocking user:', otherUser.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.goBack();
            } catch (error) {
              logger.error('[Chat] Block user failed:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ],
    });
  }, [otherUser, navigation]);

  // Handle report user
  const handleReportUser = useCallback(() => {
    const reportReasons = [
      'Uygunsuz içerik',
      'Spam veya dolandırıcılık',
      'Rahatsız edici davranış',
      'Sahte profil',
      'Diğer',
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Şikayet Nedeni',
          options: [...reportReasons, 'İptal'],
          cancelButtonIndex: reportReasons.length,
        },
        (buttonIndex) => {
          if (buttonIndex < reportReasons.length) {
            submitReport(reportReasons[buttonIndex]);
          }
        },
      );
    } else {
      showAlert({
        title: 'Şikayet Nedeni',
        message: 'Lütfen şikayet nedeninizi seçin:',
        buttons: [
          ...reportReasons.map((reason) => ({
            text: reason,
            onPress: () => submitReport(reason),
          })),
          { text: 'İptal', style: 'cancel' as const },
        ],
      });
    }
  }, []);

  // Submit report
  const submitReport = useCallback(
    async (reason: string) => {
      try {
        // TODO: Implement report API call
        logger.info('[Chat] Reporting user:', { userId: otherUser.id, reason });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showAlert({
          title: 'Teşekkürler',
          message: 'Şikayetiniz alındı. En kısa sürede incelenecektir.',
          buttons: [{ text: 'Tamam' }],
        });
      } catch (error) {
        logger.error('[Chat] Report user failed:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [otherUser],
  );

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwnMessage = item.senderId === currentUser?.id;
      const nextMessage = messages[index + 1];
      const showAvatar =
        !isOwnMessage &&
        (!nextMessage || nextMessage.senderId !== item.senderId);

      return (
        <MessageBubble
          message={item}
          isOwnMessage={isOwnMessage}
          showAvatar={showAvatar}
          otherUserAvatar={otherUser.avatarUrl ?? undefined}
          onRetry={handleRetry}
        />
      );
    },
    [currentUser, messages, otherUser, handleRetry],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.userInfo}
            onPress={() =>
              navigation.navigate('ProfileDetail', { userId: otherUser.id })
            }
          >
            <Image
              source={{
                uri:
                  otherUser.avatarUrl ||
                  'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(otherUser.name || 'User'),
              }}
              style={styles.headerAvatar}
              contentFit="cover"
            />
            <View>
              <Text style={styles.headerName}>{otherUser.name}</Text>
              <Text style={styles.headerStatus}>
                {'lastSeen' in otherUser && otherUser.lastSeen
                  ? 'Online'
                  : 'Offline'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={handleMorePress}
            accessibilityLabel="Seçenekler"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>
        </View>
        <LinearGradient
          colors={['rgba(204, 255, 0, 0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        />
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      />

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.bottom}
      >
        <View
          style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}
        >
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleAttachmentPress}
            accessibilityLabel="Dosya ekle"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>

          <LiquidTextInput
            placeholder={t('messages.input.placeholder')}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            accessibilityLabel={t('messages.input.placeholder')}
            breathingColor={COLORS.primary}
            containerStyle={styles.inputWrapper}
            style={styles.textInput}
            blurIntensity={20}
            focusedBlurIntensity={60}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              messageText.trim() && styles.sendButtonActive,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={messageText.trim() ? '#fff' : COLORS.text.muted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  headerWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  headerGradient: {
    height: 2,
    width: '100%',
  },
  backButton: {
    padding: 4,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerStatus: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  moreButton: {
    padding: 8,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: COLORS.background.tertiary,
  },
  avatarPlaceholder: {
    width: 36,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  messageBubbleContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownMessage: {
    backgroundColor: 'rgba(204, 255, 0, 0.3)',
    borderBottomRightRadius: 4,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor:
      Platform.OS === 'ios' ? 'rgba(204, 255, 0, 0.4)' : 'transparent',
  },
  otherMessage: {
    backgroundColor:
      Platform.OS === 'ios'
        ? 'rgba(39, 39, 42, 0.6)'
        : COLORS.background.secondary,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
  statusIcon: {
    marginLeft: 2,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  retryText: {
    fontSize: 11,
    color: '#FF4444',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border.default,
    backgroundColor: COLORS.background.primary,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text.primary,
    maxHeight: 100,
    padding: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: COLORS.brand.primary,
  },
});

export default withErrorBoundary(ChatDetailScreen, {
  displayName: 'ChatDetailScreen',
});
