import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import polyline from "@mapbox/polyline"; // Import polyline decoder

const GOOGLE_MAPS_APIKEY = "AIzaSyDqmJNPLK_QgOvlpCv7oeYhPa7QgMCKt8Q";

const MapScreen = () => {
  const [ location, setLocation ] = useState(null);
  const [ selectedLocation, setSelectedLocation ] = useState(null);
  const [ routeCoordinates, setRouteCoordinates ] = useState([]); // To store the decoded polyline
  const [ distance, setDistance ] = useState(null); // To store route distance
  const [ duration, setDuration ] = useState(null); // To store route duration

  // Get user location using expo-location
  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setLocation({ latitude, longitude });
    } catch (error) {
      console.error("Error requesting location permission", error);
    }
  };

  useEffect(() => {
    getUserLocation(); // Fetch location when component mounts
  }, []);

  // Handle map press
  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    fetchRoute({ latitude, longitude });
  };

  // Fetch route from Google Routes API
  const fetchRoute = async (destination) => {
    if (!location) {
      return;
    }

    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        },
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      polylineQuality: "HIGH_QUALITY",
      units: "METRIC",
    };

    try {
      const response = await axios.post(
        `https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_MAPS_APIKEY}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-FieldMask":
              "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
          },
        }
      );

      if (response.status === 200) {
        const route = response.data.routes[ 0 ];
        const encodedPolyline = route.polyline.encodedPolyline;
        const decodedCoordinates = polyline
          .decode(encodedPolyline)
          .map(([ lat, lng ]) => ({ latitude: lat, longitude: lng }));
        setRouteCoordinates(decodedCoordinates);

        // Set distance and duration
        setDistance(route.distanceMeters / 1000); // Convert to kilometers
        setDuration(Math.ceil(route.duration.replace("s", "") / 60)); // Convert to minutes
      }
    } catch (error) {
      if (error.response) {
        console.error("Error fetching route:", error.response.data);
      } else {
        console.error("Error with request:", error.message);
      }
    }
  };

  return (
    <View style={ styles.container }>
      { location ? (
        <MapView
          style={ styles.map }
          initialRegion={ {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          } }
          onPress={ handleMapPress }
        >
          {/* Marker for current location */ }
          <Marker coordinate={ location } title="Your Location" />

          {/* Marker for selected location */ }
          { selectedLocation && (
            <Marker coordinate={ selectedLocation } title="Selected Location" />
          ) }

          {/* Render polyline for the route */ }
          { routeCoordinates.length > 0 && (
            <Polyline
              coordinates={ routeCoordinates }
              strokeColor="#FF0000" // Route color
              strokeWidth={ 3 } // Thickness of the polyline
            />
          ) }
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      ) }

      {/* Display distance and duration */ }
      { distance && duration && (
        <View style={ styles.infoBox }>
          <Text>Distance: { distance.toFixed(2) } km</Text>
          <Text>Duration: { duration } minutes</Text>
        </View>
      ) }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "80%",
  },
  infoBox: {
    padding: 10,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});

export default MapScreen;
