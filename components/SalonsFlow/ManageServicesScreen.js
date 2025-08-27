import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  Modal,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { getToken } from "../../utils/authStorage"; // Import the getToken function
import jwt_decode from "jwt-decode";

const ManageServicesScreen = ({ navigation, route }) => {
  // const shopId = route.params?.userId || "defaultShopId";

  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await getToken();
      setToken(storedToken); // ✅ Store in state
    };

    fetchToken();
  }, []);

  console.log("Token in ManageServicesScreen:", token);

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to decode manually:", e);
      return null;
    }
  };

  // Usage
  const decoded = decodeJWT(token);
  const shopId = decoded?.shopId || "defaultShopId";
  console.log("realshopId", shopId);

  const [services, setServices] = useState([]);
  const [predefinedServices, setPredefinedServices] = useState([]);

  // New state for pending services to be added
  const [pendingServices, setPendingServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedPredefinedService, setSelectedPredefinedService] =
    useState(null);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New state for toggle functionality
  const [showPredefinedServices, setShowPredefinedServices] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchPredefinedServices();
  }, [shopId]);

  // Filter predefined services based on existing services
  const getFilteredPredefinedServices = () => {
    return predefinedServices.filter((predefinedService) => {
      // Check if service exists in current services
      const existsInServices = services.some(
        (existingService) =>
          existingService.name.toLowerCase() ===
          predefinedService.name.toLowerCase()
      );

      // Check if service exists in pending services
      const existsInPending = pendingServices.some(
        (pendingService) =>
          pendingService.name.toLowerCase() ===
          predefinedService.name.toLowerCase()
      );

      return !existsInServices && !existsInPending;
    });
  };

  const fetchPredefinedServices = async () => {
    try {
      const response = await fetch(
        "https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/services/predefined",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        const fetchedPredefinedServices =
          responseData.services || responseData.data || responseData;

        setPredefinedServices(fetchedPredefinedServices);
      } else {
        console.error("Error fetching predefined services");
      }
    } catch (error) {
      console.error("Network error fetching predefined services:", error);
    }
  };

  const fetchServices = async () => {
    setIsLoading(true);

    try {
      console.log("shopId being used to fetch services:", shopId);
      const response = await fetch(
        `https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/services/shop/${shopId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        const fetchedServices =
          responseData.services || responseData.data || responseData;

        const formattedServices = fetchedServices.map((service, index) => ({
          id: service.id || service._id || `service_${index}`,
          name: service.name,
          price: service.price,
          duration: service.duration,
          isPending: false,
        }));

        setServices(formattedServices);
      } else {
        const errorData = await response.json();
        console.error("Error fetching services:", errorData);
      }
    } catch (error) {
      console.error("Network error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const openAddModal = () => {
    setEditingService(null);
    setSelectedPredefinedService(null);
    setServiceName("");
    setServicePrice("");
    setServiceDuration("");
    setModalVisible(true);
  };

  const openPredefinedServiceModal = (predefinedService) => {
    setEditingService(null);
    setSelectedPredefinedService(predefinedService);
    setServiceName(predefinedService.name);
    setServicePrice(
      predefinedService.price ? predefinedService.price.toString() : ""
    );
    setServiceDuration(
      predefinedService.duration ? predefinedService.duration.toString() : ""
    );
    setModalVisible(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setSelectedPredefinedService(null);
    setServiceName(service.name);
    setServicePrice(service.price.toString());
    setServiceDuration(service.duration.toString());
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingService(null);
    setSelectedPredefinedService(null);
    setServiceName("");
    setServicePrice("");
    setServiceDuration("");
  };

  const addServiceToPending = () => {
    if (
      !serviceName.trim() ||
      !servicePrice.trim() ||
      !serviceDuration.trim()
    ) {
      Alert.alert(
        "Invalid Input",
        "Please enter service name, price, and duration"
      );
      return;
    }

    if (isNaN(servicePrice) || parseFloat(servicePrice) <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price");
      return;
    }

    if (isNaN(serviceDuration) || parseInt(serviceDuration) <= 0) {
      Alert.alert(
        "Invalid Duration",
        "Please enter a valid duration in minutes"
      );
      return;
    }

    if (editingService) {
      updateService();
      return;
    }

    const newService = {
      id: `pending_${Date.now()}`,
      name: serviceName.trim(),
      price: parseFloat(servicePrice),
      duration: parseInt(serviceDuration),
      isPending: true,
    };

    setPendingServices([...pendingServices, newService]);
    closeModal();
  };

  const removePendingService = (serviceId) => {
    setPendingServices(
      pendingServices.filter((service) => service.id !== serviceId)
    );
  };

  const saveAllServices = async () => {
    if (pendingServices.length === 0) {
      Alert.alert("No Services", "No new services to save");
      return;
    }

    setIsLoading(true);

    try {
      const servicesData = pendingServices.map((service) => ({
        name: service.name,
        price: service.price,
        duration: service.duration,
      }));

      const response = await fetch(
        "https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/services/shop/addNewServices",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shopId: shopId,
            services: servicesData,
          }),
        }
      );

      if (response.ok) {
        const responseData = await response.json();

        setServices([
          ...services,
          ...pendingServices.map((service) => ({
            ...service,
            isPending: false,
            id: `saved_${service.id}`,
          })),
        ]);
        setPendingServices([]);

        Alert.alert(
          "Success",
          `${servicesData.length} services added successfully!`
        );
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to add services");
      }
    } catch (error) {
      console.error("Error adding services:", error);
      Alert.alert(
        "Network Error",
        "Failed to connect to server. Please check your internet connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteService = async (serviceId) => {
    console.log("Deleting service with ID:", serviceId);
    try {
      setIsLoading(true);

      const response = await fetch(
        `https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/services/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        setServices(services.filter((service) => service.id !== serviceId));
        console.log("Service deleted successfully:", responseData);
      } else {
        const errorData = await response.json();
        console.error(
          "Error deleting service:",
          errorData.message || "Failed to delete service"
        );
      }
    } catch (error) {
      console.error("Network error deleting service:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateService = async () => {
    if (
      !serviceName.trim() ||
      !servicePrice.trim() ||
      !serviceDuration.trim()
    ) {
      console.log("Invalid Input: Missing fields");
      return;
    }

    if (isNaN(servicePrice) || parseFloat(servicePrice) <= 0) {
      console.log("Invalid Price");
      return;
    }

    if (isNaN(serviceDuration) || parseInt(serviceDuration) <= 0) {
      console.log("Invalid Duration");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://n78qnwcjfk.execute-api.ap-south-1.amazonaws.com/api/services/${editingService.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: serviceName.trim(),
            price: parseFloat(servicePrice),
            duration: parseInt(serviceDuration),
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setServices(
          services.map((service) =>
            service.id === editingService.id
              ? {
                  ...service,
                  name: serviceName.trim(),
                  price: parseFloat(servicePrice),
                  duration: parseInt(serviceDuration),
                }
              : service
          )
        );
        console.log("Service updated successfully:", responseData);
      } else {
        console.error(
          "Error updating service:",
          responseData.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Network error updating service:", error);
    } finally {
      setIsLoading(false);
      closeModal();
    }
  };

  const renderServiceItem = ({ item }) => (
    <View
      style={[styles.serviceCard, item.isPending && styles.pendingServiceCard]}
    >
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>
          {item.name} {item.isPending && "(Pending)"}
        </Text>
        <Text style={styles.servicePrice}>₹{item.price}</Text>
        <Text style={styles.serviceDuration}>{item.duration} min</Text>
      </View>
      <View style={styles.serviceActions}>
        {item.isPending ? (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removePendingService(item.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal(item)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteService(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderPredefinedServiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.predefinedServiceBlock}
      onPress={() => openPredefinedServiceModal(item)}
    >
      <Text style={styles.predefinedServiceName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Get filtered predefined services
  const filteredPredefinedServices = getFilteredPredefinedServices();

  // Combine services and pending services for display
  const allServices = [...services, ...pendingServices];

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Services</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Services</Text>
            <Text style={styles.statsCount}>
              {services.length} Services Available
            </Text>
            {pendingServices.length > 0 && (
              <Text style={styles.pendingCount}>
                {pendingServices.length} Pending to Save
              </Text>
            )}
          </View>

          {/* Toggle Button for Predefined Services */}
          {filteredPredefinedServices.length > 0 && (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowPredefinedServices(!showPredefinedServices)}
            >
              <Text style={styles.toggleButtonText}>
                {showPredefinedServices ? "Hide" : "Show"} Popular Services
              </Text>
              <Text style={styles.toggleIcon}>
                {showPredefinedServices ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Predefined Services Section */}
          {showPredefinedServices && filteredPredefinedServices.length > 0 && (
            <View style={styles.predefinedServicesContainer}>
              <Text style={styles.sectionSubtitle}>
                Tap to quickly add these services
              </Text>
              <View style={styles.predefinedServicesGrid}>
                {filteredPredefinedServices.map((service, index) => (
                  <TouchableOpacity
                    key={service.id || service.name || index}
                    style={styles.predefinedServiceBlock}
                    onPress={() => openPredefinedServiceModal(service)}
                  >
                    <Text style={styles.predefinedServiceName}>
                      {service.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Save All Button */}
          {pendingServices.length > 0 && (
            <TouchableOpacity
              style={styles.saveAllButton}
              onPress={saveAllServices}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveAllButtonText}>
                  Save All ({pendingServices.length}) Services
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* Services List */}
          <View style={styles.servicesContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Services</Text>
            </View>
            {isLoading &&
            services.length === 0 &&
            pendingServices.length === 0 ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color="#9370DB" />
                <Text style={styles.loadingText}>Loading services...</Text>
              </View>
            ) : allServices.length > 0 ? (
              <FlatList
                data={allServices}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No Services Added</Text>
                <Text style={styles.emptyStateText}>
                  Add services from popular options above or tap the + button to
                  create custom services
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={openAddModal}
        >
          <Text style={styles.floatingAddIcon}>+</Text>
        </TouchableOpacity>

        {/* Add/Edit Service Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {editingService
                        ? "Edit Service"
                        : selectedPredefinedService
                        ? "Add Predefined Service"
                        : "Add New Service"}
                    </Text>
                    <TouchableOpacity onPress={closeModal}>
                      <Text style={styles.closeButton}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <Text style={styles.inputLabel}>Service Name</Text>
                    <TextInput
                      style={[
                        styles.modalInput,
                        selectedPredefinedService && styles.disabledInput,
                      ]}
                      placeholder="e.g., Haircut, Facial, Massage"
                      value={serviceName}
                      onChangeText={setServiceName}
                      editable={!selectedPredefinedService}
                    />

                    <Text style={styles.inputLabel}>Price (₹)</Text>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="0"
                        keyboardType="numeric"
                        value={servicePrice}
                        onChangeText={setServicePrice}
                      />
                    </View>

                    <Text style={styles.inputLabel}>Duration (minutes)</Text>
                    <View style={styles.durationInputContainer}>
                      <TextInput
                        style={styles.durationInput}
                        placeholder="30"
                        keyboardType="numeric"
                        value={serviceDuration}
                        onChangeText={setServiceDuration}
                      />
                      <Text style={styles.durationUnit}>min</Text>
                    </View>
                  </View>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={closeModal}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={addServiceToPending}
                    >
                      <Text style={styles.saveButtonText}>
                        {editingService ? "Update" : "Add"} Service
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ManageServicesScreen;

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
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  statsCount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#9370DB",
  },
  pendingCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF9800",
    marginTop: 5,
  },
  toggleButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9370DB",
  },
  toggleIcon: {
    fontSize: 14,
    color: "#9370DB",
    fontWeight: "bold",
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  predefinedServicesContainer: {
    marginBottom: 20,
  },
  predefinedServicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  predefinedServiceBlock: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    minWidth: "30%",
    maxWidth: "32%",
    borderWidth: 1,
    borderColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  predefinedServiceName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2196F3",
    textAlign: "center",
  },
  saveAllButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  saveAllButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  servicesContainer: {
    marginBottom: 80,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: "#9370DB",
  },
  pendingServiceCard: {
    borderLeftColor: "#FF9800",
    backgroundColor: "#FFF8E1",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9370DB",
  },
  serviceActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#FF5722",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  removeButton: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  floatingAddButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  floatingAddIcon: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    fontSize: 24,
    color: "#666",
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: "#f9f9f9",
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#666",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingLeft: 12,
    paddingRight: 6,
  },
  priceInput: {
    flex: 1,
    padding: 12,
    paddingLeft: 0,
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#9370DB",
    padding: 12,
    borderRadius: 10,
  },
  saveButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  serviceDuration: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 2,
  },
  durationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
  },
  durationInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  durationUnit: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingRight: 12,
    paddingLeft: 6,
  },
});
