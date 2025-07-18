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
            <Icon name="person" size={20} color="white" />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <View style={styles.timeContainer}>
              <Icon name="schedule" size={16} color="#6b7280" />
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

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#dcfce7" }]}
            >
              <Icon name="schedule" size={24} color="#16a34a" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statNumber}>{totalUpcoming}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#f3f4f6" }]}
            >
              <Icon name="check-circle" size={24} color="#6b7280" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statNumber}>{totalCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="people" size={24} color="#3b82f6" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statNumber}>
                {totalUpcoming + totalCompleted}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
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
                <Icon name="schedule" size={20} color="#16a34a" />
                <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
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
                <Icon name="check-circle" size={20} color="#6b7280" />
                <Text style={styles.sectionTitle}>Completed Services</Text>
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

  // Stats Cards
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  // Filter Section
  filterSection: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtons: {
    flexDirection: "row",
    marginBottom: 16,
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
    marginTop: 8,
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
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginLeft: 8,
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },

  // Customer Cards
  customerCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upcomingCard: {
    backgroundColor: "#f0fdf4",
    borderWidth: 2,
    borderColor: "#16a34a",
  },
  completedCard: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  customerContent: {
    padding: 16,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  serviceTag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  serviceText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  servicePrice: {
    fontSize: 12,
    color: "#9370DB",
    fontWeight: "600",
    marginLeft: 4,
  },
  customerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  servicesCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  totalAmount: {
    fontSize: 16,
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
