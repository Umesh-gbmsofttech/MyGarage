import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import COLORS from '../../theme/colors';
import { Skeleton } from '../utility/Skeleton';
import api from '../../src/services/api';

const MAPLIBRE_STYLE_URL = 'https://demotiles.maplibre.org/style.json';
const isExpoGo = Constants.appOwnership === 'expo';
let MapLibreGL = null;
if (!isExpoGo) {
  try {
    MapLibreGL = require('@maplibre/maplibre-react-native').default;
  } catch (error) {
    console.warn('MapLibre failed to load', error);
    MapLibreGL = null;
  }
}

const showRouteUnavailableToast = () => {
  if (Platform.OS === 'android') {
    ToastAndroid.show('Route unavailable', ToastAndroid.SHORT);
    return;
  }
  Alert.alert('Route unavailable');
};

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

const MapScreen = ({ riderLocation, destinationLocation, onRiderLocationUpdate }) => {
  const cameraRef = useRef(null);
  const fullCameraRef = useRef(null);
  const watchRef = useRef(null);
  const routeRequestInFlightRef = useRef(false);
  const routeCacheRef = useRef(new Map());
  const lastDirectionTapRef = useRef(0);
  const autoRouteTriggeredRef = useRef(false);

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
  const [trackingError, setTrackingError] = useState('');

  const activeRider = riderLocation || deviceLocation;
  const mapCenter = activeRider || destinationLocation || null;
  const destinationLat = destinationLocation?.latitude;
  const destinationLng = destinationLocation?.longitude;

  const riderCoordinate = activeRider ? [activeRider.longitude, activeRider.latitude] : null;
  const destinationCoordinate = destinationLocation ? [destinationLocation.longitude, destinationLocation.latitude] : null;
  const mainRouteSourceId = 'routeSource-main';
  const fullRouteSourceId = 'routeSource-full';

  const routeFeature = useMemo(
    () => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: routeData,
      },
      properties: {},
    }),
    [routeData]
  );

  const fitMapBounds = useCallback((targetCameraRef, coordinates) => {
    if (!targetCameraRef?.current || !Array.isArray(coordinates) || coordinates.length < 2) return;
    const lngs = coordinates.map((c) => c[0]);
    const lats = coordinates.map((c) => c[1]);
    const ne = [Math.max(...lngs), Math.max(...lats)];
    const sw = [Math.min(...lngs), Math.min(...lats)];

    targetCameraRef.current.fitBounds(ne, sw, [80, 80, 80, 80], 1200);
  }, []);

  const fitToParticipants = useCallback(
    (targetCameraRef) => {
      if (!activeRider || !destinationLocation) return;
      const coords = [
        [activeRider.longitude, activeRider.latitude],
        [destinationLocation.longitude, destinationLocation.latitude],
      ];
      fitMapBounds(targetCameraRef, coords);
    },
    [activeRider, destinationLocation, fitMapBounds]
  );

  const normalizeRouteCoordinates = useCallback((payload) => {
    const source = payload?.geometry;
    if (!Array.isArray(source)) {
      console.warn('Route geometry missing or invalid');
      return [];
    }

    const normalized = source
      .map((point) => {
        if (!Array.isArray(point) || point.length < 2) {
          return null;
        }
        const lng = Number(point[0]);
        const lat = Number(point[1]);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          return null;
        }
        return [lng, lat];
      })
      .filter(Boolean);

    if (normalized.length <= 1) {
      console.warn('Route geometry malformed or too short');
      return [];
    }
    return normalized;
  }, []);

  const fetchRoute = useCallback(
    async (origin, destination, options = {}) => {
      const forceRefresh = Boolean(options.forceRefresh);
      if (!origin || !destination || routeRequestInFlightRef.current) return false;

      const routeKey = `${origin.latitude.toFixed(6)},${origin.longitude.toFixed(6)}:${destination.latitude.toFixed(6)},${destination.longitude.toFixed(6)}`;
      const cached = routeCacheRef.current.get(routeKey);
      if (cached && !forceRefresh) {
        setRouteError('');
        setRouteData(cached.route);
        setRouteSteps(cached.steps);
        setSteps(cached.steps);
        setDistanceKm(cached.distanceKm);
        setDurationMinutes(cached.durationMinutes);
        setIsRouteVisible(true);
        fitMapBounds(cameraRef, cached.route);
        if (isFullScreen) {
          setTimeout(() => fitMapBounds(fullCameraRef, cached.route), 220);
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
        if (mappedRoute.length <= 1) {
          throw new Error('Route unavailable');
        }

        const mappedSteps = data?.steps || [];
        const nextDistanceKm = data?.distanceMeters ? Number(data.distanceMeters) / 1000 : null;
        const nextDurationMinutes = data?.durationSeconds ? Number(data.durationSeconds) / 60 : null;

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

        fitMapBounds(cameraRef, mappedRoute);
        if (isFullScreen) {
          setTimeout(() => fitMapBounds(fullCameraRef, mappedRoute), 220);
        }
        return true;
      } catch (error) {
        const message = error?.message || 'Failed to load route directions.';
        setRouteError(message);
        console.error('Direction fetch failed', error);
        showRouteUnavailableToast();
        Alert.alert('Directions Error', message);
        return false;
      } finally {
        routeRequestInFlightRef.current = false;
        setRouteLoading(false);
      }
    },
    [fitMapBounds, isFullScreen, normalizeRouteCoordinates]
  );

  useEffect(() => {
    if (destinationLat === undefined || destinationLng === undefined) return;
    setRouteData([]);
    setRouteSteps([]);
    setSteps([]);
    setDistanceKm(null);
    setDurationMinutes(null);
    setIsRouteVisible(false);
    setRouteError('');
    autoRouteTriggeredRef.current = false;
  }, [destinationLat, destinationLng]);

  useEffect(() => {
    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setTrackingError('Location permission required for live tracking.');
          Alert.alert('Permission Required', 'Location permission is required for live tracking.');
          return;
        }
        setTrackingError('');
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
      } catch (error) {
        console.error('Failed to start location tracking', error);
        setTrackingError('Failed to initialize live location tracking.');
      }
    };

    startTracking();
    return () => {
      watchRef.current?.remove();
    };
  }, [onRiderLocationUpdate]);

  useEffect(() => {
    if (!mapCenter || isRouteVisible) return;
    if (activeRider && destinationLocation) {
      fitToParticipants(cameraRef);
      return;
    }
    cameraRef.current?.setCamera({
      centerCoordinate: [mapCenter.longitude, mapCenter.latitude],
      zoomLevel: 16,
      animationDuration: 700,
    });
  }, [activeRider, destinationLocation, fitToParticipants, mapCenter, isRouteVisible]);

  useEffect(() => {
    if (!activeRider || !destinationLocation || autoRouteTriggeredRef.current || routeLoading) return;
    autoRouteTriggeredRef.current = true;
    fetchRoute(activeRider, destinationLocation, { forceRefresh: false });
  }, [activeRider, destinationLocation, fetchRoute, routeLoading]);

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

    const refreshed = await fetchRoute(activeRider, destinationLocation, { forceRefresh: true });
    if (refreshed) {
      setIsFullScreen(true);
    }
  }, [activeRider, destinationLocation, fetchRoute]);

  const directionDisabled = routeLoading || !activeRider || !destinationLocation;

  const handleLocatePress = useCallback(() => {
    if (!activeRider && !destinationLocation) {
      setTrackingError('Waiting for live location updates.');
      return;
    }

    if (isRouteVisible && routeData.length > 1) {
      fitMapBounds(cameraRef, routeData);
      return;
    }

    const target = activeRider || destinationLocation;
    if (!target) return;
    cameraRef.current?.setCamera({
      centerCoordinate: [target.longitude, target.latitude],
      zoomLevel: 16,
      animationDuration: 600,
    });
  }, [activeRider, destinationLocation, fitMapBounds, isRouteVisible, routeData]);

  const handleOpenFullScreen = useCallback(() => {
    setIsFullScreen(true);
  }, []);

  const renderTrackingMap = (targetCameraRef) => (
    <MapLibreGL.MapView style={styles.map} styleURL={MAPLIBRE_STYLE_URL} logoEnabled={false} attributionEnabled={false}>
      {mapCenter && (
        <MapLibreGL.Camera
          ref={targetCameraRef}
          centerCoordinate={[mapCenter.longitude, mapCenter.latitude]}
          zoomLevel={14}
        />
      )}

      {isRouteVisible && routeData.length > 1 && (
        <MapLibreGL.ShapeSource
          id={targetCameraRef === fullCameraRef ? fullRouteSourceId : mainRouteSourceId}
          shape={routeFeature}
        >
          <MapLibreGL.LineLayer
            id={`routeLine-${targetCameraRef === fullCameraRef ? 'full' : 'main'}`}
            sourceID={targetCameraRef === fullCameraRef ? fullRouteSourceId : mainRouteSourceId}
            style={{
              lineColor: COLORS.primary,
              lineWidth: 4,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </MapLibreGL.ShapeSource>
      )}

      {riderCoordinate && (
        <MapLibreGL.PointAnnotation id={`mechanic-${targetCameraRef === fullCameraRef ? 'full' : 'main'}`} coordinate={riderCoordinate}>
          <View style={styles.markerWrap}>
            <View style={styles.markerLabel}>
              <Text style={styles.markerLabelText}>Mechanic</Text>
            </View>
            <View style={styles.mechanicMarker} />
          </View>
        </MapLibreGL.PointAnnotation>
      )}

      {destinationCoordinate && (
        <MapLibreGL.PointAnnotation id={`owner-${targetCameraRef === fullCameraRef ? 'full' : 'main'}`} coordinate={destinationCoordinate}>
          <View style={styles.markerWrap}>
            <View style={styles.markerLabel}>
              <Text style={styles.markerLabelText}>Vehicle Owner</Text>
            </View>
            <View style={styles.ownerMarker} />
          </View>
        </MapLibreGL.PointAnnotation>
      )}
    </MapLibreGL.MapView>
  );

  if (!mapCenter) {
    return (
      <View style={styles.skeletonContainer}>
        <Skeleton height={240} width="100%" style={styles.skeletonMap} />
        <Skeleton height={14} width="70%" />
      </View>
    );
  }

  if (!MapLibreGL) {
    return (
      <View style={styles.mapUnavailableCard}>
        <Text style={styles.mapUnavailableTitle}>Map Unavailable in Expo Go</Text>
        <Text style={styles.mapUnavailableText}>
          Use a development build (npx expo run:android) to load MapLibre native maps.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
        {renderTrackingMap(cameraRef)}

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
            disabled={directionDisabled}
          >
            {routeLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="navigate" size={18} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          {durationMinutes !== null && isRouteVisible ? (
            <Text style={styles.infoText}>Duration: {Math.round(durationMinutes)} min</Text>
          ) : null}
          {routeError ? <Text style={styles.infoErrorText}>{routeError}</Text> : null}
          {trackingError ? <Text style={styles.infoErrorText}>{trackingError}</Text> : null}
          <Text style={styles.infoText}>{statusText}</Text>
        </View>
      </View>

      <Modal
        visible={isFullScreen}
        transparent={false}
        animationType="slide"
        onShow={() => {
          if (isRouteVisible && routeData.length > 1) {
            fitMapBounds(fullCameraRef, routeData);
          }
        }}
        onRequestClose={() => setIsFullScreen(false)}
      >
        <View style={styles.fullScreenContainer}>
          {renderTrackingMap(fullCameraRef)}

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
              disabled={directionDisabled}
            >
              {routeLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="navigate" size={18} color="#FFFFFF" />
              )}
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
                      {(Number(step.distanceMeters || 0) / 1000).toFixed(2)} km - {Math.round(Number(step.durationSeconds || 0))}s - type {step.maneuverType ?? '-'}
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
                  {(Number(step.distanceMeters || 0) / 1000).toFixed(2)} km - {Math.round(Number(step.durationSeconds || 0))}s - type {step.maneuverType ?? '-'}
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
  mechanicMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: COLORS.success,
  },
  ownerMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: COLORS.accentWarm,
  },
  markerWrap: {
    alignItems: 'center',
    gap: 4,
  },
  markerLabel: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  markerLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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
  mapUnavailableCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 14,
    gap: 6,
  },
  mapUnavailableTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  mapUnavailableText: {
    fontSize: 12,
    color: COLORS.muted,
  },
});

export default MapScreen;
