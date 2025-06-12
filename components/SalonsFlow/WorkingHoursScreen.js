import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const WorkingHoursScreen = ({ navigation }) => {
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [seatCount, setSeatCount] = useState("");
  const [weeklyOff, setWeeklyOff] = useState("");

  const handleNext = () => {
    if (!openTime || !closeTime || !seatCount) return;
    navigation.navigate("SlotManagement");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Set Working Hours</Text>

      <TextInput
        style={styles.input}
        placeholder="Opening Time (e.g., 10:00)"
        value={openTime}
        onChangeText={setOpenTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Closing Time (e.g., 20:00)"
        value={closeTime}
        onChangeText={setCloseTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Total Seats"
        keyboardType="numeric"
        value={seatCount}
        onChangeText={setSeatCount}
      />
      <TextInput
        style={styles.input}
        placeholder="Weekly Off Day (e.g., Sunday)"
        value={weeklyOff}
        onChangeText={setWeeklyOff}
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next: Slot Management</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WorkingHoursScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: {
    fontSize: 22,
    color: "#9370DB",
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 35,
  },
  input: {
    borderWidth: 1,
    borderColor: "#9370DB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#9370DB",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: { textAlign: "center", color: "#fff", fontWeight: "600" },
});
