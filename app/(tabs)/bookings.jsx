import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
import { useRouter } from 'expo-router';

const BookingsScreen = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showLoading = true) => {
    if (!user || !token) return;
    if (showLoading) setLoading(true);
    setError('');
    try {
      const data = user.role === 'MECHANIC' ? await api.mechanicBookings(token) : await api.ownerBookings(token);
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(false);
    setRefreshing(false);
  };

  const handleRespond = async (bookingId, status) => {
    try {
      await api.respondBooking(token, bookingId, { status });
      const updated = user.role === 'MECHANIC' ? await api.mechanicBookings(token) : await api.ownerBookings(token);
      setBookings(updated);
    } catch (err) {
      setError(err.message || 'Failed to respond');
    }
  };

  const pendingBookings = bookings.filter((booking) => booking.status !== 'COMPLETED');
  const completedBookings = bookings.filter((booking) => booking.status === 'COMPLETED');

  return (
    <AppShell title="My Bookings">
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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

        {user && loading && <ActivityIndicator size="large" color="#1B6B4E" />}

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
                    onPress={() => router.push({ pathname: '/booking', params: { bookingId: booking.id } })}
                  >
                    <Text style={styles.secondaryButtonText}>Open</Text>
                  </TouchableOpacity>
                  {user.role === 'MECHANIC' && booking.status === 'PENDING' && (
                    <View style={styles.inlineActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleRespond(booking.id, 'ACCEPTED')}
                      >
                        <Text style={styles.primaryButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleRespond(booking.id, 'DECLINED')}
                      >
                        <Text style={styles.primaryButtonText}>Decline</Text>
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
                    onPress={() => router.push({ pathname: '/booking', params: { bookingId: booking.id } })}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E8E4',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2A24',
  },
  cardText: {
    fontSize: 13,
    color: '#4F5D56',
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
    color: '#1F2A24',
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#1B6B4E',
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
    borderColor: '#1B6B4E',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1B6B4E',
    fontWeight: '700',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#1B6B4E',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#D45353',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
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
    color: '#5C6B64',
    textAlign: 'center',
  },
  error: {
    color: '#D45353',
    textAlign: 'center',
  },
});

export default BookingsScreen;
