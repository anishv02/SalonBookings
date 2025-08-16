import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { jwtDecode } from "jwt-decode";
import { getToken } from "./utils/authStorage"; // ✅ Import token getter

// Screens
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
import LocationSelectionScreen from "./components/UsersFlow/LocationSelectScreen";
import ScheduleManagementScreen from "./components/SalonsFlow/ScheduleManagement";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken();

        console.log("Token retrieved:", token);

        if (token) {
          const decoded = jwtDecode(token);
          console.log("Decoded token:", decoded);

          // Optional: Check token expiry here
          const now = Date.now() / 1000;
          if (decoded.exp && decoded.exp < now) {
            console.log("Token expired");
            setInitialRoute("Login");
            return;
          }

          // Store user data for passing to components
          setUserData({
            userId: decoded.userId || decoded.id || decoded.sub, // Handle different JWT structures
            email: decoded.email,
            userType: decoded.userType,
            // Add any other fields you need from the token
          });

          // Navigate based on userType
          if (decoded.userType === "owner") {
            setInitialRoute("SalonDashboard");
          } else if (decoded.userType === "customer") {
            setInitialRoute("Home");
          } else {
            setInitialRoute("Login");
          }
        } else {
          setInitialRoute("Login");
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        setInitialRoute("Login");
      }
    };

    checkToken();
  }, []);

  if (!initialRoute) return null; // Optional: show splash or loader

  // Custom screen wrapper to pass userData
  const screenWrapper = (Component, name) => {
    return (props) => {
      // Pass userData as props to all screens
      return <Component {...props} userData={userData} />;
    };
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Login"
          component={screenWrapper(LoginScreen, "Login")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PersonalInfo"
          component={screenWrapper(PersonalInfoScreen, "PersonalInfo")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={screenWrapper(HomeScreen, "Home")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={screenWrapper(SearchScreen, "Search")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SalonDetail"
          component={screenWrapper(SalonDetailScreen, "SalonDetail")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={screenWrapper(ProfileScreen, "Profile")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Favourite"
          component={screenWrapper(FavouriteScreen, "Favourite")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SalonOwnerRegistration"
          component={screenWrapper(
            SalonOwnerRegistrationScreen,
            "SalonOwnerRegistration"
          )}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SalonDashboard"
          component={screenWrapper(DashboardScreen, "SalonDashboard")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ServiceManagement"
          component={screenWrapper(
            ServiceManagementScreen,
            "ServiceManagement"
          )}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WorkingHours"
          component={screenWrapper(WorkingHoursScreen, "WorkingHours")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SlotManagement"
          component={screenWrapper(SlotManagementScreen, "SlotManagement")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PhoneVerification"
          component={screenWrapper(PhoneVerification, "PhoneVerification")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SalonProfile"
          component={screenWrapper(SalonProfileScreen, "SalonProfile")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CustomersView"
          component={screenWrapper(CustomersView, "CustomersView")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="customerDetails"
          component={screenWrapper(CustomerDetailView, "customerDetails")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="seats"
          component={screenWrapper(SeatsView, "seats")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="profile"
          component={screenWrapper(SalonProfileScreen, "profile")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManageServices"
          component={screenWrapper(ManageServicesScreen, "ManageServices")}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ScheduleManagement"
          component={screenWrapper(
            ScheduleManagementScreen,
            "ScheduleManagement"
          )}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LocationSelection"
          component={screenWrapper(
            LocationSelectionScreen,
            "LocationSelection"
          )}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
