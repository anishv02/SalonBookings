import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const CustomersView = (props) => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'upcoming', 'completed'
  const selectedSeat = props.selectedSeat || props.route?.params?.selectedSeat;
  console.log("Selected Seat:", selectedSeat);

  // Sample customer data for each seat with status
  const customersData = {
    1: [
      {
        id: 1,
        name: "Robert Fox",
        time: "09:00 AM",
        status: "completed",
        services: [
          { name: "Hair & Beard Cut", price: 315 },
          { name: "Face Wash", price: 445 },
        ],
      },
      {
        id: 2,
        name: "Wade Warren",
        time: "10:30 AM",
        status: "upcoming",
        services: [
          { name: "Hair Color", price: 125 },
          { name: "Body Massage", price: 1125 },
        ],
      },
      {
        id: 3,
        name: "Brooklyn Simmons",
        time: "11:45 AM",
        status: "upcoming",
        services: [{ name: "Hair Cut", price: 250 }],
      },
    ],
    2: [
      {
        id: 4,
        name: "Dianne Russell",
        time: "10:00 AM",
        status: "completed",
        services: [
          { name: "Hair & Beard Cut", price: 315 },
          { name: "Hair Color", price: 125 },
        ],
      },
      {
        id: 5,
        name: "Courtney Henry",
        time: "11:15 AM",
        status: "upcoming",
        services: [{ name: "Body Massage", price: 1125 }],
      },
    ],
    3: [
      {
        id: 6,
        name: "Savannah Nguyen",
        time: "09:30 AM",
        status: "completed",
        services: [
          { name: "Hair Cut", price: 250 },
          { name: "Face Wash", price: 445 },
        ],
      },
      {
        id: 7,
        name: "Guy Hawkins",
        time: "12:00 PM",
        status: "upcoming",
        services: [{ name: "Hair & Beard Cut", price: 315 }],
      },
    ],
    4: [
      {
        id: 8,
        name: "Kristin Watson",
        time: "10:15 AM",
        status: "upcoming",
        services: [
          { name: "Hair Color", price: 125 },
          { name: "Body Massage", price: 1125 },
        ],
      },
    ],
    5: [
      {
        id: 9,
        name: "Cody Fisher",
        time: "09:45 AM",
        status: "completed",
        services: [{ name: "Hair Cut", price: 250 }],
      },
      {
        id: 10,
        name: "Annette Black",
        time: "11:30 AM",
        status: "upcoming",
        services: [
          { name: "Hair & Beard Cut", price: 315 },
          { name: "Face Wash", price: 445 },
        ],
      },
    ],
    6: [
      {
        id: 11,
        name: "Jacob Jones",
        time: "10:45 AM",
        status: "upcoming",
        services: [{ name: "Hair Color", price: 125 }],
      },
    ],
    7: [
      {
        id: 12,
        name: "Albert Flores",
        time: "09:15 AM",
        status: "completed",
        services: [{ name: "Body Massage", price: 1125 }],
      },
      {
        id: 13,
        name: "Darrell Steward",
        time: "11:00 AM",
        status: "upcoming",
        services: [
          { name: "Hair & Beard Cut", price: 315 },
          { name: "Hair Color", price: 125 },
        ],
      },
    ],
    8: [
      {
        id: 14,
        name: "Cameron Williamson",
        time: "10:30 AM",
        status: "upcoming",
        services: [
          { name: "Hair Cut", price: 250 },
          { name: "Body Massage", price: 1125 },
        ],
      },
    ],
  };

  const getFilteredCustomers = () => {
    if (!selectedSeat || !customersData[selectedSeat]) {
      return { upcoming: [], completed: [] };
    }

    const customers = customersData[selectedSeat].filter((customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    const upcoming = customers.filter(
      (customer) => customer.status === "upcoming"
    );
    const completed = customers.filter(
      (customer) => customer.status === "completed"
    );

    return { upcoming, completed };
  };

  const calculateTotal = (services) => {
    return services.reduce((total, service) => total + service.price, 0);
  };

  const handleCustomerClick = (customer) => {
    navigation.navigate("customerDetails", {
      selectedCustomer: customer,
      selectedSeat: selectedSeat,
    });
  };

  const { upcoming, completed } = getFilteredCustomers();
  const totalUpcoming = upcoming.length;
  const totalCompleted = completed.length;

  const getDisplayCustomers = () => {
    if (filterType === "upcoming") return { upcoming, completed: [] };
    if (filterType === "completed") return { upcoming: [], completed };
    return { upcoming, completed };
  };

  const { upcoming: displayUpcoming, completed: displayCompleted } =
    getDisplayCustomers();

  const renderCustomerCard = (customer, isUpcoming = true) => (
    <TouchableOpacity
      key={customer.id}
      onPress={() => handleCustomerClick(customer)}
      style={[
        styles.customerCard,
        isUpcoming ? styles.upcomingCard : styles.completedCard,
      ]}
    >
      <View style={styles.customerContent}>
        <View style={styles.customerHeader}>
          <View
            style={[
              styles.customerAvatar,
              { backgroundColor: isUpcoming ? "#16a34a" : "#6b7280" },
            ]}
          >
            <Icon name="person" size={16} color="white" />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <View style={styles.timeContainer}>
              <Icon name="schedule" size={12} color="#6b7280" />
              <Text style={styles.timeText}>{customer.time}</Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isUpcoming ? "#dcfce7" : "#f3f4f6" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isUpcoming ? "#16a34a" : "#6b7280" },
              ]}
            >
              {isUpcoming ? "Upcoming" : "Completed"}
            </Text>
          </View>
        </View>

        <View style={styles.servicesContainer}>
          {customer.services.slice(0, 2).map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service.name}</Text>
              <Text style={styles.servicePrice}>₹{service.price}</Text>
            </View>
          ))}
          {customer.services.length > 2 && (
            <View style={styles.serviceTag}>
              <Text style={styles.serviceText}>
                +{customer.services.length - 2} more
              </Text>
            </View>
          )}
        </View>

        <View style={styles.customerFooter}>
          <Text style={styles.servicesCount}>
            {customer.services.length} services
          </Text>
          <Text style={styles.totalAmount}>
            Total: ₹{calculateTotal(customer.services)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("seats")}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Seat {selectedSeat} - Appointments
            </Text>
            <Text style={styles.headerSubtitle}>
              Manage customer appointments and services
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Compact Stats Row */}
        <View style={styles.compactStatsContainer}>
          <View style={styles.compactStatItem}>
            <View style={styles.compactStatIcon}>
              <Icon name="schedule" size={16} color="#16a34a" />
            </View>
            <Text style={styles.compactStatNumber}>{totalUpcoming}</Text>
            <Text style={styles.compactStatLabel}>Upcoming</Text>
          </View>
          <View style={styles.compactStatItem}>
            <View style={styles.compactStatIcon}>
              <Icon name="check-circle" size={16} color="#6b7280" />
            </View>
            <Text style={styles.compactStatNumber}>{totalCompleted}</Text>
            <Text style={styles.compactStatLabel}>Completed</Text>
          </View>
          <View style={styles.compactStatItem}>
            <View style={styles.compactStatIcon}>
              <Icon name="people" size={16} color="#3b82f6" />
            </View>
            <Text style={styles.compactStatNumber}>
              {totalUpcoming + totalCompleted}
            </Text>
            <Text style={styles.compactStatLabel}>Total</Text>
          </View>
        </View>

        {/* Filter and Search Section */}
        <View style={styles.filterSection}>
          {/* Filter Buttons */}
          <View style={styles.filterButtons}>
            <TouchableOpacity
              onPress={() => setFilterType("all")}
              style={[
                styles.filterButton,
                filterType === "all" && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === "all" && styles.activeFilterText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilterType("upcoming")}
              style={[
                styles.filterButton,
                filterType === "upcoming" && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === "upcoming" && styles.activeFilterText,
                ]}
              >
                Upcoming
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilterType("completed")}
              style={[
                styles.filterButton,
                filterType === "completed" && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === "completed" && styles.activeFilterText,
                ]}
              >
                Completed
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Icon name="search" size={20} color="#9ca3af" />
              <TextInput
                placeholder="Search customers..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={styles.searchInput}
              />
            </View>
          </View>
        </View>

        {/* Customers List */}
        <ScrollView
          style={styles.customersList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Upcoming Appointments */}
          {displayUpcoming.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Icon name="schedule" size={18} color="#16a34a" />
                <Text style={styles.sectionTitle}>Upcoming</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>
                    {displayUpcoming.length}
                  </Text>
                </View>
              </View>
              {displayUpcoming.map((customer) =>
                renderCustomerCard(customer, true)
              )}
            </View>
          )}

          {/* Completed Services */}
          {displayCompleted.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Icon name="check-circle" size={18} color="#6b7280" />
                <Text style={styles.sectionTitle}>Completed</Text>
                <View
                  style={[styles.sectionBadge, { backgroundColor: "#f3f4f6" }]}
                >
                  <Text style={[styles.sectionBadgeText, { color: "#6b7280" }]}>
                    {displayCompleted.length}
                  </Text>
                </View>
              </View>
              {displayCompleted.map((customer) =>
                renderCustomerCard(customer, false)
              )}
            </View>
          )}

          {/* No Results */}
          {displayUpcoming.length === 0 && displayCompleted.length === 0 && (
            <View style={styles.noResults}>
              <Icon name="search-off" size={48} color="#9ca3af" />
              <Text style={styles.noResultsText}>No appointments found</Text>
              <Text style={styles.noResultsSubtext}>
                Try adjusting your search or filter
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  // Enhanced Header Styles
  header: {
    backgroundColor: "#9370DB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerText: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e0e7ff",
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
  },

  // Compact Stats Row
  compactStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactStatItem: {
    alignItems: "center",
    flex: 1,
  },
  compactStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  compactStatNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 2,
  },
  compactStatLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
  },

  // Filter Section
  filterSection: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtons: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: "#9370DB",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeFilterText: {
    color: "#ffffff",
  },
  searchContainer: {
    marginTop: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#1f2937",
  },

  // Customers List
  customersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginLeft: 6,
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16a34a",
  },

  // Customer Cards - Reduced padding
  customerCard: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upcomingCard: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#16a34a",
  },
  completedCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  customerContent: {
    padding: 12,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 2,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 3,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  serviceTag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  serviceText: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "500",
  },
  servicePrice: {
    fontSize: 11,
    color: "#9370DB",
    fontWeight: "600",
    marginLeft: 3,
  },
  customerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  servicesCount: {
    fontSize: 12,
    color: "#6b7280",
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9370DB",
  },

  // No Results
  noResults: {
    alignItems: "center",
    paddingVertical: 48,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
});

export default CustomersView;
