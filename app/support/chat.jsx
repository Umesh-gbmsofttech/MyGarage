import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AppShell from '../../components/layout/AppShell';
import KeyboardScreen from '../../components/utility/KeyboardScreen';
import { useAuth } from '../../src/context/AuthContext';
import COLORS from '../../theme/colors';
import api from '../../src/services/api';
import useLoadingDots from '../../src/hooks/useLoadingDots';

const FAQ_LIBRARY = {
  default: [
    'How do I book a mechanic?',
    'How does live tracking work?',
    'How do I rate a service?',
  ],
  login: [
    'I forgot my password. What should I do?',
    'Why is my session expiring?',
    'How do I sign in again?',
  ],
  signup: [
    'How do I create a mechanic account?',
    'Why do mechanics need approval?',
    'How do I upload a profile photo?',
  ],
  booking: [
    'How do I accept or decline a booking?',
    'How are OTPs used during service?',
    'How do I report a completed service issue?',
  ],
  diy: [
    'How do DIY guides work?',
    'Can I still book a mechanic after checking DIY?',
    'Which DIY categories are available?',
  ],
  mechanic: [
    'How do I search nearby mechanics?',
    'Why are some mechanics hidden?',
    'What does rating count mean?',
  ],
  profile: [
    'How do I edit my profile?',
    'Can I change my shop status?',
    'How do I upload a new profile image?',
  ],
  tracking: [
    'Why is my map not updating?',
    'Who shares live location during service?',
    'What do the ETA and polyline mean?',
  ],
  garage: [
    'How do I register as a Garage Owner?',
    'How do I add my own mechanics?',
    'How does Garage Owner assignment work?',
  ],
};

const keywordToTopic = (text) => {
  const value = text.toLowerCase();
  if (value.match(/login|signin|session|password/)) return 'login';
  if (value.match(/signup|register|approval|photo/)) return 'signup';
  if (value.match(/booking|otp|accept|decline|report/)) return 'booking';
  if (value.match(/diy|guide|repair|self/)) return 'diy';
  if (value.match(/mechanic|search|speciality|rating/)) return 'mechanic';
  if (value.match(/profile|account|shop active|avatar/)) return 'profile';
  if (value.match(/track|map|eta|polyline|location/)) return 'tracking';
  if (value.match(/garage|worker|assign/)) return 'garage';
  return 'default';
};

export default function SupportChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const sendingDots = useLoadingDots(sending);

  const username = useMemo(() => user?.firstName || user?.name || 'there', [user]);
  const userRole = useMemo(() => user?.role || '', [user]);
  const topic = useMemo(() => keywordToTopic(input), [input]);
  const suggestions = useMemo(() => FAQ_LIBRARY[topic] || FAQ_LIBRARY.default, [topic]);

  useEffect(() => {
    setMessages([
      {
        id: 'greeting',
        from: 'bot',
        title: 'MyGarage Assistant',
        text: `Hello ${username}, I can help with bookings, OTPs, tracking, DIY, approvals, and Garage Owner features.`,
      },
    ]);
  }, [username]);

  const sendMessage = async (text) => {
    if (sending || !text.trim()) return;
    const trimmed = text.trim();
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, from: 'user', text: trimmed },
    ]);
    setInput('');

    try {
      setSending(true);
      const data = await api.chat({ message: trimmed, userName: username, userRole });
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          from: 'bot',
          title: topic === 'default' ? 'Assistant reply' : `${topic[0].toUpperCase()}${topic.slice(1)} help`,
          text: data?.reply || 'Thanks! How else can I help?',
        },
      ]);
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, from: 'bot', title: 'Connection issue', text: 'I could not reach the assistant right now.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell title="Support Chat" hideSupport>
      <KeyboardScreen contentContainerStyle={styles.screen}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Support & Smart FAQs</Text>
          <Text style={styles.heroSubtitle}>
            Ask naturally, or use the live suggestions below the composer to jump into common questions.
          </Text>
        </View>

        <View style={styles.chatCard}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[styles.messageBubble, message.from === 'user' ? styles.userBubble : styles.botBubble]}
            >
              {message.title ? <Text style={styles.messageTitle}>{message.title}</Text> : null}
              <Text style={message.from === 'user' ? styles.userText : styles.botText}>{message.text}</Text>
            </View>
          ))}
          {sending ? (
            <View style={[styles.messageBubble, styles.botBubble]}>
              <Text style={styles.messageTitle}>Assistant</Text>
              <Text style={styles.botText}>Typing{sendingDots}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.composerCard}>
          <TextInput
            placeholder="Ask about login, bookings, OTPs, tracking, Garage Owner setup..."
            placeholderTextColor={COLORS.placeholder}
            value={input}
            onChangeText={setInput}
            style={styles.input}
            multiline
          />

          <View style={styles.suggestionWrap}>
            {suggestions.map((item) => (
              <Pressable key={item} style={styles.chip} onPress={() => sendMessage(item)} disabled={sending}>
                <Text style={styles.chipText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={[styles.sendButton, sending && styles.sendButtonDisabled]} onPress={() => sendMessage(input)} disabled={sending}>
            <Text style={styles.sendButtonText}>{sending ? `Sending${sendingDots}` : 'Send message'}</Text>
          </Pressable>
        </View>
      </KeyboardScreen>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 18,
    gap: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: '#E2E8F0',
    lineHeight: 18,
  },
  chatCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '90%',
    gap: 4,
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
  messageTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  userText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
  },
  botText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },
  composerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
  input: {
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  suggestionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    opacity: 0.8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
