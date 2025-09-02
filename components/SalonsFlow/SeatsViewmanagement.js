import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../../utils/authStorage";
import {
  scale,
  verticalScale,
  moderateScale,
  responsiveFontSize,
} from "../../responsive";

const { width } = Dimensions.get("window");

const font = (size) =>
  Platform.OS === "android"
    ? responsiveFontSize(size * 0.92)
    : responsiveFontSize(size);

// Simplified SeatsView - just show seat numbers, click to see bookings
const SeatsView = ({ onSeatSelect = () => {}, seatCount }) => {
  const navigation = useNavigation();
  const route = useRoute();

  // prefer explicit prop, then route param (from DashboardScreen), then default 8
  const finalSeatCount = Number(seatCount ?? route?.params?.seatCount ?? 8);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [seatsState, setSeatsState] = useState(() =>
    generateSeats(finalSeatCount)
  );

  useEffect(() => {
    // regenerate seats when seat count changes
    setSeatsState(generateSeats(finalSeatCount));
  }, [finalSeatCount]);

  // Generate calendar dates for current month
  const generateCalendarDates = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const dates = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // generate simple seats array based on finalSeatCount
  function generateSeats(count) {
    const arr = [];
    for (let i = 1; i <= count; i++) {
      arr.push({
        id: i,
        number: `S${String(i).padStart(2, "0")}`,
      });
    }
    return arr;
  }

  const handleSeatClick = (seat) => {
    onSeatSelect(seat);
    // Navigate to bookings list for this seat and selected date
    navigation.navigate("CustomersView", {
      selectedSeat: seat.id,
      selectedDate: selectedDate,
      seatNumber: seat.number,
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isSameMonth = (date) => {
    const currentMonth = new Date().getMonth();
    return date.getMonth() === currentMonth;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("SalonDashboard")}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={scale(24)} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Seats Management</Text>
            <Text style={styles.headerSubtitle}>
              Select a seat to view bookings
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" size={scale(24)} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Total Seats Info */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="grid-view" size={24} color="#3b82f6" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statNumber}>{seatsState.length}</Text>
              <Text style={styles.statLabel}>Total Seats</Text>
            </View>
          </View>
        </View>

        {/* Date Picker */}
        <View style={styles.dateSection}>
          <TouchableOpacity
            onPress={() => setShowCalendar(!showCalendar)}
            style={styles.datePickerBtn}
          >
            <View style={styles.datePickerContent}>
              <Icon name="calendar-today" size={20} color="#9370DB" />
              <Text style={styles.datePickerText}>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Icon
                name={
                  showCalendar ? "keyboard-arrow-up" : "keyboard-arrow-down"
                }
                size={20}
                color="#9370DB"
              />
            </View>
          </TouchableOpacity>

          {showCalendar && (
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>
                  {monthNames[selectedDate.getMonth()]}{" "}
                  {selectedDate.getFullYear()}
                </Text>
              </View>

              <View style={styles.calendarDaysHeader}>
                {dayNames.map((day) => (
                  <Text key={day} style={styles.dayHeaderText}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarDates.map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleDateSelect(date)}
                    style={[
                      styles.calendarDate,
                      isSelected(date) && styles.selectedDate,
                      isToday(date) && !isSelected(date) && styles.todayDate,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarDateText,
                        !isSameMonth(date) && styles.otherMonthText,
                        isSelected(date) && styles.selectedDateText,
                        isToday(date) &&
                          !isSelected(date) &&
                          styles.todayDateText,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Simplified Seats Grid */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.seatsGrid}>
            {seatsState.map((seat) => (
              <TouchableOpacity
                key={seat.id}
                onPress={() => handleSeatClick(seat)}
                style={styles.seatTile}
              >
                <View style={styles.seatContent}>
                  <View style={styles.seatIconContainer}>
                    <Icon name="event-seat" size={32} color="#9370DB" />
                  </View>
                  <Text style={styles.seatNumber}>{seat.number}</Text>
                  <Text style={styles.seatLabel}>Tap to view bookings</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SeatsView;

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
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(15),
    borderBottomLeftRadius: scale(25),
    borderBottomRightRadius: scale(25),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(8),
    elevation: 8,
  },
  backButton: {
    padding: moderateScale(8),
    borderRadius: scale(8),
  },
  headerText: {
    flex: 1,
    marginLeft: moderateScale(15),
  },
  headerTitle: {
    fontSize: font(22),
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: font(14),
    color: "#e0e7ff",
    marginTop: verticalScale(2),
  },
  notificationButton: {
    padding: moderateScale(8),
    borderRadius: scale(8),
  },

  // Stats Cards - simplified to show only total seats
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(20),
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: scale(16),
    padding: moderateScale(16),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
    minWidth: scale(150),
  },
  statIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(12),
  },
  statTextContainer: {
    flex: 1,
  },
  statNumber: {
    fontSize: font(20),
    fontWeight: "700",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: font(12),
    color: "#6b7280",
    marginTop: verticalScale(2),
  },

  // Beautiful Date Picker
  dateSection: {
    paddingHorizontal: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  datePickerBtn: {
    backgroundColor: "#ffffff",
    borderRadius: scale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  datePickerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: moderateScale(16),
    justifyContent: "space-between",
  },
  datePickerText: {
    fontSize: font(16),
    color: "#1f2937",
    fontWeight: "600",
    flex: 1,
    marginLeft: moderateScale(12),
  },

  // Calendar Styles
  calendarContainer: {
    backgroundColor: "#ffffff",
    borderRadius: scale(16),
    marginTop: verticalScale(8),
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  calendarHeader: {
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  calendarTitle: {
    fontSize: font(18),
    fontWeight: "700",
    color: "#1f2937",
  },
  calendarDaysHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: verticalScale(12),
  },
  dayHeaderText: {
    fontSize: font(14),
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
    width: scale(40),
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  calendarDate: {
    width: scale(40),
    height: scale(40),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: scale(20),
    marginBottom: verticalScale(8),
  },
  selectedDate: {
    backgroundColor: "#9370DB",
  },
  todayDate: {
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#9370DB",
  },
  calendarDateText: {
    fontSize: font(16),
    color: "#1f2937",
    fontWeight: "500",
  },
  selectedDateText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  todayDateText: {
    color: "#9370DB",
    fontWeight: "700",
  },
  otherMonthText: {
    color: "#d1d5db",
  },

  // Simplified Seats Grid
  seatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(20),
  },
  seatTile: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: scale(20),
    borderWidth: 2,
    borderColor: "#9370DB",
    marginBottom: verticalScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(8),
    elevation: 5,
    overflow: "hidden",
  },
  seatContent: {
    padding: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
    minHeight: scale(120),
  },
  seatIconContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: "#f3f0ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  seatNumber: {
    fontSize: font(18),
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: verticalScale(8),
  },
  seatLabel: {
    fontSize: font(12),
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },

  // Scroll Content
  scrollContent: {
    paddingBottom: verticalScale(20),
  },
});
