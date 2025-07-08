import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [isSalonOwner, setIsSalonOwner] = useState(false);
  const [step, setStep] = useState(1); // 1: phone input, 2: OTP
  const [otp, setOtp] = useState("");
  const [mockOtp, setMockOtp] = useState("");

  const sendOtp = () => {
    if (phone.length !== 10) {
      Alert.alert("Invalid", "Please enter a valid 10-digit phone number");
      return;
    }

    // Simulate OTP send
    const generatedOtp = "1234"; // mock OTP
    setMockOtp(generatedOtp);
    setStep(2);
    Alert.alert("OTP Sent", `Use OTP: ${generatedOtp} for testing`);
  };

  const verifyOtp = () => {
    if (otp !== mockOtp) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the correct OTP sent to your phone."
      );
      return;
    }
    // if (isSalonOwner) {
    //   navigation.replace("SalonOwnerRegistration", { isSalonOwner: true });
    // } else {
    //   navigation.replace("PersonalInfo", { isSalonOwner: false });
    // }
  };

  return (
    <View style={styles.container}>
      {step === 1 ? (
        <>
          <Text style={styles.heading}>Welcome!</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Are you a salon owner?</Text>
            <Switch
              value={isSalonOwner}
              onValueChange={setIsSalonOwner}
              trackColor={{ false: "#ccc", true: "#9370DB" }}
              thumbColor={isSalonOwner ? "#9370DB" : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={sendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.heading}>Enter OTP</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter 4-digit OTP"
            keyboardType="numeric"
            maxLength={4}
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity style={styles.button} onPress={verifyOtp}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep(1)}>
            <Text
              style={{ color: "#9370DB", marginTop: 20, textAlign: "center" }}
            >
              Change Phone Number
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 28,
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
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#9370DB",
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
