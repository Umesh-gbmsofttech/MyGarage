import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../src/context/AuthContext';
import COLORS from '../../theme/colors';
import api from '../../src/services/api';

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

const findFaqAnswer = (message) => {
  const lowered = message.toLowerCase();
  if (lowered.includes('book')) return FAQS[0].answer;
  if (lowered.includes('profile') || lowered.includes('update')) return FAQS[1].answer;
  if (lowered.includes('pay') || lowered.includes('payment') || lowered.includes('price')) return FAQS[2].answer;
  if (lowered.includes('track') || lowered.includes('location')) return FAQS[3].answer;
  return null;
};

const SupportChatScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const username = useMemo(() => {
    return user?.firstName || user?.name || 'there';
  }, [user]);

  useEffect(() => {
    const greeting = `Hello ${username}, I am your personal assistance for MyGarage, tell me how may I help you today?`;
    setMessages([{ id: 'greeting', from: 'bot', text: greeting }]);
  }, [username]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const outgoing = { id: `user-${Date.now()}`, from: 'user', text };
    setMessages((prev) => [...prev, outgoing]);
    setInput('');

    const faqAnswer = findFaqAnswer(text);
    if (faqAnswer) {
      setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, from: 'bot', text: faqAnswer }]);
      return;
    }

    try {
      setSending(true);
      const data = await api.geminiChat(text);
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
          <View style={styles.mapCard}>
            <Text style={styles.sectionTitle}>MyGarage Service Hub</Text>
            <MapView
              style={styles.map}
              mapType="none"
              initialRegion={{
                latitude: 19.076,
                longitude: 72.8777,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
            >
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
              />
              <Marker
                coordinate={{ latitude: 19.076, longitude: 72.8777 }}
                title="MyGarage HQ"
                description="Support & service hub"
              />
            </MapView>
          </View>

          <View style={styles.chatCard}>
            <View style={styles.chipsRow}>
              {FAQS.map((item) => (
                <TouchableOpacity key={item.id} style={styles.chip} onPress={() => sendMessage(item.question)}>
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
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(input)}>
            <Text style={styles.sendButtonText}>Send</Text>
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
  mapCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  map: {
    width: '100%',
    height: 160,
    borderRadius: 14,
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
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default SupportChatScreen;
