import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const OTP = ({ otp, setOtp, loading, onVerify }) => {
  const refs = useRef([]);

  return (
    <View>
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
                refs.current[idx + 1]?.focus();
              }
            }}
            ref={(ref) => (refs.current[idx] = ref)}
            autoFocus={idx === 0}
          />
        ))}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={onVerify}
        disabled={otp.length !== 6 || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default OTP;
