import React, { useState } from 'react';
import { Alert, Image, Linking, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import colors from '../../theme/colors';
import useLoadingDots from '../../src/hooks/useLoadingDots';

const SignUpScreen = () => {
  const { signupOwner, signupMechanic } = useAuth();
  const router = useRouter();
  const [ role, setRole ] = useState('VEHICLE_OWNER');
  const [ showPassword, setShowPassword ] = useState(false);
  const [ profileImage, setProfileImage ] = useState(null);
  const [ submitting, setSubmitting ] = useState(false);
  const [ form, setForm ] = useState({
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

  const update = (key, value) => setForm((prev) => ({ ...prev, [ key ]: value }));
  const submittingDots = useLoadingDots(submitting);

  const ensureMediaPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) return true;

    const message = permission.canAskAgain === false
      ? 'Photo library permission is blocked. Enable Photos and media access in app settings.'
      : 'Please allow access to Photos and media assets to select profile images.';
    Alert.alert(
      'Permission required',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  };

  const isSquareAsset = (asset) => {
    if (!asset) return false;
    if (typeof asset.width !== 'number' || typeof asset.height !== 'number') return true;
    return asset.width === asset.height;
  };

  const handleSignup = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
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
        const response = await signupOwner(payload);
        if (profileImage) {
          const formData = new FormData();
          formData.append('file', {
            uri: profileImage.uri,
            name: profileImage.fileName || 'profile.jpg',
            type: profileImage.mimeType || profileImage.type || 'image/jpeg',
          });
          await api.uploadProfileImage(response.token, formData);
        }
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
        const response = await signupMechanic(payload);
        if (profileImage) {
          const formData = new FormData();
          formData.append('file', {
            uri: profileImage.uri,
            name: profileImage.fileName || 'profile.jpg',
            type: profileImage.mimeType || profileImage.type || 'image/jpeg',
          });
          await api.uploadProfileImage(response.token, formData);
        }
      }
      router.replace('/');
    } catch (err) {
      Alert.alert('Error', err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickImage = async () => {
    if (submitting) return;
    try {
      const allowed = await ensureMediaPermission();
      if (!allowed) {
        return;
      }
      const mediaType = ImagePicker.MediaTypeOptions.Images;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType,
        allowsEditing: true,
        aspect: [ 1, 1 ],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length) {
        const selectedAsset = result.assets[ 0 ];
        if (!isSquareAsset(selectedAsset)) {
          Alert.alert(
            'Square image required',
            'Please crop your profile image to a square.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Crop Again', onPress: handlePickImage },
            ]
          );
          return;
        }
        setProfileImage(selectedAsset);
      }
    } catch (_err) {
      Alert.alert('Error', 'Failed to open image library.');
    }
  };

  return (
    <AppShell hideChrome hideSupport>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={ styles.container } bounces={false}>
          <Text style={ styles.title }>Create Account</Text>
          <View style={ styles.roleSwitch }>
            <TouchableOpacity
              style={ [ styles.roleButton, role === 'VEHICLE_OWNER' && styles.roleButtonActive ] }
              onPress={ () => setRole('VEHICLE_OWNER') }
              disabled={ submitting }
            >
              <Text style={ [ styles.roleText, role === 'VEHICLE_OWNER' && styles.roleTextActive ] }>Vehicle Owner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={ [ styles.roleButton, role === 'MECHANIC' && styles.roleButtonActive ] }
              onPress={ () => setRole('MECHANIC') }
              disabled={ submitting }
            >
              <Text style={ [ styles.roleText, role === 'MECHANIC' && styles.roleTextActive ] }>Mechanic</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={ styles.imagePicker } onPress={ handlePickImage } disabled={ submitting }>
            { profileImage ? (
              <Image source={ { uri: profileImage.uri } } style={ styles.profilePreview } />
            ) : (
              <Text style={ styles.imagePickerText }>Select Profile Image</Text>
            ) }
          </TouchableOpacity>

          <TextInput placeholderTextColor={ colors.placeholder } placeholder="Name" value={ form.name } onChangeText={ (v) => update('name', v) } style={ styles.input } />
          <TextInput placeholderTextColor={ colors.placeholder } placeholder="Surname" value={ form.surname } onChangeText={ (v) => update('surname', v) } style={ styles.input } />
          <TextInput placeholderTextColor={ colors.placeholder } placeholder="Mobile" value={ form.mobile } onChangeText={ (v) => update('mobile', v) } style={ styles.input } />
          <TextInput placeholderTextColor={ colors.placeholder } placeholder="Email" value={ form.email } onChangeText={ (v) => update('email', v) } style={ styles.input } />
          <View style={ styles.passwordRow }>
            <TextInput
              placeholderTextColor={ colors.placeholder }
              placeholder="Password"
              value={ form.password }
              onChangeText={ (v) => update('password', v) }
              style={ [ styles.input, styles.passwordInput ] }
              secureTextEntry={ !showPassword }
            />
            <TouchableOpacity style={ styles.eyeButton } onPress={ () => setShowPassword((prev) => !prev) } disabled={ submitting }>
              <Text style={ styles.eyeText }>{ showPassword ? 'Hide' : 'Show' }</Text>
            </TouchableOpacity>
          </View>

          { role === 'MECHANIC' && (
            <>
              <TextInput placeholderTextColor={ colors.placeholder } placeholder="Experience" value={ form.experience } onChangeText={ (v) => update('experience', v) } style={ styles.input } />
              <TextInput placeholderTextColor={ colors.placeholder } placeholder="Speciality" value={ form.speciality } onChangeText={ (v) => update('speciality', v) } style={ styles.input } />
              <TextInput placeholderTextColor={ colors.placeholder } placeholder="City" value={ form.city } onChangeText={ (v) => update('city', v) } style={ styles.input } />
              <View style={ styles.switchRow }>
                <Text style={ styles.switchLabel }>Shop active</Text>
                <Switch value={ form.shopActive } onValueChange={ (v) => update('shopActive', v) } />
              </View>
            </>
          ) }

          <TouchableOpacity style={ [ styles.primaryButton, submitting && styles.primaryButtonDisabled ] } onPress={ handleSignup } disabled={ submitting }>
            <Text style={ styles.primaryButtonText }>{ submitting ? `Submitting${submittingDots}` : 'Create Account' }</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => router.push('/auth/signin') } disabled={ submitting }>
            <Text style={ styles.link }>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    alignSelf: 'center',
    borderBottomWidth: 3,
    borderColor: colors.primarySoft,

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
    borderColor: colors.primary,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
  },
  roleText: {
    color: colors.primary,
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.card,
    color: colors.text
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
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  eyeText: {
    color: colors.primary,
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
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
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
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  imagePicker: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: colors.card,
  },
  profilePreview: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  imagePickerText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});

export default SignUpScreen;
