import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../../utils/authStorage";

const UserBookings = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  let userId = null;
  let userType = null;

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (token) {
        const decoded = jwtDecode(token);
        userId = decoded.userId;
        userType = decoded.userType;
      }

      const response = await axios.get(
        "https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/bookings/get-bookings-by-Id",
        {
          params: {
            Id: userId,
            userType: userType,
          },
        }
      );

      // Assuming the API returns bookings in response.data or response.data.bookings
      const fetchedBookings = response.data.bookings || response.data || [];
      setBookings(fetchedBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
      Alert.alert(
        "Error",
        "Failed to load bookings. Please check your connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((booking) => {
    const bookingStartTime = new Date(booking.startTime);
    const bookingEndTime = new Date(booking.endTime);
    const now = new Date();

    switch (activeTab) {
      case "Upcoming":
        // Booking is upcoming if start time is in the future and status is "Booked"
        return (
          bookingStartTime > now &&
          (booking.status === "Booked" || booking.status === "Rescheduled")
        );
      case "Completed":
        // Booking is completed if end time has passed, regardless of status (unless cancelled)
        return bookingEndTime <= now && booking.status !== "Cancelled";
      case "Cancelled":
        // Booking is cancelled if status is "Cancelled"
        return booking.status === "Cancelled";
      default:
        return true;
    }
  });

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Transform booking for display
  const transformBooking = (booking) => ({
    id: booking._id,
    salonName: booking.shop, // This will be the shop ID, you might want to fetch shop name separately
    date: new Date(booking.startTime).toISOString().split("T")[0],
    time: new Date(booking.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    services: booking.services?.map((service) => service.name) || [],
    totalAmount: booking.totalPrice,
    status:
      booking.status === "Booked"
        ? new Date(booking.endTime) <= new Date()
          ? "Completed"
          : "Upcoming"
        : booking.status,
    duration: booking.totalDuration,
  });

  // Retry function for failed API calls
  const handleRetry = () => {
    fetchBookings();
  };

  const renderBookingCard = (booking) => {
    const transformed = transformBooking(booking);
    return (
      <TouchableOpacity
        key={transformed.id}
        style={styles.bookingCard}
        onPress={() => navigation.navigate("BookingDetail", { booking })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.salonInfo}>
            <Text style={styles.salonName}>{transformed.salonName}</Text>
            <Text style={styles.bookingDate}>
              {formatDate(transformed.date)} at {transformed.time}
            </Text>
            <Text style={styles.duration}>
              Duration: {transformed.duration} min
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  transformed.status === "Completed"
                    ? "#dcfce7"
                    : transformed.status === "Cancelled"
                    ? "#fee2e2"
                    : transformed.status === "Upcoming"
                    ? "#fff3cd"
                    : "#f3f4f6",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    transformed.status === "Completed"
                      ? "#16a34a"
                      : transformed.status === "Cancelled"
                      ? "#dc2626"
                      : transformed.status === "Upcoming"
                      ? "#997404"
                      : "#666",
                },
              ]}
            >
              {transformed.status}
            </Text>
          </View>
        </View>

        <View style={styles.servicesContainer}>
          {transformed.services.map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalAmount}>₹{transformed.totalAmount}</Text>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate("BookingDetail", { booking })}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#9370DB" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Error state
  if (error && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Upcoming", "Completed", "Cancelled"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.bookingsList}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </View>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => renderBookingCard(booking))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.noBookingsText}>
              No {activeTab.toLowerCase()} bookings
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  placeholder: {
    width: 32,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 15,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  activeTab: {
    backgroundColor: "#9370DB",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFF",
    fontWeight: "600",
  },
  bookingsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bookingCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  serviceTag: {
    backgroundColor: "#F8F0FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceText: {
    color: "#9370DB",
    fontSize: 12,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsButtonText: {
    fontSize: 14,
    color: "#9370DB",
    marginRight: 4,
  },
  bottomSpacing: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  noBookingsText: {
    textAlign: "center",
    marginTop: 15,
    color: "#666",
    fontSize: 16,
  },
  duration: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    textAlign: "center",
    color: "#dc2626",
    fontSize: 16,
    marginVertical: 15,
  },
  retryButton: {
    backgroundColor: "#9370DB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default UserBookings;
