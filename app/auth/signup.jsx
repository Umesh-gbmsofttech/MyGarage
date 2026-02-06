import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

const SignUpScreen = () => {
  const { signupOwner, signupMechanic } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState('VEHICLE_OWNER');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    surname: '',
    mobile: '',
    email: '',
    password: '',
    experience: '',
    speciality: '',
    city: '',
    shopActive: true,
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSignup = async () => {
    try {
      if (role === 'VEHICLE_OWNER') {
        if (!form.name || !form.surname || !form.mobile || !form.email) {
          Alert.alert('Error', 'Please fill all fields.');
          return;
        }
        const payload = {
          name: form.name,
          surname: form.surname,
          mobile: form.mobile,
          email: form.email,
          password: form.password || 'MyGaragePassword',
          role: 'OWNER',
        };
        console.log('Signup payload:', payload);
        await signupOwner(payload);
      } else {
        if (!form.name || !form.surname || !form.mobile || !form.email || !form.experience || !form.speciality || !form.city || !form.shopActive) {
          Alert.alert('Error', 'Please fill all fields.');
          return;
        }
        const payload = {
          mechName: form.name,
          surname: form.surname,
          mobile: form.mobile,
          email: form.email,
          password: form.password || 'MyGaragePassword',
          experience: form.experience,
          speciality: form.speciality,
          city: form.city,
          shopAct: form.shopActive,
          role: 'MECHANIC',
        };
        console.log('Signup payload:', payload);
        await signupMechanic(payload);
      }
      router.replace('/');
    } catch (err) {
      Alert.alert('Error', err.message || 'Signup failed');
    }
  };

  return (
    <AppShell hideChrome hideSupport>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <View style={styles.roleSwitch}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'VEHICLE_OWNER' && styles.roleButtonActive]}
            onPress={() => setRole('VEHICLE_OWNER')}
          >
            <Text style={[styles.roleText, role === 'VEHICLE_OWNER' && styles.roleTextActive]}>Vehicle Owner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'MECHANIC' && styles.roleButtonActive]}
            onPress={() => setRole('MECHANIC')}
          >
            <Text style={[styles.roleText, role === 'MECHANIC' && styles.roleTextActive]}>Mechanic</Text>
          </TouchableOpacity>
        </View>

        <TextInput placeholder="Name" value={form.name} onChangeText={(v) => update('name', v)} style={styles.input} />
        <TextInput placeholder="Surname" value={form.surname} onChangeText={(v) => update('surname', v)} style={styles.input} />
        <TextInput placeholder="Mobile" value={form.mobile} onChangeText={(v) => update('mobile', v)} style={styles.input} />
        <TextInput placeholder="Email" value={form.email} onChangeText={(v) => update('email', v)} style={styles.input} />
        <View style={styles.passwordRow}>
          <TextInput
            placeholder="Password"
            value={form.password}
            onChangeText={(v) => update('password', v)}
            style={[styles.input, styles.passwordInput]}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((prev) => !prev)}>
            <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        {role === 'MECHANIC' && (
          <>
            <TextInput placeholder="Experience" value={form.experience} onChangeText={(v) => update('experience', v)} style={styles.input} />
            <TextInput placeholder="Speciality" value={form.speciality} onChangeText={(v) => update('speciality', v)} style={styles.input} />
            <TextInput placeholder="City" value={form.city} onChangeText={(v) => update('city', v)} style={styles.input} />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Shop active</Text>
              <Switch value={form.shopActive} onValueChange={(v) => update('shopActive', v)} />
            </View>
          </>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={handleSignup}>
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth/signin')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2A24',
  },
  roleSwitch: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1B6B4E',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#1B6B4E',
  },
  roleText: {
    color: '#1B6B4E',
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E4E8E4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E8E4',
    backgroundColor: '#FFFFFF',
  },
  eyeText: {
    color: '#1B6B4E',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2A24',
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
  link: {
    color: '#1B6B4E',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SignUpScreen;
