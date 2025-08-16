// utils/authStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "user_token";

export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing token:", error);
  }
};
