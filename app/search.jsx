import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppShell from '../components/layout/AppShell';
import MechanicCard from '../components/mechanic/MechanicCard';
import api from '../src/services/api';
import * as Location from 'expo-location';
import COLORS from '../theme/colors';
import { Skeleton, SkeletonRow } from '../components/utility/Skeleton';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(5);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);

  const loadLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = null;
      try {
        loc = await Location.getCurrentPositionAsync({});
      } catch (error) {
        loc = await Location.getLastKnownPositionAsync({});
      }
      if (!loc) return;
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (error) {
      // ignore location errors
    }
  };

  const search = async () => {
    setLoading(true);
    try {
      const data = await api.searchMechanics({ query, lat: coords?.lat, lng: coords?.lng, radiusKm });
      setMechanics(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    search();
  }, [radiusKm]);

  return (
    <AppShell title="Find Mechanics">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search by name, speciality, city"
            placeholderTextColor={COLORS.placeholder}
            value={query}
            onChangeText={setQuery}
            style={styles.input}
          />
          <TouchableOpacity style={styles.searchButton} onPress={search}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Radius: {radiusKm} km</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setRadiusKm((prev) => prev + 5)}>
            <Text style={styles.filterButtonText}>Increase</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.skeletonGrid}>
            {[0, 1, 2, 3].map((item) => (
              <View key={`mechanic-skeleton-${item}`} style={styles.skeletonCard}>
                <Skeleton height={70} width="100%" />
                <SkeletonRow lines={2} lineHeight={12} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.results}>
          {mechanics.map((mechanic) => (
            <MechanicCard key={mechanic.mechanicId} mechanic={mechanic} />
          ))}
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
  searchRow: {
    flexDirection: 'row',
    gap: 10,
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
  results: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skeletonCard: {
    width: '47%',
    gap: 10,
  },
});

export default SearchScreen;
