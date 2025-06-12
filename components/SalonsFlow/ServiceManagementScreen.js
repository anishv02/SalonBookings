import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

const predefinedServices = [
  { name: "Haircut" },
  { name: "Beard" },
  { name: "Face Massage" },
  { name: "Hair Spa" },
  { name: "Facial" },
  { name: "Hair Color" },
  { name: "Threading" },
];

const ServiceManagementScreen = ({ navigation }) => {
  const [availableServices, setAvailableServices] =
    useState(predefinedServices);
  const [services, setServices] = useState([]);
  const [predefinedServices, setPredefinedServices] = useState([
    { name: "Haircut", price: 200 },
    { name: "Shave", price: 100 },
    // ...other predefined
  ]);
  const [customService, setCustomService] = useState({
    name: "",
    duration: "",
    price: "",
  });
  const [predefinedAdded, setPredefinedAdded] = useState(false);

  const handleSelectPredefined = (service) => {
    setServices([
      ...services,
      { name: service.name, duration: "", price: "", isCustom: false },
    ]);
    setAvailableServices(
      availableServices.filter((s) => s.name !== service.name)
    );
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  const handleAddCustomService = () => {
    if (!customService.name || !customService.price) return;

    let newServices = [...services, customService];
    if (!predefinedAdded) {
      newServices = [...predefinedServices, ...newServices];
      setPredefinedAdded(true);
    }

    setServices(newServices);
    setCustomService({ name: "", price: "" });
  };

  const handleRemoveService = (index) => {
    const removed = services[index];
    if (!removed.isCustom) {
      setAvailableServices([...availableServices, { name: removed.name }]);
    }
    const updated = [...services];
    updated.splice(index, 1);
    setServices(updated);
  };

  const handleSave = () => {
    console.log("Final services to send:", services);
    // TODO: Send to backend
    navigation.navigate("WorkingHoursScreen");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add Services</Text>

      <View style={styles.tilesContainer}>
        {availableServices.map((service, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.tile}
            onPress={() => handleSelectPredefined(service)}
          >
            <Text style={styles.tileText}>{service.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {services.map((service, index) => (
        <View key={index} style={styles.serviceBox}>
          <Text style={styles.serviceLabel}>{service.name}</Text>
          <TextInput
            placeholder="Duration (in mins)"
            keyboardType="numeric"
            value={service.duration}
            onChangeText={(val) => handleServiceChange(index, "duration", val)}
            style={styles.input}
          />
          <TextInput
            placeholder="Price (₹)"
            keyboardType="numeric"
            value={service.price}
            onChangeText={(val) => handleServiceChange(index, "price", val)}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => handleRemoveService(index)}>
            <Text style={styles.removeBtn}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.subheader}>Add Custom Service</Text>
      <TextInput
        placeholder="Service Name"
        value={customService.name}
        onChangeText={(val) =>
          setCustomService({ ...customService, name: val })
        }
        style={styles.input}
      />
      <TextInput
        placeholder="Duration (mins)"
        value={customService.duration}
        onChangeText={(val) =>
          setCustomService({ ...customService, duration: val })
        }
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Price (₹)"
        value={customService.price}
        onChangeText={(val) =>
          setCustomService({ ...customService, price: val })
        }
        keyboardType="numeric"
        style={styles.input}
      />
      <Button
        title="Add Custom Service"
        onPress={handleAddCustomService}
        color="#9370DB"
      />

      <Button
        title="Save & Continue"
        onPress={handleSave}
        color="#9370DB"
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
};

export default ServiceManagementScreen;

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#9370DB",
  },
  subheader: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    color: "#9370DB",
  },

  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-start",
  },
  tile: {
    backgroundColor: "#E6E6FA",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
    borderColor: "#9370DB",
    borderWidth: 1,
  },
  tileText: {
    color: "#9370DB",
    fontWeight: "600",
  },

  serviceBox: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9370DB",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  removeBtn: {
    color: "red",
    marginTop: 6,
    fontWeight: "500",
  },
});
