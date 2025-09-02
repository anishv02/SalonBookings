import React, { useState, useEffect } from "react";
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

const RescheduleBooking = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { booking, bookingId } = route.params;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [morningExpanded, setMorningExpanded] = useState(true);
  const [afternoonExpanded, setAfternoonExpanded] = useState(true);
  const [eveningExpanded, setEveningExpanded] = useState(true);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  console.log("Reschedule booking:", booking);
  console.log("Booking ID:", bookingId);

  // Calculate total duration from booking services
  const totalDuration =
    booking.services?.reduce(
      (sum, service) => sum + (service.duration || 0),
      0
    ) ||
    booking.totalDuration ||
    30;

  // Get shop ID from booking (assuming it's stored in booking.shop or similar)
  const shopId = booking.shopId || booking.shop?._id || booking.shop;

  // Fetch available slots when component loads or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!shopId || !totalDuration) {
        console.warn("Missing shopId or totalDuration");
        return;
      }

      setLoadingSlots(true);
      setSlotsError(null);

      try {
        const url = `https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/bookings/available-slots?shopId=${shopId}&duration=${totalDuration}`;
        console.log("Fetching slots from:", url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();
        console.log("Slots response:", res);
        setAvailableSlots(res.results || {});
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        setSlotsError("Failed to fetch available slots");
        setAvailableSlots({});
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [shopId, totalDuration]);

  // Get available dates (today, tomorrow, day after tomorrow)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    const currentHour = today.getHours();

    // Add today only if current time is before 10 PM and slots are available
    if (currentHour < 22) {
      dates.push(today);
    }

    // Add next day
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    dates.push(nextDay);

    // Add day after next
    const dayAfterNext = new Date(today);
    dayAfterNext.setDate(today.getDate() + 2);
    dates.push(dayAfterNext);

    return dates;
  };

  const formatDateForDisplay = (date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    if (diffDays === 0) {
      return {
        day: "Today",
        date: `${date.getDate()} ${monthNames[date.getMonth()]}`,
      };
    } else if (diffDays === 1) {
      return {
        day: "Tomorrow",
        date: `${date.getDate()} ${monthNames[date.getMonth()]}`,
      };
    } else {
      return {
        day: dayNames[date.getDay()],
        date: `${date.getDate()} ${monthNames[date.getMonth()]}`,
      };
    }
  };

  // Helper: get slots for selected date
  const slotsForDate =
    availableSlots[selectedDate.toISOString().slice(0, 10)] || [];

  // Reschedule booking API call
  const rescheduleBookingAPI = async (bookingId, newStartTime, newEndTime) => {
    try {
      const url = `https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/bookings/reschedule/${bookingId}`;

      console.log("Rescheduling booking URL:", url);
      console.log("New times:", { newStartTime, newEndTime });

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newStartTime,
          newEndTime,
        }),
      });

      const responseText = await response.text();
      console.log("Reschedule response status:", response.status);
      console.log("Reschedule response:", responseText);

      if (!response.ok) {
        let errorMessage = "Failed to reschedule booking";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(`${response.status}: ${errorMessage}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.warn("Could not parse response as JSON:", parseError);
        responseData = { message: "Booking rescheduled successfully" };
      }

      return responseData;
    } catch (error) {
      console.error("Reschedule booking API error:", error);
      throw error;
    }
  };

  const handleReschedule = async () => {
    if (!selectedTime) {
      Alert.alert("Error", "Please select a time slot.");
      return;
    }

    // Find the selected slot object for endTime
    const slotObj = slotsForDate.find(
      (slot) => slot.startTime === selectedTime
    );
    if (!slotObj) {
      Alert.alert("Error", "Selected slot not found.");
      return;
    }

    Alert.alert(
      "Confirm Reschedule",
      `Are you sure you want to reschedule this booking to ${
        formatDateForDisplay(selectedDate).day
      }, ${formatDateForDisplay(selectedDate).date} at ${new Date(
        selectedTime
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reschedule",
          style: "default",
          onPress: async () => {
            setRescheduleLoading(true);
            try {
              await rescheduleBookingAPI(
                bookingId,
                slotObj.startTime,
                slotObj.endTime
              );

              Alert.alert(
                "Success",
                "Booking has been rescheduled successfully!",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Navigate back to booking details or bookings list
                      navigation.goBack();
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to reschedule booking. Please try again.",
                [{ text: "OK" }]
              );
            } finally {
              setRescheduleLoading(false);
            }
          },
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Reschedule Booking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Booking Info */}
        <View style={styles.currentBookingContainer}>
          <Text style={styles.currentBookingTitle}>Current Booking</Text>
          <View style={styles.currentBookingCard}>
            <Text style={styles.currentBookingDate}>
              {new Date(booking.startTime).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={styles.currentBookingTime}>
              {new Date(booking.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(booking.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Text style={styles.currentBookingSalon}>
              {booking.shop?.name || booking.shop || "Salon"}
            </Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.dateSelectionContainer}>
          <Text style={styles.sectionTitle}>Select New Date</Text>
          <View style={styles.dateButtonsContainer}>
            {getAvailableDates().map((date, index) => {
              const dateInfo = formatDateForDisplay(date);
              const isSelected =
                selectedDate.toDateString() === date.toDateString();

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateButton,
                    isSelected && styles.selectedDateButton,
                  ]}
                  onPress={() => {
                    setSelectedDate(date);
                    setSelectedTime(null); // Reset time when date changes
                  }}
                >
                  <Text
                    style={[
                      styles.dateButtonDay,
                      isSelected && styles.selectedDateButtonDay,
                    ]}
                  >
                    {dateInfo.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateButtonDate,
                      isSelected && styles.selectedDateButtonDate,
                    ]}
                  >
                    {dateInfo.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.timeSelectionHint}>
          Select your preferred time slot
        </Text>

        {/* Morning Slots Section */}
        <View style={styles.timeSlotSection}>
          <TouchableOpacity
            style={styles.mealTimeHeader}
            onPress={() => setMorningExpanded(!morningExpanded)}
          >
            <View style={styles.mealTimeIcon}>
              <Ionicons name="sunny-outline" size={20} color="#FF6B35" />
            </View>
            <View style={styles.mealTimeInfo}>
              <Text style={styles.mealTimeTitle}>Morning Slots</Text>
              <Text style={styles.mealTimeHours}>08:00 AM to 12:00 PM</Text>
            </View>
            <View style={styles.expandIcon}>
              <Ionicons
                name={morningExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </View>
          </TouchableOpacity>
          {morningExpanded && (
            <>
              {loadingSlots ? (
                <Text style={styles.loadingText}>Loading slots...</Text>
              ) : slotsError ? (
                <Text style={styles.errorText}>{slotsError}</Text>
              ) : slotsForDate.length === 0 ? (
                <Text style={styles.noSlotsText}>
                  No slots available for this date.
                </Text>
              ) : (
                <View style={styles.timeButtonsGrid}>
                  {slotsForDate
                    .filter(
                      (slot) =>
                        new Date(slot.startTime).getHours() >= 12 &&
                        new Date(slot.startTime).getHours() < 18
                    )
                    .map((slot, index) => {
                      const startTime = new Date(slot.startTime);
                      const timeString = startTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const isSelected = selectedTime === slot.startTime;

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.timeButton,
                            isSelected && styles.selectedTimeButton,
                          ]}
                          onPress={() => setSelectedTime(slot.startTime)}
                        >
                          <Text
                            style={[
                              styles.timeButtonText,
                              isSelected && styles.selectedTimeButtonText,
                            ]}
                          >
                            {timeString}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              )}
            </>
          )}
        </View>

        {/* Evening Slots Section */}
        <View style={styles.timeSlotSection}>
          <TouchableOpacity
            style={styles.mealTimeHeader}
            onPress={() => setEveningExpanded(!eveningExpanded)}
          >
            <View style={styles.mealTimeIcon}>
              <Ionicons name="moon-outline" size={20} color="#6C63FF" />
            </View>
            <View style={styles.mealTimeInfo}>
              <Text style={styles.mealTimeTitle}>Evening Slots</Text>
              <Text style={styles.mealTimeHours}>06:00 PM to 10:00 PM</Text>
            </View>
            <View style={styles.expandIcon}>
              <Ionicons
                name={eveningExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </View>
          </TouchableOpacity>

          {eveningExpanded && (
            <>
              {loadingSlots ? (
                <Text style={styles.loadingText}>Loading slots...</Text>
              ) : slotsError ? (
                <Text style={styles.errorText}>{slotsError}</Text>
              ) : slotsForDate.length === 0 ? (
                <Text style={styles.noSlotsText}>
                  No slots available for this date.
                </Text>
              ) : (
                <View style={styles.timeButtonsGrid}>
                  {slotsForDate
                    .filter(
                      (slot) =>
                        new Date(slot.startTime).getHours() >= 18 &&
                        new Date(slot.startTime).getHours() < 22
                    )
                    .map((slot, index) => {
                      const startTime = new Date(slot.startTime);
                      const timeString = startTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const isSelected = selectedTime === slot.startTime;

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.timeButton,
                            isSelected && styles.selectedTimeButton,
                          ]}
                          onPress={() => setSelectedTime(slot.startTime)}
                        >
                          <Text
                            style={[
                              styles.timeButtonText,
                              isSelected && styles.selectedTimeButtonText,
                            ]}
                          >
                            {timeString}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Reschedule Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.rescheduleButton,
            (!selectedTime || rescheduleLoading) && styles.disabledButton,
          ]}
          disabled={!selectedTime || rescheduleLoading}
          onPress={handleReschedule}
        >
          <Text style={styles.rescheduleButtonText}>
            {rescheduleLoading ? "Rescheduling..." : "Reschedule Booking"}
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
  currentBookingContainer: {
    marginBottom: 24,
  },
  currentBookingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  currentBookingCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  currentBookingDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  currentBookingTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  currentBookingSalon: {
    fontSize: 14,
    color: "#9370DB",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  dateSelectionContainer: {
    marginBottom: 24,
  },
  dateButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateButton: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 70,
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedDateButton: {
    backgroundColor: "#FFF4F0",
    borderColor: "#FF6B35",
  },
  dateButtonDay: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  selectedDateButtonDay: {
    color: "#FF6B35",
    fontWeight: "bold",
  },
  dateButtonDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  selectedDateButtonDate: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  timeSelectionHint: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  timeSlotSection: {
    marginBottom: 20,
  },
  mealTimeHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  mealTimeIcon: {
    marginRight: 12,
  },
  mealTimeInfo: {
    flex: 1,
  },
  mealTimeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  mealTimeHours: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  expandIcon: {
    padding: 4,
  },
  timeButtonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeButton: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minWidth: "30%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedTimeButton: {
    backgroundColor: "#FFF4F0",
    borderColor: "#FF6B35",
  },
  timeButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  selectedTimeButtonText: {
    color: "#FF6B35",
    fontWeight: "bold",
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  rescheduleButton: {
    backgroundColor: "#9370DB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  rescheduleButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    paddingVertical: 20,
  },
  errorText: {
    textAlign: "center",
    color: "#FF6B6B",
    fontSize: 14,
    paddingVertical: 20,
  },
  noSlotsText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    paddingVertical: 20,
  },
});

export default RescheduleBooking;
