import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import * as Location from "expo-location";

// Categories data
const CATEGORIES = [
  { id: "1", name: "Haircut", icon: "cut" },
  { id: "2", name: "Nail", icon: "hand-sparkles" },
  { id: "3", name: "Facial", icon: "face-smile" },
  { id: "4", name: "Spa", icon: "spa" },
  { id: "5", name: "Makeup", icon: "magic" },
];

// Filter options for salon types
const FILTER_OPTIONS = [
  { id: "all", name: "All", value: null },
  { id: "men", name: "Men", value: "Men" },
  { id: "women", name: "Women", value: "Women" },
  { id: "unisex", name: "Unisex", value: "Unisex" },
];

// Helper function to calculate distance between two lat/lng points (Haversine formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon))) /
      2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("John");
  const [allSalons, setAllSalons] = useState([]); // Store all salons
  const [nearbySalons, setNearbySalons] = useState([]); // Store filtered salons
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Location states
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Manual location selection states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState("");
  const [selectedCity, setSelectedCity] = useState(""); // Current city being used for API
  const [isManualLocation, setIsManualLocation] = useState(false);

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message:
              "This app needs access to your location to find nearby salons.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // For iOS/Expo
        let { status } = await Location.requestForegroundPermissionsAsync();
        return status === "granted";
      }
    } catch (err) {
      console.warn("Error requesting location permission:", err);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      // Check if location services are enabled
      const locationServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!locationServicesEnabled) {
        throw new Error(
          "Location services are disabled. Please enable them in settings."
        );
      }

      // Request permission
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw new Error("Location permission denied");
      }

      setLocationPermission("granted");

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
        maximumAge: 10000,
      });

      const locationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: currentLocation.timestamp,
      };

      setLocation(locationData);

      // Get address from coordinates (optional)
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });

        if (addressResponse.length > 0) {
          const address = addressResponse[0];
          locationData.address = {
            city: address.city,
            region: address.region,
            country: address.country,
            postalCode: address.postalCode,
            street: address.street,
          };
          setLocation(locationData);
        }
      } catch (addressError) {
        console.log("Could not get address:", addressError);
      }

      return locationData;
    } catch (err) {
      console.error("Error getting location:", err);
      setLocationError(err.message);
      setLocationPermission("denied");

      // Show user-friendly error message
      Alert.alert("Location Error", err.message, [
        {
          text: "Settings",
          onPress: () => {
            // You can open app settings here
            console.log("Open app settings");
          },
        },
        {
          text: "Retry",
          onPress: getCurrentLocation,
        },
        {
          text: "Skip",
          style: "cancel",
          onPress: () => {
            // Continue without location
            fetchSalonData();
          },
        },
      ]);
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle manual location selection
  const handleManualLocationSubmit = () => {
    if (manualLocationInput.trim()) {
      setSelectedCity(manualLocationInput.trim());
      setIsManualLocation(true);
      setShowLocationModal(false);

      // Here you would call your API with the manual city
      // For now, we'll just fetch with the existing logic
      fetchSalonData(location, manualLocationInput.trim());

      // Clear the input for next time
      setManualLocationInput("");
    }
  };

  // Handle location change/reset
  const handleLocationChange = () => {
    setShowLocationModal(true);
  };

  // Reset to current location
  const resetToCurrentLocation = async () => {
    setIsManualLocation(false);
    setSelectedCity("");
    setShowLocationModal(false);

    if (location) {
      // Use existing location
      fetchSalonData(location);
    } else {
      // Get fresh location
      const userLocation = await getCurrentLocation();
      fetchSalonData(userLocation);
    }
  };
  const applyFilter = (salonsData, filterType) => {
    if (!filterType || filterType === "all") {
      return salonsData;
    }

    return salonsData.filter((salon) => {
      // Check if salon has salonType field and matches the filter
      return (
        salon.salonType &&
        salon.salonType.toLowerCase() === filterType.toLowerCase()
      );
    });
  };

  // Handle filter selection
  const handleFilterSelect = (filterId) => {
    setSelectedFilter(filterId);
    setShowFilterDropdown(false);

    const filterOption = FILTER_OPTIONS.find(
      (option) => option.id === filterId
    );
    const filteredSalons = applyFilter(allSalons, filterOption.value);
    setNearbySalons(filteredSalons);
  };

  // Fetch salon data from API (updated to handle manual city selection)
  const fetchSalonData = async (userCoords, manualCity = null) => {
    setLoading(true);
    setError(null);

    try {
      // Use the provided API endpoint
      const response = await fetch(
        "http://43.204.228.20:5000/api/shops/getAllShops"
        // In future, when API is updated, you can send city like:
        // `http://43.204.228.20:5000/api/shops/getAllShops?city=${manualCity || detectedCity}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Assuming the API returns an array of shops in data.shops or data
      let salonsData = Array.isArray(data.shops)
        ? data.shops
        : Array.isArray(data)
        ? data
        : [];

      let userCity = "";

      // Determine the city to use
      if (manualCity) {
        userCity = manualCity;
        setSelectedCity(manualCity);
      } else if (userCoords && userCoords.latitude && userCoords.longitude) {
        try {
          const geo = await Location.reverseGeocodeAsync({
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
          });
          if (geo && geo[0]) {
            userCity = geo[0].city;
            if (!isManualLocation) {
              setSelectedCity(userCity);
            }
          }
        } catch (e) {
          console.log("Error getting city from geolocation", e);
        }

        salonsData = salonsData
          .map((salon) => {
            if (salon.latitude && salon.longitude) {
              const dist = getDistanceFromLatLonInKm(
                userCoords.latitude,
                userCoords.longitude,
                salon.latitude,
                salon.longitude
              );
              return { ...salon, distance: parseFloat(dist.toFixed(2)) };
            }
            return salon;
          })
          .filter((salon) => {
            if (salon.distance && salon.distance >= 7 && salon.distance <= 10) {
              return true;
            }
            if (
              userCity &&
              salon.city &&
              salon.city.trim().toLowerCase() === userCity.trim().toLowerCase()
            ) {
              return true;
            }
            return true;
          });
      }

      // Store all salons
      setAllSalons(salonsData);

      // Apply current filter to the salons
      const filterOption = FILTER_OPTIONS.find(
        (option) => option.id === selectedFilter
      );
      const filteredSalons = applyFilter(salonsData, filterOption.value);
      setNearbySalons(filteredSalons);

      // Check if no salons found for the current city
      if (filteredSalons.length === 0 && !manualCity && !isManualLocation) {
        // Show option to search in different city
        Alert.alert(
          "No Salons Found",
          `No salons found in ${
            userCity || "your area"
          }. Would you like to search in a different city?`,
          [
            {
              text: "Search Different City",
              onPress: () => setShowLocationModal(true),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      }
    } catch (err) {
      console.error("Error fetching salon data:", err);
      setError(err.message);
      Alert.alert(
        "Error",
        "Failed to load salon data. Please check your connection and try again.",
        [
          {
            text: "Retry",
            onPress: () => fetchSalonData(userCoords, manualCity),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Initialize location and data on component mount
  useEffect(() => {
    const initializeApp = async () => {
      // First, try to get location
      const userLocation = await getCurrentLocation();

      // Then fetch salon data with or without location
      await fetchSalonData(userLocation);
    };

    initializeApp();
  }, []);

  // Fetch user location and salons on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        fetchSalonData();
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      if (location && location.coords) {
        // Try to get full address using reverse geocoding
        try {
          const addressArr = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (addressArr && addressArr.length > 0) {
            const address = addressArr[0];
            console.log(
              `Full Address: ${address.name || ""} ${address.street || ""}, ${
                address.city || ""
              }, ${address.region || ""}, ${address.postalCode || ""}, ${
                address.country || ""
              }`
            );
            console.log("nearBySalons", nearbySalons);
          } else {
            console.log("Address not found for location:", location);
          }
        } catch (err) {
          console.log("Error getting address:", err);
        }
      } else {
        console.log("User location:", location);
      }
      fetchSalonData(location.coords);
    })();
  }, []);

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIconContainer}>
        <FontAwesome5 name={item.icon} size={18} color="#fff" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render nearby salon card - Updated with distance
  const renderNearbyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.nearbyCard}
      onPress={() =>
        navigation.navigate("SalonDetail", {
          salonId: item._id,
          salonName: item.shopName,
          salonData: item,
        })
      }
    >
      <Image
        source={{ uri: "https://via.placeholder.com/160x100?text=Salon" }}
        style={styles.nearbyImage}
      />
      <View style={styles.nearbyInfo}>
        <Text style={styles.nearbyName} numberOfLines={1}>
          {item.shopName}
        </Text>
        <View style={styles.nearbyLocationRow}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <Text style={styles.nearbyLocation} numberOfLines={1}>
            {item.city}, {item.state}
          </Text>
        </View>
        <Text style={styles.nearbyAddress} numberOfLines={1}>
          {item.address}
        </Text>
        <View style={styles.nearbyBottomRow}>
          <View style={styles.nearbyRating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.nearbyRatingText}>{item.rating || "4.5"}</Text>
          </View>
          <Text style={styles.nearbyDistance}>
            {item.distance ? `${item.distance} km` : "2.5 km"}
          </Text>
        </View>
        {/* Show salon type badge */}
        {item.salonType && (
          <View style={styles.salonTypeBadge}>
            <Text style={styles.salonTypeText}>{item.salonType}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render loading state for nearby salons
  const renderSalonLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#9370DB" />
      <Text style={styles.loadingText}>Loading salons...</Text>
    </View>
  );

  // Render error state for nearby salons
  const renderSalonError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load salons</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchSalonData(location)}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Render location status (updated to show manual location option)
  const renderLocationStatus = () => {
    if (locationLoading) {
      return (
        <View style={styles.locationStatus}>
          <ActivityIndicator size="small" color="#9370DB" />
          <Text style={styles.locationStatusText}>
            Getting your location...
          </Text>
        </View>
      );
    }

    if (locationError && !isManualLocation) {
      return (
        <View style={styles.locationStatus}>
          <TouchableOpacity
            style={styles.locationRetryButton}
            onPress={getCurrentLocation}
          >
            <Ionicons name="location-outline" size={16} color="#9370DB" />
            <Text style={styles.locationRetryText}>Enable Location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualLocationButton}
            onPress={() => setShowLocationModal(true)}
          >
            <Text style={styles.manualLocationText}>Or Search City</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (selectedCity) {
      return (
        <View style={styles.locationStatus}>
          <Ionicons
            name={isManualLocation ? "search" : "location"}
            size={16}
            color="#4CAF50"
          />
          <Text style={styles.locationStatusText}>
            {isManualLocation ? `Searching in: ${selectedCity}` : selectedCity}
          </Text>
          <TouchableOpacity
            style={styles.changeLocationButton}
            onPress={handleLocationChange}
          >
            <Text style={styles.changeLocationText}>Change</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const selectedFilterOption = FILTER_OPTIONS.find(
    (option) => option.id === selectedFilter
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>Hello {userName}!</Text>
          <Text style={styles.welcomeText}>Good Morning!</Text>
          {renderLocationStatus()}
        </View>

        <View style={styles.headerRight}>
          {/* Filter Button */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Ionicons name="filter" size={20} color="#9370DB" />
            <Text style={styles.filterButtonText}>
              {selectedFilterOption?.name}
            </Text>
            <Ionicons
              name={showFilterDropdown ? "chevron-up" : "chevron-down"}
              size={16}
              color="#9370DB"
            />
          </TouchableOpacity>

          {/* Notification Button */}
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Dropdown */}
      {showFilterDropdown && (
        <View style={styles.filterDropdown}>
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterOption,
                selectedFilter === option.id && styles.selectedFilterOption,
              ]}
              onPress={() => handleFilterSelect(option.id)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedFilter === option.id &&
                    styles.selectedFilterOptionText,
                ]}
              >
                {option.name}
              </Text>
              {selectedFilter === option.id && (
                <Ionicons name="checkmark" size={16} color="#9370DB" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Manual Location Selection Modal */}
      {showLocationModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.locationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowLocationModal(false);
                  setManualLocationInput("");
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Enter a city name to search for salons
            </Text>

            <View style={styles.locationInputContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.locationInput}
                placeholder="Enter city name (e.g., Mumbai, Delhi, Bangalore)"
                value={manualLocationInput}
                onChangeText={setManualLocationInput}
                autoCapitalize="words"
                autoCorrect={false}
                onSubmitEditing={handleManualLocationSubmit}
                returnKeyType="search"
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={() => {
                  setShowLocationModal(false);
                  setManualLocationInput("");
                }}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalPrimaryButton,
                  !manualLocationInput.trim() && styles.modalButtonDisabled,
                ]}
                onPress={handleManualLocationSubmit}
                disabled={!manualLocationInput.trim()}
              >
                <Text style={styles.modalPrimaryButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            {/* Option to use current location */}
            {!isManualLocation && location && (
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={resetToCurrentLocation}
              >
                <Ionicons name="location" size={16} color="#9370DB" />
                <Text style={styles.currentLocationText}>
                  Use Current Location
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate("Search")}
        >
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <Text style={styles.searchPlaceholder}>
            Search salons near you...
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchFilterButton}>
          <Ionicons name="options-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Main Content ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Categories Section */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Special Offers Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <View style={styles.offerCard}>
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>Haircut</Text>
              <Text style={styles.offerDiscount}>20% Off</Text>
              <Text style={styles.offerPeriod}>Till 30 - Jul - 21</Text>
              <TouchableOpacity style={styles.offerButton}>
                <Text style={styles.offerButtonText}>Get Offer Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Nearby Salons Section - Updated */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCity ? `Salons in ${selectedCity}` : "Salons"}
              {selectedFilter !== "all" && (
                <Text style={styles.filterIndicator}>
                  {" "}
                  ({selectedFilterOption?.name})
                </Text>
              )}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            renderSalonLoading()
          ) : error ? (
            renderSalonError()
          ) : nearbySalons.length > 0 ? (
            <FlatList
              data={nearbySalons}
              renderItem={renderNearbyCard}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.salonsList}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                {selectedFilter === "all"
                  ? `No salons available${
                      selectedCity ? ` in ${selectedCity}` : " nearby"
                    }`
                  : `No ${selectedFilterOption?.name} salons available${
                      selectedCity ? ` in ${selectedCity}` : " nearby"
                    }`}
              </Text>
              {!isManualLocation && (
                <TouchableOpacity
                  style={styles.searchCityButton}
                  onPress={() => setShowLocationModal(true)}
                >
                  <Text style={styles.searchCityButtonText}>
                    Search Different City
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() =>
                  fetchSalonData(
                    location,
                    isManualLocation ? selectedCity : null
                  )
                }
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
          <Ionicons name="home" size={22} color="#9370DB" />
          <Text style={styles.activeTabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="heart-outline" size={22} color="#999" />
          <Text
            style={styles.tabText}
            onPress={() => navigation.navigate("Favourite")}
          >
            Favorite
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbubble-outline" size={22} color="#999" />
          <Text style={styles.tabText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-outline" size={22} color="#999" />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 14,
    color: "#999",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  // Filter Button Styles
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#9370DB",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#9370DB",
    fontWeight: "500",
    marginHorizontal: 4,
  },
  // Filter Dropdown Styles
  filterDropdown: {
    position: "absolute",
    top: 90,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 120,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedFilterOption: {
    backgroundColor: "#F8F6FF",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedFilterOptionText: {
    color: "#9370DB",
    fontWeight: "600",
  },
  filterIndicator: {
    fontSize: 14,
    color: "#9370DB",
    fontWeight: "normal",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  // Location status styles
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationStatusText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 4,
  },
  locationRetryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
  locationRetryText: {
    fontSize: 12,
    color: "#9370DB",
    marginLeft: 4,
    fontWeight: "500",
  },
  manualLocationButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
  },
  manualLocationText: {
    fontSize: 12,
    color: "#9370DB",
    fontWeight: "500",
  },
  changeLocationButton: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  changeLocationText: {
    fontSize: 10,
    color: "#9370DB",
    fontWeight: "500",
  },
  // Modal Styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  locationModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputIcon: {
    marginRight: 10,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#333",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalSecondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  modalSecondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalPrimaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#9370DB",
    alignItems: "center",
  },
  modalButtonDisabled: {
    backgroundColor: "#CCC",
  },
  modalPrimaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingVertical: 8,
  },
  currentLocationText: {
    fontSize: 14,
    color: "#9370DB",
    fontWeight: "500",
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 15,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: "#999",
  },
  searchFilterButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    marginTop: 5,
    fontSize: 12,
    color: "#333",
  },
  sectionContainer: {
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  seeAllText: {
    fontSize: 14,
    color: "#9370DB",
    fontWeight: "500",
  },
  offerCard: {
    backgroundColor: "#9370DB",
    borderRadius: 15,
    flexDirection: "row",
    overflow: "hidden",
    height: 120,
  },
  offerContent: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 3,
  },
  offerDiscount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 3,
  },
  offerPeriod: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
    marginBottom: 8,
  },
  offerButton: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  offerButtonText: {
    color: "#9370DB",
    fontWeight: "bold",
    fontSize: 12,
  },
  salonsList: {
    paddingRight: 20,
  },
  // Updated Nearby Salon Card Styles
  nearbyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 15,
    width: 160,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  nearbyImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#f0f0f0",
  },
  nearbyInfo: {
    padding: 10,
  },
  nearbyName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    lineHeight: 18,
  },
  nearbyLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  nearbyLocation: {
    fontSize: 11,
    color: "#666",
    marginLeft: 3,
    flex: 1,
  },
  nearbyAddress: {
    fontSize: 10,
    color: "#999",
    marginBottom: 8,
    lineHeight: 14,
  },
  nearbyBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nearbyRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  nearbyRatingText: {
    fontSize: 11,
    color: "#333",
    marginLeft: 2,
    fontWeight: "500",
  },
  nearbyDistance: {
    fontSize: 10,
    color: "#9370DB",
    fontWeight: "500",
  },
  // Salon Type Badge Styles
  salonTypeBadge: {
    backgroundColor: "#9370DB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  salonTypeText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "600",
  },
  // Loading and error states
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#999",
  },
  errorContainer: {
    alignItems: "center",
    padding: 30,
  },
  errorText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#9370DB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  noDataContainer: {
    alignItems: "center",
    padding: 30,
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#9370DB",
    fontSize: 14,
    fontWeight: "600",
  },
  searchCityButton: {
    backgroundColor: "#9370DB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  searchCityButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomTabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: "center",
  },
  activeTab: {
    borderTopColor: "#9370DB",
  },
  tabText: {
    fontSize: 10,
    color: "#999",
    marginTop: 3,
  },
  activeTabText: {
    fontSize: 10,
    color: "#9370DB",
    marginTop: 3,
  },
});
