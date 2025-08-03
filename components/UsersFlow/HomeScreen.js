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

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();

  // Get user ID from navigation params
  const { userId } = route?.params || {};

  // User states
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  const [userName, setUserName] = useState("");
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

  // Updated location selection states
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isManualLocation, setIsManualLocation] = useState(false);

  // Fetch user data from API
  const fetchUserData = async (userIdParam) => {
    if (!userIdParam) {
      console.log("No user ID provided");
      return;
    }

    setUserLoading(true);
    setUserError(null);

    try {
      const response = await fetch(
        `http://43.204.228.20:5000/api/users/${userIdParam}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log("API Response:", apiResponse);

      // Extract user data from the nested structure
      const userData = apiResponse.user || apiResponse;
      console.log("User data extracted:", userData);

      setUser(userData);

      // Update user name if available
      if (userData.name || userData.firstName || userData.username) {
        setUserName(userData.name || userData.firstName || userData.username);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUserError(err.message);

      // Show user-friendly error message
      Alert.alert(
        "User Data Error",
        "Failed to load user profile. Some features may be limited.",
        [
          {
            text: "Retry",
            onPress: () => fetchUserData(userIdParam),
          },
          {
            text: "Continue",
            style: "cancel",
          },
        ]
      );
    } finally {
      setUserLoading(false);
    }
  };

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

      // Get address from coordinates
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

          // Set the selected location automatically if not manually set
          if (!isManualLocation && address.city) {
            const autoLocation = {
              id: "current",
              name: `${address.city}, ${address.region}`,
              description: `${address.street || ""} ${address.city || ""} ${
                address.region || ""
              } ${address.country || ""}`.trim(),
              coordinates: locationData,
            };
            setSelectedLocation(autoLocation);
          }
        }
      } catch (addressError) {
        console.log("Could not get address:", addressError);
      }

      setLocation(locationData);
      return locationData;
    } catch (err) {
      console.error("Error getting location:", err);
      setLocationError(err.message);
      setLocationPermission("denied");

      // Show user-friendly error message
      Alert.alert("Location Error", err.message, [
        {
          text: "Retry",
          onPress: getCurrentLocation,
        },
        {
          text: "Search Location",
          onPress: openLocationSelection,
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

  // Open location selection screen
  const openLocationSelection = () => {
    navigation.navigate("LocationSelection", {
      onLocationSelect: handleLocationSelect,
    });
  };

  // Handle location selection from the location screen
  const handleLocationSelect = (locationData) => {
    setSelectedLocation(locationData);
    setIsManualLocation(locationData.id !== "current");

    // If the selected location has coordinates, use them for distance calculation
    const locationCoords = locationData.coordinates || null;

    // Fetch salons with the new location
    fetchSalonData(locationCoords, locationData.name);
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

  // Fetch salon data from API (Updated version)
  const fetchSalonData = async (userCoords = null, cityName = null) => {
    setLoading(true);
    setError(null);

    try {
      // Construct API URL with city parameter if available
      let apiUrl = "http://43.204.228.20:5000/api/shops/getShops";
      const cityToSearch = cityName || selectedLocation?.name;

      // If you want to add city parameter to API (when backend supports it)
      if (cityToSearch) {
        apiUrl += `?city=${encodeURIComponent(cityToSearch)}`;
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Assuming the API returns an array of shops in data.shops or data
      let salonsData = Array.isArray(data.shops)
        ? data.shops
        : Array.isArray(data)
        ? data
        : [];

      console.log("Raw salons data:", salonsData.length);

      // If we have user coordinates, calculate distances and filter
      if (userCoords && userCoords.latitude && userCoords.longitude) {
        salonsData = salonsData.map((salon) => {
          if (salon.latitude && salon.longitude) {
            const dist = getDistanceFromLatLonInKm(
              userCoords.latitude,
              userCoords.longitude,
              parseFloat(salon.latitude),
              parseFloat(salon.longitude)
            );
            return { ...salon, distance: parseFloat(dist.toFixed(2)) };
          }
          return salon;
        });

        // Sort by distance if we have coordinates
        salonsData.sort((a, b) => {
          if (a.distance && b.distance) {
            return a.distance - b.distance;
          }
          return 0;
        });
      }

      // Filter by city if specified
      if (cityToSearch) {
        const cityFiltered = salonsData.filter((salon) => {
          if (salon.city) {
            return (
              salon.city.toLowerCase().includes(cityToSearch.toLowerCase()) ||
              cityToSearch.toLowerCase().includes(salon.city.toLowerCase())
            );
          }
          return true; // Keep salons without city info
        });

        if (cityFiltered.length > 0) {
          salonsData = cityFiltered;
        }
        // If no city matches found, keep all salons (maybe the city name doesn't match exactly)
      }

      console.log("Processed salons data:", salonsData.length);

      // Store all salons
      setAllSalons(salonsData);

      // Apply current filter to the salons
      const filterOption = FILTER_OPTIONS.find(
        (option) => option.id === selectedFilter
      );
      const filteredSalons = applyFilter(salonsData, filterOption.value);
      setNearbySalons(filteredSalons);

      // Check if no salons found
      if (filteredSalons.length === 0) {
        const alertMessage = cityToSearch
          ? `No salons found in ${cityToSearch}. Would you like to search in a different location?`
          : "No salons found in your area. Would you like to search in a specific location?";

        Alert.alert("No Salons Found", alertMessage, [
          {
            text: "Search Different Location",
            onPress: openLocationSelection,
          },
          {
            text: "Show All Salons",
            onPress: () => {
              setSelectedLocation(null);
              setIsManualLocation(false);
              fetchSalonData(userCoords, null); // Fetch without city filter
            },
          },
          {
            text: "OK",
            style: "cancel",
          },
        ]);
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
            onPress: () => fetchSalonData(userCoords, cityName),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Fetch user data if userId is provided
        if (userId) {
          await fetchUserData(userId);
        }

        // First, try to get location
        const userLocation = await getCurrentLocation();

        // Then fetch salon data with or without location
        await fetchSalonData(userLocation);
      } catch (error) {
        console.error("Error initializing app:", error);
        // If location fails completely, still try to fetch salon data
        await fetchSalonData();
      }
    };

    initializeApp();
  }, []); // Empty dependency array - only run once

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIconContainer}>
        <FontAwesome5 name={item.icon} size={18} color="#fff" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render nearby salon card
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
        source={{
          uri:
            item.images && item.images.length > 0
              ? item.images[0]
              : "https://via.placeholder.com/160x100?text=Salon",
        }}
        style={styles.nearbyImage}
        defaultSource={{
          uri: "https://via.placeholder.com/160x100?text=Salon",
        }}
      />
      <View style={styles.nearbyInfo}>
        <Text style={styles.nearbyName} numberOfLines={1}>
          {item.shopName || "Salon Name"}
        </Text>
        <View style={styles.nearbyLocationRow}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <Text style={styles.nearbyLocation} numberOfLines={1}>
            {item.city && item.state
              ? `${item.city}, ${item.state}`
              : item.city || item.state || "Location"}
          </Text>
        </View>
        <Text style={styles.nearbyAddress} numberOfLines={1}>
          {item.address || "Address not available"}
        </Text>
        <View style={styles.nearbyBottomRow}>
          <View style={styles.nearbyRating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.nearbyRatingText}>{item.rating || "4.5"}</Text>
          </View>
          <Text style={styles.nearbyDistance}>
            {item.distance ? `${item.distance} km` : "~2.5 km"}
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
      <Text style={styles.loadingText}>
        {selectedLocation
          ? `Loading salons in ${selectedLocation.name}...`
          : "Loading salons..."}
      </Text>
    </View>
  );

  // Render error state for nearby salons
  const renderSalonError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load salons</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() =>
          fetchSalonData(
            selectedLocation?.coordinates || location,
            selectedLocation?.name
          )
        }
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Render location status
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

    if (locationError && !selectedLocation) {
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
            onPress={openLocationSelection}
          >
            <Text style={styles.manualLocationText}>Or Search Location</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (selectedLocation) {
      return (
        <TouchableOpacity
          style={styles.locationStatus}
          onPress={openLocationSelection}
        >
          <Ionicons
            name={isManualLocation ? "search" : "location"}
            size={16}
            color="#4CAF50"
          />
          <Text style={styles.locationStatusText} numberOfLines={1}>
            {selectedLocation.name}
          </Text>
          <Ionicons name="pencil" size={12} color="#9370DB" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.locationStatus}
        onPress={openLocationSelection}
      >
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.locationStatusTextGray}>Select Location</Text>
      </TouchableOpacity>
    );
  };

  const selectedFilterOption = FILTER_OPTIONS.find(
    (option) => option.id === selectedFilter
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>
            Hello {userLoading ? "..." : userName}!
          </Text>
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

        {/* Nearby Salons Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedLocation
                ? `Salons in ${selectedLocation.name}`
                : "Salons"}
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
              keyExtractor={(item) => item._id || item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.salonsList}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                {selectedFilter === "all"
                  ? `No salons available${
                      selectedLocation
                        ? ` in ${selectedLocation.name}`
                        : " nearby"
                    }`
                  : `No ${selectedFilterOption?.name} salons available${
                      selectedLocation
                        ? ` in ${selectedLocation.name}`
                        : " nearby"
                    }`}
              </Text>
              <TouchableOpacity
                style={styles.searchCityButton}
                onPress={openLocationSelection}
              >
                <Text style={styles.searchCityButtonText}>
                  {selectedLocation
                    ? "Search Different Location"
                    : "Search Location"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() =>
                  fetchSalonData(
                    selectedLocation?.coordinates || location,
                    selectedLocation?.name
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
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Favourite")}
        >
          <Ionicons name="heart-outline" size={22} color="#999" />
          <Text style={styles.tabText}>Favorite</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbubble-outline" size={22} color="#999" />
          <Text style={styles.tabText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() =>
            navigation.navigate("Profile", {
              user: user,
              userId: userId,
            })
          }
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
  // Updated location status styles
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    maxWidth: 200,
  },
  locationStatusText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 4,
    marginRight: 4,
    flex: 1,
  },
  locationStatusTextGray: {
    fontSize: 12,
    color: "#666",
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
    marginTop: 10,
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
