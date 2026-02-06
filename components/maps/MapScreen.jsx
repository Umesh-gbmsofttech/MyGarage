import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

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

  useEffect(() => {
    const getUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    };
    getUserLocation();
  }, []);

  const mapCenter = ownerLocation || mechanicLocation || currentLocation;

  const distanceKm = useMemo(() => {
    if (!ownerLocation || !mechanicLocation) return null;
    return haversine(ownerLocation.latitude, ownerLocation.longitude, mechanicLocation.latitude, mechanicLocation.longitude);
  }, [ownerLocation, mechanicLocation]);

  if (!mapCenter) {
    return <Text style={styles.loading}>Loading map...</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
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
        {currentLocation && <Marker coordinate={currentLocation} title="You" pinColor="#1B6B4E" />}
        {ownerLocation && <Marker coordinate={ownerLocation} title="Vehicle Owner" pinColor="#0B3B2E" />}
        {mechanicLocation && <Marker coordinate={mechanicLocation} title="Mechanic" pinColor="#D45353" />}
      </MapView>
      {distanceKm && (
        <View style={styles.infoBox}>
          <Text>Distance: {distanceKm.toFixed(2)} km</Text>
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
    color: '#5C6B64',
  },
  infoBox: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#E4E8E4',
  },
});

export default MapScreen;
