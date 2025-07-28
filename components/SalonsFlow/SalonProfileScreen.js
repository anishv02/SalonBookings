import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from "react-native";

const ProfileScreen = ({ navigation }) => {
  const [salonData, setSalonData] = useState({
    _id: "6813e951f28bb4730fc1f4d4",
    shopName: "Bliss Beauty Parlour",
    shopOwnerName: "Ritika Jain",
    contactNumber: "9876501234",
    email: "bliss@parlour.com",
    address: "Park Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    salonType: "women",
    seatCount: 1,
    openTime: "09:30",
    closeTime: "22:30",
    rating: 0,
    reviews: "",
  });

  const [showSalonDetails, setShowSalonDetails] = useState(false);
  const [showOperationalSettings, setShowOperationalSettings] = useState(false);
  const [editableData, setEditableData] = useState({});
  const [operationalData, setOperationalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingOperational, setIsEditingOperational] = useState(false);

  const handleBackPress = () => {
    navigation.navigate("SalonDashboard");
  };

  const handleSalonDetailsPress = () => {
    setEditableData({ ...salonData });
    setIsEditing(false);
    setShowSalonDetails(true);
  };

  const handleOperationalSettingsPress = () => {
    setOperationalData({
      openTime: salonData.openTime,
      closeTime: salonData.closeTime,
      seatCount: salonData.seatCount,
    });
    setIsEditingOperational(false);
    setShowOperationalSettings(true);
  };

  const handleSaveChanges = () => {
    setSalonData({ ...editableData });
    setIsEditing(false);
    Alert.alert("Success", "Salon details updated successfully!");
  };

  const handleSaveOperationalChanges = async () => {
    // Validation
    if (!operationalData.openTime || !operationalData.closeTime) {
      Alert.alert("Error", "Please enter both opening and closing times");
      return;
    }

    if (!operationalData.seatCount || parseInt(operationalData.seatCount) < 1) {
      Alert.alert("Error", "Seat count must be at least 1");
      return;
    }

    try {
      // Here you would make API call to update operational settings
      // const response = await fetch(`http://43.204.228.20:5000/api/shops/${salonData._id}/operational`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     openTime: operationalData.openTime,
      //     closeTime: operationalData.closeTime,
      //     seatCount: parseInt(operationalData.seatCount),
      //   }),
      // });

      // For now, update locally
      setSalonData((prev) => ({
        ...prev,
        openTime: operationalData.openTime,
        closeTime: operationalData.closeTime,
        seatCount: parseInt(operationalData.seatCount),
      }));

      setIsEditingOperational(false);
      Alert.alert("Success", "Operational settings updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update operational settings");
    }
  };

  const handleCancelEdit = () => {
    setEditableData({ ...salonData });
    setIsEditing(false);
  };

  const handleCancelOperationalEdit = () => {
    setOperationalData({
      openTime: salonData.openTime,
      closeTime: salonData.closeTime,
      seatCount: salonData.seatCount,
    });
    setIsEditingOperational(false);
  };

  const updateField = (field, value) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateOperationalField = (field, value) => {
    setOperationalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCloseModal = () => {
    if (isEditing) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to discard them?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setIsEditing(false);
              setShowSalonDetails(false);
            },
          },
        ]
      );
    } else {
      setShowSalonDetails(false);
    }
  };

  const handleCloseOperationalModal = () => {
    if (isEditingOperational) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to discard them?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setIsEditingOperational(false);
              setShowOperationalSettings(false);
            },
          },
        ]
      );
    } else {
      setShowOperationalSettings(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          Alert.alert("Logged Out", "You have been logged out successfully");
          // navigation.navigate('Login');
        },
      },
    ]);
  };

  const renderEditableField = (
    label,
    field,
    placeholder,
    keyboardType = "default"
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.editInput}
          value={editableData[field]}
          onChangeText={(value) => updateField(field, value)}
          placeholder={placeholder}
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.fieldValue}>
          {editableData[field] || "Not specified"}
        </Text>
      )}
    </View>
  );

  const renderOperationalField = (
    label,
    field,
    placeholder,
    keyboardType = "default"
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditingOperational ? (
        <TextInput
          style={styles.editInput}
          value={operationalData[field]?.toString()}
          onChangeText={(value) => updateOperationalField(field, value)}
          placeholder={placeholder}
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.fieldValue}>
          {operationalData[field]?.toString() || "Not set"}
        </Text>
      )}
    </View>
  );

  const OperationalSettingsModal = () => (
    <Modal
      visible={showOperationalSettings}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCloseOperationalModal}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Operational Settings</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              isEditingOperational
                ? handleSaveOperationalChanges()
                : setIsEditingOperational(true)
            }
          >
            <Text style={styles.editButtonText}>
              {isEditingOperational ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Operating Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Operating Hours</Text>
            <Text style={styles.sectionDescription}>
              Set your salon's daily operating hours
            </Text>

            {renderOperationalField(
              "Opening Time",
              "openTime",
              "09:30 (HH:MM format)"
            )}
            {renderOperationalField(
              "Closing Time",
              "closeTime",
              "22:30 (HH:MM format)"
            )}
          </View>

          {/* Capacity Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Capacity Management</Text>
            <Text style={styles.sectionDescription}>
              Manage the number of available seats in your salon
            </Text>

            {renderOperationalField(
              "Number of Seats",
              "seatCount",
              "Enter number of seats",
              "numeric"
            )}

            {!isEditingOperational && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Current Status:</Text>
                <Text style={styles.infoText}>
                  • Operating: {operationalData.openTime} -{" "}
                  {operationalData.closeTime}
                </Text>
                <Text style={styles.infoText}>
                  • Available Seats: {operationalData.seatCount}
                </Text>
              </View>
            )}
          </View>

          {isEditingOperational && (
            <View style={styles.section}>
              <Text style={styles.warningTitle}>⚠️ Important Notes</Text>
              <Text style={styles.warningText}>
                • Changing operating hours will affect future bookings
              </Text>
              <Text style={styles.warningText}>
                • Reducing seat count may impact existing appointments
              </Text>
              <Text style={styles.warningText}>
                • Use 24-hour format for time (e.g., 09:30, 22:30)
              </Text>
            </View>
          )}

          {isEditingOperational && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelOperationalEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveOperationalChanges}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  const SalonDetailsModal = () => (
    <Modal
      visible={showSalonDetails}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCloseModal}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Salon Details</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              isEditing ? handleSaveChanges() : setIsEditing(true)
            }
          >
            <Text style={styles.editButtonText}>
              {isEditing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            {renderEditableField("Shop Name", "shopName", "Enter shop name")}
            {renderEditableField(
              "Owner Name",
              "shopOwnerName",
              "Enter owner name"
            )}
            {renderEditableField(
              "Contact Number",
              "contactNumber",
              "Enter contact number",
              "phone-pad"
            )}
            {renderEditableField(
              "Email",
              "email",
              "Enter email address",
              "email-address"
            )}
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>

            {renderEditableField("Address", "address", "Enter address")}
            {renderEditableField("City", "city", "Enter city")}
            {renderEditableField("State", "state", "Enter state")}
            {renderEditableField(
              "Pincode",
              "pincode",
              "Enter pincode",
              "numeric"
            )}
          </View>

          {/* Salon Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salon Configuration</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Salon Type</Text>
              {isEditing ? (
                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => updateField("salonType", "men")}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        editableData.salonType === "men" &&
                          styles.radioSelected,
                      ]}
                    />
                    <Text style={styles.radioText}>Men</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => updateField("salonType", "women")}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        editableData.salonType === "women" &&
                          styles.radioSelected,
                      ]}
                    />
                    <Text style={styles.radioText}>Women</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => updateField("salonType", "unisex")}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        editableData.salonType === "unisex" &&
                          styles.radioSelected,
                      ]}
                    />
                    <Text style={styles.radioText}>Unisex</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.fieldValue}>
                  {editableData.salonType?.charAt(0).toUpperCase() +
                    editableData.salonType?.slice(1)}
                </Text>
              )}
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Rating</Text>
              <Text style={styles.fieldValue}>{editableData.rating}/5</Text>
            </View>
          </View>

          {isEditing && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveChanges}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  const ProfileItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
  }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.profileItemContent}>
        <Text style={styles.profileItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {salonData.shopName.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{salonData.shopName}</Text>
          <Text style={styles.profilePhone}>{salonData.contactNumber}</Text>
        </View>

        {/* Profile Menu Items */}
        <View style={styles.menuContainer}>
          <ProfileItem
            icon="📋"
            title="Your Orders"
            subtitle="View order history"
            onPress={() =>
              Alert.alert("Your Orders", "Navigate to orders page")
            }
          />

          <ProfileItem
            icon="🏢"
            title="Salon Details"
            subtitle="Manage salon information"
            onPress={handleSalonDetailsPress}
          />

          <ProfileItem
            icon="⏰"
            title="Operational Settings"
            subtitle={`${salonData.openTime}-${salonData.closeTime} • ${salonData.seatCount} seats`}
            onPress={handleOperationalSettingsPress}
          />

          <ProfileItem
            icon="📅"
            title="Schedule Management"
            subtitle="Manage off days and custom timings"
            onPress={() =>
              navigation.navigate("ScheduleManagement", { salonData })
            }
          />

          <ProfileItem
            icon="✂️"
            title="Services"
            subtitle="Manage your salon services"
            onPress={() => navigation.navigate("ManageServices")}
          />

          <ProfileItem
            icon="👤"
            title="Owner Details"
            subtitle="Edit owner information"
            onPress={() =>
              Alert.alert("Owner Details", "Navigate to owner details page")
            }
          />

          <ProfileItem
            icon="⚙️"
            title="Settings"
            subtitle="App preferences"
            onPress={() => Alert.alert("Settings", "Navigate to settings page")}
          />

          <ProfileItem
            icon="📞"
            title="Contact Us"
            subtitle="Get in touch with support"
            onPress={() =>
              Alert.alert("Contact Us", "Navigate to contact page")
            }
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App version 25.7.1</Text>
          <Text style={styles.versionSubtext}>v71-7</Text>
        </View>

        <SalonDetailsModal />
        <OperationalSettingsModal />
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  profilePhone: {
    fontSize: 16,
    color: "#666",
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileItemIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  iconText: {
    fontSize: 20,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  arrow: {
    fontSize: 24,
    color: "#ccc",
    fontWeight: "300",
  },
  logoutButton: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF5722",
  },
  logoutText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5722",
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 2,
  },
  versionSubtext: {
    fontSize: 12,
    color: "#ccc",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#9370DB",
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: "#666",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  editInput: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#9370DB",
  },
  radioContainer: {
    flexDirection: "row",
    gap: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  radioSelected: {
    borderColor: "#9370DB",
    backgroundColor: "#9370DB",
  },
  radioText: {
    fontSize: 16,
    color: "#333",
  },
  infoContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#9370DB",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5722",
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#9370DB",
  },
  saveButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
