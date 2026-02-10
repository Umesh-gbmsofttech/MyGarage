import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import COLORS from '../../theme/colors';
import { Skeleton } from '../utility/Skeleton';
import api from '../../src/services/api';

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapScreen = ({ ownerLocation, mechanicLocation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [areaLabel, setAreaLabel] = useState('');

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        let loc = null;
        try {
          loc = await Location.getCurrentPositionAsync({});
        } catch (error) {
          loc = await Location.getLastKnownPositionAsync({});
        }
        if (!loc) return;
        setCurrentLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (error) {
        // ignore location errors
      }
    };
    getUserLocation();
  }, []);

  const mapCenter = ownerLocation || mechanicLocation || currentLocation;

  const distanceKm = useMemo(() => {
    if (!ownerLocation || !mechanicLocation) return null;
    return haversine(ownerLocation.latitude, ownerLocation.longitude, mechanicLocation.latitude, mechanicLocation.longitude);
  }, [ownerLocation, mechanicLocation]);

  if (!mapCenter) {
    return (
      <View style={styles.skeletonContainer}>
        <Skeleton height={200} width="100%" style={styles.skeletonMap} />
        <Skeleton height={14} width="60%" />
      </View>
    );
  }
  useEffect(() => {
    const fetchArea = async () => {
      if (!mapCenter) return;
      try {
        const data = await api.mapsReverseGeocode(mapCenter.latitude, mapCenter.longitude);
        if (data?.formattedAddress) {
          setAreaLabel(data.formattedAddress);
        }
      } catch (error) {
        // ignore map lookup errors
      }
    };
    fetchArea();
  }, [mapCenter]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType="none"
        initialRegion={{
          latitude: mapCenter.latitude,
          longitude: mapCenter.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />
        {currentLocation && <Marker coordinate={currentLocation} title="You" pinColor={COLORS.success} />}
        {ownerLocation && <Marker coordinate={ownerLocation} title="Vehicle Owner" pinColor={COLORS.primary} />}
        {mechanicLocation && <Marker coordinate={mechanicLocation} title="Mechanic" pinColor={COLORS.accentWarm} />}
      </MapView>
      {(distanceKm || areaLabel) && (
        <View style={styles.infoBox}>
          {distanceKm ? <Text>Distance: {distanceKm.toFixed(2)} km</Text> : null}
          {areaLabel ? <Text numberOfLines={1}>{areaLabel}</Text> : null}
          <Text>Live tracking active</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loading: {
    textAlign: 'center',
    color: COLORS.muted,
  },
  infoBox: {
    padding: 10,
    backgroundColor: COLORS.card,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  skeletonContainer: {
    gap: 10,
  },
  skeletonMap: {
    borderRadius: 16,
  },
});

export default MapScreen;
