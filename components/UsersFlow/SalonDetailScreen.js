// screens/SalonDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  FlatList,
  Modal,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const SalonDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Get the full salon object from params
  const { salonData } = route.params || {};

  // Fallback if no data is passed
  const salon = salonData || {};
  const services = Array.isArray(salon.services)
    ? salon.services.map((s, idx) => ({
        id: s._id || idx.toString(),
        name: s.name,
        description: s.isCustom ? "Custom Service" : "",
        price: s.price || 0,
        duration: s.duration,
      }))
    : [];

  const [activeTab, setActiveTab] = useState("Services");
  const [cart, setCart] = useState([]);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [availableSlots, setAvailableSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [morningExpanded, setMorningExpanded] = useState(true);
  const [eveningExpanded, setEveningExpanded] = useState(true);
  const [afternoonExpanded, setAfternoonExpanded] = useState(true);

  // Tabs for salon details
  const tabs = ["Services", "Reviews", "Portfolio", "Gift Card"];

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + item.price, 0);
  const bookingAmount = 10; // 20% booking amount

  // Calculate total duration of selected services
  const totalDuration = cart.reduce(
    (sum, item) => sum + (item.duration || 0),
    0
  );

  // Add service to cart
  const addToCart = (service) => {
    setCart([...cart, service]);
    // alert(`${service.name} added to cart!`);
  };

  // Remove service from cart
  const removeFromCart = (serviceId) => {
    setCart(cart.filter((item) => item.id !== serviceId));
  };

  // Toggle the cart modal
  const toggleCartModal = () => {
    setCartModalVisible(!cartModalVisible);
  };

  // Toggle the checkout modal
  const toggleCheckoutModal = () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Please add services first.");
      return;
    }
    setCartModalVisible(false);
    setCheckoutModalVisible(!checkoutModalVisible);
  };

  // Toggle the payment modal
  const togglePaymentModal = () => {
    if (!selectedTime) {
      alert("Please select a time slot.");
      return;
    }
    setCheckoutModalVisible(false);
    setPaymentModalVisible(!paymentModalVisible);
  };

  // Helper: get available dates as Date objects
  const availableDates = Object.keys(availableSlots).map((d) => new Date(d));

  // Helper: check if a date is available
  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().slice(0, 10);
    return Object.keys(availableSlots).includes(dateStr);
  };

  // Modified onDateChange to only allow available dates
  const onDateChange = (event, selectedDateValue) => {
    const currentDate = selectedDateValue || new Date();
    setShowDatePicker(Platform.OS === "ios");
    if (isDateAvailable(currentDate)) {
      setSelectedDate(currentDate);
      setSelectedTime(null); // reset time when date changes
    } else {
      // Optionally show a message
      alert("No slots available for this date.");
    }
  };

  // Handle booking confirmation
  const confirmBooking = async () => {
    try {
      // Get user from AsyncStorage
      const userData = await import(
        "@react-native-async-storage/async-storage"
      ).then(({ default: AsyncStorage }) => AsyncStorage.getItem("user"));
      const userObj = userData ? JSON.parse(userData) : null;

      if (!userObj || !userObj._id) {
        alert("User not found. Please login again.");
        return;
      }

      if (!selectedTime) {
        alert("Please select a time slot.");
        return;
      }

      // Find the selected slot object for endTime
      const slotObj = slotsForDate.find(
        (slot) => slot.startTime === selectedTime
      );

      if (!slotObj) {
        alert("Selected slot not found.");
        return;
      }

      const bookingData = {
        user: userObj._id,
        shop: salon._id,
        services: cart.map((s) => ({
          name: s.name,
          price: s.price,
          duration: s.duration,
        })),
        startTime: slotObj.startTime,
        endTime: slotObj.endTime,
      };

      const res = await fetch(
        "http://13.233.157.248:5000/api/bookings/book-slot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Booking failed");
        return;
      }

      setPaymentModalVisible(false);
      setCart([]);
      alert("Booking confirmed!");
      // Optionally, navigate to a confirmation screen or show more details
    } catch (err) {
      alert("Error booking slot. Please try again.");
    }
  };

  // Fetch available slots when cart, selectedDate, or checkoutModalVisible changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!salon._id || !totalDuration || !checkoutModalVisible) return;
      setLoadingSlots(true);
      setSlotsError(null);
      try {
        // Use the new GET API for slots
        const url = `http://13.233.157.248:5000/api/bookings/available-slots?shopId=${salon._id}&duration=${totalDuration}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch slots");
        }
        const res = await response.json();
        console.log("Available slots API response:", res);
        // Assuming the API returns { results: { "YYYY-MM-DD": [slots] } }
        setAvailableSlots(res.results || {});
      } catch (err) {
        setSlotsError("Failed to fetch slots");
        setAvailableSlots({});
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [salon._id, totalDuration, selectedDate, checkoutModalVisible]);

  // Helper: get slots for selected date
  const slotsForDate =
    availableSlots[selectedDate.toISOString().slice(0, 10)] || [];

  // Render service item
  const renderServiceItem = ({ item }) => {
    const inCart = cart.some((cartItem) => cartItem.id === item.id);

    return (
      <View style={styles.serviceCard}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.serviceDescription}>{item.description}</Text>
          ) : null}
          <View style={styles.priceContainer}>
            <Text style={styles.servicePrice}>₹{item.price.toFixed(2)}</Text>
            {item.duration && (
              <Text style={styles.discountText}>{item.duration} min</Text>
            )}
          </View>
        </View>
        {inCart ? (
          <TouchableOpacity
            style={[styles.addToCartButton, { backgroundColor: "#FF6B6B" }]}
            onPress={() => removeFromCart(item.id)}
          >
            <Ionicons name="remove-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => addToCart(item)}
          >
            <Text style={styles.addToCartButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render review item (empty for now)
  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      {/* Placeholder for review content */}
      <Text style={styles.reviewComment}>No reviews yet.</Text>
    </View>
  );

  // Render portfolio item
  const renderPortfolioItem = ({ item }) => (
    <Image source={item.source} style={styles.portfolioImage} />
  );

  // Render cart item
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>₹{item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="close-circle" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  // Render time slot item (show only available slots)
  // const renderTimeSlot = ({ item }) => (
  //   <TouchableOpacity
  //     style={[
  //       styles.timeSlot,
  //       selectedTime === item.startTime && styles.selectedTimeSlot,
  //     ]}
  //     onPress={() => setSelectedTime(item.startTime)}
  //   >
  //     <Text
  //       style={[
  //         styles.timeSlotText,
  //         selectedTime === item.startTime && styles.selectedTimeSlotText,
  //       ]}
  //     >
  //       {new Date(item.startTime).toLocaleTimeString([], {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       })}{" "}
  //       -{" "}
  //       {new Date(item.endTime).toLocaleTimeString([], {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       })}
  //     </Text>
  //   </TouchableOpacity>
  // );

  // Add these helper functions after the existing helper functions (around line 95)
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

  console.log("availableslots", availableSlots);
  console.log("slotsForDate", slotsForDate);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header with image and info */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/placeholder.png")}
          style={styles.salonImage}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        {/* Cart Button */}
        <TouchableOpacity style={styles.cartButton} onPress={toggleCartModal}>
          <Ionicons name="cart" size={24} color="#fff" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {/* Salon Info */}
      <View style={styles.salonInfoContainer}>
        <View style={styles.salonNameRow}>
          <Text style={styles.salonName}>{salon.shopName || "Salon"}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{salon.rating || 0}</Text>
          </View>
        </View>
        <Text style={styles.salonDescription}>{salon.shopOwnerName}</Text>
        <Text style={styles.discountText}>{salon.salonType}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#777" />
          <Text style={styles.locationText}>
            {salon.address}, {salon.city}, {salon.state}
          </Text>
        </View>
      </View>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
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
      {/* Tab Content */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "Services" && (
          <FlatList
            data={services}
            renderItem={renderServiceItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}

        {activeTab === "Reviews" && (
          <View style={styles.reviewsSection}>
            <Text style={styles.reviewsTitle}>User Reviews</Text>
            <FlatList
              data={[]}
              renderItem={renderReviewItem}
              keyExtractor={(item, idx) => idx.toString()}
              ListEmptyComponent={
                <Text style={styles.noReviewsText}>
                  No reviews yet for this salon.
                </Text>
              }
              scrollEnabled={false}
            />
          </View>
        )}

        {activeTab === "Portfolio" && (
          <View style={styles.portfolioContainer}>
            <FlatList
              data={PORTFOLIO}
              renderItem={renderPortfolioItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.portfolioRow}
            />
          </View>
        )}

        {activeTab === "Gift Card" && (
          <View style={styles.giftCardContainer}>
            <Image
              source={require("../../assets/placeholder.png")}
              style={styles.giftCardImage}
            />
            <Text style={styles.giftCardTitle}>Gift a Service</Text>
            <Text style={styles.giftCardDescription}>
              Surprise someone special with a gift card for any service at{" "}
              {salon.shopName || "Salon"}.
            </Text>
            <TouchableOpacity style={styles.giftCardButton}>
              <Text style={styles.giftCardButtonText}>Purchase Gift Card</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="home-outline"
            size={24}
            color="#555"
            onPress={() => navigation.navigate("Home")}
          />
          <Text
            style={styles.navItemText}
            onPress={() => navigation.navigate("Home")}
          >
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="heart-outline" size={24} color="#555" />
          <Text style={styles.navItemText}>Favorite</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={24} color="#555" />
          <Text style={styles.navItemText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#555" />
          <Text style={styles.navItemText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Modal */}
      <Modal
        visible={cartModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleCartModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Cart</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleCartModal}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {cart.length > 0 ? (
              <>
                <FlatList
                  data={cart}
                  renderItem={renderCartItem}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  style={styles.cartList}
                />

                <View style={styles.cartTotalContainer}>
                  <Text style={styles.cartTotalLabel}>Total:</Text>
                  <Text style={styles.cartTotal}>₹{cartTotal.toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={toggleCheckoutModal}
                >
                  <Text style={styles.checkoutButtonText}>
                    Proceed to Checkout
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyCartContainer}>
                <Ionicons name="cart-outline" size={64} color="#ddd" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <Text style={styles.emptyCartSubText}>
                  Please add services to continue
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Checkout Modal (Date and Time Selection) */}
      <Modal
        visible={checkoutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            {/* Updated header with close icon on right */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book table</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCheckoutModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.restaurantName}>
              {salon.shopName || "Salon"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.appointmentSummary}>
                <Text style={styles.appointmentSummaryTitle}>
                  Booking Summary
                </Text>
                <Text style={styles.appointmentSummaryText}>
                  {cart.length} {cart.length === 1 ? "service" : "services"}{" "}
                  selected
                </Text>
                <Text style={styles.appointmentSummaryPrice}>
                  Total: ₹{cartTotal.toFixed(2)}
                </Text>
              </View>

              <View style={styles.dateSelectionContainer}>
                <Text style={styles.sectionTitle}>When are you visiting?</Text>
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
                Select the time of day to see the offers
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
                    <Text style={styles.mealTimeHours}>
                      08:00 AM to 12:00 PM
                    </Text>
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
                              new Date(slot.startTime).getHours() >= 8 &&
                              new Date(slot.startTime).getHours() < 12
                          )
                          .map((slot, index) => {
                            const startTime = new Date(slot.startTime);
                            const timeString = startTime.toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            );
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

              {/* Afternoon Slots Section */}
              <View style={styles.timeSlotSection}>
                <TouchableOpacity
                  style={styles.mealTimeHeader}
                  onPress={() => setAfternoonExpanded(!afternoonExpanded)}
                >
                  <View style={styles.mealTimeIcon}>
                    <Ionicons
                      name="partly-sunny-outline"
                      size={20}
                      color="#FFB300"
                    />
                  </View>
                  <View style={styles.mealTimeInfo}>
                    <Text style={styles.mealTimeTitle}>Afternoon Slots</Text>
                    <Text style={styles.mealTimeHours}>
                      12:00 PM to 06:00 PM
                    </Text>
                  </View>
                  <View style={styles.expandIcon}>
                    <Ionicons
                      name={afternoonExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#666"
                    />
                  </View>
                </TouchableOpacity>

                {afternoonExpanded && (
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
                              new Date(slot.startTime).getHours() >= 8 &&
                              new Date(slot.startTime).getHours() < 18
                          )
                          .map((slot, index) => {
                            const startTime = new Date(slot.startTime);
                            const timeString = startTime.toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            );
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
              <View style={styles.eveningSlotSection}>
                <TouchableOpacity
                  style={styles.mealTimeHeader}
                  onPress={() => setEveningExpanded(!eveningExpanded)}
                >
                  <View style={styles.mealTimeIcon}>
                    <Ionicons name="moon-outline" size={20} color="#6C63FF" />
                  </View>
                  <View style={styles.mealTimeInfo}>
                    <Text style={styles.mealTimeTitle}>Evening Slots</Text>
                    <Text style={styles.mealTimeHours}>
                      06:00 PM to 10:00 PM
                    </Text>
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
                            const timeString = startTime.toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            );
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

            <TouchableOpacity
              style={[
                styles.proceedButton,
                !selectedTime && styles.disabledProceedButton,
              ]}
              disabled={!selectedTime}
              onPress={togglePaymentModal}
            >
              <Text style={styles.proceedButtonText}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.bookingSummary}>
              <Text style={styles.bookingSummaryTitle}>Booking Details</Text>

              <View style={styles.bookingDetail}>
                <Text style={styles.bookingDetailLabel}>Date:</Text>
                <Text style={styles.bookingDetailValue}>
                  {selectedDate.toDateString()}
                </Text>
              </View>

              <View style={styles.bookingDetail}>
                <Text style={styles.bookingDetailLabel}>Time:</Text>
                <Text style={styles.bookingDetailValue}>
                  {selectedTime
                    ? new Date(selectedTime).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Kolkata",
                      })
                    : ""}
                </Text>
              </View>

              <View style={styles.bookingDetail}>
                <Text style={styles.bookingDetailLabel}>Salon:</Text>
                <Text style={styles.bookingDetailValue}>
                  {salon.shopName || "Salon"}
                </Text>
              </View>

              <Text style={styles.bookingServicesTitle}>Services:</Text>
              {cart.map((service, index) => (
                <View key={index} style={styles.bookingService}>
                  <Text style={styles.bookingServiceName}>{service.name}</Text>
                  <Text style={styles.bookingServicePrice}>
                    ₹{service.price.toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.bookingTotalContainer}>
                <Text style={styles.bookingTotalLabel}>Total Amount:</Text>
                <Text style={styles.bookingTotal}>₹{cartTotal.toFixed(2)}</Text>
              </View>

              <View style={styles.bookingTotalContainer}>
                <Text style={styles.bookingTotalLabel}>Booking Amount :</Text>
                <Text style={styles.bookingTotal}>
                  ₹{bookingAmount.toFixed(2)}
                </Text>
              </View>
            </View>

            <Text style={styles.paymentMethodTitle}>Select Payment Method</Text>

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === "online" && styles.selectedPaymentOption,
                ]}
                onPress={() => setPaymentMethod("online")}
              >
                <Ionicons
                  name="card-outline"
                  size={24}
                  color={paymentMethod === "online" ? "#9370DB" : "#777"}
                />
                <View style={styles.paymentOptionTextContainer}>
                  <Text
                    style={[
                      styles.paymentOptionText,
                      paymentMethod === "online" &&
                        styles.selectedPaymentOptionText,
                    ]}
                  >
                    Pay Booking Amount Online
                  </Text>
                  <Text style={styles.paymentOptionSubtext}>
                    Pay ₹{bookingAmount.toFixed(2)} now, remaining at salon
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === "salon" && styles.selectedPaymentOption,
                ]}
                onPress={() => setPaymentMethod("salon")}
              >
                <Ionicons
                  name="cash-outline"
                  size={24}
                  color={paymentMethod === "salon" ? "#9370DB" : "#777"}
                />
                <View style={styles.paymentOptionTextContainer}>
                  <Text
                    style={[
                      styles.paymentOptionText,
                      paymentMethod === "salon" &&
                        styles.selectedPaymentOptionText,
                    ]}
                  >
                    Pay at Salon
                  </Text>
                  <Text style={styles.paymentOptionSubtext}>
                    Pay full amount at the salon
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.confirmPaymentButton}
              onPress={confirmBooking}
            >
              <Text style={styles.confirmPaymentButtonText}>
                {paymentMethod === "online"
                  ? `Pay ₹${bookingAmount.toFixed(2)} & Confirm`
                  : "Confirm Booking"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "relative",
    height: 200,
  },
  salonImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cartButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  salonInfoContainer: {
    padding: 16,
  },
  salonNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  salonName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  ratingText: {
    color: "#333",
    marginLeft: 4,
    fontWeight: "bold",
  },
  salonDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  discountText: {
    fontSize: 12,
    color: "#9370DB",
    marginTop: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: "#777",
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#9370DB",
  },
  tabText: {
    fontSize: 14,
    color: "#777",
  },
  activeTabText: {
    color: "#333",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  serviceCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  serviceDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  addToCartButton: {
    backgroundColor: "#9370DB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addToCartButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  reviewCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  reviewRating: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  portfolioContainer: {
    flex: 1,
  },
  portfolioRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  portfolioImage: {
    width: "48%",
    height: 120,
    borderRadius: 10,
  },
  giftCardContainer: {
    alignItems: "center",
    padding: 16,
  },
  giftCardImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 16,
  },
  giftCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  giftCardDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  giftCardButton: {
    backgroundColor: "#9370DB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  giftCardButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  bottomNavBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  navItem: {
    alignItems: "center",
  },
  navItemText: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  cartList: {
    maxHeight: 300,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cartItemInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 10,
  },
  cartItemName: {
    fontSize: 16,
    color: "#333",
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  removeButton: {
    padding: 5,
  },
  cartTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9370DB",
  },
  checkoutButton: {
    backgroundColor: "#9370DB",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyCartContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  emptyCartSubText: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
    textAlign: "center",
  },
  appointmentSummary: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  appointmentSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  appointmentSummaryText: {
    fontSize: 14,
    color: "#555",
  },
  appointmentSummaryPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9370DB",
    marginTop: 8,
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  timeSlotContainer: {
    marginBottom: 20,
  },
  timeSlotTitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  timeSlot: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    minWidth: 80,
    alignItems: "center",
  },
  selectedTimeSlot: {
    backgroundColor: "#9370DB",
    borderColor: "#9370DB",
  },
  timeSlotText: {
    fontSize: 14,
    color: "#333",
  },
  selectedTimeSlotText: {
    color: "#fff",
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#9370DB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  bookingSummary: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  bookingSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  bookingDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bookingDetailLabel: {
    fontSize: 14,
    color: "#666",
  },
  bookingDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  bookingServicesTitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 8,
  },
  bookingService: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  bookingServiceName: {
    fontSize: 14,
    color: "#333",
  },
  bookingServicePrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  bookingTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  bookingTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  bookingTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9370DB",
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  paymentOptions: {
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 12,
  },
  selectedPaymentOption: {
    borderColor: "#9370DB",
    backgroundColor: "rgba(147, 112, 219, 0.1)",
  },
  paymentOptionTextContainer: {
    marginLeft: 12,
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedPaymentOptionText: {
    color: "#9370DB",
  },
  paymentOptionSubtext: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  confirmPaymentButton: {
    backgroundColor: "#9370DB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmPaymentButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewsSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  noReviewsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
  },
  restaurantName: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
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
  discountBadge: {
    position: "absolute",
    bottom: -6,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
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
  viewAllSlotsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  viewAllSlotsText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
    marginRight: 4,
  },
  eveningSlotSection: {
    marginBottom: 20,
  },
  proceedButton: {
    backgroundColor: "#9370DB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  disabledProceedButton: {
    backgroundColor: "#ccc",
  },
  proceedButtonText: {
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

export default SalonDetailScreen;
