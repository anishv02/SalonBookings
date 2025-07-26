import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");

  const handleGoogleSignIn = () => {
    // Implement Google Sign-In logic here
    Alert.alert(
      "Google Sign-In",
      "Google Sign-In functionality to be implemented"
    );
  };

  const handleContinue = () => {
    if (phone.length !== 10) {
      Alert.alert("Invalid", "Please enter a valid 10-digit phone number");
      return;
    }

    // Continue with phone number logic
    Alert.alert("Success", "Proceeding with phone number: " + phone);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>

      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
      >
        <View style={styles.googleButtonContent}>
          {/* Google Icon placeholder - you can replace with actual Google icon */}
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Login with Gmail</Text>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        value={phone}
        onChangeText={setPhone}
      />
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* New User Option */}
      <TouchableOpacity
        style={styles.newUserButton}
        onPress={() => {
          Alert.alert("New User", "Redirecting to registration...");
          navigation.navigate("PersonalInfo"); // Uncomment when you have a register screen
        }}
      >
        <Text style={styles.newUserText}>New User? Create Account</Text>
      </TouchableOpacity>

      {/* Register as Salon Owner */}
      {/* <TouchableOpacity
        style={styles.salonOwnerButton}
        onPress={() => {
          navigation.navigate("SalonOwnerRegistration");
        }}
      >
        <Text style={styles.salonOwnerText}>Register as Salon Owner</Text>
      </TouchableOpacity>*/}

      {/* Terms and Privacy Policy */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{"\n"}
          <Text style={styles.termsLink}>Terms of Service</Text>
          <Text style={styles.termsText}> & </Text>
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
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
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
  },
  googleButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleIconText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#666",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#9370DB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  newUserButton: {
    padding: 12,
    marginBottom: 12,
  },
  newUserText: {
    textAlign: "center",
    color: "#9370DB",
    fontWeight: "500",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  salonOwnerButton: {
    padding: 12,
    marginBottom: 30,
  },
  salonOwnerText: {
    textAlign: "center",
    color: "#FF6B35",
    fontWeight: "500",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  termsContainer: {
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    fontSize: 12,
    color: "#9370DB",
    fontWeight: "600",
  },
});
