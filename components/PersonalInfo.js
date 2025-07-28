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
  const [isSalonOwner, setIsSalonOwner] = useState(null);

  const handleContinue = async () => {
    // if (
    //   !name ||
    //   !email ||
    //   !contactNumber ||
    //   !password ||
    //   isSalonOwner === null
    // ) {
    //   Alert.alert("All fields are required");
    //   return;
    // }

    // Prepare userType based on radio selection
    const userType = isSalonOwner ? "Owner" : "User";

    // Prepare user data object
    const userData = {
      name,
      email,
      contactNumber,
      password,
      userType,
    };

    // Save user data locally if needed
    await AsyncStorage.setItem("user", JSON.stringify(userData));

    // Navigate based on userType
    if (isSalonOwner) {
      navigation.replace("SalonOwnerRegistration", { userType });
    } else {
      navigation.replace("Home", { userType });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Tell us about you</Text>
      {/* Radio Button Section */}
      <View style={styles.radioGroupInline}>
        <Text style={styles.radioLabel}>Are you a salon owner?</Text>
        <View style={styles.radioOptions}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setIsSalonOwner(true)}
          >
            <View
              style={[
                styles.radioCircle,
                isSalonOwner === true && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setIsSalonOwner(false)}
          >
            <View
              style={[
                styles.radioCircle,
                isSalonOwner === false && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        onPress={() => navigation.replace("Login")}
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
  radioGroupInline: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9370DB",
    marginBottom: 0,
    marginRight: 12,
  },
  radioOptions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 0,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9370DB",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  radioSelected: {
    backgroundColor: "#9370DB",
    borderColor: "#9370DB",
  },
  radioText: {
    fontSize: 16,
    color: "#333",
  },
});
