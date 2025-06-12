// screens/FavoritesScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  ScrollView,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'salons', 'professionals', 'services'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for favorite salons
  const FAVORITE_SALONS = [
    {
      id: "s1",
      name: "Cuts & Style",
      type: "salon",
      rating: 4.7,
      reviews: 124,
      address: "123 Beauty St, New York",
      distance: "0.8 mi",
      services: ["Haircut", "Hair Coloring", "Styling"],
    },
    {
      id: "s2",
      name: "Beauty Lounge",
      type: "salon",
      rating: 4.9,
      reviews: 208,
      address: "456 Fashion Ave, New York",
      distance: "1.2 mi",
      services: ["Makeup", "Facial", "Nail Care"],
    },
    {
      id: "s3",
      name: "Glamour Studio",
      type: "salon",
      rating: 4.5,
      reviews: 86,
      address: "789 Style Blvd, New York",
      distance: "2.1 mi",
      services: ["Hair Styling", "Waxing", "Spa"],
    },
  ];

  // Mock data for favorite professionals
  const FAVORITE_PROFESSIONALS = [
    {
      id: "p1",
      name: "Bella Grace",
      type: "professional",
      profession: "Hair Stylist",
      rating: 4.9,
      experience: "5 yrs exp",
      salon: "Cuts & Style",
    },
    {
      id: "p2",
      name: "Daisy Scarlett",
      type: "professional",
      profession: "Hair Stylist",
      rating: 4.8,
      experience: "9 yrs exp",
      salon: "Beauty Lounge",
    },
    {
      id: "p3",
      name: "Sophie Bloom",
      type: "professional",
      profession: "Makeup Artist",
      rating: 4.7,
      experience: "7 yrs exp",
      salon: "Glamour Studio",
    },
  ];

  // Mock data for favorite services
  const FAVORITE_SERVICES = [
    {
      id: "sv1",
      name: "Premium Haircut",
      type: "service",
      price: "$45",
      duration: "45 mins",
      salon: "Cuts & Style",
    },
    {
      id: "sv2",
      name: "Full Makeup",
      type: "service",
      price: "$65",
      duration: "60 mins",
      salon: "Beauty Lounge",
    },
    {
      id: "sv3",
      name: "Spa Package",
      type: "service",
      price: "$120",
      duration: "120 mins",
      salon: "Glamour Studio",
    },
  ];

  // Combined data for "All" tab
  const getAllFavorites = () => {
    let allItems = [
      ...FAVORITE_SALONS,
      ...FAVORITE_PROFESSIONALS,
      ...FAVORITE_SERVICES,
    ];

    // Filter by search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      allItems = allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.type === "salon" &&
            item.address.toLowerCase().includes(query)) ||
          (item.type === "professional" &&
            item.profession.toLowerCase().includes(query)) ||
          (item.type === "service" && item.salon.toLowerCase().includes(query))
      );
    }

    return allItems;
  };

  // Get data based on active tab
  const getDataForActiveTab = () => {
    switch (activeTab) {
      case "all":
        return getAllFavorites();
      case "salons":
        return FAVORITE_SALONS.filter(
          (salon) =>
            !searchQuery ||
            salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            salon.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "professionals":
        return FAVORITE_PROFESSIONALS.filter(
          (professional) =>
            !searchQuery ||
            professional.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            professional.profession
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      case "services":
        return FAVORITE_SERVICES.filter(
          (service) =>
            !searchQuery ||
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.salon.toLowerCase().includes(searchQuery.toLowerCase())
        );
      default:
        return [];
    }
  };

  // Render grid item
  const renderGridItem = ({ item }) => {
    // Different rendering based on item type
    switch (item.type) {
      case "salon":
        return (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() =>
              navigation.navigate("SalonDetail", { salonId: item.id })
            }
          >
            <View style={styles.gridImageContainer}>
              <View style={styles.gridPlaceholderImage}>
                <MaterialIcons name="storefront" size={24} color="#9370DB" />
              </View>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => {
                  /* Toggle favorite logic */
                }}
              >
                <Ionicons name="heart" size={16} color="#FF4081" />
              </TouchableOpacity>
            </View>
            <Text style={styles.gridItemName}>{item.name}</Text>
            <View style={styles.gridItemRating}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>
                {item.rating} ({item.reviews})
              </Text>
            </View>
            <Text style={styles.gridItemDistance}>{item.distance}</Text>
          </TouchableOpacity>
        );

      case "professional":
        return (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() =>
              navigation.navigate("ProfessionalDetail", { proId: item.id })
            }
          >
            <View style={styles.gridImageContainer}>
              <View style={styles.gridPlaceholderImage}>
                <Ionicons name="person" size={24} color="#9370DB" />
              </View>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => {
                  /* Toggle favorite logic */
                }}
              >
                <Ionicons name="heart" size={16} color="#FF4081" />
              </TouchableOpacity>
            </View>
            <Text style={styles.gridItemName}>{item.name}</Text>
            <Text style={styles.gridItemProfession}>{item.profession}</Text>
            <View style={styles.gridItemRating}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </TouchableOpacity>
        );

      case "service":
        return (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() =>
              navigation.navigate("ServiceDetail", { serviceId: item.id })
            }
          >
            <View style={styles.gridImageContainer}>
              <View style={styles.gridPlaceholderImage}>
                <FontAwesome5 name="spa" size={24} color="#9370DB" />
              </View>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => {
                  /* Toggle favorite logic */
                }}
              >
                <Ionicons name="heart" size={16} color="#FF4081" />
              </TouchableOpacity>
            </View>
            <Text style={styles.gridItemName}>{item.name}</Text>
            <Text style={styles.gridItemPrice}>{item.price}</Text>
            <Text style={styles.gridItemSalon}>{item.salon}</Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  // Render list item
  const renderListItem = ({ item }) => {
    // Different rendering based on item type
    switch (item.type) {
      case "salon":
        return (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() =>
              navigation.navigate("SalonDetail", { salonId: item.id })
            }
          >
            <View style={styles.listItemImage}>
              <MaterialIcons name="storefront" size={24} color="#9370DB" />
            </View>
            <View style={styles.listItemContent}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemName}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    /* Toggle favorite logic */
                  }}
                >
                  <Ionicons name="heart" size={18} color="#FF4081" />
                </TouchableOpacity>
              </View>
              <View style={styles.listItemRating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {item.rating} ({item.reviews})
                </Text>
                <Text style={styles.listItemDistance}>{item.distance}</Text>
              </View>
              <Text style={styles.listItemAddress} numberOfLines={1}>
                {item.address}
              </Text>
              <View style={styles.listItemTags}>
                {item.services.slice(0, 2).map((service, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{service}</Text>
                  </View>
                ))}
                {item.services.length > 2 && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      +{item.services.length - 2}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );

      case "professional":
        return (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() =>
              navigation.navigate("ProfessionalDetail", { proId: item.id })
            }
          >
            <View style={styles.listItemImage}>
              <Ionicons name="person" size={24} color="#9370DB" />
            </View>
            <View style={styles.listItemContent}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemName}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    /* Toggle favorite logic */
                  }}
                >
                  <Ionicons name="heart" size={18} color="#FF4081" />
                </TouchableOpacity>
              </View>
              <Text style={styles.listItemProfession}>{item.profession}</Text>
              <View style={styles.listItemRating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.listItemExperience}>{item.experience}</Text>
              </View>
              <Text style={styles.listItemSalonName}>at {item.salon}</Text>
            </View>
          </TouchableOpacity>
        );

      case "service":
        return (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() =>
              navigation.navigate("ServiceDetail", { serviceId: item.id })
            }
          >
            <View style={styles.listItemImage}>
              <FontAwesome5 name="spa" size={24} color="#9370DB" />
            </View>
            <View style={styles.listItemContent}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemName}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    /* Toggle favorite logic */
                  }}
                >
                  <Ionicons name="heart" size={18} color="#FF4081" />
                </TouchableOpacity>
              </View>
              <View style={styles.serviceDetails}>
                <Text style={styles.listItemPrice}>{item.price}</Text>
                <Text style={styles.listItemDuration}>{item.duration}</Text>
              </View>
              <Text style={styles.listItemSalonName}>at {item.salon}</Text>
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <TouchableOpacity
          style={styles.viewToggleButton}
          onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
        >
          <Ionicons
            name={viewMode === "grid" ? "list" : "grid"}
            size={20}
            color="#9370DB"
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search favorites"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "salons" && styles.activeTab]}
            onPress={() => setActiveTab("salons")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "salons" && styles.activeTabText,
              ]}
            >
              Salons
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "professionals" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("professionals")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "professionals" && styles.activeTabText,
              ]}
            >
              Professionals
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "services" && styles.activeTab]}
            onPress={() => setActiveTab("services")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "services" && styles.activeTabText,
              ]}
            >
              Services
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <FlatList
          data={getDataForActiveTab()}
          renderItem={viewMode === "grid" ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode} // This forces the list to re-render when view mode changes
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>No favorites found</Text>
              <Text style={styles.emptySubText}>
                {searchQuery
                  ? "Try a different search term"
                  : "Add some items to your favorites"}
              </Text>
            </View>
          }
        />
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home-outline" size={22} color="#999" />
          <Text style={styles.footerTabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.activeFooterTab]}>
          <Ionicons name="heart" size={22} color="#9370DB" />
          <Text style={styles.activeFooterTabText}>Favorite</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Messages")}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#999" />
          <Text style={styles.footerTabText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-outline" size={22} color="#999" />
          <Text style={styles.footerTabText}>Profile</Text>
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
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  viewToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFF",
  },
  searchBar: {
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
  tabContainer: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#9370DB",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9370DB",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 10,
  },
  // Grid Item Styles
  gridItem: {
    flex: 1,
    margin: 6,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
    maxWidth: "47%",
  },
  gridImageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 5,
    overflow: "hidden",
  },
  gridPlaceholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  gridItemName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  gridItemProfession: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  gridItemRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 4,
  },
  gridItemDistance: {
    fontSize: 12,
    color: "#666",
  },
  gridItemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9370DB",
    marginBottom: 4,
  },
  gridItemSalon: {
    fontSize: 12,
    color: "#666",
  },
  // List Item Styles
  listItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  listItemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  listItemProfession: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  listItemRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  listItemDistance: {
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
  },
  listItemExperience: {
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
  },
  listItemAddress: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  listItemTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    color: "#666",
  },
  listItemSalonName: {
    fontSize: 12,
    color: "#666",
  },
  serviceDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  listItemPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#9370DB",
    marginRight: 10,
  },
  listItemDuration: {
    fontSize: 12,
    color: "#666",
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 20,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  // Footer Tab Bar
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
  activeFooterTab: {
    borderTopColor: "#9370DB",
  },
  footerTabText: {
    fontSize: 10,
    color: "#999",
    marginTop: 3,
  },
  activeFooterTabText: {
    fontSize: 10,
    color: "#9370DB",
    marginTop: 3,
  },
});

export default FavoritesScreen;
