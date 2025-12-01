import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { radii } from '../constants/radii';
import { TYPOGRAPHY } from '../constants/typography';
import { SHADOWS } from '../constants/shadows';
import EmptyState from '../components/EmptyState';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

const messages = [
  { id: '1', text: 'Hey! How are you?', user: 'other' },
  { id: '2', text: 'I am good, thanks!', user: 'me' },
];

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { otherUser } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{otherUser.name}</Text>
        </View>

        {messages.length === 0 ? (
          <EmptyState
            icon="message-text-outline"
            title="No Messages Yet"
            subtitle="Be the first one to say hello!"
          />
        ) : (
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.user === 'me'
                    ? styles.myMessageContainer
                    : styles.otherMessageContainer,
                ]}
              >
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Type a message..." />
          <TouchableOpacity style={styles.sendButton}>
            <MaterialCommunityIcons
              name="send"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    padding: spacing.md,
    ...SHADOWS.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.gray,
    borderRadius: radii.full,
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  listContent: {
    padding: spacing.md,
  },
  messageContainer: {
    borderRadius: radii.md,
    marginBottom: spacing.md,
    maxWidth: '80%',
    padding: spacing.md,
  },
  messageText: {
    ...TYPOGRAPHY.body,
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
  },
  sendButton: {
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
});

export default ChatScreen;
