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
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeToken } from "../../utils/authStorage";

const ProfileScreen = ({ route }) => {
  console.log("route", route.params);
  const navigation = useNavigation();
  const [user, setUser] = useState(route?.params?.user || null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isPersonalInfoVisible, setPersonalInfoVisible] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Always fetch user from AsyncStorage (or context) if not passed via route
    if (!user) {
      loadUserData();
    }
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditedUser(parsedUser);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleEditProfile = () => {
    const userData = {
      name: user?.name || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      contactNumber: user?.contactNumber || "",
      dateOfBirth: user?.dateOfBirth || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      pincode: user?.pincode || "",
    };
    setEditedUser(userData);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedUser({});
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!editedUser.name || !editedUser.email || !editedUser.contactNumber) {
        Alert.alert(
          "Error",
          "Please fill in all required fields (Name, Email, Contact Number)"
        );
        setIsLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editedUser.email)) {
        Alert.alert("Error", "Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      // Phone validation (basic)
      const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
      if (!phoneRegex.test(editedUser.contactNumber)) {
        Alert.alert("Error", "Please enter a valid contact number");
        setIsLoading(false);
        return;
      }

      // Create updated user object
      const updatedUser = {
        ...editedUser,
        firstName: editedUser.firstName || editedUser.name.split(" ")[0],
        lastName:
          editedUser.lastName || editedUser.name.split(" ").slice(1).join(" "),
      };

      // determine userId: prefer route param, then current user state, then editedUser._id
      const userIdFromRoute = route?.params?.user?._id || route?.params?.userId;
      const userId = userIdFromRoute || user?._id || updatedUser._id;

      if (!userId) {
        // fallback to local save if no id available
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditMode(false);
        Alert.alert("Success", "Profile updated locally (no userId).");
        setIsLoading(false);
        return;
      }

      // Call PATCH API to update user on server
      const apiUrl = `https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/users/${userId}`;
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      const resJson = await res.json();

      if (!res.ok) {
        const message = resJson?.message || resJson?.error || "Update failed";
        Alert.alert("Error", message);
        setIsLoading(false);
        return;
      }

      // Update AsyncStorage and local state with returned user object if available
      const savedUser = resJson?.user || resJson || updatedUser;
      await AsyncStorage.setItem("user", JSON.stringify(savedUser));
      setUser(savedUser);
      setIsEditMode(false);

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Remove the JWT token and user data from storage
      await removeToken();

      // Navigate to Login screen and reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    } else if (user?.name) {
      const nameParts = user.name.split(" ");
      if (nameParts.length >= 2) {
        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
      }
      return user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  const renderPersonalInfoScreen = () => (
    <Modal
      visible={isPersonalInfoVisible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                if (isEditMode) {
                  handleCancelEdit();
                } else {
                  setPersonalInfoVisible(false);
                }
              }}
              style={styles.modalCancelButton}
            >
              <Ionicons name="arrow-back" size={24} color="#9370DB" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Personal Information</Text>
            <TouchableOpacity
              onPress={() => {
                if (isEditMode) {
                  handleSaveProfile();
                } else {
                  handleEditProfile();
                }
              }}
              style={styles.modalSaveButton}
              disabled={isLoading}
            >
              <Text style={styles.modalSaveText}>
                {isLoading ? "Saving..." : isEditMode ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Image */}
            <View style={styles.modalProfileImageContainer}>
              <View style={styles.modalProfileImage}>
                <Text style={styles.modalProfileInitials}>{getInitials()}</Text>
              </View>
              {isEditMode && (
                <TouchableOpacity style={styles.modalCameraButton}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            <View style={styles.formContainer}>
              {isEditMode ? (
                // Edit Mode - Form Fields
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editedUser.name}
                      onChangeText={(text) =>
                        setEditedUser({ ...editedUser, name: text })
                      }
                      placeholder="Enter your full name"
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editedUser.email}
                      onChangeText={(text) =>
                        setEditedUser({ ...editedUser, email: text })
                      }
                      placeholder="Enter your email"
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Contact Number *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editedUser.contactNumber}
                      onChangeText={(text) =>
                        setEditedUser({ ...editedUser, contactNumber: text })
                      }
                      placeholder="Enter your phone number"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Date of Birth</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editedUser.dateOfBirth}
                      onChangeText={(text) =>
                        setEditedUser({ ...editedUser, dateOfBirth: text })
                      }
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Address</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={editedUser.address}
                      onChangeText={(text) =>
                        setEditedUser({ ...editedUser, address: text })
                      }
                      placeholder="Enter your address"
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>City</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editedUser.city}
                        onChangeText={(text) =>
                          setEditedUser({ ...editedUser, city: text })
                        }
                        placeholder="City"
                        placeholderTextColor="#999"
                      />
                    </View>

                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>State</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editedUser.state}
                        onChangeText={(text) =>
                          setEditedUser({ ...editedUser, state: text })
                        }
                        placeholder="State"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>PIN Code</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editedUser.pincode}
                      onChangeText={(text) =>
                        setEditedUser({ ...editedUser, pincode: text })
                      }
                      placeholder="Enter PIN code"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                </>
              ) : (
                // View Mode - Display Information
                <View style={styles.personalInfoContainer}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Full Name</Text>
                    <Text style={styles.detailValue}>
                      {user?.name || "Not specified"}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Email Address</Text>
                    <Text style={styles.detailValue}>
                      {user?.email || "Not specified"}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Contact Number</Text>
                    <Text style={styles.detailValue}>
                      {user?.contactNumber || "Not specified"}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date of Birth</Text>
                    <Text style={styles.detailValue}>
                      {user?.dateOfBirth || "Not specified"}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>
                      {user?.address || "Not specified"}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>City</Text>
                    <Text style={styles.detailValue}>
                      {user?.city || "Not specified"}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>State</Text>
                    <Text style={styles.detailValue}>
                      {user?.state || "Not specified"}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>PIN Code</Text>
                    <Text style={styles.detailValue}>
                      {user?.pincode || "Not specified"}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.bottomSpacing} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
  <Modal
    visible={isEditModalVisible}
    animationType="slide"
    presentationStyle="pageSheet"
  >
    <SafeAreaView style={styles.modalContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setEditModalVisible(false)}
            style={styles.modalCancelButton}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSaveProfile}
            style={styles.modalSaveButton}
            disabled={isLoading}
          >
            <Text style={styles.modalSaveText}>
              {isLoading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image */}
          <View style={styles.modalProfileImageContainer}>
            <View style={styles.modalProfileImage}>
              <Text style={styles.modalProfileInitials}>
                {editedUser.firstName?.charAt(0) ||
                  editedUser.name?.charAt(0) ||
                  "U"}
              </Text>
            </View>
            <TouchableOpacity style={styles.modalCameraButton}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.name}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, name: text })
                }
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.email}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, email: text })
                }
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Number *</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.contactNumber}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, contactNumber: text })
                }
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.dateOfBirth}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, dateOfBirth: text })
                }
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editedUser.address}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, address: text })
                }
                placeholder="Enter your address"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedUser.city}
                  onChangeText={(text) =>
                    setEditedUser({ ...editedUser, city: text })
                  }
                  placeholder="City"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedUser.state}
                  onChangeText={(text) =>
                    setEditedUser({ ...editedUser, state: text })
                  }
                  placeholder="State"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PIN Code</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.pincode}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, pincode: text })
                }
                placeholder="Enter PIN code"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setPersonalInfoVisible(true)}
        >
          <MaterialIcons name="edit" size={20} color="#9370DB" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitials}>{getInitials()}</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || "User Name"}</Text>
            <Text style={styles.userPhone}>
              {user?.email || "user@email.com"}
            </Text>
            <Text style={styles.userPhone}>
              {user?.contactNumber || "+91 9876543210"}
            </Text>
            {user?.city && user?.state && (
              <Text style={styles.userPhone}>
                {user.city}, {user.state}
              </Text>
            )}
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setPersonalInfoVisible(true)}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="person-outline" size={22} color="#9370DB" />
            </View>
            <Text style={styles.optionText}>Personal Info</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIcon}>
              <Ionicons name="calendar-outline" size={22} color="#9370DB" />
            </View>
            <Text style={styles.optionText}>Appointments</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIcon}>
              <Ionicons name="time-outline" size={22} color="#9370DB" />
            </View>
            <Text style={styles.optionText}>Past Bookings</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIcon}>
              <Ionicons name="ticket-outline" size={22} color="#9370DB" />
            </View>
            <Text style={styles.optionText}>My Coupons</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIcon}>
              <Ionicons name="settings-outline" size={22} color="#9370DB" />
            </View>
            <Text style={styles.optionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
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

          <TouchableOpacity style={styles.optionItem}>
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

      {/* Personal Information Screen */}
      {renderPersonalInfoScreen()}
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
    marginBottom: 20,
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
    flex: 1,
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
    marginBottom: 2,
  },
  personalInfoContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
  },
  detailsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  detailItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  optionsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginHorizontal: 20,
    overflow: "hidden",
    marginBottom: 20,
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
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  modalCancelButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: "#9370DB",
  },
  modalSaveButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  modalSaveText: {
    fontSize: 16,
    color: "#9370DB",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    paddingTop: 20,
  },
  modalProfileImageContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  modalProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
  },
  modalProfileInitials: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFF",
  },
  modalCameraButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
});

export default ProfileScreen;
