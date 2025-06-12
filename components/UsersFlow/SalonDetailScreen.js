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
import DateTimePicker from "@react-native-community/datetimepicker";

// Sample salon data
const SALON_DATA = {
  id: "1",
  name: "Star Quality Cutz",
  rating: 4.8,
  reviewCount: 124,
  description: "Experience precision, style, and with",
  discount: "SAVE UP TO 20%",
  address: "123 Main Street, Downtown",
  distance: "0.8 miles away",
  openingHours: "9:00 AM - 8:00 PM",
  contact: "+1 (555) 123-4567",
};

// Sample services data
const SERVICES = [
  {
    id: "1",
    name: "Haircut",
    description: "Fresh cuts, style tailored for you.",
    price: 50.0,
    discount: "SAVE UP TO 20%",
  },
  {
    id: "2",
    name: "Makeup",
    description: "Professional makeup for any occasion.",
    price: 60.0,
    discount: "SAVE UP TO 15%",
  },
  {
    id: "3",
    name: "Beard Trim",
    description: "Shape and style your beard.",
    price: 25.0,
    discount: "SAVE UP TO 10%",
  },
  {
    id: "4",
    name: "Hair Coloring",
    description: "Premium colors with expert application.",
    price: 80.0,
    discount: "SAVE UP TO 15%",
  },
  {
    id: "5",
    name: "Face Treatment",
    description: "Rejuvenating facial care for all skin types.",
    price: 70.0,
    discount: "",
  },
];

// Sample portfolio images
const PORTFOLIO = [
  { id: "1", source: require("../../assets/placeholder.png") },
  { id: "2", source: require("../../assets/placeholder.png") },
  { id: "3", source: require("../../assets/placeholder.png") },
  { id: "4", source: require("../../assets/placeholder.png") },
];

// Sample reviews
const REVIEWS = [
  {
    id: "1",
    user: "Alex Johnson",
    rating: 5,
    comment:
      "Best haircut I've ever had! The stylist was very attentive to what I wanted.",
    date: "2 days ago",
  },
  {
    id: "2",
    user: "Sarah Williams",
    rating: 4,
    comment: "Great service and friendly staff. Will definitely come back.",
    date: "1 week ago",
  },
  {
    id: "3",
    user: "Michael Brown",
    rating: 5,
    comment: "Excellent experience from start to finish. Highly recommend!",
    date: "2 weeks ago",
  },
];

// Time slots for booking
const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
];

const SalonDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { salonId, salonName } = route.params || {
    salonId: "1",
    salonName: "Star Quality Cutz",
  };

  const [activeTab, setActiveTab] = useState("Services");
  const [cart, setCart] = useState([]);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");

  // Tabs for salon details
  const tabs = ["Services", "Reviews", "Portfolio", "Gift Card"];

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + item.price, 0);
  const bookingAmount = cartTotal * 0.2; // 20% booking amount

  // Add service to cart
  const addToCart = (service) => {
    setCart([...cart, service]);
    // Show a brief notification
    alert(`${service.name} added to cart!`);
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

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === "ios"); // Only hide on Android
    setSelectedDate(currentDate);
  };

  // Handle booking confirmation
  const confirmBooking = () => {
    // You would normally send this to your backend
    console.log("Booking confirmed:", {
      services: cart,
      date: selectedDate,
      time: selectedTime,
      salon: salonName,
      paymentMethod: paymentMethod,
      bookingAmount: bookingAmount,
      totalAmount: cartTotal,
    });

    // Close modal and show confirmation
    setPaymentModalVisible(false);
    // Reset cart after booking
    setCart([]);
    // You could navigate to a confirmation screen or show a success message
    alert(
      `Booking confirmed for ${selectedDate.toDateString()} at ${selectedTime}. ${
        paymentMethod === "online"
          ? "Booking amount of $" +
            bookingAmount.toFixed(2) +
            " paid successfully!"
          : "You'll pay full amount at the salon."
      }`
    );
  };

  // Render service item
  const renderServiceItem = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDescription}>{item.description}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.servicePrice}>${item.price.toFixed(2)}</Text>
          {item.discount ? (
            <Text style={styles.discountText}>{item.discount}</Text>
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() => addToCart(item)}
      >
        <Text style={styles.addToCartButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  // Render review item
  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item.user}</Text>
        <View style={styles.reviewRating}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < item.rating ? "star" : "star-outline"}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewDate}>{item.date}</Text>
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
        <Text style={styles.cartItemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="close-circle" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  // Render time slot item
  const renderTimeSlot = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.timeSlot,
        selectedTime === item && styles.selectedTimeSlot,
      ]}
      onPress={() => setSelectedTime(item)}
    >
      <Text
        style={[
          styles.timeSlotText,
          selectedTime === item && styles.selectedTimeSlotText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.salonName}>{SALON_DATA.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{SALON_DATA.rating}</Text>
          </View>
        </View>
        <Text style={styles.salonDescription}>{SALON_DATA.description}</Text>
        <Text style={styles.discountText}>{SALON_DATA.discount}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#777" />
          <Text style={styles.locationText}>{SALON_DATA.address}</Text>
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
            data={SERVICES}
            renderItem={renderServiceItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}

        {activeTab === "Reviews" && (
          <FlatList
            data={REVIEWS}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
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
              {SALON_DATA.name}.
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
                  <Text style={styles.cartTotal}>${cartTotal.toFixed(2)}</Text>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Appointment Time</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCheckoutModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.appointmentSummary}>
              <Text style={styles.appointmentSummaryTitle}>
                Booking Summary
              </Text>
              <Text style={styles.appointmentSummaryText}>
                {cart.length} {cart.length === 1 ? "service" : "services"} at{" "}
                {SALON_DATA.name}
              </Text>
              <Text style={styles.appointmentSummaryPrice}>
                Total: ${cartTotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerTitle}>Select Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerButtonText}>
                  {selectedDate.toDateString()}
                </Text>
                <Ionicons name="calendar" size={20} color="#9370DB" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.timeSlotContainer}>
              <Text style={styles.timeSlotTitle}>Select Time</Text>
              <FlatList
                data={TIME_SLOTS}
                renderItem={renderTimeSlot}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedTime && styles.disabledButton,
              ]}
              disabled={!selectedTime}
              onPress={togglePaymentModal}
            >
              <Text style={styles.confirmButtonText}>Continue to Payment</Text>
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
                <Text style={styles.bookingDetailValue}>{selectedTime}</Text>
              </View>

              <View style={styles.bookingDetail}>
                <Text style={styles.bookingDetailLabel}>Salon:</Text>
                <Text style={styles.bookingDetailValue}>{SALON_DATA.name}</Text>
              </View>

              <Text style={styles.bookingServicesTitle}>Services:</Text>
              {cart.map((service, index) => (
                <View key={index} style={styles.bookingService}>
                  <Text style={styles.bookingServiceName}>{service.name}</Text>
                  <Text style={styles.bookingServicePrice}>
                    ${service.price.toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.bookingTotalContainer}>
                <Text style={styles.bookingTotalLabel}>Total Amount:</Text>
                <Text style={styles.bookingTotal}>${cartTotal.toFixed(2)}</Text>
              </View>

              <View style={styles.bookingTotalContainer}>
                <Text style={styles.bookingTotalLabel}>
                  Booking Amount (20%):
                </Text>
                <Text style={styles.bookingTotal}>
                  ${bookingAmount.toFixed(2)}
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
                    Pay ${bookingAmount.toFixed(2)} now, remaining at salon
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
                  ? `Pay $${bookingAmount.toFixed(2)} & Confirm`
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
});

export default SalonDetailScreen;
