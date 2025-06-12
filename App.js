import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./components/UsersFlow/HomeScreen";
import SearchScreen from "./components/UsersFlow/SearchScreen";
import SalonDetailScreen from "./components/UsersFlow/SalonDetailScreen";
import ProfileScreen from "./components/UsersFlow/ProfileSection";
import FavouriteScreen from "./components/UsersFlow/FavouriteScreen";
import LoginScreen from "./components/LoginScreen";
import PersonalInfoScreen from "./components/UsersFlow/PersonalInfo";
import SalonOwnerRegistrationScreen from "./components/SalonsFlow/SalonOwnerRegistration";
import DashboardScreen from "./components/SalonsFlow/DashboardScreen";
import ServiceManagementScreen from "./components/SalonsFlow/ServiceManagementScreen";
import WorkingHoursScreen from "./components/SalonsFlow/WorkingHoursScreen";
import SlotManagementScreen from "./components/SalonsFlow/SlotManagementScreen";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PersonalInfo"
          component={PersonalInfoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SalonDetail"
          component={SalonDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Favourite"
          component={FavouriteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SalonOwnerRegistration"
          component={SalonOwnerRegistrationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SalonDashboard"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ServiceManagement"
          component={ServiceManagementScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WorkingHours"
          component={WorkingHoursScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SlotManagement"
          component={SlotManagementScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
