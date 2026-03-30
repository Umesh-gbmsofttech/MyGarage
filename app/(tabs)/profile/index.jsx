import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Linking, Modal, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AppShell from '../../../components/layout/AppShell';
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../src/services/api';
import { useRouter } from 'expo-router';
import apiBase from '../../../api';
import colors from '../../../theme/colors';
import { Skeleton, SkeletonRow } from '../../../components/utility/Skeleton';
import useLoadingDots from '../../../src/hooks/useLoadingDots';

const ProfileScreen = () => {
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
  const router = useRouter();
  const { user, token, signout } = useAuth();
  const [ loading, setLoading ] = useState(false);
  const [ refreshing, setRefreshing ] = useState(false);
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
  const [ signoutConfirmVisible, setSignoutConfirmVisible ] = useState(false);
  const [ profilePreviewVisible, setProfilePreviewVisible ] = useState(false);
  const [ saveLoading, setSaveLoading ] = useState(false);
  const [ settingsLoading, setSettingsLoading ] = useState(false);
  const [ deleteBannerId, setDeleteBannerId ] = useState(null);
  const [ visibilityLoading, setVisibilityLoading ] = useState(false);
  const [ profileImageUploading, setProfileImageUploading ] = useState(false);
  const [ selectedProfileImage, setSelectedProfileImage ] = useState(null);
  const [ pendingApprovals, setPendingApprovals ] = useState([]);
  const [ workerModalVisible, setWorkerModalVisible ] = useState(false);
  const [ workerSaving, setWorkerSaving ] = useState(false);
  const [ editingWorkerId, setEditingWorkerId ] = useState(null);
  const [ workerForm, setWorkerForm ] = useState({
    firstName: '',
    surname: '',
    mobile: '',
    email: '',
    password: '',
    experience: '',
    speciality: '',
    expertise: '',
    city: '',
    about: '',
  });
  const [ availabilityLoading, setAvailabilityLoading ] = useState(false);
  const saveDots = useLoadingDots(saveLoading);
  const settingsDots = useLoadingDots(settingsLoading);
  const deleteDots = useLoadingDots(Boolean(deleteBannerId));
  const visibilityDots = useLoadingDots(visibilityLoading);
  const profileImageDots = useLoadingDots(profileImageUploading);

  const ensureMediaPermission = async (onDenied) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) return true;

    const message = permission.canAskAgain === false
      ? 'Photo library permission is blocked. Enable Photos and media access in app settings.'
      : 'Please allow access to Photos and media assets to continue.';
    onDenied?.(message);
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

  const isBannerAsset16By9 = (asset) => {
    if (!asset) return false;
    if (typeof asset.width !== 'number' || typeof asset.height !== 'number') return true;
    const ratio = asset.width / asset.height;
    return Math.abs(ratio - (16 / 9)) < 0.03;
  };

  const loadProfile = useCallback(async (showLoading = true) => {
    if (!token) return;
    if (showLoading) {
      setLoading(true);
    }
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
        available: data.available ?? true,
        profileImageUrl: data.profileImageUrl || '',
        expertise: data.expertise || '',
        about: data.about || '',
        addressLine: data.addressLine || '',
        avatarUrl: data.avatarUrl || '',
      });
      if (data.role === 'ADMIN') {
        const settings = await api.adminSettings(token);
        setAdminSettings(settings);
        const bannersData = await api.adminBanners(token);
        setBanners(bannersData);
        const approvals = await api.pendingMechanicApprovals(token).catch(() => []);
        setPendingApprovals(Array.isArray(approvals) ? approvals : []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [ token ]);

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [ token, loadProfile ]);

  const handleRefresh = useCallback(async () => {
    if (!token) {
      return;
    }
    setRefreshing(true);
    try {
      await loadProfile(false);
    } finally {
      setRefreshing(false);
    }
  }, [ token, loadProfile ]);

  const handleSave = async () => {
    if (saveLoading) return;
    try {
      setSaveLoading(true);
      const updated = await api.updateProfile(token, edit);
      setProfile(updated);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      return false;
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleSettings = async (value) => {
    if (settingsLoading) return;
    try {
      setSettingsLoading(true);
      const updated = await api.updateAdminSettings(token, { showAllMechanics: value });
      setAdminSettings(updated);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handlePickBanner = async () => {
    try {
      const allowed = await ensureMediaPermission(setBannerError);
      if (!allowed) {
        return;
      }
      const mediaType = ImagePicker.MediaTypeOptions.Images;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType,
        allowsEditing: true,
        aspect: [ 16, 9 ],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[ 0 ];
        if (!isBannerAsset16By9(asset)) {
          Alert.alert(
            '16:9 image required',
            'Please crop the banner image to 16:9.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Crop Again', onPress: handlePickBanner },
            ]
          );
          return;
        }
        if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
          setBannerError('Image size exceeds 10MB. Please choose a smaller banner image.');
          return;
        }
        setSelectedBanner(asset);
        setBannerError('');
      }
    } catch (_err) {
      setBannerError('Failed to open image library.');
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
        type: selectedBanner.mimeType || selectedBanner.type || 'image/jpeg',
      });
      await api.uploadBanner(token, formData);
      const refreshed = await api.adminBanners(token);
      setBanners(refreshed);
      setSelectedBanner(null);
    } catch (err) {
      const normalized = String(err?.message || '').toLowerCase();
      if (normalized.includes('network request failed')) {
        setBannerError('Upload failed. Check internet connection or select an image under 10MB.');
      } else {
        setBannerError(err.message || 'Upload failed');
      }
    } finally {
      setBannerUploading(false);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (deleteBannerId) return;
    try {
      setDeleteBannerId(bannerId);
      await api.deleteBanner(token, bannerId);
      const refreshed = await api.adminBanners(token);
      setBanners(refreshed);
    } finally {
      setDeleteBannerId(null);
    }
  };

  const handleVisibility = async () => {
    if (!mechanicId || visibilityLoading) return;
    try {
      setVisibilityLoading(true);
      await api.updateMechanicVisibility(token, mechanicId, mechanicVisible);
    } finally {
      setVisibilityLoading(false);
    }
  };

  const resetWorkerForm = () => {
    setEditingWorkerId(null);
    setWorkerForm({
      firstName: '',
      surname: '',
      mobile: '',
      email: '',
      password: '',
      experience: '',
      speciality: '',
      expertise: '',
      city: '',
      about: '',
    });
  };

  const saveWorker = async () => {
    try {
      setWorkerSaving(true);
      if (editingWorkerId) {
        await api.updateGarageMechanic(token, editingWorkerId, workerForm);
      } else {
        await api.addGarageMechanic(token, workerForm);
      }
      setWorkerModalVisible(false);
      resetWorkerForm();
      await loadProfile();
    } catch (err) {
      setError(err.message || 'Failed to save worker');
    } finally {
      setWorkerSaving(false);
    }
  };

  const handleApproval = async (id, status) => {
    try {
      await api.updateMechanicApproval(token, id, { status });
      const approvals = await api.pendingMechanicApprovals(token).catch(() => []);
      setPendingApprovals(Array.isArray(approvals) ? approvals : []);
    } catch (err) {
      setError(err.message || 'Failed to update approval');
    }
  };

  const handleAvailabilityChange = async (available) => {
    if (!token || availabilityLoading) return;
    try {
      setAvailabilityLoading(true);
      const updated = await api.updateAvailability(token, { available });
      setProfile(updated);
      setEdit((prev) => ({ ...prev, available: updated.available ?? available }));
    } catch (err) {
      setError(err.message || 'Failed to update working status');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const isAdmin = profile?.role === 'ADMIN';
  const hasUploadedProfileImage = Boolean(profile?.profileImageUrl || profile?.avatarUrl);
  const effectiveProfileSource = isAdmin
    ? require('../../../assets/images/MyGarage.png')
    : hasUploadedProfileImage
      ? { uri: `${apiBase.replace('/api', '')}${profile.profileImageUrl || profile.avatarUrl}` }
      : null;

  const handlePickProfileImage = async () => {
    try {
      const allowed = await ensureMediaPermission(setError);
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
        const asset = result.assets[ 0 ];
        if (!isSquareAsset(asset)) {
          Alert.alert(
            'Square image required',
            'Please crop your profile image to a square.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Crop Again', onPress: handlePickProfileImage },
            ]
          );
          return;
        }
        setSelectedProfileImage(asset);
        setError('');
      }
    } catch (_err) {
      setError('Failed to open image library.');
    }
  };

  const handleUploadProfileImage = async () => {
    if (!selectedProfileImage) return;
    try {
      setProfileImageUploading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: selectedProfileImage.uri,
        name: selectedProfileImage.fileName || 'profile.jpg',
        type: selectedProfileImage.mimeType || selectedProfileImage.type || 'image/jpeg',
      });
      await api.uploadProfileImage(token, formData);
      await loadProfile();
      setSelectedProfileImage(null);
    } catch (err) {
      setError(err.message || 'Failed to upload profile image');
    } finally {
      setProfileImageUploading(false);
    }
  };

  if (!user) {
    return (
      <AppShell title="Profile">
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
    <AppShell title="Profile">
      <ScrollView
        contentContainerStyle={ styles.container }
        refreshControl={ <RefreshControl refreshing={ refreshing } onRefresh={ handleRefresh } /> }
      >
        { loading && (
          <View style={ styles.card }>
            <Skeleton height={ 60 } width={ 60 } style={ styles.profileAvatarPlaceholder } />
            <SkeletonRow lines={ 3 } lineHeight={ 12 } />
          </View>
        ) }
        { error ? <Text style={ styles.error }>{ error }</Text> : null }

        { profile && (
          <View style={ styles.card }>
            <TouchableOpacity
              style={ styles.profileHeader }
              onPress={ () => {
                if (effectiveProfileSource) {
                  setProfilePreviewVisible(true);
                }
              } }
            >
              { effectiveProfileSource ? (
                <Image
                  source={ effectiveProfileSource }
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

            {(profile.role === 'MECHANIC' || profile.role === 'GARAGE_OWNER') && (
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
                  <Text style={ styles.profileLabel }>Work status</Text>
                  <Text style={ styles.profileValue }>{ edit.available ? 'Available for bookings' : 'Busy on service' }</Text>
                </View>
                <View style={ styles.profileRow }>
                  <Text style={ styles.profileLabel }>Approval</Text>
                  <Text style={ styles.profileValue }>{ profile.approvalStatus || '-' }</Text>
                </View>
                { profile.registrationSource === 'GARAGE_OWNER' ? (
                  <View style={ styles.profileRow }>
                    <Text style={ styles.profileLabel }>Team role</Text>
                    <Text style={ styles.profileValue }>Garage mechanic</Text>
                  </View>
                ) : null }
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

            { !isAdmin && (
              <TouchableOpacity style={ styles.primaryButton } onPress={ () => setIsEditing(true) }>
                <Text style={ styles.primaryButtonText }>Edit Profile</Text>
              </TouchableOpacity>
            ) }
            {(profile.role === 'MECHANIC' || profile.role === 'GARAGE_OWNER') && !profile.garageOwnerUserId ? (
              <View style={styles.statusCard}>
                <Text style={styles.subTitle}>Availability</Text>
                <Text style={styles.reviewText}>Only providers marked available appear in the public mechanic list.</Text>
                <View style={styles.statusToggleRow}>
                  <TouchableOpacity
                    style={[styles.statusToggle, edit.available !== false && styles.statusToggleActive]}
                    onPress={() => handleAvailabilityChange(true)}
                    disabled={availabilityLoading}
                  >
                    <Text style={[styles.statusToggleText, edit.available !== false && styles.statusToggleTextActive]}>Available</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusToggle, edit.available === false && styles.statusToggleBusy]}
                    onPress={() => handleAvailabilityChange(false)}
                    disabled={availabilityLoading}
                  >
                    <Text style={[styles.statusToggleText, edit.available === false && styles.statusToggleTextActive]}>Working</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
            {profile.certificationDocumentUrl ? (
              <TouchableOpacity style={ styles.secondaryButton } onPress={ () => Linking.openURL(`${apiBase.replace('/api', '')}${profile.certificationDocumentUrl}`) }>
                <Text style={ styles.secondaryButtonText }>Open certification document</Text>
              </TouchableOpacity>
            ) : null}
            {profile.shopActDocumentUrl ? (
              <TouchableOpacity style={ styles.secondaryButton } onPress={ () => Linking.openURL(`${apiBase.replace('/api', '')}${profile.shopActDocumentUrl}`) }>
                <Text style={ styles.secondaryButtonText }>Open Shop Act document</Text>
              </TouchableOpacity>
            ) : null}
            { profile.role === 'MECHANIC' && profile.garageOwnerEligible ? (
              <TouchableOpacity style={ styles.secondaryButton } onPress={ () => router.push('/garage-owner/register') }>
                <Text style={ styles.secondaryButtonText }>Have a garage? Register as Garage Owner</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={ styles.secondaryButton } onPress={ () => setSignoutConfirmVisible(true) }>
              <Text style={ styles.secondaryButtonText }>Sign out</Text>
            </TouchableOpacity>
          </View>
        ) }

        { profile?.role === 'GARAGE_OWNER' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>My Mechanics</Text>
            <Text style={styles.emptyText}>
              Add and manage your own workers. Assigned workers will handle travel and live location for your bookings.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => { resetWorkerForm(); setWorkerModalVisible(true); }}>
              <Text style={styles.primaryButtonText}>Add Mechanic</Text>
            </TouchableOpacity>
            {(profile.myMechanics || []).map((worker) => (
              <View key={worker.mechanicId} style={styles.bannerRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.profileValue}>{worker.mechName} {worker.surname}</Text>
                  <Text style={styles.reviewText}>{worker.speciality || '-'}</Text>
                  <Text style={styles.reviewMeta}>{worker.available ? 'Ready for assignment' : 'Busy'}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setEditingWorkerId(worker.mechanicId);
                    setWorkerForm({
                      firstName: worker.mechName || '',
                      surname: worker.surname || '',
                      mobile: '',
                      email: '',
                      password: '',
                      experience: '',
                      speciality: worker.speciality || '',
                      expertise: worker.expertise || '',
                      city: worker.city || '',
                      about: '',
                    });
                    setWorkerModalVisible(true);
                  }}
                >
                  <Text style={styles.link}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => { await api.deleteGarageMechanic(token, worker.mechanicId); await loadProfile(); }}>
                  <Text style={styles.linkDanger}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        { profile?.role === 'ADMIN' && (
          <>
            <View style={ styles.card }>
              <Text style={ styles.sectionTitle }>Admin Controls</Text>
              <View style={ styles.switchRow }>
                <Text style={ styles.switchLabel }>Show all mechanics</Text>
                <Switch
                  value={ !!adminSettings?.showAllMechanics }
                  onValueChange={ handleToggleSettings }
                  disabled={ settingsLoading }
                />
              </View>
              { settingsLoading ? <Text style={ styles.switchHint }>Saving settings{ settingsDots }</Text> : null }

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
                    source={ { uri: `${apiBase.replace('/api', '')}${banner.imageUrl}` } }
                    style={ styles.bannerImage }
                  />
                  <TouchableOpacity onPress={ () => handleDeleteBanner(banner.id) } disabled={ Boolean(deleteBannerId) }>
                    <Text style={ styles.linkDanger }>
                      { deleteBannerId === banner.id ? `Deleting${deleteDots}` : 'Delete' }
                    </Text>
                  </TouchableOpacity>
                </View>
              )) }

              <View style={ styles.divider } />

              <Text style={ styles.subTitle }>Mechanic visibility</Text>
              <TextInput
                placeholderTextColor={ colors.placeholder }
                placeholder="Mechanic user ID"
                value={ mechanicId }
                onChangeText={ setMechanicId }
                style={ styles.input }
              />
              <View style={ styles.switchRow }>
                <Text style={ styles.switchLabel }>Visible</Text>
                <Switch value={ mechanicVisible } onValueChange={ setMechanicVisible } />
              </View>
              <TouchableOpacity style={ [ styles.primaryButton, visibilityLoading && styles.buttonDisabled ] } onPress={ handleVisibility } disabled={ visibilityLoading }>
                <Text style={ styles.primaryButtonText }>
                  { visibilityLoading ? `Submitting${visibilityDots}` : 'Update Visibility' }
                </Text>
              </TouchableOpacity>

              <View style={ styles.divider } />

              <Text style={ styles.subTitle }>Pending provider approvals</Text>
              {pendingApprovals.length === 0 ? <Text style={styles.reviewText}>No pending approvals.</Text> : null}
              {pendingApprovals.map((item) => (
                <View key={item.mechanicId} style={styles.bannerRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.profileValue}>{item.mechName} {item.surname}</Text>
                    <Text style={styles.reviewText}>{item.role} · {item.speciality || '-'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleApproval(item.mechanicId, 'APPROVED')}>
                    <Text style={styles.link}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleApproval(item.mechanicId, 'REJECTED')}>
                    <Text style={styles.linkDanger}>Reject</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        ) }
      </ScrollView>
      <Modal visible={ isEditing } transparent animationType="slide">
        <View style={ styles.modalBackdrop }>
          <View style={ styles.modalContent }>
            <Text style={ styles.sectionTitle }>Edit Profile</Text>
            
            <View style={ styles.editAvatarContainer }>
              <TouchableOpacity style={ [ styles.secondaryButton, profileImageUploading && styles.buttonDisabled ] } onPress={ handlePickProfileImage } disabled={ profileImageUploading }>
                <Text style={ styles.secondaryButtonText }>
                  { selectedProfileImage ? 'Change Selected' : 'Select New Photo' }
                </Text>
              </TouchableOpacity>
              
              { selectedProfileImage && (
                <View style={ styles.selectedImagePreviewContainer }>
                  <Image source={{ uri: selectedProfileImage.uri }} style={ styles.selectedImagePreview } />
                  <TouchableOpacity 
                    style={ [ styles.primaryButton, profileImageUploading && styles.buttonDisabled ] } 
                    onPress={ handleUploadProfileImage } 
                    disabled={ profileImageUploading }
                  >
                    <Text style={ styles.primaryButtonText }>
                      { profileImageUploading ? `Uploading${profileImageDots}` : 'Upload Photo' }
                    </Text>
                  </TouchableOpacity>
                </View>
              ) }
            </View>

            <TextInput
              placeholderTextColor={ colors.placeholder }
              placeholder="First name"
              value={ edit.firstName }
              onChangeText={ (value) => setEdit((prev) => ({ ...prev, firstName: value })) }
              style={ styles.input }
            />
            <TextInput
              placeholderTextColor={ colors.placeholder }
              placeholder="Surname"
              value={ edit.surname }
              onChangeText={ (value) => setEdit((prev) => ({ ...prev, surname: value })) }
              style={ styles.input }
            />
            <TextInput
              placeholderTextColor={ colors.placeholder }
              placeholder="Mobile"
              value={ edit.mobile }
              onChangeText={ (value) => setEdit((prev) => ({ ...prev, mobile: value })) }
              style={ styles.input }
            />

            { (profile?.role === 'MECHANIC' || profile?.role === 'GARAGE_OWNER') && (
              <>
                <TextInput
                  placeholderTextColor={ colors.placeholder }
                  placeholder="Experience"
                  value={ edit.experience }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, experience: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholderTextColor={ colors.placeholder }
                  placeholder="Speciality"
                  value={ edit.speciality }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, speciality: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholderTextColor={ colors.placeholder }
                  placeholder="City"
                  value={ edit.city }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, city: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholderTextColor={ colors.placeholder }
                  placeholder="Expertise"
                  value={ edit.expertise }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, expertise: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholderTextColor={ colors.placeholder }
                  placeholder="About"
                  value={ edit.about }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, about: value })) }
                  style={ styles.input }
                  multiline
                />
              </>
            ) }

            { profile?.role === 'VEHICLE_OWNER' && (
              <>
                <TextInput
                  placeholderTextColor={ colors.placeholder }
                  placeholder="City"
                  value={ edit.city }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, city: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholderTextColor={ colors.placeholder }
                  placeholder="Address"
                  value={ edit.addressLine }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, addressLine: value })) }
                  style={ styles.input }
                />
              </>
            ) }

            <TouchableOpacity style={ [ styles.primaryButton, saveLoading && styles.buttonDisabled ] } onPress={ async () => { const ok = await handleSave(); if (ok) setIsEditing(false); } } disabled={ saveLoading }>
              <Text style={ styles.primaryButtonText }>{ saveLoading ? `Saving${saveDots}` : 'Save Profile' }</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ styles.secondaryButton } onPress={ () => setIsEditing(false) }>
              <Text style={ styles.secondaryButtonText }>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={ signoutConfirmVisible } transparent animationType="fade" onRequestClose={ () => setSignoutConfirmVisible(false) }>
        <View style={ styles.modalBackdrop }>
          <View style={ styles.modalContent }>
            <Text style={ styles.sectionTitle }>Confirmation!</Text>
            <Text style={ styles.emptyText }>Are you sure you want to sign out?</Text>
            <TouchableOpacity
              style={ styles.primaryButton }
              onPress={ () => {
                setSignoutConfirmVisible(false);
                signout();
              } }
            >
              <Text style={ styles.primaryButtonText }>Sign out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ styles.secondaryButton } onPress={ () => setSignoutConfirmVisible(false) }>
              <Text style={ styles.secondaryButtonText }>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={ workerModalVisible } transparent animationType="slide" onRequestClose={() => setWorkerModalVisible(false)}>
        <View style={ styles.modalBackdrop }>
          <View style={ styles.modalContent }>
            <Text style={ styles.sectionTitle }>{editingWorkerId ? 'Edit Mechanic' : 'Add Mechanic'}</Text>
            <TextInput placeholderTextColor={ colors.placeholder } placeholder="First name" value={ workerForm.firstName } onChangeText={ (value) => setWorkerForm((prev) => ({ ...prev, firstName: value })) } style={ styles.input } />
            <TextInput placeholderTextColor={ colors.placeholder } placeholder="Surname" value={ workerForm.surname } onChangeText={ (value) => setWorkerForm((prev) => ({ ...prev, surname: value })) } style={ styles.input } />
            <TextInput placeholderTextColor={ colors.placeholder } placeholder="Mobile" value={ workerForm.mobile } onChangeText={ (value) => setWorkerForm((prev) => ({ ...prev, mobile: value })) } style={ styles.input } />
            {!editingWorkerId ? <TextInput placeholderTextColor={ colors.placeholder } placeholder="Email" value={ workerForm.email } onChangeText={ (value) => setWorkerForm((prev) => ({ ...prev, email: value })) } style={ styles.input } /> : null}
            {!editingWorkerId ? <TextInput placeholderTextColor={ colors.placeholder } placeholder="Temporary password" value={ workerForm.password } onChangeText={ (value) => setWorkerForm((prev) => ({ ...prev, password: value })) } style={ styles.input } /> : null}
            <TextInput placeholderTextColor={ colors.placeholder } placeholder="Experience" value={ workerForm.experience } onChangeText={ (value) => setWorkerForm((prev) => ({ ...prev, experience: value })) } style={ styles.input } />
            <TextInput placeholderTextColor={ colors.placeholder } placeholder="Speciality" value={ workerForm.speciality } onChangeText={ (value) => setWorkerForm((prev) => ({ ...prev, speciality: value })) } style={ styles.input } />
            <TextInput placeholderTextColor={ colors.placeholder } placeholder="Expertise" value={ workerForm.expertise } onChangeText={ (value) => setWorkerForm((prev) => ({ ...prev, expertise: value })) } style={ styles.input } />
            <TextInput placeholderTextColor={ colors.placeholder } placeholder="City" value={ workerForm.city } onChangeText={ (value) => setWorkerForm((prev) => ({ ...prev, city: value })) } style={ styles.input } />
            <TextInput placeholderTextColor={ colors.placeholder } placeholder="About" value={ workerForm.about } onChangeText={ (value) => setWorkerForm((prev) => ({ ...prev, about: value })) } style={ styles.input } />
            <TouchableOpacity style={ styles.primaryButton } onPress={ saveWorker } disabled={ workerSaving }>
              <Text style={ styles.primaryButtonText }>{workerSaving ? 'Saving...' : 'Save Mechanic'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ styles.secondaryButton } onPress={ () => setWorkerModalVisible(false) }>
              <Text style={ styles.secondaryButtonText }>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={ profilePreviewVisible } transparent animationType="fade" onRequestClose={ () => setProfilePreviewVisible(false) }>
        <View style={ styles.previewModalBackdrop }>
          <View style={ styles.previewCard }>
            <TouchableOpacity style={ styles.closeIconButton } onPress={ () => setProfilePreviewVisible(false) }>
              <Text style={ styles.closeIconText }>X</Text>
            </TouchableOpacity>
            <Image
              source={ effectiveProfileSource || require('../../../assets/images/MyGarage.png') }
              style={ styles.previewLargeImage }
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 28,
    gap: 16,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF1F7',
    color: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: colors.background,
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
  editAvatarContainer: {
    gap: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedImagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedImagePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    backgroundColor: colors.border,
  },
  profileLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  profileValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 18,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  previewModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewCard: {
    width: '100%',
    maxWidth: 380,
    height: 420,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewLargeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  closeIconButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
  switchHint: {
    color: colors.muted,
    fontSize: 12,
  },
  statusCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CFE0F6',
    backgroundColor: '#F5F9FF',
    padding: 12,
    gap: 10,
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusToggle: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  statusToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusToggleBusy: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  statusToggleText: {
    color: colors.text,
    fontWeight: '700',
  },
  statusToggleTextActive: {
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: colors.primary,
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
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  bannerRow: {
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerImage: {
    width: 176,
    height: 99,
    borderRadius: 10,
  },
  previewBox: {
    gap: 10,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  reviewRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewText: {
    fontSize: 13,
    color: colors.muted,
  },
  reviewMeta: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
  linkDanger: {
    color: colors.danger,
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
    color: colors.muted,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
});

export default ProfileScreen;



