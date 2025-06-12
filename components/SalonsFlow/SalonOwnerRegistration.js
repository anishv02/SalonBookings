import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

const SalonOwnerRegistrationScreen = ({ navigation }) => {
  const [shopName, setShopName] = useState("");
  const [shopOwnerName, setShopOwnerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [salonType, setSalonType] = useState("men");

  const handleNext = () => {
    if (!shopName || !shopOwnerName || !contactNumber || !email) {
      Alert.alert("Please fill all required fields");
      return;
    }
    navigation.navigate("ServiceManagement");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Register Your Salon</Text>

      <TextInput
        style={styles.input}
        placeholder="Salon Name"
        value={shopName}
        onChangeText={setShopName}
      />
      <TextInput
        style={styles.input}
        placeholder="Owner Name"
        value={shopOwnerName}
        onChangeText={setShopOwnerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        keyboardType="phone-pad"
        value={contactNumber}
        onChangeText={setContactNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="State"
        value={state}
        onChangeText={setState}
      />
      <TextInput
        style={styles.input}
        placeholder="Pincode"
        keyboardType="numeric"
        value={pincode}
        onChangeText={setPincode}
      />

      <Text style={{ marginBottom: 10 }}>Salon Type:</Text>
      <View style={styles.radioContainer}>
        {["men", "women", "unisex"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSalonType(type)}
            style={[styles.radio, salonType === type && styles.selected]}
          >
            <Text
              style={[
                styles.radioText,
                { color: salonType === type ? "#fff" : "#000" },
              ]}
            >
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next: Add Services</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SalonOwnerRegistrationScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    marginTop: 45,
  },
  heading: {
    fontSize: 24,
    color: "#9370DB",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#9370DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#9370DB",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
  radioContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  radio: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#9370DB",
    borderRadius: 20,
    marginRight: 10,
  },
  selected: {
    backgroundColor: "#9370DB",
  },
  radioText: {
    color: "#fff",
  },
});
