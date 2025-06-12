import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const SlotManagementScreen = ({ navigation }) => {
  const [defaultDuration, setDefaultDuration] = useState("");
  const [bufferTime, setBufferTime] = useState("");

  const handleSubmit = () => {
    if (!defaultDuration) return;
    navigation.navigate("SalonDashboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Slot Management</Text>

      <TextInput
        style={styles.input}
        placeholder="Default Slot Duration (in mins)"
        keyboardType="numeric"
        value={defaultDuration}
        onChangeText={setDefaultDuration}
      />
      <TextInput
        style={styles.input}
        placeholder="Buffer Time (optional)"
        keyboardType="numeric"
        value={bufferTime}
        onChangeText={setBufferTime}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SlotManagementScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: {
    fontSize: 22,
    color: "#9370DB",
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#9370DB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: { backgroundColor: "#9370DB", padding: 14, borderRadius: 10 },
  buttonText: { textAlign: "center", color: "#fff", fontWeight: "600" },
});
