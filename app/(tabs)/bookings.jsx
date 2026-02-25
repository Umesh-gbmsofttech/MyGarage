import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
import { useRouter } from 'expo-router';
import COLORS from '../../theme/colors';
import { Skeleton, SkeletonRow } from '../../components/utility/Skeleton';
import { emitNotificationBadgeRefresh } from '../../src/utils/notificationBadgeEvents';
import useLoadingDots from '../../src/hooks/useLoadingDots';

const sortBookings = (list) => {
  return [...list].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.created_at || a.updatedAt || 0).getTime();
    const timeB = new Date(b.createdAt || b.created_at || b.updatedAt || 0).getTime();
    if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
      return timeB - timeA;
    }
    return (b.id || 0) - (a.id || 0);
  });
};

const BookingsScreen = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [respondingKey, setRespondingKey] = useState('');
  const responding = Boolean(respondingKey);
  const respondingDots = useLoadingDots(responding);
  const load = useCallback(async (showLoading = true) => {
    if (!user || !token) return;
    if (showLoading) setLoading(true);
    setError('');
    try {
      const data = user.role === 'MECHANIC' ? await api.mechanicBookings(token) : await api.ownerBookings(token);
      setBookings(sortBookings(data));
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(false);
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const handleRespond = async (bookingId, status) => {
    const actionKey = `${bookingId}:${status}`;
    if (respondingKey) return;
    try {
      setRespondingKey(actionKey);
      await api.respondBooking(token, bookingId, { status });
      const updated = user.role === 'MECHANIC' ? await api.mechanicBookings(token) : await api.ownerBookings(token);
      setBookings(sortBookings(updated));
      emitNotificationBadgeRefresh();
    } catch (err) {
      setError(err.message || 'Failed to respond');
    } finally {
      setRespondingKey('');
    }
  };

  const pendingBookings = bookings.filter((booking) => booking.status !== 'COMPLETED');
  const completedBookings = bookings.filter((booking) => booking.status === 'COMPLETED');

  return (
    <AppShell title="My Bookings">
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {!user && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>You are not logged in</Text>
            <Text style={styles.emptyText}>Please login to view your bookings.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/auth/signin')}>
              <Text style={styles.primaryButtonText}>Please login</Text>
            </TouchableOpacity>
          </View>
        )}

        {user && loading && (
          <View style={styles.skeletonStack}>
            {[0, 1, 2].map((item) => (
              <View key={`booking-skeleton-${item}`} style={styles.card}>
                <Skeleton height={18} width="45%" />
                <SkeletonRow lines={3} lineHeight={12} />
                <Skeleton height={36} width="40%" style={styles.skeletonButton} />
              </View>
            ))}
          </View>
        )}

        {user && !loading && error ? <Text style={styles.error}>{error}</Text> : null}

        {user && !loading && bookings.length === 0 && !error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>Bookings will appear here once created.</Text>
          </View>
        ) : null}

        {user && pendingBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Yet To Done</Text>
            {pendingBookings.map((booking) => (
              <View key={booking.id} style={styles.card}>
                <View>
                  <Text style={styles.cardTitle}>Booking #{booking.id}</Text>
                  <Text style={styles.cardText}>Status: {booking.status}</Text>
                  <Text style={styles.cardText}>Vehicle: {booking.vehicleMake} {booking.vehicleModel}</Text>
                  <Text style={styles.cardText}>Issue: {booking.issueDescription}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      emitNotificationBadgeRefresh();
                      router.push({ pathname: '/booking', params: { bookingId: booking.id } });
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Open</Text>
                  </TouchableOpacity>
                  {user.role === 'MECHANIC' && booking.status === 'PENDING' && (
                    <View style={styles.inlineActions}>
                      <TouchableOpacity
                        style={[styles.acceptButton, respondingKey && styles.actionDisabled]}
                        onPress={() => handleRespond(booking.id, 'ACCEPTED')}
                        disabled={Boolean(respondingKey)}
                      >
                        <Text style={styles.primaryButtonText}>
                          {respondingKey === `${booking.id}:ACCEPTED` ? `Sending${respondingDots}` : 'Accept'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.declineButton, respondingKey && styles.actionDisabled]}
                        onPress={() => handleRespond(booking.id, 'DECLINED')}
                        disabled={Boolean(respondingKey)}
                      >
                        <Text style={styles.primaryButtonText}>
                          {respondingKey === `${booking.id}:DECLINED` ? `Sending${respondingDots}` : 'Decline'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {user && completedBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Done</Text>
            {completedBookings.map((booking) => (
              <View key={booking.id} style={styles.card}>
                <View>
                  <Text style={styles.cardTitle}>Booking #{booking.id}</Text>
                  <Text style={styles.cardText}>Status: {booking.status}</Text>
                  <Text style={styles.cardText}>Vehicle: {booking.vehicleMake} {booking.vehicleModel}</Text>
                  <Text style={styles.cardText}>Issue: {booking.issueDescription}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      emitNotificationBadgeRefresh();
                      router.push({ pathname: '/booking', params: { bookingId: booking.id } });
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Open</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  cardActions: {
    gap: 10,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  declineButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionDisabled: {
    opacity: 0.8,
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
  },
  error: {
    color: COLORS.danger,
    textAlign: 'center',
  },
  skeletonStack: {
    gap: 12,
  },
  skeletonButton: {
    alignSelf: 'flex-start',
  },
});

export default BookingsScreen;
