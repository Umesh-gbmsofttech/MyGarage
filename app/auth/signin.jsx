import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

const SignInScreen = () => {
  const { signin } = useAuth();
  const router = useRouter();
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ showPassword, setShowPassword ] = useState(false);

  const handleSignin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    try {
      await signin({ email, password });
      router.replace('/');
    } catch (err) {
      Alert.alert('Error', err.message || 'Login failed');
    }
  };

  return (
    <AppShell hideChrome hideSupport>
      <View style={ styles.container }>
        <Text style={ styles.title }>Sign In</Text>
        <TextInput
          placeholderTextColor="#39a87f"
          placeholder="Email"
          value={ email }
          onChangeText={ setEmail }
          style={ styles.input }
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={ styles.passwordRow }>
          <TextInput
            placeholderTextColor="#39a87f"
            placeholder="Password"
            value={ password }
            onChangeText={ setPassword }
            style={ [ styles.input, styles.passwordInput ] }
            secureTextEntry={ !showPassword }
          />
          <TouchableOpacity style={ styles.eyeButton } onPress={ () => setShowPassword((prev) => !prev) }>
            <Text style={ styles.eyeText }>{ showPassword ? 'Hide' : 'Show' }</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={ styles.primaryButton } onPress={ handleSignin }>
          <Text style={ styles.primaryButtonText }>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={ () => router.push('/auth/signup') }>
          <Text style={ styles.link }>Create a new account</Text>
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
    color: '#1B6B4E',
    alignSelf: 'center',
    borderBottomWidth: 3,
    borderColor: '#167716',
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

export default SignInScreen;
