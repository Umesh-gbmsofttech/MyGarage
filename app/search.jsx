import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../components/layout/AppShell';
import MechanicCard from '../components/mechanic/MechanicCard';
import api from '../src/services/api';
import * as Location from 'expo-location';
import COLORS from '../theme/colors';
import { Skeleton, SkeletonRow } from '../components/utility/Skeleton';

const PAGE_SIZE = 10;

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(5);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [coords, setCoords] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = null;
      try {
        loc = await Location.getCurrentPositionAsync({});
      } catch (_error) {
        loc = await Location.getLastKnownPositionAsync({});
      }
      if (!loc) return;
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (_error) {
      // ignore location errors
    }
  };

  const fetchPage = useCallback(
    async (nextPage, replace = false) => {
      if (nextPage === 0) setLoading(true);
      if (nextPage > 0) setLoadingMore(true);
      try {
        const data = await api.searchMechanicsPaged({
          query,
          lat: coords?.lat,
          lng: coords?.lng,
          radiusKm,
          page: nextPage,
          size: PAGE_SIZE,
        });
        const rows = Array.isArray(data?.content) ? data.content : [];
        setHasMore(!(data?.last ?? rows.length < PAGE_SIZE));
        setPage(nextPage);
        setMechanics((prev) => (replace ? rows : [...prev, ...rows]));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [coords?.lat, coords?.lng, query, radiusKm]
  );

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    fetchPage(0, true);
  }, [fetchPage]);

  return (
    <AppShell title="Find Mechanics">
      <FlatList
        data={mechanics}
        keyExtractor={(item) => String(item.mechanicId)}
        numColumns={2}
        onEndReached={() => {
          if (!loading && !loadingMore && hasMore) {
            fetchPage(page + 1);
          }
        }}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.container}
        columnWrapperStyle={styles.resultsRow}
        ListHeaderComponent={
          <>
            <View style={styles.searchRow}>
              <TextInput
                placeholder="Search by name, speciality, city"
                placeholderTextColor={COLORS.placeholder}
                value={query}
                onChangeText={setQuery}
                style={styles.input}
              />
              <TouchableOpacity style={styles.searchButton} onPress={() => fetchPage(0, true)}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Radius: {radiusKm} km</Text>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setRadiusKm((prev) => Math.min(prev + 5, 100))}
              >
                <Text style={styles.filterButtonText}>Increase</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.skeletonGrid}>
                {[0, 1, 2, 3].map((item) => (
                  <View key={`mechanic-skeleton-${item}`} style={styles.skeletonCard}>
                    <Skeleton height={70} width="100%" />
                    <SkeletonRow lines={2} lineHeight={12} />
                  </View>
                ))}
              </View>
            ) : null}
          </>
        }
        renderItem={({ item }) =>
          loading ? null : (
            <View style={styles.cardWrap}>
              <MechanicCard mechanic={item} />
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreWrap}>
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : null
        }
      />
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  filterButton: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  filterButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  resultsRow: {
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: '48%',
    marginBottom: 12,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 6,
  },
  skeletonCard: {
    width: '47%',
    gap: 10,
  },
  loadingMoreWrap: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  loadingMoreText: {
    color: COLORS.muted,
  },
});

export default SearchScreen;
