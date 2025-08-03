import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Keyboard,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

// Mock autocomplete data
const MOCK_PLACES = [
  {
    id: "1",
    name: "Mumbai, Maharashtra",
    description: "Mumbai, Maharashtra, India",
    coordinates: { latitude: 19.076, longitude: 72.8777 },
  },
  {
    id: "2",
    name: "Delhi, India",
    description: "Delhi, India",
    coordinates: { latitude: 28.7041, longitude: 77.1025 },
  },
  {
    id: "3",
    name: "Bangalore, Karnataka",
    description: "Bangalore, Karnataka, India",
    coordinates: { latitude: 12.9716, longitude: 77.5946 },
  },
  {
    id: "4",
    name: "Pune, Maharashtra",
    description: "Pune, Maharashtra, India",
    coordinates: { latitude: 18.5204, longitude: 73.8567 },
  },
  {
    id: "5",
    name: "Hyderabad, Telangana",
    description: "Hyderabad, Telangana, India",
    coordinates: { latitude: 17.385, longitude: 78.4867 },
  },
  {
    id: "6",
    name: "Chennai, Tamil Nadu",
    description: "Chennai, Tamil Nadu, India",
    coordinates: { latitude: 13.0827, longitude: 80.2707 },
  },
  {
    id: "7",
    name: "Kolkata, West Bengal",
    description: "Kolkata, West Bengal, India",
    coordinates: { latitude: 22.5726, longitude: 88.3639 },
  },
  {
    id: "8",
    name: "Ahmedabad, Gujarat",
    description: "Ahmedabad, Gujarat, India",
    coordinates: { latitude: 23.0225, longitude: 72.5714 },
  },
];

// Web-compatible Map Component
const WebMap = ({ coordinates, onMapPress, markerPosition }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      loadGoogleMapsScript();
    }
  }, []);

  const loadGoogleMapsScript = () => {
    if (window.google) {
      initializeMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBT1sNC4CwP--_eODhf_CwC78LJT66t6kc&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: coordinates || { lat: 19.076, lng: 72.8777 },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    let marker = null;

    // Add marker if position exists
    if (markerPosition) {
      marker = new window.google.maps.Marker({
        position: {
          lat: markerPosition.latitude,
          lng: markerPosition.longitude,
        },
        map: map,
        draggable: true,
      });

      marker.addListener("dragend", (event) => {
        const newPosition = {
          latitude: event.latLng.lat(),
          longitude: event.latLng.lng(),
        };
        onMapPress && onMapPress({ nativeEvent: { coordinate: newPosition } });
      });
    }

    // Add click listener
    map.addListener("click", (event) => {
      const clickPosition = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng(),
      };

      // Remove existing marker
      if (marker) {
        marker.setMap(null);
      }

      // Add new marker
      marker = new window.google.maps.Marker({
        position: { lat: clickPosition.latitude, lng: clickPosition.longitude },
        map: map,
        draggable: true,
      });

      marker.addListener("dragend", (dragEvent) => {
        const newPosition = {
          latitude: dragEvent.latLng.lat(),
          longitude: dragEvent.latLng.lng(),
        };
        onMapPress && onMapPress({ nativeEvent: { coordinate: newPosition } });
      });

      onMapPress && onMapPress({ nativeEvent: { coordinate: clickPosition } });
    });

    // Update map center when coordinates change
    if (coordinates) {
      map.setCenter({ lat: coordinates.latitude, lng: coordinates.longitude });
    }
  };

  if (Platform.OS === "web") {
    return (
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f0f0f0",
          borderRadius: 12,
        }}
      />
    );
  }

  // Fallback for non-web platforms
  return (
    <View style={styles.mapFallback}>
      <Ionicons name="map" size={64} color="#9370DB" />
      <Text style={styles.mapFallbackText}>Map View</Text>
      <Text style={styles.mapFallbackDescription}>
        Interactive map functionality is available on mobile devices
      </Text>
      {markerPosition && (
        <View style={styles.coordinatesDisplay}>
          <Text style={styles.coordinatesText}>
            Selected: {markerPosition.latitude.toFixed(6)},{" "}
            {markerPosition.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

const LocationSelectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { onLocationSelect } = route.params || {};

  // Search and location states
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Map states
  const [mapRegion, setMapRegion] = useState({
    latitude: 19.076,
    longitude: 72.8777,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerPosition, setMarkerPosition] = useState(null);

  // Current location states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // UI states
  const [mapHeight] = useState(new Animated.Value(height * 0.5));
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        () => {
          setIsKeyboardVisible(true);
          Animated.timing(mapHeight, {
            toValue: height * 0.3,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      );

      const keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        () => {
          setIsKeyboardVisible(false);
          Animated.timing(mapHeight, {
            toValue: height * 0.5,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      );

      return () => {
        keyboardDidShowListener?.remove();
        keyboardDidHideListener?.remove();
      };
    }
  }, []);

  // Search functionality
  const handleSearch = (text) => {
    setSearchQuery(text);

    if (text.length > 1) {
      const filtered = MOCK_PLACES.filter(
        (place) =>
          place.name.toLowerCase().includes(text.toLowerCase()) ||
          place.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPlaces(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredPlaces([]);
      setShowSuggestions(false);
    }
  };

  // Handle place selection from dropdown
  const handlePlaceSelect = (place) => {
    setSearchQuery(place.name);
    setSelectedLocation(place);
    setShowSuggestions(false);
    setMarkerPosition(place.coordinates);

    const newRegion = {
      ...place.coordinates,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setMapRegion(newRegion);

    if (Platform.OS !== "web") {
      Keyboard.dismiss();
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission denied");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      try {
        const addressResponse = await Location.reverseGeocodeAsync(coords);
        if (addressResponse.length > 0) {
          const address = addressResponse[0];
          const locationName = `${
            address.city || address.district || address.subregion
          }, ${address.region || address.country}`;

          setSearchQuery(locationName);
          setSelectedLocation({
            id: "current",
            name: locationName,
            description: `${address.street || ""} ${address.city || ""} ${
              address.region || ""
            } ${address.country || ""}`.trim(),
            coordinates: coords,
          });
        }
      } catch (addressError) {
        console.log("Could not get address:", addressError);
        setSearchQuery("Current Location");
        setSelectedLocation({
          id: "current",
          name: "Current Location",
          description: `${coords.latitude.toFixed(
            6
          )}, ${coords.longitude.toFixed(6)}`,
          coordinates: coords,
        });
      }

      setCurrentLocation(coords);
      setMarkerPosition(coords);

      const newRegion = {
        ...coords,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(newRegion);
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError(error.message);
      Alert.alert(
        "Location Error",
        "Could not get your current location. Please try again or search manually.",
        [{ text: "OK" }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle map press to drop pin
  const handleMapPress = async (event) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarkerPosition(coordinate);

    try {
      if (Platform.OS !== "web" && Location.reverseGeocodeAsync) {
        const addressResponse = await Location.reverseGeocodeAsync(coordinate);
        if (addressResponse.length > 0) {
          const address = addressResponse[0];
          const locationName = `${
            address.city || address.district || address.subregion
          }, ${address.region || address.country}`;

          setSearchQuery(locationName);
          setSelectedLocation({
            id: "custom",
            name: locationName,
            description: `${address.street || ""} ${address.city || ""} ${
              address.region || ""
            } ${address.country || ""}`.trim(),
            coordinates: coordinate,
          });
        } else {
          setSearchQuery("Selected Location");
          setSelectedLocation({
            id: "custom",
            name: "Selected Location",
            description: `${coordinate.latitude.toFixed(
              6
            )}, ${coordinate.longitude.toFixed(6)}`,
            coordinates: coordinate,
          });
        }
      } else {
        setSearchQuery("Selected Location");
        setSelectedLocation({
          id: "custom",
          name: "Selected Location",
          description: `${coordinate.latitude.toFixed(
            6
          )}, ${coordinate.longitude.toFixed(6)}`,
          coordinates: coordinate,
        });
      }
    } catch (error) {
      console.log("Could not get address for selected location:", error);
      setSearchQuery("Selected Location");
      setSelectedLocation({
        id: "custom",
        name: "Selected Location",
        description: `${coordinate.latitude.toFixed(
          6
        )}, ${coordinate.longitude.toFixed(6)}`,
        coordinates: coordinate,
      });
    }
  };

  // Handle location confirmation
  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert("No Location Selected", "Please select a location first.");
      return;
    }

    if (onLocationSelect) {
      onLocationSelect(selectedLocation);
    }

    navigation.goBack();
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredPlaces([]);
    setShowSuggestions(false);
    setSelectedLocation(null);
    setMarkerPosition(null);
  };

  // Render suggestion item
  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handlePlaceSelect(item)}
    >
      <Ionicons name="location-outline" size={20} color="#666" />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName}>{item.name}</Text>
        <Text style={styles.suggestionDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search for a city or area"
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setShowSuggestions(filteredPlaces.length > 0)}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Location Actions */}
        <View style={styles.locationActions}>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="location" size={16} color="#fff" />
            )}
            <Text style={styles.currentLocationText}>
              {locationLoading ? "Getting..." : "Current Location"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredPlaces.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredPlaces}
            renderItem={renderSuggestionItem}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Map Container */}
      <Animated.View
        style={[
          styles.mapContainer,
          Platform.OS === "web"
            ? { height: height * 0.5 }
            : { height: mapHeight },
        ]}
      >
        <WebMap
          coordinates={mapRegion}
          onMapPress={handleMapPress}
          markerPosition={markerPosition}
        />

        {/* Pin Instructions */}
        {!isKeyboardVisible && (
          <View style={styles.pinInstructions}>
            <Text style={styles.pinInstructionsText}>
              {Platform.OS === "web"
                ? "Click on the map to drop a pin"
                : "Tap on the map to drop a pin"}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Selected Location Info */}
      {selectedLocation && !isKeyboardVisible && (
        <View style={styles.selectedLocationContainer}>
          <View style={styles.selectedLocationInfo}>
            <Ionicons name="location" size={20} color="#9370DB" />
            <View style={styles.selectedLocationText}>
              <Text style={styles.selectedLocationName}>
                {selectedLocation.name}
              </Text>
              <Text style={styles.selectedLocationDescription}>
                {selectedLocation.description}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedLocation && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmLocation}
          disabled={!selectedLocation}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    width: 34,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  locationActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9370DB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  currentLocationText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    maxHeight: 200,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f8f8",
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 15,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  suggestionDescription: {
    fontSize: 14,
    color: "#666",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    margin: 10,
  },
  mapFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 20,
  },
  mapFallbackText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  mapFallbackDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  coordinatesDisplay: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  coordinatesText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  pinInstructions: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  pinInstructionsText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  selectedLocationContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  selectedLocationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  selectedLocationText: {
    flex: 1,
    marginLeft: 12,
  },
  selectedLocationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  selectedLocationDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#9370DB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonDisabled: {
    backgroundColor: "#ccc",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LocationSelectionScreen;
