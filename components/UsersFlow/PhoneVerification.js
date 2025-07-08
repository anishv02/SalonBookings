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

const PhoneVerification = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const sendOtp = () => {
    // Call userAPI to check if phone exists and fetch user details
    fetch("https://your-backend-api.com/user/check-phone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (data.exists) {
          // Save user details to AsyncStorage for profile section
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
        } else {
          Alert.alert(
            "Phone number not found",
            "Please register as a new user."
          );
          return;
        }
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to check phone number.");
        return;
      });
    if (!phone) {
      Alert.alert("Enter your phone number");
      return;
    }
    setStep(2);
    Alert.alert("OTP sent", "Enter the OTP you received.");
  };

  const verifyOtp = () => {
    // TODO: Integrate with your backend to verify OTP

    if (otp === "1234") {
      // For demo, use 1234 as OTP
      navigation.replace("Home");
    } else {
      Alert.alert("Invalid OTP");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.replace("PhoneVerification"); // Navigate to phone verification screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Phone Verification</Text>
      {step === 1 ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity style={styles.button} onPress={sendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.replace("PersonalInfo")}>
            <Text style={styles.linkText}>New User?</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={styles.button} onPress={verifyOtp}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
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
  linkText: {
    color: "#9370DB",
    textAlign: "center",
    marginTop: 16,
    textDecorationLine: "underline",
  },
});

export default PhoneVerification;
