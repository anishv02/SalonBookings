// src/components/UsersFlow/PersonalInfoScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PersonalInfoScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleContinue = async () => {
    if (!name || !email || !contactNumber || !password) {
      Alert.alert("All fields are required");
      return;
    }
    try {
      const res = await fetch("http://13.233.157.248:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, contactNumber, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error || "Registration failed");
        return;
      }
      // Save the returned user object
      await AsyncStorage.setItem("user", JSON.stringify(data));
      navigation.replace("Home");
    } catch (e) {
      Alert.alert("Error", "Could not register user");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Tell us about you</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
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
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        keyboardType="phone-pad"
        value={contactNumber}
        onChangeText={setContactNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: 20, alignSelf: "center" }}
        onPress={() => navigation.replace("PhoneVerification")}
      >
        <Text style={{ color: "#9370DB", fontWeight: "500" }}>
          Already have an account?
        </Text>
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
