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
} from "react-native";

const AddSalonServicesScreen = ({ navigation }) => {
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [services, setServices] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);

  const addService = () => {
    if (!serviceName.trim() || !servicePrice.trim()) {
      Alert.alert("Invalid Input", "Please enter both service name and price");
      return;
    }

    if (isNaN(servicePrice) || parseFloat(servicePrice) <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price");
      return;
    }

    const newService = {
      id: Date.now().toString(),
      name: serviceName.trim(),
      price: parseFloat(servicePrice),
    };

    if (editingIndex >= 0) {
      // Update existing service
      const updatedServices = [...services];
      updatedServices[editingIndex] = newService;
      setServices(updatedServices);
      setEditingIndex(-1);
    } else {
      // Add new service
      setServices([...services, newService]);
    }

    setServiceName("");
    setServicePrice("");
  };

  const editService = (index) => {
    const service = services[index];
    setServiceName(service.name);
    setServicePrice(service.price.toString());
    setEditingIndex(index);
  };

  const deleteService = (index) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedServices = services.filter((_, i) => i !== index);
            setServices(updatedServices);
            if (editingIndex === index) {
              setServiceName("");
              setServicePrice("");
              setEditingIndex(-1);
            }
          },
        },
      ]
    );
  };

  const handleContinue = () => {
    if (services.length === 0) {
      Alert.alert(
        "No Services Added",
        "You haven't added any services yet. Are you sure you want to continue?",
        [
          { text: "Add Services", style: "cancel" },
          {
            text: "Continue Anyway",
            onPress: () => {
              Alert.alert("Success", "Proceeding without services");
              navigation.navigate("SalonDashboard"); // Replace with actual next screen
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      "Services Added",
      `Successfully added ${services.length} service(s)!`
    );
    // navigation.navigate('NextScreen');
  };

  const handleSkip = () => {
    navigation.navigate("SalonDashboard"); // Replace with actual next screen
  };

  const renderServiceItem = ({ item, index }) => (
    <View style={styles.serviceItem}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.servicePrice}>₹{item.price}</Text>
      </View>
      <View style={styles.serviceActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editService(index)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteService(index)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.heading}>Add Salon Services</Text>
        <Text style={styles.subheading}>
          Add your services and pricing to help customers know what you offer
        </Text>

        {/* Add Service Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {editingIndex >= 0 ? "Edit Service" : "Add New Service"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Service Name (e.g., Haircut, Facial)"
            value={serviceName}
            onChangeText={setServiceName}
          />

          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Price"
              keyboardType="numeric"
              value={servicePrice}
              onChangeText={setServicePrice}
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addService}>
            <Text style={styles.addButtonText}>
              {editingIndex >= 0 ? "Update Service" : "Add Service"}
            </Text>
          </TouchableOpacity>

          {editingIndex >= 0 && (
            <TouchableOpacity
              style={styles.cancelEditButton}
              onPress={() => {
                setServiceName("");
                setServicePrice("");
                setEditingIndex(-1);
              }}
            >
              <Text style={styles.cancelEditText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Services List */}
        {services.length > 0 && (
          <View style={styles.servicesContainer}>
            <Text style={styles.servicesTitle}>
              Added Services ({services.length})
            </Text>
            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              Continue {services.length > 0 && `(${services.length} services)`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default AddSalonServicesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
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
  addButton: {
    backgroundColor: "#9370DB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  addButtonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  cancelEditButton: {
    padding: 8,
  },
  cancelEditText: {
    textAlign: "center",
    color: "#666",
    fontSize: 13,
  },
  servicesContainer: {
    marginBottom: 24,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#9370DB",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9370DB",
  },
  serviceActions: {
    flexDirection: "row",
    gap: 6,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#FF5722",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  actionButtons: {
    gap: 10,
  },
  continueButton: {
    backgroundColor: "#9370DB",
    padding: 14,
    borderRadius: 10,
  },
  continueButtonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  skipButton: {
    backgroundColor: "transparent",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  skipButtonText: {
    textAlign: "center",
    color: "#666",
    fontWeight: "500",
    fontSize: 15,
  },
});
