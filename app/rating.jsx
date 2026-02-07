import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../src/context/AuthContext';
import api from '../src/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import COLORS from '../theme/colors';

const RatingScreen = () => {
  const { token } = useAuth();
  const router = useRouter();
  const { mechanicId } = useLocalSearchParams();
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Please login', 'Please login to submit a review.');
      return;
    }
    await api.createReview(token, {
      type: mechanicId ? 'MECHANIC' : 'PLATFORM',
      mechanicId: mechanicId ? Number(mechanicId) : undefined,
      rating: Number(rating),
      comment,
    });
    Alert.alert('Thanks!', 'Your review has been submitted.');
    router.replace('/');
  };

  return (
    <AppShell hideChrome>
      <View style={styles.container}>
        <Text style={styles.title}>{mechanicId ? 'Rate the mechanic' : 'Rate the platform'}</Text>
        <TextInput value={rating} onChangeText={setRating} style={styles.input} keyboardType="numeric" />
        <TextInput
          value={comment}
          onChangeText={setComment}
          style={[styles.input, styles.textArea]}
          placeholder="Share your experience"
          placeholderTextColor={COLORS.placeholder}
          multiline
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E4E8E4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
  },
  primaryButton: {
    backgroundColor: '#1B6B4E',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default RatingScreen;
