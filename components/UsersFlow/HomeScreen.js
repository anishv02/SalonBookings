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
  getCardWidth,
  getButtonHeight,
  getHeaderHeight,
  safeArea,
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

// Enhanced font helper with device-specific optimizations
const font = (size) => {
  let adjustedSize = responsiveFontSize(size);

  // Fine-tune for specific device types
  if (deviceType.isSmallDevice && size > 16) {
    adjustedSize = adjustedSize * 0.95; // Slightly smaller for large text on small screens
  }

  if (deviceType.isTablet && size < 12) {
    adjustedSize = adjustedSize * 1.1; // Boost small text on tablets
  }

  return adjustedSize;
};

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);

  // User states
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  const [userName, setUserName] = useState("");
  const [allSalons, setAllSalons] = useState([]);
  const [nearbySalons, setNearbySalons] = useState([]);
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

      const userData = apiResponse.user || apiResponse;
      console.log("User data extracted:", userData);

      setUser(userData);

      if (userData.name || userData.firstName || userData.username) {
        setUserName(userData.name || userData.firstName || userData.username);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUserError(err.message);

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
      const locationServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!locationServicesEnabled) {
        throw new Error(
          "Location services are disabled. Please enable them in settings."
        );
      }

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw new Error("Location permission denied");
      }

      setLocationPermission("granted");

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
      console.log("locationData", locationData);
      return locationData;
    } catch (err) {
      console.error("Error getting location:", err);
      setLocationError(err.message);
      setLocationPermission("denied");

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
    const locationCoords = locationData.coordinates || null;
    fetchSalonData(locationCoords, locationData.name);
  };

  const applyFilter = (salonsData, filterType) => {
    if (!filterType || filterType === "all") {
      return salonsData;
    }

    return salonsData.filter((salon) => {
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

  // Fetch salon data from API
  const fetchSalonData = async (userCoords = null, cityName = null) => {
    setLoading(true);
    setError(null);

    try {
      let apiUrl =
        "https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/shops/getShops";

      if (userId) {
        apiUrl += `?id=${userId}`;
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      let salonsData = Array.isArray(data.shops)
        ? data.shops
        : Array.isArray(data)
        ? data
        : [];

      console.log("Raw salons data:", salonsData.length);

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

        salonsData.sort((a, b) => {
          if (a.distance && b.distance) {
            return a.distance - b.distance;
          }
          return 0;
        });
      }

      let cityToFilter = null;

      if (cityName) {
        cityToFilter = cityName;
      } else if (selectedLocation && selectedLocation.name) {
        cityToFilter = selectedLocation.name.split(",")[0].trim();
      } else if (location && location.address && location.address.city) {
        cityToFilter = location.address.city;
      }

      console.log("City to filter by:", cityToFilter);

      setAllSalons(salonsData);

      let cityFilteredSalons = salonsData;
      if (cityToFilter) {
        cityFilteredSalons = salonsData.filter((salon) => {
          if (salon.city) {
            const salonCity = salon.city.toLowerCase().trim();
            const searchCity = cityToFilter.toLowerCase().trim();

            return (
              salonCity.includes(searchCity) ||
              searchCity.includes(salonCity) ||
              salonCity === searchCity
            );
          }
          return false;
        });

        console.log(`Salons in ${cityToFilter}:`, cityFilteredSalons.length);

        if (cityFilteredSalons.length === 0) {
          setNearbySalons([]);

          Alert.alert(
            "No Salons Found",
            `No salons currently available in ${cityToFilter}. Try changing your location to see available salons.`,
            [
              {
                text: "Change Location",
                onPress: openLocationSelection,
              },
              {
                text: "Show All Salons",
                onPress: () => {
                  setSelectedLocation(null);
                  setIsManualLocation(false);
                  const filterOption = FILTER_OPTIONS.find(
                    (option) => option.id === selectedFilter
                  );
                  const filteredSalons = applyFilter(
                    salonsData,
                    filterOption.value
                  );
                  setNearbySalons(filteredSalons);
                },
              },
              {
                text: "OK",
                style: "cancel",
              },
            ]
          );
          return;
        }
      }

      const filterOption = FILTER_OPTIONS.find(
        (option) => option.id === selectedFilter
      );
      const finalFilteredSalons = applyFilter(
        cityFilteredSalons,
        filterOption.value
      );
      setNearbySalons(finalFilteredSalons);

      console.log("Final filtered salons:", finalFilteredSalons.length);
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

        const userLocation = await getCurrentLocation();
        await fetchSalonData(userLocation);
      } catch (error) {
        console.error("Error initializing app:", error);
        await fetchSalonData();
      }
    };

    initializeApp();
  }, []);

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIconContainer}>
        <FontAwesome5 name={item.icon} size={scale(18)} color="#fff" />
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
          user: user,
        });
      }}
    >
      <Image
        source={{
          uri:
            item.images && item.images.length > 0
              ? item.images[0]
              : "https://via.placeholder.com/120x80?text=Salon",
        }}
        style={styles.nearbyImage}
        defaultSource={{
          uri: "https://via.placeholder.com/120x80?text=Salon",
        }}
      />
      <View style={styles.nearbyInfo}>
        <Text style={styles.nearbyName} numberOfLines={1}>
          {item.shopName || "Salon Name"}
        </Text>
        <View style={styles.nearbyLocationRow}>
          <Ionicons name="location-outline" size={scale(12)} color="#666" />
          <Text style={styles.nearbyLocation} numberOfLines={1}>
            {item.city && item.state
              ? `${item.city}, ${item.state}`
              : item.city || item.state || "Location"}
          </Text>
        </View>
        <Text style={styles.nearbyAddress} numberOfLines={2}>
          {item.address || "Address not available"}
        </Text>
        <View style={styles.nearbyBottomRow}>
          <View style={styles.nearbyRating}>
            <Ionicons name="star" size={scale(12)} color="#FFD700" />
            <Text style={styles.nearbyRatingText}>{item.rating || "4.5"}</Text>
          </View>
          <Text style={styles.nearbyDistance}>
            {item.distance ? `${item.distance} km` : "~2.5 km"}
          </Text>
        </View>
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
            <Ionicons
              name="location-outline"
              size={scale(16)}
              color="#9370DB"
            />
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
            size={scale(16)}
            color="#4CAF50"
          />
          <Text style={styles.locationStatusText} numberOfLines={1}>
            {selectedLocation.name}
          </Text>
          <Ionicons name="pencil" size={scale(12)} color="#9370DB" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.locationStatus}
        onPress={openLocationSelection}
      >
        <Ionicons name="location-outline" size={scale(16)} color="#666" />
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
            <Ionicons name="filter" size={scale(20)} color="#9370DB" />
            <Text style={styles.filterButtonText}>
              {selectedFilterOption?.name}
            </Text>
            <Ionicons
              name={showFilterDropdown ? "chevron-up" : "chevron-down"}
              size={scale(16)}
              color="#9370DB"
            />
          </TouchableOpacity>

          {/* Notification Button */}
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={scale(24)}
              color="black"
            />
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
                <Ionicons name="checkmark" size={scale(16)} color="#9370DB" />
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
            size={scale(20)}
            color="#999"
            style={styles.searchIcon}
          />
          <Text style={styles.searchPlaceholder}>
            Search salons near you...
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchFilterButton}>
          <Ionicons name="options-outline" size={scale(20)} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Main Content ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Categories Section */}
        {/* <View style={styles.categoriesContainer}>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
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
              numColumns={deviceType.isTablet ? 3 : 2}
              key={deviceType.isTablet ? "tablet" : "phone"} // Force re-render on device type change
              columnWrapperStyle={
                deviceType.isTablet ? styles.salonRowTablet : styles.salonRow
              }
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
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
          <Ionicons name="home" size={scale(22)} color="#9370DB" />
          <Text style={styles.activeTabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Favourite")}
        >
          <Ionicons name="heart-outline" size={scale(22)} color="#999" />
          <Text style={styles.tabText}>Favorite</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbubble-outline" size={scale(22)} color="#999" />
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
          <Ionicons name="person-outline" size={scale(22)} color="#999" />
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
    paddingHorizontal: spacing.headerPadding,
    paddingTop:
      Platform.OS === "android"
        ? verticalScale(15) + safeArea.top
        : verticalScale(10) + safeArea.top,
    paddingBottom: verticalScale(15),
    minHeight: getHeaderHeight(),
  },
  headerLeft: {
    flex: 1,
    maxWidth: wp(deviceType.isTablet ? 75 : 65),
    justifyContent: "flex-start",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: wp(deviceType.isTablet ? 20 : 30),
  },
  greetingText: {
    fontSize: font(deviceType.isSmallDevice ? 13 : 14),
    color: "#999",
    lineHeight: font(deviceType.isSmallDevice ? 16 : 18),
  },
  welcomeText: {
    fontSize: font(
      deviceType.isSmallDevice ? 18 : deviceType.isTablet ? 24 : 20
    ),
    fontWeight: "bold",
    color: "#000",
    lineHeight: font(
      deviceType.isSmallDevice ? 22 : deviceType.isTablet ? 28 : 24
    ),
    marginTop: verticalScale(2),
  },

  // Enhanced Filter Button Styles
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingVertical: verticalScale(deviceType.isSmallDevice ? 6 : 8),
    paddingHorizontal: scale(deviceType.isSmallDevice ? 8 : 12),
    borderRadius: borderRadius.button,
    marginRight: scale(deviceType.isSmallDevice ? 6 : 10),
    borderWidth: 1,
    borderColor: "#9370DB",
    minHeight: getButtonHeight() * 0.8,
    maxWidth: wp(25),
  },
  filterButtonText: {
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#9370DB",
    fontWeight: "500",
    marginHorizontal: scale(4),
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },

  // Enhanced Filter Dropdown Styles
  filterDropdown: {
    position: "absolute",
    top: getHeaderHeight() + verticalScale(10),
    right: spacing.headerPadding,
    backgroundColor: "#fff",
    borderRadius: borderRadius.lg,
    paddingVertical: verticalScale(8),
    minWidth: scale(120),
    maxWidth: wp(40),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8,
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
    flex: 1,
  },
  selectedFilterOptionText: {
    color: "#9370DB",
    fontWeight: "600",
  },
  filterIndicator: {
    fontSize: font(deviceType.isSmallDevice ? 12 : 14),
    color: "#9370DB",
    fontWeight: "normal",
  },
  notificationButton: {
    width: scale(deviceType.isSmallDevice ? 36 : 40),
    height: scale(deviceType.isSmallDevice ? 36 : 40),
    borderRadius: scale(deviceType.isSmallDevice ? 18 : 20),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },

  // Enhanced Location status styles
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(6),
    maxWidth: wp(deviceType.isTablet ? 60 : 55),
    minHeight: verticalScale(20),
    flexWrap: deviceType.isSmallDevice ? "wrap" : "nowrap",
  },
  locationStatusText: {
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#4CAF50",
    marginLeft: scale(4),
    marginRight: scale(4),
    flex: 1,
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },
  locationStatusTextGray: {
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#666",
    marginLeft: scale(4),
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },
  locationRetryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    backgroundColor: "#f0f0f0",
    borderRadius: borderRadius.button,
    minHeight: verticalScale(28),
    marginBottom: deviceType.isSmallDevice ? verticalScale(4) : 0,
  },
  locationRetryText: {
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#9370DB",
    marginLeft: scale(4),
    fontWeight: "500",
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },
  manualLocationButton: {
    marginLeft: deviceType.isSmallDevice ? 0 : scale(8),
    marginTop: deviceType.isSmallDevice ? verticalScale(4) : 0,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    backgroundColor: "#f8f8f8",
    borderRadius: borderRadius.button,
    minHeight: verticalScale(28),
  },
  manualLocationText: {
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#9370DB",
    fontWeight: "500",
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },

  // Enhanced Search container
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.headerPadding,
    marginTop: verticalScale(deviceType.isSmallDevice ? 12 : 15),
    alignItems: "center",
    marginBottom: verticalScale(5),
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    height: getButtonHeight(),
    minHeight: getButtonHeight(),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: font(deviceType.isSmallDevice ? 13 : 14),
    color: "#999",
    lineHeight: font(deviceType.isSmallDevice ? 16 : 18),
  },
  searchFilterButton: {
    width: getButtonHeight(),
    height: getButtonHeight(),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: borderRadius.md,
    marginLeft: scale(10),
  },

  // Enhanced ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.headerPadding,
    paddingBottom: verticalScale(20),
  },

  // Enhanced Categories
  categoriesContainer: {
    marginTop: spacing.sectionMargin,
    marginBottom: verticalScale(10),
  },
  categoryItem: {
    alignItems: "center",
    marginRight: scale(deviceType.isSmallDevice ? 15 : 20),
    minWidth: scale(60),
  },
  categoryIconContainer: {
    width: scale(deviceType.isSmallDevice ? 45 : deviceType.isTablet ? 60 : 50),
    height: scale(
      deviceType.isSmallDevice ? 45 : deviceType.isTablet ? 60 : 50
    ),
    borderRadius: scale(
      deviceType.isSmallDevice ? 22.5 : deviceType.isTablet ? 30 : 25
    ),
    backgroundColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    marginTop: verticalScale(6),
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#333",
    textAlign: "center",
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },

  // Enhanced Sections
  sectionContainer: {
    marginTop: spacing.sectionMargin,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(15),
    minHeight: verticalScale(24),
  },
  sectionTitle: {
    fontSize: font(
      deviceType.isSmallDevice ? 16 : deviceType.isTablet ? 20 : 18
    ),
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    lineHeight: font(
      deviceType.isSmallDevice ? 20 : deviceType.isTablet ? 24 : 22
    ),
  },
  seeAllText: {
    fontSize: font(deviceType.isSmallDevice ? 13 : 14),
    color: "#9370DB",
    fontWeight: "500",
    lineHeight: font(deviceType.isSmallDevice ? 16 : 18),
  },

  // Enhanced Salon list styles
  salonsList: {
    paddingBottom: verticalScale(20),
  },
  salonRow: {
    justifyContent: "space-between",
    marginBottom: verticalScale(15),
  },
  salonRowTablet: {
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
  },

  // Enhanced Nearby Salon Card Styles
  nearbyCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.card,
    width: getCardWidth(deviceType.isTablet ? 3 : 2, spacing.headerPadding / 2),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    minHeight: verticalScale(
      deviceType.isSmallDevice ? 220 : deviceType.isTablet ? 280 : 250
    ),
  },
  nearbyImage: {
    width: "100%",
    height: verticalScale(
      deviceType.isSmallDevice ? 100 : deviceType.isTablet ? 140 : 120
    ),
    backgroundColor: "#f0f0f0",
  },
  nearbyInfo: {
    padding: spacing.cardPadding,
    flex: 1,
    justifyContent: "space-between",
  },
  nearbyName: {
    fontSize: font(
      deviceType.isSmallDevice ? 13 : deviceType.isTablet ? 16 : 14
    ),
    fontWeight: "600",
    color: "#333",
    marginBottom: verticalScale(4),
    lineHeight: font(
      deviceType.isSmallDevice ? 16 : deviceType.isTablet ? 20 : 18
    ),
  },
  nearbyLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(4),
    minHeight: verticalScale(16),
  },
  nearbyLocation: {
    fontSize: font(
      deviceType.isSmallDevice ? 10 : deviceType.isTablet ? 13 : 11
    ),
    color: "#666",
    marginLeft: scale(3),
    flex: 1,
    lineHeight: font(
      deviceType.isSmallDevice ? 13 : deviceType.isTablet ? 16 : 15
    ),
  },
  nearbyAddress: {
    fontSize: font(
      deviceType.isSmallDevice ? 9 : deviceType.isTablet ? 12 : 10
    ),
    color: "#999",
    marginBottom: verticalScale(8),
    lineHeight: font(
      deviceType.isSmallDevice ? 12 : deviceType.isTablet ? 15 : 14
    ),
  },
  nearbyBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: verticalScale(20),
    marginBottom: verticalScale(4),
  },
  nearbyRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: borderRadius.xs,
    minHeight: verticalScale(20),
  },
  nearbyRatingText: {
    fontSize: font(
      deviceType.isSmallDevice ? 10 : deviceType.isTablet ? 13 : 11
    ),
    color: "#333",
    marginLeft: scale(2),
    fontWeight: "500",
    lineHeight: font(
      deviceType.isSmallDevice ? 13 : deviceType.isTablet ? 16 : 15
    ),
  },
  nearbyDistance: {
    fontSize: font(
      deviceType.isSmallDevice ? 9 : deviceType.isTablet ? 12 : 10
    ),
    color: "#9370DB",
    fontWeight: "500",
    lineHeight: font(
      deviceType.isSmallDevice ? 12 : deviceType.isTablet ? 15 : 14
    ),
  },

  // Enhanced Salon Type Badge
  salonTypeBadge: {
    backgroundColor: "#9370DB",
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: borderRadius.xs,
    alignSelf: "flex-start",
    marginTop: verticalScale(6),
    minHeight: verticalScale(16),
    justifyContent: "center",
  },
  salonTypeText: {
    fontSize: font(deviceType.isSmallDevice ? 8 : deviceType.isTablet ? 11 : 9),
    color: "#fff",
    fontWeight: "600",
    lineHeight: font(
      deviceType.isSmallDevice ? 10 : deviceType.isTablet ? 13 : 12
    ),
  },

  // Enhanced Loading and error states
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
    paddingHorizontal: spacing.sm,
  },
  retryButton: {
    backgroundColor: "#9370DB",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: borderRadius.button,
    minHeight: getButtonHeight(),
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
    paddingHorizontal: spacing.sm,
  },
  refreshButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: borderRadius.button,
    marginTop: verticalScale(10),
    minHeight: getButtonHeight(),
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
    borderRadius: borderRadius.button,
    marginBottom: verticalScale(10),
    minHeight: getButtonHeight(),
    justifyContent: "center",
  },
  searchCityButtonText: {
    color: "#fff",
    fontSize: font(14),
    fontWeight: "600",
    lineHeight: font(18),
  },

  // Enhanced Bottom Tab Bar
  bottomTabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    backgroundColor: "#fff",
    paddingVertical: verticalScale(deviceType.isSmallDevice ? 8 : 10),
    paddingBottom:
      Platform.OS === "android"
        ? verticalScale(deviceType.isSmallDevice ? 8 : 10)
        : verticalScale(deviceType.isSmallDevice ? 12 : 15) + safeArea.bottom,
    minHeight:
      verticalScale(
        deviceType.isSmallDevice ? 55 : deviceType.isTablet ? 70 : 60
      ) + safeArea.bottom,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: scale(4),
  },
  activeTab: {
    borderTopColor: "#9370DB",
  },
  tabText: {
    fontSize: font(
      deviceType.isSmallDevice ? 9 : deviceType.isTablet ? 12 : 10
    ),
    color: "#999",
    marginTop: verticalScale(3),
    lineHeight: font(
      deviceType.isSmallDevice ? 11 : deviceType.isTablet ? 14 : 12
    ),
    textAlign: "center",
  },
  activeTabText: {
    fontSize: font(
      deviceType.isSmallDevice ? 9 : deviceType.isTablet ? 12 : 10
    ),
    color: "#9370DB",
    marginTop: verticalScale(3),
    lineHeight: font(
      deviceType.isSmallDevice ? 11 : deviceType.isTablet ? 14 : 12
    ),
    textAlign: "center",
  },
});
