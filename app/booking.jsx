import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppShell from '../components/layout/AppShell';
import MapScreen from '../components/maps/MapScreen';
import KeyboardScreen from '../components/utility/KeyboardScreen';
import { useAuth } from '../src/context/AuthContext';
import api from '../src/services/api';
import COLORS from '../theme/colors';
import { Skeleton, SkeletonRow } from '../components/utility/Skeleton';
import useLoadingDots from '../src/hooks/useLoadingDots';

const BookingScreen = () => {
  const { bookingId } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [ booking, setBooking ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ otpMeet, setOtpMeet ] = useState('');
  const [ otpComplete, setOtpComplete ] = useState('');
  const [ locations, setLocations ] = useState([]);
  const [ localDeviceLocation, setLocalDeviceLocation ] = useState(null);
  const [ prompted, setPrompted ] = useState(false);
  const [ actionLoading, setActionLoading ] = useState('');
  const [garageWorkers, setGarageWorkers] = useState([]);
  const [previousStatus, setPreviousStatus] = useState(null);
  const isMechanic = useMemo(() => user?.role === 'MECHANIC' || user?.role === 'GARAGE_OWNER', [ user ]);
  const isGarageOwner = useMemo(() => user?.role === 'GARAGE_OWNER', [user]);
  const isAssignedWorker = useMemo(() => booking?.assignedWorkerId && String(booking.assignedWorkerId) === String(user?.id), [booking, user]);
  const workerAssignmentAccepted = useMemo(() => booking?.assignedWorkerAccepted === true, [booking]);
  const canPushLiveLocation = useMemo(() => {
    if (!booking || !user) return false;
    if (user.role === 'GARAGE_OWNER') return !booking.assignedWorkerId;
    if (user.role === 'MECHANIC') {
      if (String(booking.mechanicId) === String(user.id) && !booking.assignedWorkerId) return true;
      return String(booking.assignedWorkerId) === String(user.id) && workerAssignmentAccepted;
    }
    return false;
  }, [booking, user, workerAssignmentAccepted]);
  const loadingDots = useLoadingDots(Boolean(actionLoading));

  const loadBooking = useCallback(async (showLoading = true) => {
    if (!token || !user) return;
    if (showLoading) {
      setLoading(true);
    }
    try {
      const item = await api.bookingById(token, bookingId);
      setBooking(item || null);
    } catch (err) {
      setBooking(null);
      Alert.alert('Error', err.message || 'Failed to load booking');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [ token, user, bookingId ]);

  const loadBookingSummary = useCallback(async () => {
    if (!token || !bookingId || !booking) return;
    try {
      const summary = await api.bookingSummary(token, bookingId);
      if (summary?.status && summary.status !== booking.status) {
        await loadBooking(false);
        return;
      }
      if (summary) {
        setBooking((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: summary.status ?? prev.status,
            vehicleMake: summary.vehicleMake ?? prev.vehicleMake,
            vehicleModel: summary.vehicleModel ?? prev.vehicleModel,
          };
        });
      }
    } catch (_err) {
      // ignore transient summary polling failures
    }
  }, [ token, bookingId, booking, loadBooking ]);

  const pushLocation = useCallback(async () => {
    if (!localDeviceLocation || !token || !bookingId) return;
    try {
      await api.updateLocation(token, bookingId, {
        latitude: localDeviceLocation.latitude,
        longitude: localDeviceLocation.longitude,
      });
    } catch (error) {
      console.error('Failed to push live location', error);
    }
  }, [localDeviceLocation, token, bookingId]);

  const loadLocations = useCallback(async () => {
    if (!token || !bookingId) return;
    try {
      const data = await api.getLiveLocation(token, bookingId);
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load live locations', err);
    }
  }, [token, bookingId]);

  useEffect(() => {
    loadBooking();
  }, [ loadBooking ]);

  useEffect(() => {
    if (!token || user?.role !== 'GARAGE_OWNER') return;
    api.garageOwnerMechanics(token).then((rows) => setGarageWorkers(Array.isArray(rows) ? rows : [])).catch(() => {});
  }, [token, user]);

  useEffect(() => {
    if (!token || !bookingId) return undefined;
      const interval = setInterval(() => {
        if (!booking) {
          loadBooking(false);
          return;
        }
        loadBookingSummary();
    }, 8000);
    return () => clearInterval(interval);
  }, [ token, bookingId, booking, loadBooking, loadBookingSummary ]);

  useEffect(() => {
    if (!booking) return undefined;
    if (booking.status === 'ACCEPTED' || booking.status === 'IN_PROGRESS') {
      loadLocations();
      const interval = setInterval(loadLocations, 8000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [ booking, loadLocations ]);

  useEffect(() => {
    if (!booking || !canPushLiveLocation) return undefined;
    if (booking.status === 'ACCEPTED' || booking.status === 'IN_PROGRESS') {
      const interval = setInterval(pushLocation, 12000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [ booking, canPushLiveLocation, pushLocation ]);

  useEffect(() => {
    if (!booking) return;
    setPreviousStatus((current) => current ?? booking.status);
  }, [booking]);

  useEffect(() => {
    if (!booking?.completeVerified || prompted) return;
    if (previousStatus && previousStatus !== 'COMPLETED' && booking.status === 'COMPLETED') {
      setPrompted(true);
      Alert.alert('Service Completed', 'Please share feedback.', [
        { text: 'Skip' },
        { text: 'Give Feedback', onPress: () => router.push('/feedback') },
      ]);
    }
    if (booking.status) {
      setPreviousStatus(booking.status);
    }
  }, [ booking, prompted, previousStatus, router ]);

  const handleVerifyMeet = async () => {
    if (actionLoading) return;
    try {
      setActionLoading('verifyMeet');
      const updated = await api.verifyMeetOtp(token, bookingId, { code: otpMeet });
      setBooking(updated);
      setOtpMeet('');
      Alert.alert('Success', 'Meet OTP verified');
    } catch (err) {
      Alert.alert('Error', err.message || 'OTP verification failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleVerifyComplete = async () => {
    if (actionLoading) return;
    try {
      setActionLoading('verifyComplete');
      const updated = await api.verifyCompleteOtp(token, bookingId, { code: otpComplete });
      setBooking(updated);
      setOtpComplete('');
      Alert.alert('Success', 'Completion OTP verified');
    } catch (err) {
      Alert.alert('Error', err.message || 'OTP verification failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleGenerateCompleteOtp = async () => {
    if (actionLoading) return;
    try {
      setActionLoading('generateComplete');
      const updated = await api.generateCompleteOtp(token, bookingId);
      setBooking(updated);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to generate completion OTP');
    } finally {
      setActionLoading('');
    }
  };

  const handleAssignWorker = async (workerUserId) => {
    if (actionLoading) return;
    try {
      setActionLoading(`assign:${workerUserId}`);
      const updated = await api.assignBookingWorker(token, bookingId, { workerUserId });
      setBooking(updated);
      Alert.alert('Assigned', 'Service request assigned to your mechanic.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to assign worker');
    } finally {
      setActionLoading('');
    }
  };

  const providerUserId = booking?.assignedWorkerId || booking?.mechanicId;
  const mechanicLocation = locations.find((loc) => String(loc.userId ?? loc.user?.id) === String(providerUserId));
  const mechanicPoint = mechanicLocation
    ? { latitude: mechanicLocation.latitude, longitude: mechanicLocation.longitude }
    : null;
  const ownerPoint = booking?.serviceLatitude && booking?.serviceLongitude
    ? { latitude: booking.serviceLatitude, longitude: booking.serviceLongitude }
    : null;

  const riderLocation = isMechanic
    ? (localDeviceLocation || mechanicPoint)
    : mechanicPoint;
  const destinationLocation = isMechanic
    ? ownerPoint
    : ownerPoint;

  const handleRiderLocationUpdate = useCallback((location) => {
    setLocalDeviceLocation(location);
  }, []);

  return (
    <AppShell hideChrome hideSupport>
      <KeyboardScreen contentContainerStyle={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          { loading && (
            <View style={ styles.card }>
              <Skeleton height={ 18 } width="40%" />
              <SkeletonRow lines={ 3 } lineHeight={ 12 } />
            </View>
          ) }
          { booking && (
            <View style={ styles.card }>
              <Text style={ styles.title }>Booking #{ booking.id }</Text>
              <Text style={ styles.text }>Status: { booking.status }</Text>
              <Text style={ styles.text }>Make: { booking.vehicleMake || '-' }</Text>
              <Text style={ styles.text }>Model: { booking.vehicleModel || '-' }</Text>
              <Text style={ styles.text }>Year: { booking.vehicleYear || '-' }</Text>
              <Text style={ styles.text }>Issue: { booking.issueDescription }</Text>
              <Text style={ styles.text }>Service Location: { booking.serviceAddress || 'Captured from owner device' }</Text>
              {booking.assignedWorkerId ? (
                <Text style={styles.text}>
                  Assigned Mechanic: {booking.assignedWorkerAccepted ? 'Accepted and on duty' : 'Awaiting worker confirmation'}
                </Text>
              ) : null}
            </View>
          ) }

          { (booking?.status === 'ACCEPTED' || booking?.status === 'IN_PROGRESS') && (
            <View style={ styles.card }>
              <Text style={ styles.sectionTitle }>Live Tracking</Text>
              <MapScreen
                riderLocation={ riderLocation }
                destinationLocation={ destinationLocation }
                onRiderLocationUpdate={ handleRiderLocationUpdate }
                riderImage={ booking?.assignedWorkerProfileImageUrl || booking?.mechanicProfileImageUrl }
                destinationImage={ booking?.ownerProfileImageUrl }
                allowLiveTracking={canPushLiveLocation}
                allowManualRouting={isMechanic}
                riderLabel={booking?.assignedWorkerId ? 'Assigned Mechanic' : 'Mechanic'}
                destinationLabel="Service Pin"
                routeDistanceKm={booking?.routeDistanceKm}
                routeDurationMinutes={booking?.routeDurationMinutes}
                onRouteMetrics={(metrics) => {
                  if (!isMechanic || !token) return;
                  api.updateRouteStats(token, bookingId, metrics).then(setBooking).catch(() => {});
                }}
              />
            </View>
          ) }

          {isGarageOwner && booking?.status === 'ACCEPTED' && garageWorkers.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Assign Your Mechanic</Text>
              {garageWorkers.map((worker) => (
                <TouchableOpacity
                  key={worker.mechanicId}
                  style={[styles.secondaryButton, booking.assignedWorkerId === worker.mechanicId && styles.assignedButton]}
                  onPress={() => handleAssignWorker(worker.mechanicId)}
                  disabled={Boolean(actionLoading)}
                >
                  <Text style={styles.secondaryButtonText}>
                    {actionLoading === `assign:${worker.mechanicId}` ? `Assigning${loadingDots}` : `${worker.mechName} ${worker.surname}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <View style={ styles.card }>
            <Text style={ styles.sectionTitle }>OTP Verification</Text>
            { !isMechanic && booking && !booking.meetVerified && (
              <>
                <Text style={ styles.text }>Meet OTP: { booking.meetOtp || 'Pending' }</Text>
                <Text style={ styles.text }>Share this with mechanic</Text>
              </>
            ) }
            { !isMechanic && booking && booking.meetVerified && !booking.completeOtp && (
              <TouchableOpacity style={ [ styles.primaryButton, actionLoading && styles.buttonDisabled ] } onPress={ handleGenerateCompleteOtp } disabled={ Boolean(actionLoading) }>
                <Text style={ styles.primaryButtonText }>
                  { actionLoading === 'generateComplete' ? `Submitting${loadingDots}` : 'Service Done' }
                </Text>
              </TouchableOpacity>
            ) }
            { !isMechanic && booking && booking.completeOtp && (
              <>
                <Text style={ styles.text }>Completion OTP: { booking.completeOtp }</Text>
                <Text style={ styles.text }>Share this with mechanic</Text>
              </>
            ) }

            { isMechanic && booking && !booking.meetVerified && ((isAssignedWorker && workerAssignmentAccepted) || !booking.assignedWorkerId || isGarageOwner) && (
              <>
                <TextInput
                  placeholder="Enter Meet OTP"
                  placeholderTextColor={ COLORS.placeholder }
                  value={ otpMeet }
                  onChangeText={ setOtpMeet }
                  style={ styles.input }
                  keyboardType="numeric"
                />
                <TouchableOpacity style={ [ styles.secondaryButton, actionLoading && styles.buttonDisabled ] } onPress={ handleVerifyMeet } disabled={ Boolean(actionLoading) }>
                  <Text style={ styles.secondaryButtonText }>
                    { actionLoading === 'verifyMeet' ? `Sending${loadingDots}` : 'Verify Meet OTP' }
                  </Text>
                </TouchableOpacity>
              </>
            ) }
            { isMechanic && booking && booking.meetVerified && !booking.completeVerified && ((isAssignedWorker && workerAssignmentAccepted) || !booking.assignedWorkerId || isGarageOwner) && (
              <>
                <TextInput
                  placeholder="Enter Completion OTP"
                  placeholderTextColor={ COLORS.placeholder }
                  value={ otpComplete }
                  onChangeText={ setOtpComplete }
                  style={ styles.input }
                  keyboardType="numeric"
                />
                <TouchableOpacity style={ [ styles.secondaryButton, actionLoading && styles.buttonDisabled ] } onPress={ handleVerifyComplete } disabled={ Boolean(actionLoading) }>
                  <Text style={ styles.secondaryButtonText }>
                    { actionLoading === 'verifyComplete' ? `Sending${loadingDots}` : 'Verify Completion OTP' }
                  </Text>
                </TouchableOpacity>
              </>
            ) }
          </View>
      </KeyboardScreen>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 16,
    paddingTop: 50,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  text: {
    fontSize: 13,
    color: COLORS.muted,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  assignedButton: {
    backgroundColor: '#EFF6FF',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default BookingScreen;
