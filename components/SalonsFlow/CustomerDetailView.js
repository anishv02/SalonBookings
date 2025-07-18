import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRoute, useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const CustomerDetailsView = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // Get params from navigation
  const { selectedCustomer, selectedSeat } = route.params || {};

  const calculateTotal = (services) => {
    return services.reduce((total, service) => total + service.price, 0);
  };

  // Now you can use selectedCustomer and selectedSeat throughout your component
  console.log("Selected Customer:", selectedCustomer);

  const total = calculateTotal(selectedCustomer.services);

  // Mock additional customer data (you can replace with actual data)
  const customerDetails = {
    phone: selectedCustomer.phone || "+91 98765 43210",
    email: selectedCustomer.email || "customer@example.com",
    address: selectedCustomer.address || "123 Main Street, City, State",
    lastVisit: selectedCustomer.lastVisit || "15 Jan 2025",
    totalVisits: selectedCustomer.totalVisits || 8,
    memberSince: selectedCustomer.memberSince || "Mar 2023",
    preferences: selectedCustomer.preferences || [
      "Hair Color",
      "Styling",
      "Spa",
    ],
    notes:
      selectedCustomer.notes ||
      "Prefers natural products. Allergic to sulfates.",
  };

  const StatusBadge = ({ status }) => (
    <View
      style={[
        styles.statusBadge,
        status === "confirmed"
          ? styles.confirmedBadge
          : status === "pending"
          ? styles.pendingBadge
          : styles.completedBadge,
      ]}
    >
      <Text
        style={[
          styles.statusText,
          status === "confirmed"
            ? styles.confirmedText
            : status === "pending"
            ? styles.pendingText
            : styles.completedText,
        ]}
      >
        {status?.toUpperCase() || "CONFIRMED"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CustomersView")}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{selectedCustomer.name}</Text>
            <Text style={styles.headerSubtitle}>Appointment Details</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Icon name="more-vert" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.detailsContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Customer Info Card */}
          <View style={styles.customerInfoCard}>
            <View style={styles.customerHeader}>
              <View style={styles.customerLargeAvatar}>
                <Icon name="person" size={36} color="white" />
              </View>
              <View style={styles.customerHeaderText}>
                <Text style={styles.customerHeaderName}>
                  {selectedCustomer.name}
                </Text>
                <View style={styles.customerHeaderTime}>
                  <Icon name="access-time" size={16} color="#6b7280" />
                  <Text style={styles.timeText}>{selectedCustomer.time}</Text>
                </View>
                <StatusBadge status={selectedCustomer.status} />
              </View>
            </View>

            <View style={styles.appointmentInfo}>
              <View style={styles.appointmentItem}>
                <Icon name="event-seat" size={20} color="#9370DB" />
                <Text style={styles.appointmentText}>
                  Seat: {selectedSeat?.number}
                </Text>
              </View>
              <View style={styles.appointmentItem}>
                <Icon name="person-outline" size={20} color="#9370DB" />
                <Text style={styles.appointmentText}>
                  Stylist: {selectedSeat?.stylist}
                </Text>
              </View>
              <View style={styles.appointmentItem}>
                <Icon name="schedule" size={20} color="#9370DB" />
                <Text style={styles.appointmentText}>Duration: 2 hours</Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact Information</Text>
            <View style={styles.contactItem}>
              <Icon name="phone" size={20} color="#9370DB" />
              <Text style={styles.contactText}>{customerDetails.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="email" size={20} color="#9370DB" />
              <Text style={styles.contactText}>{customerDetails.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="location-on" size={20} color="#9370DB" />
              <Text style={styles.contactText}>{customerDetails.address}</Text>
            </View>
          </View>

          {/* Services */}
          <View style={styles.servicesCard}>
            <Text style={styles.servicesTitle}>
              <Icon
                name="content-cut"
                size={20}
                color="#9370DB"
                style={styles.titleIcon}
              />
              Services Booked
            </Text>

            {selectedCustomer.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>
                    {service.description ||
                      "Professional service with premium products"}
                  </Text>
                </View>
                <View style={styles.servicePrice}>
                  <Text style={styles.servicePriceText}>₹{service.price}</Text>
                  <Text style={styles.serviceDuration}>
                    {service.duration || "45 min"}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>₹{total}</Text>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CustomerDetailsView;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#9370DB",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e0e7ff",
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  customerInfoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  customerLargeAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#9370DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  customerHeaderText: {
    flex: 1,
  },
  customerHeaderName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 5,
  },
  customerHeaderTime: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  confirmedBadge: {
    backgroundColor: "#dcfce7",
  },
  pendingBadge: {
    backgroundColor: "#fef3c7",
  },
  completedBadge: {
    backgroundColor: "#dbeafe",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  confirmedText: {
    color: "#16a34a",
  },
  pendingText: {
    color: "#d97706",
  },
  completedText: {
    color: "#2563eb",
  },
  appointmentInfo: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 20,
  },
  appointmentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 10,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  titleIcon: {
    marginRight: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  contactText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 15,
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#9370DB",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 10,
  },
  servicesCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  serviceInfo: {
    flex: 1,
    marginRight: 15,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  servicePrice: {
    alignItems: "flex-end",
  },
  servicePriceText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9370DB",
  },
  serviceDuration: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#9370DB",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#9370DB",
  },
  preferencesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  preferenceTag: {
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  preferenceText: {
    fontSize: 14,
    color: "#9370DB",
    fontWeight: "500",
  },
  notesText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#9370DB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 0.48,
    shadowColor: "#9370DB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 0.48,
    borderWidth: 2,
    borderColor: "#9370DB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: "#9370DB",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});
