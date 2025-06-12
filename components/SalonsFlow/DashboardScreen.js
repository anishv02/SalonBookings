import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const DashboardScreen = () => {
  const todayAppointments = [
    { id: "1", name: "Ravi Sharma", time: "11:00 AM" },
    { id: "2", name: "Anjali Mehra", time: "2:30 PM" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today’s Appointments</Text>
      <FlatList
        data={todayAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.name}</Text>
            <Text>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: {
    fontSize: 24,
    color: "#9370DB",
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#9370DB",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
});
