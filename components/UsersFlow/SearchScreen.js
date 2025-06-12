// screens/SearchScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  StatusBar,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

// Mock data for recent bookings
const RECENT_BOOKINGS = [
  {
    id: "1",
    salonName: "Cuts & Style",
    service: "Men's Haircut",
    date: "15 Apr",
  },
  {
    id: "2",
    salonName: "Beauty Lounge",
    service: "Facial Treatment",
    date: "02 Apr",
  },
  {
    id: "3",
    salonName: "Hair Studio",
    service: "Hair Coloring",
    date: "23 Mar",
  },
];

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

  // Handle search submission
  handleSearch = () => {
    if (searchQuery.trim() !== "") {
      // Navigate directly to salon detail for demo
      navigation.navigate("SalonDetail", {
        salonId: "1",
        salonName: "Star Quality Cutz",
      });
    }
  };

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        console.log(`Selected category: ${item.name}`);
        // navigation.navigate("CategoryResults", { category: item.name });
      }}
    >
      <View style={styles.categoryIconContainer}>
        <FontAwesome5 name={item.icon} size={18} color="#fff" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render recent booking item
  // Render recent booking item
  const renderRecentBooking = ({ item }) => (
    <TouchableOpacity
      style={styles.recentBookingItem}
      onPress={() => {
        navigation.navigate("SalonDetail", {
          salonId: item.id,
          salonName: item.salonName,
        });
      }}
    >
      <View style={styles.recentBookingContent}>
        <View style={styles.recentBookingIconContainer}>
          <Ionicons name="calendar-outline" size={20} color="#9370DB" />
        </View>
        <View style={styles.recentBookingInfo}>
          <Text style={styles.recentBookingSalon}>{item.salonName}</Text>
          <Text style={styles.recentBookingService}>{item.service}</Text>
        </View>
      </View>
      <View style={styles.recentBookingDate}>
        <Text style={styles.recentBookingDateText}>{item.date}</Text>
      </View>
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
            onSubmitEditing={handleSearch}
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Recent Bookings Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={RECENT_BOOKINGS}
            renderItem={renderRecentBooking}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

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
                  handleSearch();
                }}
              >
                <Text style={styles.popularSearchText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionContainer}>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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
    marginBottom: 15,
  },
  clearText: {
    fontSize: 14,
    color: "#9370DB",
  },
  recentBookingItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  recentBookingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentBookingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentBookingInfo: {
    flex: 1,
  },
  recentBookingSalon: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  recentBookingService: {
    fontSize: 12,
    color: "#999",
    marginTop: 3,
  },
  recentBookingDate: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  recentBookingDateText: {
    fontSize: 12,
    color: "#666",
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
