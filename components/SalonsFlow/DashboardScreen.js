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
import { useNavigation } from "@react-navigation/native";

const { height: screenHeight } = Dimensions.get("window");

const LandingPage = ({ onNavigate }) => {
  const navigation = useNavigation();

  // Calculate available height for tiles (screen height minus header and padding)
  const availableHeight = screenHeight - 150; // Accounting for header, safe area, and padding
  const tileHeight = (availableHeight - 32) / 3; // 3 tiles with 16px spacing between them

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Salon Dashboard</Text>

        <View style={styles.tilesContainer}>
          {/* Seats Management Tile */}
          <TouchableOpacity
            style={[styles.tile, { height: tileHeight }]}
            onPress={() => navigation.navigate("seats")}
          >
            <View style={styles.tileContent}>
              <View style={styles.tileIconContainer}>
                <Icon name="event-seat" size={40} color="#9370DB" />
              </View>
              <View style={styles.tileTextContainer}>
                <Text style={styles.tileTitle}>Seats Management</Text>
                <Text style={styles.tileSubtitle}>
                  View and manage salon seats, stylists, and customer
                  appointments. Track availability and optimize seating
                  arrangements.
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Icon name="arrow-forward-ios" size={24} color="#9370DB" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Profile Tile */}
          <TouchableOpacity
            style={[styles.tile, { height: tileHeight }]}
            onPress={() => navigation.navigate("profile")}
          >
            <View style={styles.tileContent}>
              <View style={styles.tileIconContainer}>
                <Icon name="person" size={40} color="#9370DB" />
              </View>
              <View style={styles.tileTextContainer}>
                <Text style={styles.tileTitle}>Profile</Text>
                <Text style={styles.tileSubtitle}>
                  Manage your salon profile, settings, and preferences. Update
                  business information and customize your experience.
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Icon name="arrow-forward-ios" size={24} color="#9370DB" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Insights Tile */}
          <TouchableOpacity
            style={[styles.tile, { height: tileHeight }]}
            onPress={() => navigation.navigate("insights")}
          >
            <View style={styles.tileContent}>
              <View style={styles.tileIconContainer}>
                <Icon name="insights" size={40} color="#9370DB" />
              </View>
              <View style={styles.tileTextContainer}>
                <Text style={styles.tileTitle}>Insights & Analytics</Text>
                <Text style={styles.tileSubtitle}>
                  View comprehensive sales data, revenue analytics, and business
                  insights. Track performance and make data-driven decisions.
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Icon name="arrow-forward-ios" size={24} color="#9370DB" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 24,
    letterSpacing: 0.5,
  },

  // Landing Page Styles
  tilesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: "space-between",
  },
  tile: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  tileContent: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  tileIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#f8f6ff",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#9370DB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tileTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  tileTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  tileSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  arrowContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: "#f8f6ff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9370DB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default LandingPage;
