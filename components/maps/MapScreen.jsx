import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import COLORS from '../../theme/colors';
import { Skeleton } from '../utility/Skeleton';
import api from '../../src/services/api';

const haversineMeters = (a, b) => {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const toMeters = (point, refLat) => {
  const latMeters = point.latitude * 110540;
  const lngMeters = point.longitude * (111320 * Math.cos((refLat * Math.PI) / 180));
  return { x: lngMeters, y: latMeters };
};

const pointToSegmentDistanceMeters = (point, start, end) => {
  const refLat = point.latitude;
  const p = toMeters(point, refLat);
  const a = toMeters(start, refLat);
  const b = toMeters(end, refLat);

  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq === 0) return Math.hypot(apx, apy);

  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq));
  const closestX = a.x + abx * t;
  const closestY = a.y + aby * t;
  return Math.hypot(p.x - closestX, p.y - closestY);
};

const distanceFromPolyline = (point, polyline) => {
  if (!point || !polyline?.length) return Number.POSITIVE_INFINITY;
  if (polyline.length === 1) return haversineMeters(point, polyline[0]);

  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < polyline.length - 1; i += 1) {
    const distance = pointToSegmentDistanceMeters(point, polyline[i], polyline[i + 1]);
    if (distance < min) min = distance;
  }
  return min;
};

const MapScreen = ({ riderLocation, destinationLocation, onRiderLocationUpdate }) => {
  const mapRef = useRef(null);
  const watchRef = useRef(null);
  const routeRequestInFlightRef = useRef(false);
  const initialRouteKeyRef = useRef('');
  const lastRerouteAtRef = useRef(0);
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [etaText, setEtaText] = useState('');
  const [distanceKm, setDistanceKm] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [tileUrlTemplate, setTileUrlTemplate] = useState(
    'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key='
  );

  const activeRider = riderLocation || deviceLocation;
  const mapCenter = activeRider || destinationLocation || null;
  const destinationLat = destinationLocation?.latitude;
  const destinationLng = destinationLocation?.longitude;

  const fetchRoute = useCallback(async (origin, destination) => {
    if (!origin || !destination || routeRequestInFlightRef.current) return false;
    try {
      routeRequestInFlightRef.current = true;
      setRouteLoading(true);
      const data = await api.mapsDirections({
        originLat: origin.latitude,
        originLng: origin.longitude,
        destinationLat: destination.latitude,
        destinationLng: destination.longitude,
      });
      setRoute(data?.route || []);
      setEtaText(data?.etaText || '');
      setDistanceKm(data?.distanceMeters ? Number(data.distanceMeters) / 1000 : null);
      return true;
    } catch (_error) {
      // ignore transient direction errors
      return false;
    } finally {
      routeRequestInFlightRef.current = false;
      setRouteLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadMapConfig = async () => {
      try {
        const data = await api.mapsConfig();
        if (data?.tileUrlTemplate) {
          setTileUrlTemplate(data.tileUrlTemplate);
        }
      } catch (_error) {
        // keep default maptiler template if config request fails
      }
    };
    loadMapConfig();
  }, []);

  useEffect(() => {
    if (destinationLat === undefined || destinationLng === undefined) return;
    initialRouteKeyRef.current = '';
    setRoute([]);
    setEtaText('');
    setDistanceKm(null);
  }, [destinationLat, destinationLng]);

  useEffect(() => {
    const requestInitialRoute = async () => {
      if (!activeRider || destinationLat === undefined || destinationLng === undefined) return;
      const destination = { latitude: destinationLat, longitude: destinationLng };
      const initialKey = `${destinationLat.toFixed(6)},${destinationLng.toFixed(6)}`;
      if (initialRouteKeyRef.current === initialKey) return;

      const success = await fetchRoute(activeRider, destination);
      if (success) {
        initialRouteKeyRef.current = initialKey;
      }
    };

    requestInitialRoute();
  }, [activeRider, destinationLat, destinationLng, fetchRoute]);

  useEffect(() => {
    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        setTrackingEnabled(true);

        const current = (await Location.getCurrentPositionAsync({})) || (await Location.getLastKnownPositionAsync({}));
        if (current) {
          const next = { latitude: current.coords.latitude, longitude: current.coords.longitude };
          setDeviceLocation(next);
          onRiderLocationUpdate?.(next);
        }

        watchRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2500,
            distanceInterval: 5,
          },
          (position) => {
            const next = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            setDeviceLocation(next);
            onRiderLocationUpdate?.(next);
          }
        );
      } catch (_error) {
        // ignore location setup errors
      }
    };

    startTracking();
    return () => {
      watchRef.current?.remove();
    };
  }, [onRiderLocationUpdate]);

  useEffect(() => {
    if (!activeRider) return;
    mapRef.current?.animateCamera(
      {
        center: activeRider,
        zoom: 16,
        pitch: 45,
      },
      { duration: 700 }
    );
  }, [activeRider]);

  useEffect(() => {
    const maybeReroute = async () => {
      if (!activeRider || !destinationLocation || route.length < 2) return;
      const deviationMeters = distanceFromPolyline(activeRider, route);
      if (deviationMeters <= 40) return;
      if (Date.now() - lastRerouteAtRef.current < 15000) return;

      lastRerouteAtRef.current = Date.now();
      await fetchRoute(activeRider, destinationLocation);
    };

    maybeReroute();
  }, [activeRider, destinationLocation, route, fetchRoute]);

  const statusText = useMemo(() => {
    if (!trackingEnabled) return 'Location permission required for live tracking';
    if (routeLoading) return 'Updating route...';
    return 'Live tracking active';
  }, [trackingEnabled, routeLoading]);

  if (!mapCenter) {
    return (
      <View style={styles.skeletonContainer}>
        <Skeleton height={240} width="100%" style={styles.skeletonMap} />
        <Skeleton height={14} width="70%" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="none"
        initialRegion={{
          latitude: mapCenter.latitude,
          longitude: mapCenter.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
      >
        <UrlTile urlTemplate={tileUrlTemplate} maximumZ={19} />
        {route.length > 1 && (
          <Polyline coordinates={route} strokeWidth={5} strokeColor={COLORS.primary} lineCap="round" />
        )}
        {activeRider && <Marker coordinate={activeRider} title="Rider" pinColor={COLORS.success} />}
        {destinationLocation && (
          <Marker coordinate={destinationLocation} title="Destination" pinColor={COLORS.accentWarm} />
        )}
      </MapView>

      <View style={styles.infoBox}>
        {!!etaText && <Text style={styles.infoText}>ETA: {etaText}</Text>}
        {distanceKm !== null && <Text style={styles.infoText}>Distance: {distanceKm.toFixed(2)} km</Text>}
        <Text style={styles.infoText}>{statusText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    gap: 2,
  },
  infoText: {
    color: '#F8FAFC',
    fontSize: 12,
  },
  skeletonContainer: {
    gap: 10,
  },
  skeletonMap: {
    borderRadius: 16,
  },
});

export default MapScreen;
