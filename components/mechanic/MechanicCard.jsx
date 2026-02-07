import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

const MechanicCard = ({ mechanic }) => {
  const router = useRouter();
  const { user } = useAuth();

  const handleBook = () => {
    if (!user) {
      Alert.alert('Please login', 'Please login to book a mechanic.');
      return;
    }
    router.push({ pathname: '/vehicle-form', params: { mechanicId: mechanic.mechanicId } });
  };

  return (
    <View style={styles.card}>
      <Image
        source={mechanic.profileImageUrl ? { uri: mechanic.profileImageUrl } : require('../../assets/images/profile.png')}
        style={styles.avatar}
      />
      <Text style={styles.name}>{mechanic.mechName} {mechanic.surname}</Text>
      <Text style={styles.speciality}>{mechanic.expertise || mechanic.speciality || 'General'}</Text>
      <Text style={styles.rating}>{(mechanic.rating || 0).toFixed(1)} / ({mechanic.ratingCount || 0})</Text>
      <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E4E8E4',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F2A24',
  },
  speciality: {
    fontSize: 12,
    textAlign: 'center',
    color: '#5C6B64',
    marginVertical: 4,
  },
  rating: {
    fontSize: 12,
    textAlign: 'center',
    color: '#7A847E',
  },
  bookButton: {
    marginTop: 10,
    backgroundColor: '#1B6B4E',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default MechanicCard;
