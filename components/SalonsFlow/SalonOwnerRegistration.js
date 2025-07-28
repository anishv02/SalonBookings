import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // <-- Make sure this is installed

const SalonOwnerRegistrationScreen = ({ navigation }) => {
  const [shopName, setShopName] = useState("");
  const [shopOwnerName, setShopOwnerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [salonType, setSalonType] = useState("men");
  const [seatCount, setSeatCount] = useState("1");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [salonImage, setSalonImage] = useState(null);

  // Validation function
  const validateForm = () => {
    if (!shopName.trim()) {
      Alert.alert("Error", "Please enter salon name");
      return false;
    }
    if (!shopOwnerName.trim()) {
      Alert.alert("Error", "Please enter owner name");
      return false;
    }
    if (!contactNumber.trim() || contactNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid contact number");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email");
      return false;
    }
    if (!address.trim()) {
      Alert.alert("Error", "Please enter address");
      return false;
    }
    if (!city.trim()) {
      Alert.alert("Error", "Please enter city");
      return false;
    }
    if (!state.trim()) {
      Alert.alert("Error", "Please enter state");
      return false;
    }
    if (!pincode.trim() || pincode.length < 5) {
      Alert.alert("Error", "Please enter a valid pincode");
      return false;
    }
    if (!seatCount.trim() || parseInt(seatCount) < 1) {
      Alert.alert("Error", "Please enter valid seat count (minimum 1)");
      return false;
    }
    if (!openTime.trim()) {
      Alert.alert("Error", "Please enter opening time");
      return false;
    }
    if (!closeTime.trim()) {
      Alert.alert("Error", "Please enter closing time");
      return false;
    }
    return true;
  };

  // Format time to HH:MM format if needed
  const formatTime = (time) => {
    // If time is already in HH:MM format, return as is
    if (time.includes(":")) return time;

    // If time is in HHMM format, add colon
    if (time.length === 4) {
      return time.substring(0, 2) + ":" + time.substring(2);
    }

    return time;
  };

  // Image picker handler
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setSalonImage({
        uri: selectedAsset.uri,
        type: selectedAsset.type || "image/jpeg",
        name: selectedAsset.fileName || `salon_image_${Date.now()}.jpg`,
      });
    }
  };

  const handleRegistration = async () => {
    // Commented out validation and API for now
    // if (!validateForm()) return;

    // setLoading(true);

    // const registrationData = {
    //   shopName: shopName.trim(),
    //   shopOwnerName: shopOwnerName.trim(),
    //   contactNumber: contactNumber.trim(),
    //   email: email.trim().toLowerCase(),
    //   address: address.trim(),
    //   city: city.trim(),
    //   state: state.trim(),
    //   pincode: pincode.trim(),
    //   salonType: salonType,
    //   seatCount: parseInt(seatCount),
    //   openTime: formatTime(openTime.trim()),
    //   closeTime: formatTime(closeTime.trim()),
    //   rating: 0,
    //   reviews: "",
    // };

    // const formData = new FormData();
    // Object.keys(registrationData).forEach((key) => {
    //   formData.append(key, registrationData[key]);
    // });
    // if (salonImage) {
    //   formData.append("profileImage", {
    //     uri: salonImage.uri,
    //     type: salonImage.type,
    //     name: salonImage.name,
    //   });
    // }

    // try {
    //   const response = await fetch(
    //     "http://43.204.228.20:5000/api/shops/register",
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "multipart/form-data",
    //       },
    //       body: formData,
    //     }
    //   );

    //   const result = await response.json();

    //   if (response.ok) {
    //     Alert.alert("Success", "Salon registered successfully!", [
    //       {
    //         text: "OK",
    //         onPress: () => {
    //           navigation.navigate("ServiceManagement", {
    //             salonData: result,
    //           });
    //         },
    //       },
    //     ]);
    //   } else {
    //     Alert.alert(
    //       "Registration Failed",
    //       result.message || "Something went wrong. Please try again."
    //     );
    //   }
    // } catch (error) {
    //   console.error("Registration error:", error);
    //   Alert.alert(
    //     "Network Error",
    //     "Unable to connect to server. Please check your internet connection and try again."
    //   );
    // } finally {
    //   setLoading(false);
    // }

    // For now, just navigate to ServiceManagement without restrictions
    navigation.navigate("ServiceManagement");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Register Your Salon</Text>

      {/* Image Picker Field */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {salonImage ? (
          <Image
            source={{ uri: salonImage.uri }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.imagePickerText}>Select Salon Image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Salon Name *"
        value={shopName}
        onChangeText={setShopName}
      />

      <TextInput
        style={styles.input}
        placeholder="Owner Name *"
        value={shopOwnerName}
        onChangeText={setShopOwnerName}
      />

      <TextInput
        style={styles.input}
        placeholder="Contact Number *"
        keyboardType="phone-pad"
        value={contactNumber}
        onChangeText={setContactNumber}
        maxLength={10}
      />

      <TextInput
        style={styles.input}
        placeholder="Email *"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Address *"
        multiline
        numberOfLines={2}
        value={address}
        onChangeText={setAddress}
      />

      <TextInput
        style={styles.input}
        placeholder="City *"
        value={city}
        onChangeText={setCity}
      />

      <TextInput
        style={styles.input}
        placeholder="State *"
        value={state}
        onChangeText={setState}
      />

      <TextInput
        style={styles.input}
        placeholder="Pincode *"
        keyboardType="numeric"
        value={pincode}
        onChangeText={setPincode}
        maxLength={6}
      />

      <Text style={styles.label}>Salon Type *</Text>
      <View style={styles.radioContainer}>
        {["men", "women", "unisex"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSalonType(type)}
            style={[styles.radio, salonType === type && styles.selected]}
          >
            <Text
              style={[
                styles.radioText,
                { color: salonType === type ? "#fff" : "#9370DB" },
              ]}
            >
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Number of Seats *"
        keyboardType="numeric"
        value={seatCount}
        onChangeText={setSeatCount}
      />

      <View style={styles.timeContainer}>
        <View style={styles.timeInputContainer}>
          <Text style={styles.timeLabel}>Opening Time *</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={openTime}
            onChangeText={setOpenTime}
          />
        </View>

        <View style={styles.timeInputContainer}>
          <Text style={styles.timeLabel}>Closing Time *</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={closeTime}
            onChangeText={setCloseTime}
          />
        </View>
      </View>

      <Text style={styles.requiredNote}>* Required fields</Text>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegistration}
        disabled={false} // No restrictions
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register Salon</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 45,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    color: "#9370DB",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#9370DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#9370DB",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  radio: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#9370DB",
    borderRadius: 20,
    marginRight: 10,
  },
  selected: {
    backgroundColor: "#9370DB",
  },
  radioText: {
    fontWeight: "500",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  timeInputContainer: {
    flex: 0.48,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
    fontWeight: "500",
  },
  timeInput: {
    marginBottom: 0,
  },
  requiredNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
  },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#9370DB",
    borderRadius: 10,
    height: 120,
    marginBottom: 18,
    marginTop: 8,
    overflow: "hidden",
  },
  imagePickerText: {
    color: "#9370DB",
    fontSize: 16,
    fontWeight: "500",
  },
  imagePreview: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
});

export default SalonOwnerRegistrationScreen;
