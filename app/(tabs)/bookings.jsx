import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
import COLORS from '../../theme/colors';
import { Skeleton, SkeletonRow } from '../../components/utility/Skeleton';
import { emitNotificationBadgeRefresh } from '../../src/utils/notificationBadgeEvents';
import useLoadingDots from '../../src/hooks/useLoadingDots';

const PAGE_SIZE = 8;

const sortBookings = (list) => {
  return [...list].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
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
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportBookingId, setReportBookingId] = useState(null);
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const responding = Boolean(respondingKey) || reportSubmitting;
  const respondingDots = useLoadingDots(responding);

  const fetchPage = useCallback(
    async (page, replace = false) => {
      if (!user || !token) return;
      if (page === 0) setLoading(true);
      if (page > 0) setLoadingMore(true);
      setError('');
      try {
        const response =
          user.role === 'MECHANIC'
            ? await api.mechanicBookings(token, page, PAGE_SIZE)
            : await api.ownerBookings(token, page, PAGE_SIZE);
        const rows = Array.isArray(response?.content) ? response.content : [];
        setHasMore(!(response?.last ?? rows.length < PAGE_SIZE));
        setCurrentPage(page);
        setBookings((prev) => (replace ? sortBookings(rows) : sortBookings([...prev, ...rows])));
      } catch (err) {
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [token, user]
  );

  useEffect(() => {
    fetchPage(0, true);
  }, [fetchPage]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPage(0, true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPage]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchPage(currentPage + 1);
  }, [currentPage, fetchPage, hasMore, loading, loadingMore]);

  const handleRespond = async (bookingId, status) => {
    const actionKey = `${bookingId}:${status}`;
    if (respondingKey) return;
    try {
      setRespondingKey(actionKey);
      await api.respondBooking(token, bookingId, { status });
      await fetchPage(0, true);
      emitNotificationBadgeRefresh();
    } catch (err) {
      setError(err.message || 'Failed to respond');
    } finally {
      setRespondingKey('');
    }
  };

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status !== 'COMPLETED'),
    [bookings]
  );
  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'COMPLETED'),
    [bookings]
  );
  const mostRecentCompletedId = completedBookings[0]?.id;

  const openReportModal = (bookingId) => {
    setReportBookingId(bookingId);
    setReportDescription('');
    setReportVisible(true);
  };

  const submitReport = async () => {
    if (!reportBookingId || !reportDescription.trim()) return;
    try {
      setReportSubmitting(true);
      await api.reportBooking(token, reportBookingId, { description: reportDescription.trim() });
      setReportVisible(false);
      await fetchPage(0, true);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (!user) {
    return (
      <AppShell title="My Bookings">
        <View style={styles.loggedOutState}>
          <Text style={styles.loggedOutTitle}>You are not logged in</Text>
          <Text style={styles.loggedOutText}>Please login to view your bookings.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/auth/signin')}>
            <Text style={styles.primaryButtonText}>Please login</Text>
          </TouchableOpacity>
        </View>
      </AppShell>
    );
  }

  const listData = [];
  if (pendingBookings.length > 0) {
    listData.push({ type: 'header', id: 'pending-header', title: 'Service Yet To Done' });
    pendingBookings.forEach((b) => listData.push({ type: 'booking', section: 'pending', booking: b }));
  }
  if (completedBookings.length > 0) {
    listData.push({ type: 'header', id: 'completed-header', title: 'Service Done' });
    completedBookings.forEach((b) => listData.push({ type: 'booking', section: 'completed', booking: b }));
  }

  return (
    <AppShell title="My Bookings">
      {loading && bookings.length === 0 ? (
        <View style={[styles.container, styles.skeletonStack]}>
          {[0, 1, 2].map((item) => (
            <View key={`booking-skeleton-${item}`} style={styles.card}>
              <Skeleton height={18} width="45%" />
              <SkeletonRow lines={3} lineHeight={12} />
              <Skeleton height={36} width="40%" style={styles.skeletonButton} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, idx) =>
            item.type === 'header' ? item.id : `booking-${item.booking.id}-${idx}`
          }
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.25}
          ListEmptyComponent={
            !error ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No bookings yet</Text>
                <Text style={styles.emptyText}>Bookings will appear here once created.</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <Text style={styles.footerText}>Loading{respondingDots}</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return <Text style={styles.sectionTitle}>{item.title}</Text>;
            }
            const booking = item.booking;
            const canReport = booking.status === 'COMPLETED' && booking.id === mostRecentCompletedId;
            return (
              <View style={styles.card}>
                <View>
                  <Text style={styles.cardTitle}>Booking #{booking.id}</Text>
                  <Text style={styles.cardText}>Status: {booking.status}</Text>
                  <Text style={styles.cardText}>Make: {booking.vehicleMake || '-'}</Text>
                  <Text style={styles.cardText}>Model: {booking.vehicleModel || '-'}</Text>
                  <Text style={styles.cardText}>Year: {booking.vehicleYear || '-'}</Text>
                  <Text style={styles.cardText}>Issue: {booking.issueDescription}</Text>
                  {booking.serviceCompletedAt ? (
                    <Text style={styles.cardText}>
                      Service Date: {new Date(booking.serviceCompletedAt).toLocaleString()}
                    </Text>
                  ) : null}
                  {booking.reportCreatedAt ? (
                    <Text style={styles.cardText}>
                      Report Date: {new Date(booking.reportCreatedAt).toLocaleString()}
                    </Text>
                  ) : null}
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
                  {canReport ? (
                    <TouchableOpacity style={styles.reportButton} onPress={() => openReportModal(booking.id)}>
                      <Text style={styles.primaryButtonText}>Report</Text>
                    </TouchableOpacity>
                  ) : null}
                  {user.role === 'MECHANIC' && booking.status === 'PENDING' ? (
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
                  ) : null}
                </View>
              </View>
            );
          }}
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Modal visible={reportVisible} transparent animationType="fade" onRequestClose={() => setReportVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Report Service Issue</Text>
            <TextInput
              value={reportDescription}
              onChangeText={setReportDescription}
              placeholder="Describe the issue in detail"
              placeholderTextColor={COLORS.placeholder}
              multiline
              style={styles.reportInput}
            />
            <TouchableOpacity
              style={[styles.primaryButton, reportSubmitting && styles.actionDisabled]}
              onPress={submitReport}
              disabled={reportSubmitting || !reportDescription.trim()}
            >
              <Text style={styles.primaryButtonText}>
                {reportSubmitting ? `Submitting${respondingDots}` : 'Submit Report'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setReportVisible(false)}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
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
    gap: 12,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
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
  reportButton: {
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
  loggedOutState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  loggedOutTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  loggedOutText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  error: {
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 10,
  },
  skeletonStack: {
    gap: 12,
  },
  skeletonButton: {
    alignSelf: 'flex-start',
  },
  footerLoader: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  reportInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    color: COLORS.text,
    textAlignVertical: 'top',
    backgroundColor: COLORS.background,
  },
});

export default BookingsScreen;
