// screens/HomeScreen.js
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

// Mock data for home professionals
const PRO_CARE_PROFESSIONALS = [
  {
    id: "1",
    name: "Bella Grace",
    profession: "Hair Stylist",
    rating: 4.9,
    experience: "5 yrs exp",
    image: { uri: "https://via.placeholder.com/60" }, // Using placeholder image
  },
  {
    id: "2",
    name: "Daisy Scarlett",
    profession: "Hair Stylist",
    rating: 4.8,
    experience: "9 yrs exp",
    image: { uri: "https://via.placeholder.com/60" }, // Using placeholder image
  },
];

// Mock data for nearby salons
const NEARBY_SALONS = [
  {
    id: "1",
    name: "Cuts & Style",
    image: { uri: "https://via.placeholder.com/120" }, // Using placeholder image
    rating: 4.7,
    distance: "0.8 mi",
  },
  {
    id: "2",
    name: "Hair Studio",
    image: { uri: "https://via.placeholder.com/120" }, // Using placeholder image
    rating: 4.5,
    distance: "1.2 mi",
  },
  {
    id: "3",
    name: "Beauty Lounge",
    image: { uri: "https://via.placeholder.com/120" }, // Using placeholder image
    rating: 4.9,
    distance: "0.5 mi",
  },
];

// Categories data
const CATEGORIES = [
  { id: "1", name: "Haircut", icon: "cut" },
  { id: "2", name: "Nail", icon: "hand-sparkles" },
  { id: "3", name: "Facial", icon: "face-smile" },
  { id: "4", name: "Spa", icon: "spa" },
  { id: "5", name: "Makeup", icon: "magic" },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("John");

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIconContainer}>
        <FontAwesome5 name={item.icon} size={18} color="#fff" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render pro care professional card
  const renderProCard = ({ item }) => (
    <TouchableOpacity style={styles.proCard}>
      <Image source={item.image} style={styles.proImage} />
      <Text style={styles.proName}>{item.name}</Text>
      <Text style={styles.proProfession}>{item.profession}</Text>
      <View style={styles.proInfoRow}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <Text style={styles.experienceText}>{item.experience}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render nearby salon card
  const renderNearbyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.nearbyCard}
      onPress={() =>
        navigation.navigate("SalonDetail", {
          salonId: item.id,
          salonName: item.name,
        })
      }
    >
      <Image source={item.image} style={styles.nearbyImage} />
      <View style={styles.nearbyInfo}>
        <Text style={styles.nearbyName}>{item.name}</Text>
        <View style={styles.nearbyRating}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.nearbyRatingText}>{item.rating}</Text>
          <Text style={styles.nearbyDistance}>{item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Hello {userName}!</Text>
          <Text style={styles.welcomeText}>Good Morning!</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

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
          <Text style={styles.searchPlaceholder}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
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
            {/* <Image
              source={require("../assets/images/haircut-offer.png")}
              style={styles.offerImage}
              resizeMode="contain"
            /> */}
          </View>
        </View>

        {/* Pro Care at Home Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pro Care at Home</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={PRO_CARE_PROFESSIONALS}
            renderItem={renderProCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Nearby Salons Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Salons</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={NEARBY_SALONS}
            renderItem={renderNearbyCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
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
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={22} color="#999" />
          <Text
            style={styles.tabText}
            onPress={() => navigation.navigate("Profile")}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
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
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
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
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#333",
  },
  filterButton: {
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
    color: "#999",
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
  offerImage: {
    width: 100,
    height: 120,
  },
  proCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    width: 120,
    marginRight: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  proImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  proName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  proProfession: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 5,
  },
  proInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 2,
  },
  experienceText: {
    fontSize: 11,
    color: "#999",
  },
  nearbyCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 15,
    width: 120,
    height: 120,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  nearbyImage: {
    width: "100%",
    height: "100%",
  },
  nearbyInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
  },
  nearbyName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  nearbyRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  nearbyRatingText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
    marginRight: 8,
  },
  nearbyDistance: {
    color: "#fff",
    fontSize: 12,
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
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: "#999",
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

export default HomeScreen;
