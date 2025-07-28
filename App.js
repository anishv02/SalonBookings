import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./components/UsersFlow/HomeScreen";
import SearchScreen from "./components/UsersFlow/SearchScreen";
import SalonDetailScreen from "./components/UsersFlow/SalonDetailScreen";
import ProfileScreen from "./components/UsersFlow/ProfileSection";
import FavouriteScreen from "./components/UsersFlow/FavouriteScreen";
import LoginScreen from "./components/LoginScreen";
import PersonalInfoScreen from "./components/PersonalInfo";
import SalonOwnerRegistrationScreen from "./components/SalonsFlow/SalonOwnerRegistration";
import DashboardScreen from "./components/SalonsFlow/DashboardScreen";
import ServiceManagementScreen from "./components/SalonsFlow/ServiceManagementScreen";
import WorkingHoursScreen from "./components/SalonsFlow/WorkingHoursScreen";
import SlotManagementScreen from "./components/SalonsFlow/SlotManagementScreen";
import PhoneVerification from "./components/UsersFlow/PhoneVerification";
import SalonProfileScreen from "./components/SalonsFlow/SalonProfileScreen";
import CustomersView from "./components/SalonsFlow/CustomerViewComponent";
import CustomerDetailView from "./components/SalonsFlow/CustomerDetailView";
import SeatsView from "./components/SalonsFlow/SeatsViewmanagement";
import ManageServicesScreen from "./components/SalonsFlow/ManageServicesScreen";
import ScheduleManagementScreen from "./components/SalonsFlow/ScheduleManagement";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        setInitialRoute("Login");
      } else {
        setInitialRoute("Login");
      }
    };
    checkUser();
  }, []);

  if (!initialRoute) return null; // or a loading spinner

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
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
        <Stack.Screen
          name="PhoneVerification"
          component={PhoneVerification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SalonProfile"
          component={SalonProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CustomersView"
          component={CustomersView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="customerDetails"
          component={CustomerDetailView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="seats"
          component={SeatsView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="profile"
          component={SalonProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManageServices"
          component={ManageServicesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ScheduleManagement"
          component={ScheduleManagementScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
