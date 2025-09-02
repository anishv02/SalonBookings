import React, { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../../utils/authStorage";
import axios from "axios";

const CustomersView = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'upcoming', 'completed', 'cancelled'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedSeat = props.selectedSeat || props.route?.params?.selectedSeat;
  console.log("Selected Seat:", selectedSeat);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token and decode for shopId
      const token = await getToken();
      let decoded = null;
      if (token) {
        try {
          decoded = jwtDecode(token);
        } catch (err) {
          console.error("JWT decode failed", err);
        }
      }

      // Determine shopId from various sources
      const shopId =
        route?.params?.shopId ||
        decoded?.shopId ||
        decoded?.salonId ||
        decoded?.salonObj?._id;

      const userType =
        decoded?.userType || decoded?.role || decoded?.type || "owner";

      if (!shopId) {
        setError("Shop ID not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/bookings/get-bookings-by-Id",
        {
          params: {
            Id: shopId,
            userType: userType,
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const fetchedBookings = response.data.bookings || response.data || [];
      setBookings(fetchedBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings by selected seat
  const getSeatBookings = () => {
    if (!selectedSeat || !bookings.length) {
      return [];
    }

    // Filter bookings for the selected seat
    return bookings.filter((booking) => {
      const seatStr = booking.seatNumber || booking.seat || "";
      const match = seatStr.match(/\d+/);
      if (!match) return false;
      const seatIndex = parseInt(match[0], 10);
      return seatIndex === selectedSeat;
    });
  };

  // Transform booking data to match the expected format
  const transformBookingToCustomer = (booking) => {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const now = new Date();

    // Determine status based on timing and booking status
    let status;
    if (booking.status === "Cancelled") {
      status = "cancelled";
    } else if (endTime <= now) {
      status = "completed";
    } else if (startTime > now && booking.status === "Booked") {
      status = "upcoming";
    } else {
      status = "upcoming"; // default for "Booked" status
    }

    return {
      id: booking._id,
      name:
        (booking.user && (booking.user.name || booking.user.displayName)) ||
        (typeof booking.user === "string"
          ? `User ${booking.user.slice(-4)}`
          : "Customer"),
      time: startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: status,
      services:
        booking.services?.map((service) => ({
          name: service.name,
          price: service.price,
        })) || [],
      totalPrice: booking.totalPrice,
      totalDuration: booking.totalDuration,
      startTime: booking.startTime,
      endTime: booking.endTime,
      seatNumber: booking.seatNumber,
      originalBooking: booking, // Keep original booking data for navigation
    };
  };

  const getFilteredCustomers = () => {
    const seatBookings = getSeatBookings();
    const customers = seatBookings
      .map(transformBookingToCustomer)
      .filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );

    const upcoming = customers.filter(
      (customer) => customer.status === "upcoming"
    );
    const completed = customers.filter(
      (customer) => customer.status === "completed"
    );
    const cancelled = customers.filter(
      (customer) => customer.status === "cancelled"
    );

    return { upcoming, completed, cancelled };
  };

  const calculateTotal = (services) => {
    return services.reduce((total, service) => total + service.price, 0);
  };

  const handleCustomerClick = (customer) => {
    navigation.navigate("customerDetails", {
      selectedCustomer: customer,
      selectedSeat: selectedSeat,
      booking: customer.originalBooking, // Pass original booking data
    });
  };

  const { upcoming, completed, cancelled } = getFilteredCustomers();
  const totalUpcoming = upcoming.length;
  const totalCompleted = completed.length;
  const totalCancelled = cancelled.length;

  const getDisplayCustomers = () => {
    if (filterType === "upcoming")
      return { upcoming, completed: [], cancelled: [] };
    if (filterType === "completed")
      return { upcoming: [], completed, cancelled: [] };
    if (filterType === "cancelled")
      return { upcoming: [], completed: [], cancelled };
    return { upcoming, completed, cancelled };
  };

  const {
    upcoming: displayUpcoming,
    completed: displayCompleted,
    cancelled: displayCancelled,
  } = getDisplayCustomers();

  const renderCustomerCard = (customer, statusType) => {
    const isUpcoming = statusType === "upcoming";
    const isCancelled = statusType === "cancelled";

    return (
      <TouchableOpacity
        key={customer.id}
        onPress={() => handleCustomerClick(customer)}
        style={[
          styles.customerCard,
          isUpcoming
            ? styles.upcomingCard
            : isCancelled
            ? styles.cancelledCard
            : styles.completedCard,
        ]}
      >
        <View style={styles.customerContent}>
          <View style={styles.customerHeader}>
            <View
              style={[
                styles.customerAvatar,
                {
                  backgroundColor: isUpcoming
                    ? "#16a34a"
                    : isCancelled
                    ? "#dc2626"
                    : "#6b7280",
                },
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
                {
                  backgroundColor: isUpcoming
                    ? "#dcfce7"
                    : isCancelled
                    ? "#fee2e2"
                    : "#f3f4f6",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isUpcoming
                      ? "#16a34a"
                      : isCancelled
                      ? "#dc2626"
                      : "#6b7280",
                  },
                ]}
              >
                {statusType.charAt(0).toUpperCase() + statusType.slice(1)}
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
              {customer.services.length} services • {customer.totalDuration} min
            </Text>
            <Text style={styles.totalAmount}>
              Total: ₹{customer.totalPrice}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
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
              <Text style={styles.headerSubtitle}>Loading...</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
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
              <Text style={styles.headerSubtitle}>Error loading data</Text>
            </View>
          </View>
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchBookings}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
              <Icon name="cancel" size={16} color="#dc2626" />
            </View>
            <Text style={styles.compactStatNumber}>{totalCancelled}</Text>
            <Text style={styles.compactStatLabel}>Cancelled</Text>
          </View>
          <View style={styles.compactStatItem}>
            <View style={styles.compactStatIcon}>
              <Icon name="people" size={16} color="#3b82f6" />
            </View>
            <Text style={styles.compactStatNumber}>
              {totalUpcoming + totalCompleted + totalCancelled}
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
            <TouchableOpacity
              onPress={() => setFilterType("cancelled")}
              style={[
                styles.filterButton,
                filterType === "cancelled" && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === "cancelled" && styles.activeFilterText,
                ]}
              >
                Cancelled
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
                renderCustomerCard(customer, "upcoming")
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
                renderCustomerCard(customer, "completed")
              )}
            </View>
          )}

          {/* Cancelled Appointments */}
          {displayCancelled.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Icon name="cancel" size={18} color="#dc2626" />
                <Text style={styles.sectionTitle}>Cancelled</Text>
                <View
                  style={[styles.sectionBadge, { backgroundColor: "#fee2e2" }]}
                >
                  <Text style={[styles.sectionBadgeText, { color: "#dc2626" }]}>
                    {displayCancelled.length}
                  </Text>
                </View>
              </View>
              {displayCancelled.map((customer) =>
                renderCustomerCard(customer, "cancelled")
              )}
            </View>
          )}

          {/* No Results */}
          {displayUpcoming.length === 0 &&
            displayCompleted.length === 0 &&
            displayCancelled.length === 0 && (
              <View style={styles.noResults}>
                <Icon name="search-off" size={48} color="#9ca3af" />
                <Text style={styles.noResultsText}>No appointments found</Text>
                <Text style={styles.noResultsSubtext}>
                  {searchTerm
                    ? "Try adjusting your search"
                    : `No bookings for seat ${selectedSeat}`}
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

  // Customer Cards
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
  cancelledCard: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#dc2626",
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

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginVertical: 15,
  },
  retryButton: {
    backgroundColor: "#9370DB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
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
