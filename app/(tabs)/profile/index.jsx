import React, { useCallback, useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../../../components/layout/AppShell';
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../src/services/api';
import { useRouter } from 'expo-router';
import API_BASE from '../../../api';
import COLORS from '../../../theme/colors';
import { Skeleton, SkeletonRow } from '../../../components/utility/Skeleton';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, token, signout } = useAuth();
  const [ loading, setLoading ] = useState(false);
  const [ profile, setProfile ] = useState(null);
  const [ error, setError ] = useState('');
  const [ edit, setEdit ] = useState({});
  const [ isEditing, setIsEditing ] = useState(false);
  const [ adminSettings, setAdminSettings ] = useState(null);
  const [ banners, setBanners ] = useState([]);
  const [ selectedBanner, setSelectedBanner ] = useState(null);
  const [ bannerUploading, setBannerUploading ] = useState(false);
  const [ bannerError, setBannerError ] = useState('');
  const [ mechanicId, setMechanicId ] = useState('');
  const [ mechanicVisible, setMechanicVisible ] = useState(true);
  const [ platformReviews, setPlatformReviews ] = useState([]);
  const [ mechanicReviews, setMechanicReviews ] = useState([]);
  const [ imagePickerReady, setImagePickerReady ] = useState(true);

  const getImagePicker = async () => {
    try {
      const module = await import('expo-image-picker');
      setImagePickerReady(true);
      return module;
    } catch (err) {
      setImagePickerReady(false);
      setError('Image picker is not available in this build.');
      return null;
    }
  };

  const loadProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getProfile(token);
      setProfile(data);
      setEdit({
        firstName: data.firstName || '',
        surname: data.surname || '',
        mobile: data.mobile || '',
        city: data.city || '',
        experience: data.experience || '',
        speciality: data.speciality || '',
        shopActive: data.shopActive ?? true,
        profileImageUrl: data.profileImageUrl || '',
        expertise: data.expertise || '',
        about: data.about || '',
        addressLine: data.addressLine || '',
        avatarUrl: data.avatarUrl || '',
      });
      if (data.role === 'ADMIN') {
        const settings = await api.adminSettings();
        setAdminSettings(settings);
        const bannersData = await api.adminBanners();
        setBanners(bannersData);
      }
      const platform = await api.platformReviews();
      setPlatformReviews(Array.isArray(platform) ? platform : []);
      if (data.role === 'MECHANIC' && data.userId) {
        const mechReviews = await api.mechanicReviews(data.userId);
        setMechanicReviews(Array.isArray(mechReviews) ? mechReviews : []);
      } else {
        setMechanicReviews([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [ token ]);

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [ token, loadProfile ]);

  const handleSave = async () => {
    try {
      const updated = await api.updateProfile(token, edit);
      setProfile(updated);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleToggleSettings = async (value) => {
    const updated = await api.updateAdminSettings({ showAllMechanics: value });
    setAdminSettings(updated);
  };

  const handlePickBanner = async () => {
    const ImagePicker = await getImagePicker();
    if (!ImagePicker) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setBannerError('Permission to access media library is required.');
      return;
    }
    const mediaType = ImagePicker.MediaType?.Images || ImagePicker.MediaTypeOptions?.Images;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType,
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedBanner(result.assets[ 0 ]);
      setBannerError('');
    }
  };

  const handleUploadBanner = async () => {
    if (!selectedBanner) return;
    setBannerUploading(true);
    setBannerError('');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedBanner.uri,
        name: selectedBanner.fileName || 'banner.jpg',
        type: selectedBanner.type || 'image/jpeg',
      });
      await api.uploadBanner(formData);
      const refreshed = await api.adminBanners();
      setBanners(refreshed);
      setSelectedBanner(null);
    } catch (err) {
      setBannerError(err.message || 'Upload failed');
    } finally {
      setBannerUploading(false);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    await api.deleteBanner(bannerId);
    const refreshed = await api.adminBanners();
    setBanners(refreshed);
  };

  const handleVisibility = async () => {
    if (!mechanicId) return;
    await api.updateMechanicVisibility(mechanicId, mechanicVisible);
  };

  const handlePickProfileImage = async () => {
    const ImagePicker = await getImagePicker();
    if (!ImagePicker) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access media library is required.');
      return;
    }
    const mediaType = ImagePicker.MediaType?.Images || ImagePicker.MediaTypeOptions?.Images;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType,
      quality: 0.8,
    });
    if (!result.canceled) {
      try {
        const asset = result.assets[ 0 ];
        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          name: asset.fileName || 'profile.jpg',
          type: asset.type || 'image/jpeg',
        });
        await api.uploadProfileImage(token, formData);
        await loadProfile();
      } catch (err) {
        setError(err.message || 'Failed to upload profile image');
      }
    }
  };

  if (!user) {
    return (
      <AppShell hideChrome>
        <View style={ styles.emptyState }>
          <Text style={ styles.emptyTitle }>You are not logged in</Text>
          <Text style={ styles.emptyText }>Please login to view your profile.</Text>
          <TouchableOpacity style={ styles.primaryButton } onPress={ () => router.push('/auth/signin') }>
            <Text style={ styles.primaryButtonText }>Please login</Text>
          </TouchableOpacity>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell hideChrome>
      <ScrollView contentContainerStyle={ styles.container }>
        { loading && (
          <View style={ styles.card }>
            <Skeleton height={60} width={60} style={ styles.profileAvatarPlaceholder } />
            <SkeletonRow lines={3} lineHeight={12} />
          </View>
        ) }
        { error ? <Text style={ styles.error }>{ error }</Text> : null }

        { profile && (
          <View style={ styles.card }>
            <TouchableOpacity style={ styles.profileHeader } onPress={ handlePickProfileImage }>
              { (profile.profileImageUrl || profile.avatarUrl) ? (
                <Image
                  source={ { uri: `${API_BASE.replace('/api', '')}${profile.profileImageUrl || profile.avatarUrl}` } }
                  style={ styles.profileAvatar }
                />
              ) : (
                <View style={ styles.profileAvatarPlaceholder } />
              ) }
              <Text style={ styles.roleTag }>{ profile.role }</Text>
            </TouchableOpacity>

            <View style={ styles.profileRow }>
              <Text style={ styles.profileLabel }>First name</Text>
              <Text style={ styles.profileValue }>{ edit.firstName || '-' }</Text>
            </View>
            <View style={ styles.profileRow }>
              <Text style={ styles.profileLabel }>Surname</Text>
              <Text style={ styles.profileValue }>{ edit.surname || '-' }</Text>
            </View>
            <View style={ styles.profileRow }>
              <Text style={ styles.profileLabel }>Mobile</Text>
              <Text style={ styles.profileValue }>{ edit.mobile || '-' }</Text>
            </View>

            { profile.role === 'MECHANIC' && (
              <>
                <View style={ styles.profileRow }>
                  <Text style={ styles.profileLabel }>Experience</Text>
                  <Text style={ styles.profileValue }>{ edit.experience || '-' }</Text>
                </View>
                <View style={ styles.profileRow }>
                  <Text style={ styles.profileLabel }>Speciality</Text>
                  <Text style={ styles.profileValue }>{ edit.speciality || '-' }</Text>
                </View>
                <View style={ styles.profileRow }>
                  <Text style={ styles.profileLabel }>City</Text>
                  <Text style={ styles.profileValue }>{ edit.city || '-' }</Text>
                </View>
                <View style={ styles.profileRow }>
                  <Text style={ styles.profileLabel }>Expertise</Text>
                  <Text style={ styles.profileValue }>{ edit.expertise || '-' }</Text>
                </View>
                <View style={ styles.profileRow }>
                  <Text style={ styles.profileLabel }>About</Text>
                  <Text style={ styles.profileValue }>{ edit.about || '-' }</Text>
                </View>
                <View style={ styles.profileRow }>
                  <Text style={ styles.profileLabel }>Shop active</Text>
                  <Text style={ styles.profileValue }>{ edit.shopActive ? 'Yes' : 'No' }</Text>
                </View>
              </>
            ) }

            { profile.role === 'VEHICLE_OWNER' && (
              <>
                <View style={ styles.profileRow }>
                  <Text style={ styles.profileLabel }>City</Text>
                  <Text style={ styles.profileValue }>{ edit.city || '-' }</Text>
                </View>
                <View style={ styles.profileRow }>
                  <Text style={ styles.profileLabel }>Address</Text>
                  <Text style={ styles.profileValue }>{ edit.addressLine || '-' }</Text>
                </View>
              </>
            ) }

            <TouchableOpacity style={ styles.primaryButton } onPress={ () => setIsEditing(true) }>
              <Text style={ styles.primaryButtonText }>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ styles.secondaryButton } onPress={ signout }>
              <Text style={ styles.secondaryButtonText }>Sign out</Text>
            </TouchableOpacity>
          </View>
        ) }

        { profile?.role === 'ADMIN' && (
          <>
            <View style={ styles.card }>
              <Text style={ styles.sectionTitle }>Admin Controls</Text>
              <View style={ styles.switchRow }>
                <Text style={ styles.switchLabel }>Show all mechanics</Text>
                <Switch
                  value={ !!adminSettings?.showAllMechanics }
                  onValueChange={ handleToggleSettings }
                />
              </View>

              <View style={ styles.divider } />

              <Text style={ styles.subTitle }>Manage banners</Text>
              <View style={ styles.bannerPickerRow }>
                <TouchableOpacity style={ styles.secondaryButton } onPress={ handlePickBanner }>
                  <Text style={ styles.secondaryButtonText }>Select Image</Text>
                </TouchableOpacity>
                { selectedBanner && (
                  <TouchableOpacity style={ styles.secondaryButton } onPress={ handlePickBanner }>
                    <Text style={ styles.secondaryButtonText }>Change</Text>
                  </TouchableOpacity>
                ) }
              </View>
              { selectedBanner && (
                <View style={ styles.previewBox }>
                  <Image source={ { uri: selectedBanner.uri } } style={ styles.previewImage } />
                  <TouchableOpacity style={ styles.primaryButton } onPress={ handleUploadBanner } disabled={ bannerUploading }>
                    <Text style={ styles.primaryButtonText }>{ bannerUploading ? 'Uploading...' : 'Upload' }</Text>
                  </TouchableOpacity>
                </View>
              ) }
              { bannerError ? <Text style={ styles.error }>{ bannerError }</Text> : null }

              { banners.map((banner) => (
                <View key={ banner.id } style={ styles.bannerRow }>
                  <Image
                    source={ { uri: `${API_BASE.replace('/api', '')}${banner.imageUrl}` } }
                    style={ styles.bannerImage }
                  />
                  <TouchableOpacity onPress={ () => handleDeleteBanner(banner.id) }>
                    <Text style={ styles.linkDanger }>Delete</Text>
                  </TouchableOpacity>
                </View>
              )) }

              <View style={ styles.divider } />

              <Text style={ styles.subTitle }>Mechanic visibility</Text>
              <TextInput
                placeholderTextColor={COLORS.placeholder}
                placeholder="Mechanic user ID"
                value={ mechanicId }
                onChangeText={ setMechanicId }
                style={ styles.input }
              />
              <View style={ styles.switchRow }>
                <Text style={ styles.switchLabel }>Visible</Text>
                <Switch value={ mechanicVisible } onValueChange={ setMechanicVisible } />
              </View>
              <TouchableOpacity style={ styles.primaryButton } onPress={ handleVisibility }>
                <Text style={ styles.primaryButtonText }>Update Visibility</Text>
              </TouchableOpacity>
            </View>
          </>
        ) }

        <View style={ styles.card }>
          <Text style={ styles.sectionTitle }>Reviews</Text>
          <Text style={ styles.subTitle }>Platform reviews</Text>
          { platformReviews.map((review) => (
            <View key={ review.id } style={ styles.reviewRow }>
              <Text style={ styles.reviewText }>{ review.comment || 'No comment' }</Text>
              <Text style={ styles.reviewMeta }>{ review.rating } ★</Text>
            </View>
          )) }
          { profile?.role === 'MECHANIC' && (
            <>
              <Text style={ styles.subTitle }>Mechanic reviews</Text>
              { mechanicReviews.map((review) => (
                <View key={ review.id } style={ styles.reviewRow }>
                  <Text style={ styles.reviewText }>{ review.comment || 'No comment' }</Text>
                  <Text style={ styles.reviewMeta }>{ review.rating } ★</Text>
                </View>
              )) }
            </>
          ) }
        </View>
      </ScrollView>
      <Modal visible={ isEditing } transparent animationType="slide">
        <View style={ styles.modalBackdrop }>
          <View style={ styles.modalContent }>
            <Text style={ styles.sectionTitle }>Edit Profile</Text>
            <TouchableOpacity style={ styles.secondaryButton } onPress={ handlePickProfileImage }>
              <Text style={ styles.secondaryButtonText }>Change Profile Image</Text>
            </TouchableOpacity>
            <TextInput
              placeholderTextColor={COLORS.placeholder}
              placeholder="First name"
              value={ edit.firstName }
              onChangeText={ (value) => setEdit((prev) => ({ ...prev, firstName: value })) }
              style={ styles.input }
            />
            <TextInput
              placeholderTextColor={COLORS.placeholder}
              placeholder="Surname"
              value={ edit.surname }
              onChangeText={ (value) => setEdit((prev) => ({ ...prev, surname: value })) }
              style={ styles.input }
            />
            <TextInput
              placeholderTextColor={COLORS.placeholder}
              placeholder="Mobile"
              value={ edit.mobile }
              onChangeText={ (value) => setEdit((prev) => ({ ...prev, mobile: value })) }
              style={ styles.input }
            />

            { profile?.role === 'MECHANIC' && (
              <>
                <TextInput
                  placeholderTextColor={COLORS.placeholder}
                  placeholder="Experience"
                  value={ edit.experience }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, experience: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholderTextColor={COLORS.placeholder}
                  placeholder="Speciality"
                  value={ edit.speciality }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, speciality: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholderTextColor={COLORS.placeholder}
                  placeholder="City"
                  value={ edit.city }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, city: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholderTextColor={COLORS.placeholder}
                  placeholder="Expertise"
                  value={ edit.expertise }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, expertise: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholderTextColor={COLORS.placeholder}
                  placeholder="About"
                  value={ edit.about }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, about: value })) }
                  style={ styles.input }
                  multiline
                />
                <View style={ styles.switchRow }>
                  <Text style={ styles.switchLabel }>Shop active</Text>
                  <Switch
                    value={ !!edit.shopActive }
                    onValueChange={ (value) => setEdit((prev) => ({ ...prev, shopActive: value })) }
                  />
                </View>
              </>
            ) }

            { profile?.role === 'VEHICLE_OWNER' && (
              <>
                <TextInput
                  placeholderTextColor={COLORS.placeholder}
                  placeholder="City"
                  value={ edit.city }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, city: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholderTextColor={COLORS.placeholder}
                  placeholder="Address"
                  value={ edit.addressLine }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, addressLine: value })) }
                  style={ styles.input }
                />
              </>
            ) }

            <TouchableOpacity style={ styles.primaryButton } onPress={ async () => { await handleSave(); setIsEditing(false); } }>
              <Text style={ styles.primaryButtonText }>Save Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ styles.secondaryButton } onPress={ () => setIsEditing(false) }>
              <Text style={ styles.secondaryButtonText }>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF1F7',
    color: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: COLORS.background,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profileAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.border,
  },
  profileLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  profileValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 18,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  bannerPickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
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
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  secondaryButton: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  bannerRow: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerImage: {
    width: 160,
    height: 80,
    borderRadius: 10,
  },
  previewBox: {
    gap: 10,
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  reviewRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reviewText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  reviewMeta: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  linkDanger: {
    color: COLORS.danger,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  error: {
    color: COLORS.danger,
    textAlign: 'center',
  },
});

export default ProfileScreen;
