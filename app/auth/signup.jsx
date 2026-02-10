import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import COLORS from '../../theme/colors';

const SignUpScreen = () => {
  const { signupOwner, signupMechanic } = useAuth();
  const router = useRouter();
  const [ role, setRole ] = useState('VEHICLE_OWNER');
  const [ showPassword, setShowPassword ] = useState(false);
  const [ profileImage, setProfileImage ] = useState(null);
  const [ imagePickerReady, setImagePickerReady ] = useState(true);
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
        const response = await signupOwner(payload);
        if (profileImage) {
          const formData = new FormData();
          formData.append('file', {
            uri: profileImage.uri,
            name: profileImage.fileName || 'profile.jpg',
            type: profileImage.type || 'image/jpeg',
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
            type: profileImage.type || 'image/jpeg',
          });
          await api.uploadProfileImage(response.token, formData);
        }
      }
      router.replace('/');
    } catch (err) {
      Alert.alert('Error', err.message || 'Signup failed');
    }
  };

  const handlePickImage = async () => {
    let ImagePicker;
    try {
      ImagePicker = await import('expo-image-picker');
      setImagePickerReady(true);
    } catch (err) {
      setImagePickerReady(false);
      Alert.alert('Error', 'Image picker is not available in this build.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }
    const mediaType = ImagePicker.MediaType?.Images || ImagePicker.MediaTypeOptions?.Images;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType,
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[ 0 ]);
    }
  };

  return (
    <AppShell hideChrome hideSupport>
      <View style={ styles.container }>
        <Text style={ styles.title }>Create Account</Text>
        <View style={ styles.roleSwitch }>
          <TouchableOpacity
            style={ [ styles.roleButton, role === 'VEHICLE_OWNER' && styles.roleButtonActive ] }
            onPress={ () => setRole('VEHICLE_OWNER') }
          >
            <Text style={ [ styles.roleText, role === 'VEHICLE_OWNER' && styles.roleTextActive ] }>Vehicle Owner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={ [ styles.roleButton, role === 'MECHANIC' && styles.roleButtonActive ] }
            onPress={ () => setRole('MECHANIC') }
          >
            <Text style={ [ styles.roleText, role === 'MECHANIC' && styles.roleTextActive ] }>Mechanic</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={ styles.imagePicker } onPress={ handlePickImage }>
          { profileImage ? (
            <Image source={ { uri: profileImage.uri } } style={ styles.profilePreview } />
          ) : (
            <Text style={ styles.imagePickerText }>Select Profile Image</Text>
          ) }
        </TouchableOpacity>

        <TextInput placeholderTextColor={ COLORS.placeholder } placeholder="Name" value={ form.name } onChangeText={ (v) => update('name', v) } style={ styles.input } />
        <TextInput placeholderTextColor={ COLORS.placeholder } placeholder="Surname" value={ form.surname } onChangeText={ (v) => update('surname', v) } style={ styles.input } />
        <TextInput placeholderTextColor={ COLORS.placeholder } placeholder="Mobile" value={ form.mobile } onChangeText={ (v) => update('mobile', v) } style={ styles.input } />
        <TextInput placeholderTextColor={ COLORS.placeholder } placeholder="Email" value={ form.email } onChangeText={ (v) => update('email', v) } style={ styles.input } />
        <View style={ styles.passwordRow }>
          <TextInput
            placeholderTextColor={ COLORS.placeholder }
            placeholder="Password"
            value={ form.password }
            onChangeText={ (v) => update('password', v) }
            style={ [ styles.input, styles.passwordInput ] }
            secureTextEntry={ !showPassword }
          />
          <TouchableOpacity style={ styles.eyeButton } onPress={ () => setShowPassword((prev) => !prev) }>
            <Text style={ styles.eyeText }>{ showPassword ? 'Hide' : 'Show' }</Text>
          </TouchableOpacity>
        </View>

        { role === 'MECHANIC' && (
          <>
            <TextInput placeholderTextColor={ COLORS.placeholder } placeholder="Experience" value={ form.experience } onChangeText={ (v) => update('experience', v) } style={ styles.input } />
            <TextInput placeholderTextColor={ COLORS.placeholder } placeholder="Speciality" value={ form.speciality } onChangeText={ (v) => update('speciality', v) } style={ styles.input } />
            <TextInput placeholderTextColor={ COLORS.placeholder } placeholder="City" value={ form.city } onChangeText={ (v) => update('city', v) } style={ styles.input } />
            <View style={ styles.switchRow }>
              <Text style={ styles.switchLabel }>Shop active</Text>
              <Switch value={ form.shopActive } onValueChange={ (v) => update('shopActive', v) } />
            </View>
          </>
        ) }

        <TouchableOpacity style={ styles.primaryButton } onPress={ handleSignup }>
          <Text style={ styles.primaryButtonText }>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={ () => router.push('/auth/signin') }>
          <Text style={ styles.link }>Already have an account? Sign in</Text>
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
  roleSwitch: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  roleText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    color: COLORS.text
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
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
  link: {
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  imagePicker: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.card,
  },
  profilePreview: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  imagePickerText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});

export default SignUpScreen;
