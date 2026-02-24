import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

const bearingDegrees = (from, to) => {
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const theta = Math.atan2(y, x);
  return (theta * 180) / Math.PI + 360;
};

const MapScreen = ({ riderLocation, destinationLocation, onRiderLocationUpdate }) => {
  const mapRef = useRef(null);
  const fullMapRef = useRef(null);
  const watchRef = useRef(null);
  const routeRequestInFlightRef = useRef(false);
  const routeCacheRef = useRef(new Map());
  const lastDirectionTapRef = useRef(0);
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [routeData, setRouteData] = useState([]);
  const [routeSteps, setRouteSteps] = useState([]);
  const [isRouteVisible, setIsRouteVisible] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(true);
  const [steps, setSteps] = useState([]);
  const [distanceKm, setDistanceKm] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [tileUrlTemplate, setTileUrlTemplate] = useState(
    'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key='
  );

  const activeRider = riderLocation || deviceLocation;
  const mapCenter = activeRider || destinationLocation || null;
  const destinationLat = destinationLocation?.latitude;
  const destinationLng = destinationLocation?.longitude;

  const animateRouteCamera = useCallback((targetRef, origin, destination, points) => {
    if (!targetRef?.current) return;
    const fitCoords = points?.length > 1 ? points : [origin, destination];
    targetRef.current.fitToCoordinates(fitCoords, {
      edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
      animated: true,
    });

    setTimeout(() => {
      const heading = bearingDegrees(origin, destination) % 360;
      const focusPoint = points?.length ? points[Math.floor(points.length / 2)] : destination;
      targetRef.current?.animateCamera(
        {
          center: focusPoint,
          zoom: 16.5,
          pitch: 45,
          heading,
        },
        { duration: 1200 }
      );
    }, 350);
  }, []);

  const normalizeRouteCoordinates = useCallback((payload) => {
    const source = Array.isArray(payload?.route) ? payload.route : payload?.geometry;
    if (!Array.isArray(source)) return [];

    return source
      .map((point) => {
        if (Array.isArray(point) && point.length >= 2) {
          return { latitude: Number(point[1]), longitude: Number(point[0]) };
        }
        if (point && typeof point === 'object') {
          const lat = Number(point.latitude);
          const lng = Number(point.longitude);
          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            return { latitude: lat, longitude: lng };
          }
        }
        return null;
      })
      .filter(Boolean);
  }, []);

  const fetchRoute = useCallback(async (origin, destination) => {
    if (!origin || !destination || routeRequestInFlightRef.current) return false;
    const routeKey = `${origin.latitude.toFixed(6)},${origin.longitude.toFixed(6)}:${destination.latitude.toFixed(6)},${destination.longitude.toFixed(6)}`;
    const cached = routeCacheRef.current.get(routeKey);
    if (cached) {
      setRouteError('');
      setRouteData(cached.route);
      setRouteSteps(cached.steps);
      setDistanceKm(cached.distanceKm);
      setDurationMinutes(cached.durationMinutes);
      setIsRouteVisible(true);
      animateRouteCamera(mapRef, origin, destination, cached.route);
      if (isFullScreen) {
        setTimeout(() => animateRouteCamera(fullMapRef, origin, destination, cached.route), 220);
      }
      return true;
    }

    try {
      routeRequestInFlightRef.current = true;
      setRouteLoading(true);
      setRouteError('');
      const data = await api.mapsDirections({
        originLat: origin.latitude,
        originLng: origin.longitude,
        destinationLat: destination.latitude,
        destinationLng: destination.longitude,
      });
      const mappedRoute = normalizeRouteCoordinates(data);
      const mappedSteps = data?.steps || [];
      const nextDistanceKm = data?.distanceMeters ? Number(data.distanceMeters) / 1000 : null;
      const nextDurationMinutes = data?.durationSeconds ? Number(data.durationSeconds) / 60 : null;
      if (mappedRoute.length <= 1) {
        throw new Error('No route geometry found for this trip.');
      }

      routeCacheRef.current.set(routeKey, {
        route: mappedRoute,
        steps: mappedSteps,
        distanceKm: nextDistanceKm,
        durationMinutes: nextDurationMinutes,
      });

      setRouteData(mappedRoute);
      setRouteSteps(mappedSteps);
      setSteps(mappedSteps);
      setDistanceKm(nextDistanceKm);
      setDurationMinutes(nextDurationMinutes);
      setIsRouteVisible(true);
      animateRouteCamera(mapRef, origin, destination, mappedRoute);
      if (isFullScreen) {
        setTimeout(() => animateRouteCamera(fullMapRef, origin, destination, mappedRoute), 220);
      }
      return true;
    } catch (error) {
      const message = error?.message || 'Failed to load route directions.';
      setRouteError(message);
      console.error('Direction fetch failed', error);
      Alert.alert('Directions Error', message);
      return false;
    } finally {
      routeRequestInFlightRef.current = false;
      setRouteLoading(false);
    }
  }, [animateRouteCamera, isFullScreen, normalizeRouteCoordinates]);

  useEffect(() => {
    const loadMapConfig = async () => {
      try {
        const data = await api.mapsConfig();
        if (data?.tileUrlTemplate) {
          setTileUrlTemplate(data.tileUrlTemplate);
        }
      } catch (error) {
        console.error('Failed to load map config', error);
      }
    };
    loadMapConfig();
  }, []);

  useEffect(() => {
    if (destinationLat === undefined || destinationLng === undefined) return;
    setRouteData([]);
    setRouteSteps([]);
    setSteps([]);
    setDistanceKm(null);
    setDurationMinutes(null);
    setIsRouteVisible(false);
    setRouteError('');
  }, [destinationLat, destinationLng]);

  useEffect(() => {
    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setRouteError('Location permission required for live tracking.');
          Alert.alert('Permission Required', 'Location permission is required for live tracking.');
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
        console.error('Failed to start location tracking', _error);
        setRouteError('Failed to initialize live location tracking.');
      }
    };

    startTracking();
    return () => {
      watchRef.current?.remove();
    };
  }, [onRiderLocationUpdate]);

  useEffect(() => {
    if (!activeRider || isRouteVisible) return;
    mapRef.current?.animateCamera(
      {
        center: activeRider,
        zoom: 16,
        pitch: 45,
      },
      { duration: 700 }
    );
  }, [activeRider, isRouteVisible]);

  const statusText = useMemo(() => {
    if (!trackingEnabled) return 'Location permission required for live tracking';
    if (routeLoading) return 'Updating route...';
    return 'Live tracking active';
  }, [trackingEnabled, routeLoading]);

  const displayedDistanceKm = useMemo(() => {
    if (distanceKm !== null && isRouteVisible) {
      return Number(distanceKm);
    }
    if (activeRider && destinationLocation) {
      return haversineMeters(activeRider, destinationLocation) / 1000;
    }
    return null;
  }, [distanceKm, isRouteVisible, activeRider, destinationLocation]);

  const handleDirectionPress = useCallback(async () => {
    if (!activeRider || !destinationLocation) {
      const message = 'Both mechanic and owner locations are required to fetch directions.';
      setRouteError(message);
      Alert.alert('Location Missing', message);
      return;
    }
    const now = Date.now();
    if (now - lastDirectionTapRef.current < 700) return;
    lastDirectionTapRef.current = now;
    const success = await fetchRoute(activeRider, destinationLocation);
    if (success) {
      setIsFullScreen(true);
    }
  }, [activeRider, destinationLocation, fetchRoute]);

  const handleLocatePress = useCallback(() => {
    if (!activeRider || !destinationLocation) {
      const target = activeRider || destinationLocation;
      if (!target) {
        setRouteError('Waiting for live location updates.');
        return;
      }
      mapRef.current?.animateToRegion(
        {
          latitude: target.latitude,
          longitude: target.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        600
      );
      return;
    }
    animateRouteCamera(mapRef, activeRider, destinationLocation, routeData);
  }, [activeRider, destinationLocation, animateRouteCamera, routeData]);

  const handleOpenFullScreen = useCallback(() => {
    setIsFullScreen(true);
  }, []);

  const renderTrackingMap = (targetRef, isModal = false) => (
    <MapView
      ref={targetRef}
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
      {isRouteVisible && routeData.length > 1 && (
        <Polyline coordinates={routeData} strokeWidth={4} strokeColor={COLORS.primary} lineCap="round" />
      )}
      {activeRider && <Marker coordinate={activeRider} title="Mechanic" pinColor={COLORS.success} />}
      {destinationLocation && (
        <Marker coordinate={destinationLocation} title="Owner" pinColor={COLORS.accentWarm} />
      )}
      {isModal && isRouteVisible && routeData.length > 1 ? null : null}
    </MapView>
  );

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
      <View style={styles.mapWrap}>
        {renderTrackingMap(mapRef)}

        <View style={styles.overlayCard}>
          <TouchableOpacity style={styles.overlayButton} onPress={handleOpenFullScreen}>
            <Ionicons name="expand" size={18} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.distancePill} onPress={handleLocatePress}>
            <Ionicons name="location-outline" size={14} color={COLORS.primary} />
            <Text style={styles.distanceText}>
              {displayedDistanceKm !== null ? `${displayedDistanceKm.toFixed(1)} km` : '--'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.overlayButton, routeLoading && styles.overlayButtonDisabled]}
            onPress={handleDirectionPress}
            disabled={routeLoading}
          >
            <Ionicons name="navigate" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          {durationMinutes !== null && isRouteVisible ? (
            <Text style={styles.infoText}>Duration: {Math.round(durationMinutes)} min</Text>
          ) : null}
          {routeError ? <Text style={styles.infoErrorText}>{routeError}</Text> : null}
          <Text style={styles.infoText}>{statusText}</Text>
        </View>
      </View>

      <Modal
        visible={isFullScreen}
        transparent={false}
        animationType="slide"
        onShow={() => {
          if (isRouteVisible && activeRider && destinationLocation) {
            animateRouteCamera(fullMapRef, activeRider, destinationLocation, routeData);
          }
        }}
        onRequestClose={() => setIsFullScreen(false)}
      >
        <View style={styles.fullScreenContainer}>
          {renderTrackingMap(fullMapRef, true)}

          <TouchableOpacity style={styles.closeButton} onPress={() => setIsFullScreen(false)}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.fullOverlayTop}>
            <View style={styles.distancePillDark}>
              <Ionicons name="location-outline" size={14} color="#FFFFFF" />
              <Text style={styles.distanceTextDark}>
                {displayedDistanceKm !== null ? `${displayedDistanceKm.toFixed(1)} km` : '--'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.overlayButtonDark, routeLoading && styles.overlayButtonDisabled]}
              onPress={handleDirectionPress}
              disabled={routeLoading}
            >
              <Ionicons name="navigate" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSheet}>
            <TouchableOpacity style={styles.sheetHeader} onPress={() => setStepsExpanded((prev) => !prev)}>
              <Text style={styles.sheetTitle}>Turn-by-turn directions</Text>
              <Ionicons
                name={stepsExpanded ? 'chevron-down' : 'chevron-up'}
                size={18}
                color={COLORS.text}
              />
            </TouchableOpacity>

            {stepsExpanded && (
              <ScrollView style={styles.stepsList} nestedScrollEnabled>
                {routeSteps.length > 0 ? routeSteps.map((step, idx) => (
                  <View key={`step-${idx}`} style={styles.stepRow}>
                    <Text style={styles.stepInstruction}>{idx + 1}. {step.instruction}</Text>
                    <Text style={styles.stepMeta}>
                      {(Number(step.distanceMeters || 0) / 1000).toFixed(2)} km • {Math.round(Number(step.durationSeconds || 0))}s • type {step.maneuverType ?? '-'}
                    </Text>
                  </View>
                )) : (
                  <Text style={styles.stepMeta}>Tap the direction button to load route steps.</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {steps.length > 0 && isRouteVisible && (
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsHeading}>Turn-by-turn</Text>
          <ScrollView style={styles.stepsList} nestedScrollEnabled>
            {steps.map((step, idx) => (
              <View key={`step-${idx}`} style={styles.stepRow}>
                <Text style={styles.stepInstruction}>{idx + 1}. {step.instruction}</Text>
                <Text style={styles.stepMeta}>
                  {(Number(step.distanceMeters || 0) / 1000).toFixed(2)} km • {Math.round(Number(step.durationSeconds || 0))}s • type {step.maneuverType ?? '-'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  mapWrap: {
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
    left: 10,
    right: 10,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderRadius: 10,
    gap: 2,
  },
  overlayCard: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  overlayButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  overlayButtonDisabled: {
    opacity: 0.5,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  distanceText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 42,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15,23,42,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullOverlayTop: {
    position: 'absolute',
    top: 42,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overlayButtonDark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.75)',
  },
  distancePillDark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  distanceTextDark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: 280,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  sheetTitle: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
  },
  infoText: {
    color: '#F8FAFC',
    fontSize: 12,
  },
  infoErrorText: {
    color: '#FCA5A5',
    fontSize: 12,
  },
  stepsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    maxHeight: 170,
  },
  stepsHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  stepsList: {
    flexGrow: 0,
  },
  stepRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepInstruction: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  stepMeta: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  skeletonContainer: {
    gap: 10,
  },
  skeletonMap: {
    borderRadius: 16,
  },
});

export default MapScreen;
