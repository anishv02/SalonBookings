import React, { useState } from "react";
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
} from "react-native";

const ManageServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([
    { id: "1", name: "Haircut", price: 150 },
    { id: "2", name: "Hair Wash", price: 50 },
    { id: "3", name: "Facial", price: 300 },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  const handleBackPress = () => {
    navigation.goBack();
  };

  const openAddModal = () => {
    setEditingService(null);
    setServiceName("");
    setServicePrice("");
    setModalVisible(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServicePrice(service.price.toString());
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingService(null);
    setServiceName("");
    setServicePrice("");
  };

  const saveService = () => {
    if (!serviceName.trim() || !servicePrice.trim()) {
      Alert.alert("Invalid Input", "Please enter both service name and price");
      return;
    }

    if (isNaN(servicePrice) || parseFloat(servicePrice) <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price");
      return;
    }

    if (editingService) {
      // Update existing service
      setServices(
        services.map((service) =>
          service.id === editingService.id
            ? {
                ...service,
                name: serviceName.trim(),
                price: parseFloat(servicePrice),
              }
            : service
        )
      );
      Alert.alert("Success", "Service updated successfully!");
    } else {
      // Add new service
      const newService = {
        id: Date.now().toString(),
        name: serviceName.trim(),
        price: parseFloat(servicePrice),
      };
      setServices([...services, newService]);
      Alert.alert("Success", "Service added successfully!");
    }

    closeModal();
  };

  const deleteService = (serviceId) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setServices(services.filter((service) => service.id !== serviceId));
            Alert.alert("Success", "Service deleted successfully!");
          },
        },
      ]
    );
  };

  const renderServiceItem = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.servicePrice}>₹{item.price}</Text>
      </View>
      <View style={styles.serviceActions}>
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
      </View>
    </View>
  );

  return (
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
        </View>

        {/* Services List */}
        <View style={styles.servicesContainer}>
          {services.length > 0 ? (
            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No Services Added</Text>
              <Text style={styles.emptyStateText}>
                Tap the + button to add your first service
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.floatingAddButton} onPress={openAddModal}>
        <Text style={styles.floatingAddIcon}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Service Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? "Edit Service" : "Add New Service"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Service Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Haircut, Facial, Massage"
                value={serviceName}
                onChangeText={setServiceName}
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
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveService}>
                <Text style={styles.saveButtonText}>
                  {editingService ? "Update" : "Add"} Service
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  servicesContainer: {
    marginBottom: 80, // Added margin to prevent overlap with floating button
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
  // Floating Add Button
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
    elevation: 8, // Android shadow
    shadowColor: "#000", // iOS shadow
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
});
