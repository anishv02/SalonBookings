import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const SeatsView = ({ onSeatSelect = () => {} }) => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Generate calendar dates for current month
  const generateCalendarDates = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
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

  // Updated sample data for seats - removed stylist names
  const seats = [
    {
      id: 1,
      number: "S01",
      isOccupied: true,
      customer: "Alice Johnson",
      startTime: "1:00 PM",
      endTime: "2:30 PM",
      services: ["Haircut", "Color"],
    },
    {
      id: 2,
      number: "S02",
      isOccupied: false,
      startTime: null,
      endTime: null,
      services: [],
    },
    {
      id: 3,
      number: "S03",
      isOccupied: true,
      customer: "Sarah Wilson",
      startTime: "2:00 PM",
      endTime: "4:00 PM",
      services: ["Styling", "Treatment"],
    },
    {
      id: 4,
      number: "S04",
      isOccupied: false,
      startTime: null,
      endTime: null,
      services: [],
    },
    {
      id: 5,
      number: "S05",
      isOccupied: true,
      customer: "Emma Davis",
      startTime: "12:30 PM",
      endTime: "3:15 PM",
      services: ["Haircut", "Wash"],
    },
    {
      id: 6,
      number: "S06",
      isOccupied: false,
      startTime: null,
      endTime: null,
      services: [],
    },
    {
      id: 7,
      number: "S07",
      isOccupied: true,
      customer: "Lisa Brown",
      startTime: "3:00 PM",
      endTime: "5:00 PM",
      services: ["Color", "Styling"],
    },
    {
      id: 8,
      number: "S08",
      isOccupied: false,
      startTime: null,
      endTime: null,
      services: [],
    },
  ];

  const handleSeatClick = (seat) => {
    console.log("Selected Seat:", seat);
    onSeatSelect(seat);
    navigation.navigate("CustomersView", { selectedSeat: seat.id });
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

  const occupiedSeats = seats.filter((seat) => seat.isOccupied).length;
  const availableSeats = seats.filter((seat) => !seat.isOccupied).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("SalonDashboard")}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Seats Management</Text>
            <Text style={styles.headerSubtitle}>
              Track seat occupancy and customer services
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
              <Icon name="event-seat" size={24} color="#16a34a" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statNumber}>{availableSeats}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#fee2e2" }]}
            >
              <Icon name="people" size={24} color="#dc2626" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statNumber}>{occupiedSeats}</Text>
              <Text style={styles.statLabel}>Occupied</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="grid-view" size={24} color="#3b82f6" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statNumber}>{seats.length}</Text>
              <Text style={styles.statLabel}>Total Seats</Text>
            </View>
          </View>
        </View>

        {/* Beautiful Date Picker */}
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

        {/* Enhanced Seats Grid */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.seatsGrid}>
            {seats.map((seat) => (
              <TouchableOpacity
                key={seat.id}
                onPress={() => handleSeatClick(seat)}
                style={[
                  styles.seatTile,
                  seat.isOccupied ? styles.occupiedSeat : styles.availableSeat,
                ]}
              >
                <View style={styles.seatContent}>
                  {/* Seat Header */}
                  <View style={styles.seatHeader}>
                    <View
                      style={[
                        styles.seatNumber,
                        {
                          backgroundColor: seat.isOccupied
                            ? "#dc2626"
                            : "#16a34a",
                        },
                      ]}
                    >
                      <Text style={styles.seatNumberText}>{seat.number}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusIndicator,
                        {
                          backgroundColor: seat.isOccupied
                            ? "#dc2626"
                            : "#16a34a",
                        },
                      ]}
                    />
                  </View>

                  {/* Customer Info (if occupied) */}
                  {seat.isOccupied && seat.customer && (
                    <View style={styles.customerInfo}>
                      <Icon name="person" size={18} color="#1f2937" />
                      <Text style={styles.customerName}>{seat.customer}</Text>
                    </View>
                  )}

                  {/* Time Info (if occupied) */}
                  {seat.isOccupied && seat.startTime && seat.endTime && (
                    <View style={styles.timeInfo}>
                      <Icon name="schedule" size={16} color="#6b7280" />
                      <Text style={styles.timeText}>
                        {seat.startTime} - {seat.endTime}
                      </Text>
                    </View>
                  )}

                  {/* Services (if occupied) */}
                  {seat.isOccupied && seat.services.length > 0 && (
                    <View style={styles.servicesContainer}>
                      {seat.services.slice(0, 2).map((service, index) => (
                        <View key={index} style={styles.serviceTag}>
                          <Text style={styles.serviceText}>{service}</Text>
                        </View>
                      ))}
                      {seat.services.length > 2 && (
                        <View style={styles.serviceTag}>
                          <Text style={styles.serviceText}>
                            +{seat.services.length - 2}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Upcoming entry for available seats */}
                  {!seat.isOccupied && seat.upcoming && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={{ fontWeight: "bold", color: "#9370DB" }}>
                        Upcoming Booking
                      </Text>
                      <Text style={{ color: "#1f2937", marginTop: 2 }}>
                        Name: {seat.upcoming.name}
                      </Text>
                      <Text style={{ color: "#6b7280", marginTop: 2 }}>
                        Time: {seat.upcoming.time}
                      </Text>
                      <Text style={{ color: "#6b7280", marginTop: 2 }}>
                        Services: {seat.upcoming.services.join(", ")}
                      </Text>
                    </View>
                  )}

                  {/* Status */}
                  <View
                    style={[
                      styles.statusContainer,
                      seat.isOccupied
                        ? styles.occupiedStatus
                        : styles.availableStatus,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: seat.isOccupied ? "#dc2626" : "#16a34a" },
                      ]}
                    >
                      {seat.isOccupied ? "Occupied" : "Available"}
                    </Text>
                  </View>
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

  // Beautiful Date Picker
  dateSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  datePickerBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  datePickerText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },

  // Calendar Styles
  calendarContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginTop: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  calendarDaysHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
    width: 40,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  calendarDate: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginBottom: 8,
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
    fontSize: 16,
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

  // Enhanced Seats Grid
  seatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  seatTile: {
    width: "48%",
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  // Occupied seat styling (red theme)
  occupiedSeat: {
    backgroundColor: "#fef2f2",
    borderColor: "#dc2626",
  },
  // Available seat styling (green theme)
  availableSeat: {
    backgroundColor: "#f0fdf4",
    borderColor: "#16a34a",
  },
  seatContent: {
    padding: 16,
  },
  seatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  seatNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  seatNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 6,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
    fontWeight: "500",
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
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  occupiedStatus: {
    backgroundColor: "#fee2e2",
  },
  availableStatus: {
    backgroundColor: "#dcfce7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Scroll Content
  scrollContent: {
    paddingBottom: 20,
  },
});
