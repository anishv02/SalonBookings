import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const BookingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { booking, isUpcoming } = route.params;
  const id = booking._id;

  console.log("Booking Details:", booking);
  console.log("Is Upcoming:", isUpcoming);

  // Helper function to check if booking is upcoming (fallback if not passed from parent)
  const checkIfUpcoming = () => {
    if (isUpcoming !== undefined) {
      return isUpcoming;
    }
    // Fallback check if isUpcoming wasn't passed
    const bookingStartTime = new Date(booking.startTime);
    const now = new Date();
    return (
      bookingStartTime > now &&
      (booking.status === "Booked" || booking.status === "Rescheduled")
    );
  };

  const isBookingUpcoming = checkIfUpcoming();

  const cancelBookingAPI = async (bookingId) => {
    try {
      const url = `https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/bookings/cancel/${bookingId}`;

      console.log("Cancelling booking URL:", url);
      console.log("Booking ID to cancel:", bookingId);

      const headers = {
        "Content-Type": "application/json",
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: headers,
      });

      const responseText = await response.text();
      console.log("Cancel booking response status:", response.status);
      console.log("Cancel booking response:", responseText);

      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = "Failed to cancel booking";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = responseText || errorMessage;
        }

        throw new Error(`${response.status}: ${errorMessage}`);
      }

      // Parse successful response
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.warn("Could not parse response as JSON:", parseError);
        responseData = { message: "Booking cancelled successfully" };
      }

      return responseData;
    } catch (error) {
      console.error("Cancel booking API error:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    if (!isBookingUpcoming) {
      Alert.alert("Cannot Cancel", "Only upcoming bookings can be cancelled.", [
        { text: "OK" },
      ]);
      return;
    }

    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelBookingAPI(id);
              Alert.alert(
                "Success",
                "Booking has been cancelled successfully.",
                [
                  {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to cancel booking. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    if (!isBookingUpcoming) {
      Alert.alert(
        "Cannot Reschedule",
        "Only upcoming bookings can be rescheduled.",
        [{ text: "OK" }]
      );
      return;
    }

    // Navigate to RescheduleBooking screen with booking data
    navigation.navigate("RescheduleBooking", {
      booking: booking,
      bookingId: id,
    });
  };

  // Determine display status
  const getDisplayStatus = () => {
    if (booking.status === "Cancelled") return "Cancelled";
    if (booking.status === "Booked") {
      const endTime = new Date(booking.endTime);
      const now = new Date();
      if (endTime <= now) return "Completed";
      return "Upcoming";
    }
    return booking.status;
  };

  const displayStatus = getDisplayStatus();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Salon Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Salon Information</Text>
          <View style={styles.card}>
            <Text style={styles.salonName}>{booking.shop}</Text>
            <Text style={styles.seatNumber}>Seat: {booking.seatNumber}</Text>
          </View>
        </View>

        {/* Booking Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Status</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  displayStatus === "Completed"
                    ? "#dcfce7"
                    : displayStatus === "Cancelled"
                    ? "#fee2e2"
                    : "#fff3cd",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    displayStatus === "Completed"
                      ? "#16a34a"
                      : displayStatus === "Cancelled"
                      ? "#dc2626"
                      : "#997404",
                },
              ]}
            >
              {displayStatus}
            </Text>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.card}>
            <View style={styles.timeRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.timeText}>
                {new Date(booking.startTime).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.timeText}>
                {new Date(booking.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -
                {new Date(booking.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <Text style={styles.duration}>
              Duration: {booking.totalDuration} minutes
            </Text>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Booked</Text>
          <View style={styles.card}>
            {booking.services.map((service, index) => (
              <View key={service._id} style={styles.serviceRow}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDuration}>
                    {service.duration} min
                  </Text>
                </View>
                <Text style={styles.servicePrice}>₹{service.price}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalPrice}>₹{booking.totalPrice}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons - Only show for upcoming bookings */}
        {isBookingUpcoming && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.rescheduleButton]}
              onPress={handleReschedule}
            >
              <Ionicons name="calendar-outline" size={20} color="#9370DB" />
              <Text style={styles.rescheduleButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Ionicons name="close-circle-outline" size={20} color="#dc2626" />
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info message for non-upcoming bookings */}
        {!isBookingUpcoming && (
          <View style={styles.infoContainer}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#666"
            />
            <Text style={styles.infoText}>
              {displayStatus === "Completed"
                ? "This booking has been completed."
                : displayStatus === "Cancelled"
                ? "This booking has been cancelled."
                : "Reschedule and cancel options are only available for upcoming bookings."}
            </Text>
          </View>
        )}
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  salonName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  seatNumber: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  duration: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  actionButtons: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#FFF",
    marginBottom: 10,
  },
  rescheduleButton: {
    borderWidth: 1,
    borderColor: "#9370DB",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  rescheduleButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#9370DB",
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
});

export default BookingDetailScreen;
