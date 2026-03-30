import React, { useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import AppShell from '../../components/layout/AppShell';
import KeyboardScreen from '../../components/utility/KeyboardScreen';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
import COLORS from '../../theme/colors';
import useLoadingDots from '../../src/hooks/useLoadingDots';

export default function GarageOwnerRegisterScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState({
    city: '',
    speciality: '',
    expertise: '',
    about: '',
  });
  const [shopActFile, setShopActFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadingDots = useLoadingDots(loading);
  const documentPreview = useMemo(() => {
    if (!shopActFile) return null;
    const lowerName = shopActFile.name?.toLowerCase() || '';
    const isPdf = shopActFile.mimeType === 'application/pdf' || lowerName.endsWith('.pdf');
    return { isPdf, uri: shopActFile.uri, name: shopActFile.name || 'Selected document' };
  }, [shopActFile]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!token) return;
    if (!form.city || !form.speciality) {
      Alert.alert('Missing details', 'City and speciality are required to register as a Garage Owner.');
      return;
    }
    if (!shopActFile) {
      Alert.alert('Missing document', 'Please upload your Shop Act or authorized garage document.');
      return;
    }
    try {
      setLoading(true);
      await api.registerGarageOwner(token, form);
      const formData = new FormData();
      formData.append('file', {
        uri: shopActFile.uri,
        name: shopActFile.name || 'shop-act',
        type: shopActFile.mimeType || 'application/octet-stream',
      });
      await api.uploadProfileDocument(token, formData, 'SHOP_ACT');
      Alert.alert('Submitted', 'Garage Owner registration is now pending Super Admin approval.');
      router.replace('/profile');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to register as Garage Owner');
    } finally {
      setLoading(false);
    }
  };

  const pickShopActDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset) return;
    setShopActFile(asset);
  };

  return (
    <AppShell title="Register as Garage Owner" hideSupport>
      <KeyboardScreen contentContainerStyle={styles.container}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Have a garage?</Text>
          <Text style={styles.infoText}>
            Registering as a Garage Owner lets you manage your own mechanics, receive service requests, assign jobs,
            and monitor live progress. Super Admin approval is required before public visibility.
          </Text>
        </View>
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Before you continue</Text>
          <Text style={styles.warningText}>
            You will be listed only after approval, and your Shop Act or authorized garage proof is required for review.
          </Text>
        </View>

        <TextInput placeholder="City" placeholderTextColor={COLORS.placeholder} value={form.city} onChangeText={(v) => update('city', v)} style={styles.input} />
        <TextInput placeholder="Primary speciality" placeholderTextColor={COLORS.placeholder} value={form.speciality} onChangeText={(v) => update('speciality', v)} style={styles.input} />
        <TextInput placeholder="Expertise summary" placeholderTextColor={COLORS.placeholder} value={form.expertise} onChangeText={(v) => update('expertise', v)} style={styles.input} />
        <TextInput
          placeholder="Tell users what your garage specializes in"
          placeholderTextColor={COLORS.placeholder}
          value={form.about}
          onChangeText={(v) => update('about', v)}
          style={[styles.input, styles.textArea]}
          multiline
        />
        <TouchableOpacity style={styles.documentButton} onPress={pickShopActDocument} disabled={loading}>
          <Text style={styles.documentButtonText}>{shopActFile ? 'Change Shop Act document' : 'Select Shop Act document'}</Text>
        </TouchableOpacity>
        <Text style={styles.fileHint}>Accepted file types: png, jpg, jpeg, pdf</Text>
        {documentPreview ? (
          documentPreview.isPdf ? (
            <View style={styles.fileCard}>
              <Text style={styles.fileCardTitle}>PDF selected</Text>
              <Text style={styles.fileCardText}>{documentPreview.name}</Text>
            </View>
          ) : (
            <Image source={{ uri: documentPreview.uri }} style={styles.documentPreview} />
          )
        ) : null}

        <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? `Submitting${loadingDots}` : 'Submit Garage Owner Request'}</Text>
        </TouchableOpacity>
      </KeyboardScreen>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    gap: 6,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  infoText: {
    color: COLORS.muted,
    lineHeight: 18,
  },
  warningCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    gap: 6,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  warningText: {
    color: COLORS.muted,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  documentButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D8EE',
    backgroundColor: '#F7FAFD',
    paddingVertical: 12,
    alignItems: 'center',
  },
  documentButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  fileHint: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: -2,
  },
  fileCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 12,
    gap: 4,
  },
  fileCardTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  fileCardText: {
    color: COLORS.muted,
  },
  documentPreview: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
