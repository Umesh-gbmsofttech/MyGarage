import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import COLORS from '../../theme/colors';

const SignInScreen = () => {
  const { signin } = useAuth();
  const router = useRouter();
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ showPassword, setShowPassword ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ loadingDots, setLoadingDots ] = useState('');

  useEffect(() => {
    if (!loading) {
      setLoadingDots('');
      return;
    }
    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev.length >= 3 ? '' : `${prev}.`));
    }, 350);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSignin = async () => {
    if (loading) return;
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      await signin({ email, password });
      router.replace('/');
    } catch (err) {
      Alert.alert('Error', err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell hideChrome hideSupport>
      <View style={ styles.container }>
        <Text style={ styles.title }>Sign In</Text>
        <TextInput
          placeholderTextColor={COLORS.placeholder}
          placeholder="Email"
          value={ email }
          onChangeText={ setEmail }
          style={ styles.input }
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={ styles.passwordRow }>
          <TextInput
            placeholderTextColor={COLORS.placeholder}
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
        <TouchableOpacity
          style={ [ styles.primaryButton, loading && styles.primaryButtonDisabled ] }
          onPress={ handleSignin }
          disabled={ loading }
        >
          <Text style={ styles.primaryButtonText }>{ loading ? `Loading${loadingDots}` : 'Sign In' }</Text>
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
    color: COLORS.primary,
    alignSelf: 'center',
    borderBottomWidth: 3,
    borderColor: COLORS.primarySoft,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
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
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  eyeText: {
    color: COLORS.primary,
    fontWeight: '700',
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
  link: {
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SignInScreen;
