import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const SalonProfileScreen = ({ navigation }) => {
  const openGoogleMaps = () => {
    Linking.openURL(
      "https://maps.google.com/?q=Megapolis+Sparklet,+Rajiv+Gandhi+Infotech+Park,+Phase+3,+Hinjawadi,+Pune+411057"
    );
  };

  const SectionItem = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <Icon name={icon} size={22} color="#4B5563" />
        <Text style={styles.itemText}>{label}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );

  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Section: SALON DETAILS */}
        <View style={styles.card}>
          <View style={[styles.sectionHeader, { borderBottomWidth: 0 }]}>
            <Text style={styles.sectionTitle}>🏪 Salon Details</Text>
          </View>

          <View style={styles.sectionContent}>
            <View style={[styles.item, { borderBottomWidth: 0 }]}>
              <View style={styles.itemLeft}>
                <Icon name="store" size={22} color="#4B5563" />
                <Text style={styles.itemText}>Salon Name: Glow & Shine</Text>
              </View>
            </View>

            <SectionItem
              icon="location-on"
              label="View Address"
              onPress={openGoogleMaps}
            />
            <SectionItem
              icon="content-cut"
              label="Services Overview"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Section: SETTINGS */}
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => toggleSection("settings")}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>⚙️ Manage Settings</Text>
            <Icon
              name={
                expandedSection === "settings" ? "expand-less" : "expand-more"
              }
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
          {expandedSection === "settings" && (
            <View style={styles.sectionContent}>
              <SectionItem
                icon="edit"
                label="Edit Salon Info"
                onPress={() => navigation.navigate("EditSalonInfo")}
              />
              <SectionItem
                icon="cut"
                label="Edit Services"
                onPress={() => navigation.navigate("EditServices")}
              />
              <SectionItem
                icon="people"
                label="Manage Staff"
                onPress={() => navigation.navigate("ManageStaff")}
              />
              <SectionItem
                icon="access-time"
                label="Business Hours"
                onPress={() => navigation.navigate("BusinessHours")}
              />
              <SectionItem
                icon="event-busy"
                label="Block Dates"
                onPress={() => navigation.navigate("BlockDates")}
              />
            </View>
          )}
        </View>

        {/* Section: PAYMENT */}
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => toggleSection("payment")}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>💳 Bank / Payment</Text>
            <Icon
              name={
                expandedSection === "payment" ? "expand-less" : "expand-more"
              }
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
          {expandedSection === "payment" && (
            <View style={styles.sectionContent}>
              <SectionItem icon="account-balance" label="Bank Account Info" />
              <SectionItem icon="payment" label="UPI ID" />
              <SectionItem icon="edit" label="Edit Payout Details" />
              <SectionItem icon="receipt" label="Payout History" />
            </View>
          )}
        </View>

        {/* Section: SUPPORT */}
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => toggleSection("support")}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>💬 Support / Feedback</Text>
            <Icon
              name={
                expandedSection === "support" ? "expand-less" : "expand-more"
              }
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
          {expandedSection === "support" && (
            <View style={styles.sectionContent}>
              <SectionItem icon="help" label="Help Center / FAQ" />
              <SectionItem icon="chat" label="Chat with Support" />
              <SectionItem icon="report-problem" label="Report an Issue" />
              <SectionItem icon="feedback" label="Submit Feedback" />
            </View>
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Icon name="logout" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  sectionContent: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    fontSize: 15,
    color: "#1f2937",
    marginLeft: 12,
  },
  logoutSection: {
    marginTop: 16,
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default SalonProfileScreen;
