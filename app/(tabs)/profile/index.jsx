import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../../../components/layout/AppShell';
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../src/services/api';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, token, signout } = useAuth();
  const [ loading, setLoading ] = useState(false);
  const [ profile, setProfile ] = useState(null);
  const [ error, setError ] = useState('');
  const [ edit, setEdit ] = useState({});
  const [ adminSettings, setAdminSettings ] = useState(null);
  const [ banners, setBanners ] = useState([]);
  const [ newBanner, setNewBanner ] = useState('');
  const [ mechanicId, setMechanicId ] = useState('');
  const [ mechanicVisible, setMechanicVisible ] = useState(true);
  const [ platformReviews, setPlatformReviews ] = useState([]);
  const [ mechanicReviews, setMechanicReviews ] = useState([]);

  const loadProfile = async () => {
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
      setPlatformReviews(platform);
      if (data.role === 'MECHANIC') {
        const mechReviews = await api.mechanicReviews(data.userId);
        setMechanicReviews(mechReviews);
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [ token ]);

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

  const handleAddBanner = async () => {
    if (!newBanner) return;
    const created = await api.createBanner({ imageUrl: newBanner, active: true });
    setBanners((prev) => [ created, ...prev ]);
    setNewBanner('');
  };

  const handleToggleBanner = async (banner) => {
    const updated = await api.updateBanner(banner.id, { active: !banner.active });
    setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
  };

  const handleDeleteBanner = async (bannerId) => {
    await api.deleteBanner(bannerId);
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
  };

  const handleVisibility = async () => {
    if (!mechanicId) return;
    await api.updateMechanicVisibility(mechanicId, mechanicVisible);
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
        { loading && <ActivityIndicator size="large" color="#1B6B4E" /> }
        { error ? <Text style={ styles.error }>{ error }</Text> : null }

        { profile && (
          <View style={ styles.card }>
            <Text style={ styles.sectionTitle }>Profile</Text>
            <Text style={ styles.roleTag }>{ profile.role }</Text>

            <TextInput
              placeholder="First name"
              value={ edit.firstName }
              onChangeText={ (value) => setEdit((prev) => ({ ...prev, firstName: value })) }
              style={ styles.input }
            />
            <TextInput
              placeholder="Surname"
              value={ edit.surname }
              onChangeText={ (value) => setEdit((prev) => ({ ...prev, surname: value })) }
              style={ styles.input }
            />
            <TextInput
              placeholder="Mobile"
              value={ edit.mobile }
              onChangeText={ (value) => setEdit((prev) => ({ ...prev, mobile: value })) }
              style={ styles.input }
            />

            { profile.role === 'MECHANIC' && (
              <>
                <TextInput
                  placeholder="Experience"
                  value={ edit.experience }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, experience: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholder="Speciality"
                  value={ edit.speciality }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, speciality: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholder="City"
                  value={ edit.city }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, city: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholder="Expertise"
                  value={ edit.expertise }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, expertise: value })) }
                  style={ styles.input }
                />
                <TextInput
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

            { profile.role === 'VEHICLE_OWNER' && (
              <>
                <TextInput
                  placeholder="City"
                  value={ edit.city }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, city: value })) }
                  style={ styles.input }
                />
                <TextInput
                  placeholder="Address"
                  value={ edit.addressLine }
                  onChangeText={ (value) => setEdit((prev) => ({ ...prev, addressLine: value })) }
                  style={ styles.input }
                />
              </>
            ) }

            <TouchableOpacity style={ styles.primaryButton } onPress={ handleSave }>
              <Text style={ styles.primaryButtonText }>Save Profile</Text>
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
              <View style={ styles.inlineRow }>
                <TextInput
                  placeholder="Banner image URL"
                  value={ newBanner }
                  onChangeText={ setNewBanner }
                  style={ [ styles.input, styles.inlineInput ] }
                />
                <TouchableOpacity style={ styles.primaryButtonSmall } onPress={ handleAddBanner }>
                  <Text style={ styles.primaryButtonText }>Add</Text>
                </TouchableOpacity>
              </View>
              { banners.map((banner) => (
                <View key={ banner.id } style={ styles.bannerRow }>
                  <Text style={ styles.bannerText }>{ banner.imageUrl }</Text>
                  <View style={ styles.bannerActions }>
                    <TouchableOpacity onPress={ () => handleToggleBanner(banner) }>
                      <Text style={ styles.link }>{ banner.active ? 'Disable' : 'Enable' }</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={ () => handleDeleteBanner(banner.id) }>
                      <Text style={ styles.linkDanger }>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )) }

              <View style={ styles.divider } />

              <Text style={ styles.subTitle }>Mechanic visibility</Text>
              <TextInput
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
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E8E4',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2A24',
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2A24',
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9F5E1',
    color: '#1B6B4E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E4E8E4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FDFCF7',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  inlineInput: {
    flex: 1,
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
    backgroundColor: '#1B6B4E',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonSmall: {
    backgroundColor: '#1B6B4E',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  secondaryButton: {
    borderColor: '#1B6B4E',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1B6B4E',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E4E8E4',
  },
  bannerRow: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#E4E8E4',
    borderRadius: 12,
    gap: 6,
  },
  bannerText: {
    fontSize: 12,
    color: '#4F5D56',
  },
  bannerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  reviewRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E8E4',
  },
  reviewText: {
    fontSize: 13,
    color: '#4F5D56',
  },
  reviewMeta: {
    fontSize: 12,
    color: '#1B6B4E',
    fontWeight: '700',
  },
  link: {
    color: '#1B6B4E',
    fontWeight: '600',
  },
  linkDanger: {
    color: '#D45353',
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
    color: '#5C6B64',
    textAlign: 'center',
  },
  error: {
    color: '#D45353',
    textAlign: 'center',
  },
});

export default ProfileScreen;
