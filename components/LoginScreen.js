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
  const [email, setEmail] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    Alert.alert(
      "Google Sign-In",
      "Google Sign-In functionality to be implemented"
    );
  };

  const handleContinue = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert("Invalid", "Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "http://43.204.228.20:5000/api/otp/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setShowOtpInput(true);
        Alert.alert("OTP Sent", "Please check your email for the OTP.");
      } else {
        Alert.alert("Error", result.message || "Failed to send OTP.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // OTP input handler (only allows 6 digits)
  const handleOtpChange = (value) => {
    if (/^\d{0,6}$/.test(value)) setOtp(value);
  };

  // Check if owner has shop
  const checkOwnerShop = async (userId) => {
    console.log("userid", userId);
    try {
      const response = await fetch(
        `http://43.204.228.20:5000/api/shops/getShops?id=${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      console.log("response:", response);
      console.log("Owner Shop Check Result:", result);

      if (response.ok) {
        // Shop found, navigate to SalonDashboard
        return true;
      } else {
        // No shop found, navigate to PersonalInfo
        return false;
      }
    } catch (error) {
      console.error("Error checking owner shop:", error);
      // In case of error, navigate to PersonalInfo for safety
      return false;
    }
  };

  // Check if customer exists
  const checkCustomerExists = async (userId) => {
    try {
      const response = await fetch(
        `http://43.204.228.20:5000/api/users/${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();

      if (response.ok && result) {
        // Customer found, navigate to HomeScreen
        return true;
      } else {
        // Customer not found, navigate to PersonalInfo
        return false;
      }
    } catch (error) {
      console.error("Error checking customer:", error);
      // In case of error, navigate to PersonalInfo for safety
      return false;
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "http://43.204.228.20:5000/api/otp/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      const result = await response.json();
      console.log("response:", response);
      console.log("OTP Verification Result:", result);

      if (response.ok || result.userType === "New") {
        Alert.alert("Success", "OTP verified successfully!");

        // Extract user info from the actual response structure
        const { user, token } = result;
        const _id = user?._id;
        const userType = user?.userType;
        const userEmail = user?.email;

        console.log(
          "User ID:",
          _id,
          "userType:",
          userType,
          "Email:",
          userEmail
        );

        // Check if user object exists - if not, treat as new user
        if (result.userType === "New") {
          console.log("No user data found, treating as new user");
          navigation.replace("PersonalInfo");
          setLoading(false);
          return;
        }

        // Handle existing users based on their userType
        if (userType === "owner") {
          console.log("Owner detected, checking for shop...");
          const hasShop = await checkOwnerShop(_id);
          console.log("Has shop:", hasShop);
          if (hasShop) {
            console.log("Navigating to SalonDashboard with ID:", _id);
            navigation.replace("SalonDashboard", { userId: _id });
          } else {
            console.log("No shop found, navigating to PersonalInfo");
            navigation.replace("PersonalInfo", { userId: _id });
          }
        } else if (userType === "customer") {
          console.log("Customer detected, checking existence...");
          const customerExists = await checkCustomerExists(_id);
          console.log("Customer exists:", customerExists);
          if (customerExists) {
            navigation.replace("Home", { userId: _id });
          } else {
            navigation.replace("PersonalInfo", { userId: _id });
          }
        } else {
          console.log("Unknown userType:", userType);
          Alert.alert(
            "Error",
            "Unknown user userType. Please complete your profile."
          );
          navigation.replace("PersonalInfo", { userId: _id });
        }
      } else {
        Alert.alert(
          "Error",
          result.message || "Invalid OTP. Please try again."
        );
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>

      {!showOtpInput ? (
        <>
          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <View style={styles.googleButtonContent}>
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
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Sending..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={{ fontSize: 16, marginBottom: 20, textAlign: "center" }}>
            Enter the 6-digit OTP sent to your email
          </Text>
          <View style={styles.otpContainer}>
            {[...Array(6)].map((_, idx) => (
              <TextInput
                key={idx}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={otp[idx] || ""}
                onChangeText={(val) => {
                  let newOtp = otp.split("");
                  newOtp[idx] = val.replace(/[^0-9]/g, "");
                  setOtp(newOtp.join("").slice(0, 6));
                  // Move to next input if not last and value entered
                  if (val && idx < 5) {
                    const nextInput = `otpInput${idx + 1}`;
                    if (refs[nextInput]) refs[nextInput].focus();
                  }
                }}
                ref={(ref) => (refs[`otpInput${idx}`] = ref)}
                autoFocus={idx === 0}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyOtp}
            disabled={otp.length !== 6 || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* New User Option */}
      {!showOtpInput && (
        <TouchableOpacity
          style={styles.newUserButton}
          onPress={() => {
            Alert.alert("New User", "Redirecting to registration...");
            navigation.navigate("PersonalInfo");
          }}
        >
          <Text style={styles.newUserText}>New User? Create Account</Text>
        </TouchableOpacity>
      )}

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

const refs = {};

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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 8,
  },
  otpInput: {
    width: 40,
    height: 48,
    borderWidth: 1,
    borderColor: "#9370DB",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    marginHorizontal: 4,
    backgroundColor: "#f9f9f9",
  },
});

export default LoginScreen;
