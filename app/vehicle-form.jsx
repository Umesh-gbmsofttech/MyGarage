import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../src/context/AuthContext';
import api from '../src/services/api';
import COLORS from '../theme/colors';

const defaultGuides = {
  regular: 'Keep up with oil changes, air filter checks, and brake inspections every 6 months.',
  engineCooling: 'Check coolant levels, radiator hoses, and watch for overheating indicators.',
  tyres: 'Maintain proper PSI, rotate every 5,000 km, and inspect for uneven wear.',
  batteries: 'Clean terminals, check voltage, and test alternator output regularly.',
  brakeSystem: 'Listen for squealing, check brake fluid, and replace pads on time.',
  carClean: 'Wash weekly, wax monthly, and clean interiors with anti-bacterial wipes.',
  emergency: 'Carry jumper cables, a torch, reflective triangles, and a basic toolkit.',
  lights: 'Check headlights, indicators, and fuses; replace bulbs immediately when dim.',
};

export default function VehicleForm() {
  const router = useRouter();
  const { service, mode, mechanicId } = useLocalSearchParams();
  const { token, user } = useAuth();

  const [ vehicleType, setVehicleType ] = useState('');
  const [ model, setModel ] = useState('');
  const [ fuelType, setFuelType ] = useState('');
  const [ issue, setIssue ] = useState('');
  const [ result, setResult ] = useState(null);

  const handleSubmit = async () => {
    if (!vehicleType || !model || !fuelType) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (mode === 'diy') {
      const guide = defaultGuides[ service ] || 'Try a basic inspection or search online for guidance.';
      setResult({
        guide,
        query: `${vehicleType} ${model} ${fuelType} ${service} troubleshooting`,
      });
      return;
    }

    if (!user || !token) {
      Alert.alert('Please login', 'Please login to book a mechanic.');
      return;
    }

    try {
      const booking = await api.createBooking(token, {
        mechanicId: Number(mechanicId),
        vehicleMake: vehicleType,
        vehicleModel: model,
        vehicleYear: fuelType,
        issueDescription: issue || 'General inspection',
      });
      router.replace({ pathname: '/booking', params: { bookingId: booking.id } });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create booking');
    }
  };

  const handleSearch = () => {
    if (!result?.query) return;
    Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(result.query)}`);
  };

  return (
    <AppShell hideChrome hideSupport>
      <View style={ styles.container }>
        <Text style={ styles.heading }>Vehicle Information</Text>
        <TextInput placeholderTextColor={ COLORS.placeholder } placeholder="Vehicle Type" style={ styles.input } value={ vehicleType } onChangeText={ setVehicleType } />
        <TextInput placeholderTextColor={ COLORS.placeholder } placeholder="Model" style={ styles.input } value={ model } onChangeText={ setModel } />
        <TextInput placeholderTextColor={ COLORS.placeholder } placeholder="Fuel Type" style={ styles.input } value={ fuelType } onChangeText={ setFuelType } />
        { mode !== 'diy' && (
          <TextInput
            placeholderTextColor={ COLORS.placeholder }
            placeholder="Describe the issue"
            style={ styles.input }
            value={ issue }
            onChangeText={ setIssue }
            multiline
          />
        ) }
        <TouchableOpacity style={ styles.primaryButton } onPress={ handleSubmit }>
          <Text style={ styles.primaryButtonText }>{ mode === 'diy' ? 'Get DIY Result' : 'Continue' }</Text>
        </TouchableOpacity>

        { result && (
          <View style={ styles.resultCard }>
            <Text style={ styles.resultTitle }>DIY Guidance</Text>
            <Text style={ styles.resultText }>{ result.guide }</Text>
            <TouchableOpacity style={ styles.secondaryButton } onPress={ handleSearch }>
              <Text style={ styles.secondaryButtonText }>Search Google</Text>
            </TouchableOpacity>
          </View>
        ) }
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    alignSelf: 'center',
    borderBottomWidth: 3,
    borderColor: COLORS.primarySoft,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700' },
  resultCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
