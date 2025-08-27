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
import {
  scale,
  verticalScale,
  moderateScale,
  responsiveFontSize,
  wp,
  hp,
  spacing,
  borderRadius,
  deviceType,
} from "../../responsive";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../../utils/authStorage";

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

const font = (size) => {
  if (Platform.OS === "android") {
    return responsiveFontSize(size * 0.92);
  }
  return responsiveFontSize(size);
};

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();

  // Get user ID from navigation params
  // const { userId } = route?.params || {};

  const [userId, setUserId] = useState(null);

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
        `https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/users/${userIdParam}`
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

  console.log("User", user);

  // Fetch salon data from API (Updated version)
  const fetchSalonData = async (userCoords = null, cityName = null) => {
    setLoading(true);
    setError(null);

    try {
      // Construct API URL with id parameter if available
      let apiUrl =
        "https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/shops/getShops";
      const cityToSearch = cityName || selectedLocation?.name;

      // If you want to add id parameter to API (when backend supports it)
      if (userId) {
        apiUrl += `?id=${userId}`;
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
        const token = await getToken();
        if (token) {
          const decoded = jwtDecode(token);
          console.log("Decoded token HOme:", decoded);
          const extractedShopId = decoded.userId;
          setUserId(extractedShopId);
          console.log("Extracted Shop ID:", extractedShopId);
          await fetchUserData(extractedShopId);
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
      onPress={() => {
        navigation.navigate("SalonDetail", {
          salonId: item._id,
          salonName: item.shopName,
          salonData: item,
          userId: userId,
        });
      }}
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
        {/* <View style={styles.sectionContainer}>
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
        </View> */}

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
    paddingHorizontal: wp(5),
    paddingTop:
      Platform.OS === "android" ? verticalScale(15) : verticalScale(10),
    paddingBottom: verticalScale(10),
  },
  headerLeft: {
    flex: 1,
    maxWidth: wp(65),
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingText: {
    fontSize: font(14),
    color: "#999",
    lineHeight: font(18),
  },
  welcomeText: {
    fontSize: font(20),
    fontWeight: "bold",
    color: "#000",
    lineHeight: font(24),
    marginTop: verticalScale(2),
  },

  // Filter Button Styles
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    borderRadius: borderRadius.lg,
    marginRight: scale(10),
    borderWidth: 1,
    borderColor: "#9370DB",
    minHeight: verticalScale(36),
  },
  filterButtonText: {
    fontSize: font(12),
    color: "#9370DB",
    fontWeight: "500",
    marginHorizontal: scale(4),
  },

  // Filter Dropdown Styles
  filterDropdown: {
    position: "absolute",
    top: Platform.OS === "android" ? verticalScale(95) : verticalScale(90),
    right: wp(5),
    backgroundColor: "#fff",
    borderRadius: borderRadius.lg,
    paddingVertical: verticalScale(8),
    minWidth: scale(120),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8, // Increased for Android
    zIndex: 1000,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    minHeight: verticalScale(44),
  },
  selectedFilterOption: {
    backgroundColor: "#F8F6FF",
  },
  filterOptionText: {
    fontSize: font(14),
    color: "#333",
    lineHeight: font(18),
  },
  selectedFilterOptionText: {
    color: "#9370DB",
    fontWeight: "600",
  },
  filterIndicator: {
    fontSize: font(14),
    color: "#9370DB",
    fontWeight: "normal",
  },
  notificationButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },

  // Location status styles
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(4),
    maxWidth: wp(55),
    minHeight: verticalScale(20),
  },
  locationStatusText: {
    fontSize: font(12),
    color: "#4CAF50",
    marginLeft: scale(4),
    marginRight: scale(4),
    flex: 1,
    lineHeight: font(16),
  },
  locationStatusTextGray: {
    fontSize: font(12),
    color: "#666",
    marginLeft: scale(4),
    lineHeight: font(16),
  },
  locationRetryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    backgroundColor: "#f0f0f0",
    borderRadius: borderRadius.lg,
    minHeight: verticalScale(28),
  },
  locationRetryText: {
    fontSize: font(12),
    color: "#9370DB",
    marginLeft: scale(4),
    fontWeight: "500",
    lineHeight: font(16),
  },
  manualLocationButton: {
    marginLeft: scale(8),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    backgroundColor: "#f8f8f8",
    borderRadius: borderRadius.lg,
    minHeight: verticalScale(28),
  },
  manualLocationText: {
    fontSize: font(12),
    color: "#9370DB",
    fontWeight: "500",
    lineHeight: font(16),
  },

  // Search container
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: wp(5),
    marginTop: verticalScale(15),
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: borderRadius.md,
    paddingHorizontal: scale(10),
    height: verticalScale(40),
    minHeight: verticalScale(40),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: font(14),
    color: "#999",
    lineHeight: font(18),
  },
  searchFilterButton: {
    width: scale(40),
    height: verticalScale(40),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: borderRadius.md,
    marginLeft: scale(10),
  },

  // ScrollView
  scrollView: {
    flex: 1,
    paddingHorizontal: wp(5),
  },

  // Categories
  categoriesContainer: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
  },
  categoryItem: {
    alignItems: "center",
    marginRight: scale(20),
  },
  categoryIconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    marginTop: verticalScale(5),
    fontSize: font(12),
    color: "#333",
    textAlign: "center",
    lineHeight: font(16),
  },

  // Sections
  sectionContainer: {
    marginTop: verticalScale(25),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(15),
    minHeight: verticalScale(24),
  },
  sectionTitle: {
    fontSize: font(18),
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    lineHeight: font(22),
  },
  seeAllText: {
    fontSize: font(14),
    color: "#9370DB",
    fontWeight: "500",
    lineHeight: font(18),
  },

  // Offer card
  offerCard: {
    backgroundColor: "#9370DB",
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    overflow: "hidden",
    height: verticalScale(120),
    minHeight: verticalScale(100),
  },
  offerContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "center",
  },
  offerTitle: {
    fontSize: font(16),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: verticalScale(3),
    lineHeight: font(20),
  },
  offerDiscount: {
    fontSize: font(22),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: verticalScale(3),
    lineHeight: font(26),
  },
  offerPeriod: {
    fontSize: font(12),
    color: "#fff",
    opacity: 0.8,
    marginBottom: verticalScale(8),
    lineHeight: font(16),
  },
  offerButton: {
    backgroundColor: "#fff",
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
    borderRadius: borderRadius.lg,
    alignSelf: "flex-start",
    minHeight: verticalScale(28),
    justifyContent: "center",
  },
  offerButtonText: {
    color: "#9370DB",
    fontWeight: "bold",
    fontSize: font(12),
    lineHeight: font(16),
  },

  // Salon list
  salonsList: {
    paddingRight: scale(20),
  },

  // Nearby Salon Card Styles
  nearbyCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.lg,
    marginRight: scale(15),
    width: scale(160),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  nearbyImage: {
    width: "100%",
    height: verticalScale(100),
    backgroundColor: "#f0f0f0",
  },
  nearbyInfo: {
    padding: spacing.sm,
  },
  nearbyName: {
    fontSize: font(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: verticalScale(4),
    lineHeight: font(18),
  },
  nearbyLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(4),
    minHeight: verticalScale(16),
  },
  nearbyLocation: {
    fontSize: font(11),
    color: "#666",
    marginLeft: scale(3),
    flex: 1,
    lineHeight: font(15),
  },
  nearbyAddress: {
    fontSize: font(10),
    color: "#999",
    marginBottom: verticalScale(8),
    lineHeight: font(14),
  },
  nearbyBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: verticalScale(20),
  },
  nearbyRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: borderRadius.sm,
    minHeight: verticalScale(20),
  },
  nearbyRatingText: {
    fontSize: font(11),
    color: "#333",
    marginLeft: scale(2),
    fontWeight: "500",
    lineHeight: font(15),
  },
  nearbyDistance: {
    fontSize: font(10),
    color: "#9370DB",
    fontWeight: "500",
    lineHeight: font(14),
  },

  // Salon Type Badge
  salonTypeBadge: {
    backgroundColor: "#9370DB",
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: borderRadius.sm,
    alignSelf: "flex-start",
    marginTop: verticalScale(6),
    minHeight: verticalScale(16),
    justifyContent: "center",
  },
  salonTypeText: {
    fontSize: font(9),
    color: "#fff",
    fontWeight: "600",
    lineHeight: font(12),
  },

  // Loading and error states
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    minHeight: verticalScale(60),
  },
  loadingText: {
    marginLeft: scale(10),
    fontSize: font(14),
    color: "#999",
    lineHeight: font(18),
  },
  errorContainer: {
    alignItems: "center",
    padding: spacing.lg,
    minHeight: verticalScale(80),
  },
  errorText: {
    fontSize: font(14),
    color: "#666",
    marginBottom: verticalScale(15),
    textAlign: "center",
    lineHeight: font(20),
  },
  retryButton: {
    backgroundColor: "#9370DB",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: borderRadius.sm,
    minHeight: verticalScale(40),
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: font(14),
    fontWeight: "600",
    lineHeight: font(18),
  },
  noDataContainer: {
    alignItems: "center",
    padding: spacing.lg,
    minHeight: verticalScale(120),
  },
  noDataText: {
    fontSize: font(14),
    color: "#666",
    marginBottom: verticalScale(15),
    textAlign: "center",
    lineHeight: font(20),
  },
  refreshButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: borderRadius.sm,
    marginTop: verticalScale(10),
    minHeight: verticalScale(40),
    justifyContent: "center",
  },
  refreshButtonText: {
    color: "#9370DB",
    fontSize: font(14),
    fontWeight: "600",
    lineHeight: font(18),
  },
  searchCityButton: {
    backgroundColor: "#9370DB",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: borderRadius.sm,
    marginBottom: verticalScale(10),
    minHeight: verticalScale(40),
    justifyContent: "center",
  },
  searchCityButtonText: {
    color: "#fff",
    fontSize: font(14),
    fontWeight: "600",
    lineHeight: font(18),
  },

  // Bottom Tab Bar
  bottomTabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    paddingVertical: verticalScale(10),
    paddingBottom:
      Platform.OS === "android" ? verticalScale(10) : verticalScale(15),
    minHeight: verticalScale(60),
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  activeTab: {
    borderTopColor: "#9370DB",
  },
  tabText: {
    fontSize: font(10),
    color: "#999",
    marginTop: verticalScale(3),
    lineHeight: font(12),
  },
  activeTabText: {
    fontSize: font(10),
    color: "#9370DB",
    marginTop: verticalScale(3),
    lineHeight: font(12),
  },
});
