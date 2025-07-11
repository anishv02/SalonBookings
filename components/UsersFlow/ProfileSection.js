// screens/ProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_APPOINTMENTS = []; // or fetch from API if available

const ProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(route?.params?.user || null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    // Always fetch user from AsyncStorage (or context) if not passed via route
    if (!user) {
      import("@react-native-async-storage/async-storage").then(
        ({ default: AsyncStorage }) => {
          AsyncStorage.getItem("user")
            .then((data) => {
              if (data) setUser(JSON.parse(data));
            })
            .catch(() => {});
        }
      );
    }
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.replace("PhoneVerification"); // Navigate to phone verification screen
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const renderAppointmentItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.appointmentCard}
      onPress={() =>
        navigation.navigate("AppointmentDetail", { appointmentId: item.id })
      }
    >
      <View style={styles.appointmentHeader}>
        <Text style={styles.salonName}>{item.salonName}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "Completed"
              ? styles.completedStatus
              : styles.upcomingStatus,
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceText}>{item.service}</Text>
          <Text style={styles.appointmentTime}>
            {item.date} • {item.time}
          </Text>
        </View>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <MaterialIcons name="edit" size={20} color="#9370DB" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitials}>
                {user?.firstName?.charAt(0) || ""}
              </Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userPhone}>{user?.email}</Text>
            <Text style={styles.userPhone}>{user?.contactNumber}</Text>
          </View>
        </View>

        {/* Options Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => navigation.navigate("PersonalInfo")}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="person-outline" size={22} color="#9370DB" />
              </View>
              <Text style={styles.optionText}>Personal Info</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => navigation.navigate("SavedAddresses")}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="location-outline" size={22} color="#9370DB" />
              </View>
              <Text style={styles.optionText}>Saved Addresses</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => navigation.navigate("PaymentMethods")}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="card-outline" size={22} color="#9370DB" />
              </View>
              <Text style={styles.optionText}>Payment Methods</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.optionsContainer}>
            <View style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#9370DB"
                />
              </View>
              <Text style={styles.optionText}>Notifications</Text>
              <Switch
                trackColor={{ false: "#E0E0E0", true: "#D4C1F9" }}
                thumbColor={notificationsEnabled ? "#9370DB" : "#FFF"}
                onValueChange={toggleNotifications}
                value={notificationsEnabled}
              />
            </View>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => navigation.navigate("AppSettings")}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="settings-outline" size={22} color="#9370DB" />
              </View>
              <Text style={styles.optionText}>App Settings</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Appointments Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Appointments</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllAppointments")}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.appointmentsContainer}>
            {RECENT_APPOINTMENTS.map((item) => renderAppointmentItem(item))}
          </View>
        </View>

        {/* Help & Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Help & Support</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => navigation.navigate("HelpCenter")}
            >
              <View style={styles.optionIcon}>
                <Ionicons
                  name="help-circle-outline"
                  size={22}
                  color="#9370DB"
                />
              </View>
              <Text style={styles.optionText}>Help Center</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => navigation.navigate("ContactUs")}
            >
              <View style={styles.optionIcon}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={22}
                  color="#9370DB"
                />
              </View>
              <Text style={styles.optionText}>Contact Us</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              <View style={styles.optionIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#9370DB"
                />
              </View>
              <Text style={styles.optionText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home-outline" size={22} color="#999" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Favourite")}
        >
          <Ionicons name="heart-outline" size={22} color="#999" />
          <Text style={styles.tabText}>Favorite</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Message")}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#999" />
          <Text style={styles.tabText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, styles.activeTab]}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person" size={22} color="#9370DB" />
          <Text style={styles.activeTabText}>Profile</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFF",
    marginBottom: 15,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileInfo: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 14,
    color: "#9370DB",
  },
  optionsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  appointmentsContainer: {
    paddingHorizontal: 20,
  },
  appointmentCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  salonName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedStatus: {
    backgroundColor: "#E6F7EE",
  },
  upcomingStatus: {
    backgroundColor: "#FFF8E6",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#00A86B",
  },
  appointmentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  appointmentTime: {
    fontSize: 12,
    color: "#888",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9370DB",
  },
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 70,
  },
  bottomTabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    paddingVertical: 25,
  },
  tabItem: {
    alignItems: "center",
  },
  activeTab: {
    borderTopColor: "#9370DB",
  },
  tabText: {
    fontSize: 10,
    color: "#999",
    marginTop: 3,
  },
  activeTabText: {
    fontSize: 10,
    color: "#9370DB",
    marginTop: 3,
  },
});

export default ProfileScreen;
