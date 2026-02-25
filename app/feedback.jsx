import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../src/context/AuthContext';
import api from '../src/services/api';
import COLORS from '../theme/colors';
import useLoadingDots from '../src/hooks/useLoadingDots';

const FeedbackScreen = () => {
  const { token } = useAuth();
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingDots = useLoadingDots(submitting);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!token) {
      setMessage('Please login to send feedback.');
      return;
    }
    try {
      setSubmitting(true);
      await api.createReview(token, { type: 'PLATFORM', rating: Number(rating), comment });
      setMessage('Thanks for the feedback!');
      setComment('');
    } catch (err) {
      setMessage(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Feedback">
      <View style={styles.container}>
        <Text style={styles.title}>Rate the platform</Text>
        <TextInput value={rating} onChangeText={setRating} style={styles.input} keyboardType="numeric" />
        <TextInput
          value={comment}
          onChangeText={setComment}
          style={[styles.input, styles.textArea]}
          placeholder="Share your feedback"
          placeholderTextColor={COLORS.placeholder}
          multiline
        />
        <TouchableOpacity style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? `Submitting${submittingDots}` : 'Submit'}</Text>
        </TouchableOpacity>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
  },
  textArea: {
    minHeight: 90,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  message: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default FeedbackScreen;
