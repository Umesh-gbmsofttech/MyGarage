import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../src/context/AuthContext';
import api from '../src/services/api';
import COLORS from '../theme/colors';

const FeedbackScreen = () => {
  const { token } = useAuth();
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!token) {
      setMessage('Please login to send feedback.');
      return;
    }
    await api.createReview(token, { type: 'PLATFORM', rating: Number(rating), comment });
    setMessage('Thanks for the feedback!');
    setComment('');
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
        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Submit</Text>
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
