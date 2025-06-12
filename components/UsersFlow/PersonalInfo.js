// src/components/UsersFlow/PersonalInfoScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const PersonalInfoScreen = ({ navigation, route }) => {
  const { isSalonOwner } = route.params;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleContinue = () => {
    // Save details (possibly in context or backend)
    if (!isSalonOwner) {
      navigation.navigate("Home");
    } else {
      // You can later route to SalonDashboardScreen or similar
      alert("Salon owner flow coming soon");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Tell us about you</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PersonalInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "600",
    color: "#9370DB",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#9370DB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
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
    fontSize: 16,
  },
});
