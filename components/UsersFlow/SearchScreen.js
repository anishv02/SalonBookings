// screens/SearchScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import debounce from "lodash/debounce";

// Categories data (same as HomeScreen)
const CATEGORIES = [
  { id: "1", name: "Haircut", icon: "cut" },
  { id: "2", name: "Nail", icon: "hand-sparkles" },
  { id: "3", name: "Facial", icon: "face-smile" },
  { id: "4", name: "Spa", icon: "spa" },
  { id: "5", name: "Makeup", icon: "magic" },
  { id: "6", name: "Hair Color", icon: "paint-brush" },
  { id: "7", name: "Massage", icon: "hands" },
  { id: "8", name: "Waxing", icon: "leaf" },
];

// Popular search keywords
const POPULAR_SEARCHES = [
  "Hair salon",
  "Manicure",
  "Facial",
  "Hair coloring",
  "Eyebrow threading",
  "Massage",
];

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch salons function
  const fetchSalons = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/shops/getShops"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Normalize and filter the response data based on search query
      let salonsData = Array.isArray(data.shops)
        ? data.shops
        : Array.isArray(data)
        ? data
        : [];

      // Filter salons based on search query (case insensitive)
      salonsData = salonsData.filter(
        (salon) =>
          salon.shopName.toLowerCase().includes(query.toLowerCase()) ||
          salon.city?.toLowerCase().includes(query.toLowerCase()) ||
          salon.state?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(salonsData);
    } catch (err) {
      console.error("Error fetching salons:", err);
      setError("Failed to fetch salons. Please try again.");
      setSearchResults([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Debounced search function
  const debouncedFetch = useCallback(
    debounce((query) => {
      fetchSalons(query);
    }, 500),
    []
  );

  // Effect for search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setShowDropdown(true);
      debouncedFetch(searchQuery.trim());
    } else {
      setShowDropdown(false);
      setSearchResults([]);
      setInitialLoad(false); // Reset initial load when query is empty
    }

    // Cleanup function
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchQuery, debouncedFetch]);

  // Handle salon selection
  const handleSalonSelect = (salon) => {
    setShowDropdown(false);
    setSearchQuery("");
    Keyboard.dismiss();
    navigation.navigate("SalonDetail", {
      salonId: salon._id,
      salonName: salon.shopName,
      salonData: salon,
    });
  };

  // Render search results
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchDropdownItem}
      onPress={() => handleSalonSelect(item)}
    >
      <View style={styles.searchResultContent}>
        <View style={styles.searchResultMain}>
          <Text style={styles.searchDropdownText}>{item.shopName}</Text>
          <Text style={styles.searchDropdownSubText}>
            {item.city}
            {item.state ? `, ${item.state}` : ""}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
      {item.salonType && (
        <View
          style={[
            styles.salonTypeBadge,
            {
              backgroundColor:
                item.salonType === "Unisex" ? "#9370DB" : "#4CAF50",
            },
          ]}
        >
          <Text style={styles.salonTypeText}>{item.salonType}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render category items
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setSearchQuery(item.name);
        setShowDropdown(true);
      }}
    >
      <View style={styles.categoryIconContainer}>
        <FontAwesome5 name={item.icon} size={20} color="#FFF" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with back button and search bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search salons or services"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              returnKeyType="search"
              // Remove or modify onFocus to not show dropdown immediately
              // onFocus={() => setShowDropdown(true)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery("");
                  setShowDropdown(false);
                }}
              >
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <View style={styles.searchDropdown}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#9370DB" />
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => fetchSalons(searchQuery)}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item._id}
                  style={styles.resultsList}
                  keyboardShouldPersistTaps="handled"
                  maxToRenderPerBatch={10}
                  windowSize={10}
                  removeClippedSubviews={true}
                />
              ) : (
                !initialLoad && (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>
                      No salons found matching "{searchQuery}"
                    </Text>
                  </View>
                )
              )}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const newStyles = {
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    padding: 15,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    marginBottom: 10,
  },
  retryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#9370DB",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  noResultsContainer: {
    padding: 15,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 14,
    color: "#666",
  },
  searchResultContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchResultMain: {
    flex: 1,
    marginRight: 10,
  },
  salonTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  salonTypeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  resultsList: {
    maxHeight: 300,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 5,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginLeft: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  searchDropdown: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
    paddingVertical: 4,
  },
  searchDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchDropdownText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  searchDropdownSubText: {
    fontSize: 12,
    color: "#999",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 15,
  },
  popularSearchesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  popularSearchItem: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  popularSearchText: {
    fontSize: 13,
    color: "#666",
  },
  categoriesGrid: {
    marginTop: 5,
  },
  categoryRow: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: "center",
    width: "22%",
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  ...newStyles,
});

export default SearchScreen;
