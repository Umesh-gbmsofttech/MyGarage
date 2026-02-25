import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../src/context/AuthContext';
import COLORS from '../../theme/colors';
import api from '../../src/services/api';
import useLoadingDots from '../../src/hooks/useLoadingDots';

const FAQS = [
  {
    id: 'booking',
    question: 'How does booking work?',
    answer:
      'Open Book Now, choose a mechanic, add vehicle details and issue, then submit. You can track status in My Bookings.',
  },
  {
    id: 'profile',
    question: 'How do I update my profile?',
    answer:
      'Go to Profile tab, tap Edit Profile, update your details, and Save. You can also change your profile image there.',
  },
  {
    id: 'payment',
    question: 'How do I pay for a service?',
    answer:
      'Payments are handled after service completion. The mechanic will confirm completion, then you can settle the amount.',
  },
  {
    id: 'tracking',
    question: 'Can I track the mechanic?',
    answer:
      'Yes. Once a booking is accepted, Live Tracking appears on the booking details screen.',
  },
];

const SupportChatScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const sendingDots = useLoadingDots(sending);

  const username = useMemo(() => {
    return user?.firstName || user?.name || 'there';
  }, [user]);

  useEffect(() => {
    const greeting = `Hello ${username}, I am your personal assistance for MyGarage, tell me how may I help you today?`;
    setMessages([{ id: 'greeting', from: 'bot', text: greeting }]);
  }, [username]);

  const sendMessage = async (text) => {
    if (sending || !text.trim()) return;
    const outgoing = { id: `user-${Date.now()}`, from: 'user', text };
    setMessages((prev) => [...prev, outgoing]);
    setInput('');

    try {
      setSending(true);
      const data = await api.chat(text);
      const reply = data?.reply || 'Thanks! How else can I help?';
      setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, from: 'bot', text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, from: 'bot', text: 'I could not reach the assistant right now.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell title="Support Chat" hideSupport>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.chatCard}>
            <View style={styles.chipsRow}>
              {FAQS.map((item) => (
                <TouchableOpacity key={item.id} style={[styles.chip, sending && styles.chipDisabled]} onPress={() => sendMessage(item.question)} disabled={sending}>
                  <Text style={styles.chipText}>{item.question}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.messages}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.from === 'user' ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text style={message.from === 'user' ? styles.userText : styles.botText}>{message.text}</Text>
                </View>
              ))}
              {sending && (
                <View style={[styles.messageBubble, styles.botBubble]}>
                  <Text style={styles.botText}>Typing...</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Ask about bookings, profile updates..."
            placeholderTextColor={COLORS.placeholder}
            value={input}
            onChangeText={setInput}
            style={styles.input}
            editable={!sending}
          />
          <TouchableOpacity style={[styles.sendButton, sending && styles.sendButtonDisabled]} onPress={() => sendMessage(input)} disabled={sending}>
            <Text style={styles.sendButtonText}>{sending ? `Sending${sendingDots}` : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    gap: 16,
    paddingBottom: 120,
  },
  chatCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipDisabled: {
    opacity: 0.6,
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  messages: {
    gap: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  botText: {
    color: COLORS.text,
    fontSize: 13,
  },
  inputRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default SupportChatScreen;
