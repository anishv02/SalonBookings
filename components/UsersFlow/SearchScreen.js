// screens/SearchScreen.js
import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

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
  const [allSalons, setAllSalons] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all salons from API on mount
  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const response = await fetch("http://192.168.1.4:3000/getShopDetails");
        const data = await response.json();
        let salonsData;
        if (Array.isArray(data)) {
          salonsData = data;
        } else if (data && typeof data === "object" && data._id) {
          salonsData = [data];
        } else {
          salonsData = data.salons || data.shops || [];
        }
        setAllSalons(salonsData);
      } catch (err) {
        setAllSalons([]);
      }
    };
    fetchSalons();
  }, []);

  // Update search results as user types
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const results = allSalons.filter((salon) =>
      salon.shopName.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    setSearchResults(results);
    setShowDropdown(true);
  }, [searchQuery, allSalons]);

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        // navigation.navigate("CategoryResults", { category: item.name });
      }}
    >
      <View style={styles.categoryIconContainer}>
        <FontAwesome5 name={item.icon} size={18} color="#fff" />
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
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery("")}
              >
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          {showDropdown && searchResults.length > 0 && (
            <View style={styles.searchDropdown}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchDropdownItem}
                    onPress={() => {
                      setShowDropdown(false);
                      setSearchQuery("");
                      Keyboard.dismiss();
                      navigation.navigate("SalonDetail", {
                        salonId: item._id,
                        salonName: item.shopName,
                        salonData: item,
                      });
                    }}
                  >
                    <Text style={styles.searchDropdownText}>
                      {item.shopName}
                    </Text>
                    <Text style={styles.searchDropdownSubText}>
                      {item.city}, {item.state}
                    </Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 180 }}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Popular Searches Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Popular Searches</Text>
          <View style={styles.popularSearchesContainer}>
            {POPULAR_SEARCHES.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.popularSearchItem}
                onPress={() => {
                  setSearchQuery(item);
                }}
              >
                <Text style={styles.popularSearchText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View className="sectionContainer">
          <Text style={styles.sectionTitle}>Filter by Category</Text>
          <View style={styles.categoriesGrid}>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              numColumns={4}
              scrollEnabled={false}
              columnWrapperStyle={styles.categoryRow}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
});

export default SearchScreen;
