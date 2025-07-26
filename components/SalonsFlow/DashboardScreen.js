import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const LandingPage = ({ onNavigate }) => {
  const navigation = useNavigation();
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTilePress = (route) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate(route);
    });
  };

  const availableHeight = screenHeight - 250; // Reduce header margin
  const tileHeight = (availableHeight - 32) / 2;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.backgroundDecorations}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.title}>Salon Dashboard</Text>
            <Text style={styles.subtitle}>Manage your salon with style ✨</Text>
          </View>

          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => navigation.navigate("profile")}
            activeOpacity={0.7}
          >
            <View style={styles.profileIconInner}>
              <Icon name="person" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.tilesContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Seats Management Tile */}
          <TouchableOpacity
            style={[
              styles.tile,
              styles.seatsManagementTile,
              { height: tileHeight },
            ]}
            onPress={() => handleTilePress("seats")}
            activeOpacity={0.9}
          >
            <View style={styles.tileGradient}>
              <View style={styles.tileContent}>
                <View style={styles.tileHeader}>
                  <View
                    style={[
                      styles.tileIconContainer,
                      styles.seatsIconContainer,
                    ]}
                  >
                    <Icon name="event-seat" size={32} color="#fff" />
                  </View>
                  <View style={styles.arrowContainer}>
                    <Icon name="arrow-forward-ios" size={20} color="#764ba2" />
                  </View>
                </View>

                <View style={styles.tileTextContainer}>
                  <Text style={styles.tileTitle}>Seats Management</Text>
                  <Text style={styles.tileSubtitle}>
                    Manage salon seats, stylists, and appointments with
                    real-time availability tracking
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Insights Tile */}
          <TouchableOpacity
            style={[styles.tile, styles.insightsTile, { height: tileHeight }]}
            onPress={() => handleTilePress("insights")}
            activeOpacity={0.9}
          >
            <View style={styles.tileGradient}>
              <View style={styles.tileContent}>
                <View style={styles.tileHeader}>
                  <View
                    style={[
                      styles.tileIconContainer,
                      styles.insightsIconContainer,
                    ]}
                  >
                    <Icon name="insights" size={32} color="#fff" />
                  </View>
                  <View style={styles.arrowContainer}>
                    <Icon
                      name="arrow-forward-ios"
                      size={20}
                      color="rgba(255,255,255,0.8)"
                    />
                  </View>
                </View>

                <View style={styles.tileTextContainer}>
                  <Text style={styles.tileTitle}>Business Insights</Text>
                  <Text style={styles.tileSubtitle}>
                    Comprehensive analytics and revenue tracking for data-driven
                    decisions
                  </Text>

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>₹45K</Text>
                      <Text style={styles.statLabel}>Today's Revenue</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>+12%</Text>
                      <Text style={styles.statLabel}>vs Yesterday</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },

  // Background Decorations
  backgroundDecorations: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
    opacity: 0.08,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: "#764ba2",
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: "#764ba2",
    top: 300,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: "#764ba2",
    bottom: 200,
    right: -50,
  },

  // Header Styles
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  titleContainer: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#8b7db8",
    marginBottom: 5,
    fontWeight: "500",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2d1b4e",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b5b73",
    textAlign: "center",
    fontStyle: "italic",
  },
  profileIcon: {
    position: "absolute",
    top: 0,
    right: 20,
    zIndex: 2,
  },
  profileIconInner: {
    width: 48,
    height: 48,
    backgroundColor: "#764ba2",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#764ba2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(118, 75, 162, 0.2)",
  },

  // Tiles Container
  tilesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  tile: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },

  // Seats Management Tile
  seatsManagementTile: {
    backgroundColor: "#764ba2",
  },

  // Insights Tile
  insightsTile: {
    backgroundColor: "#9d7bb8",
  },

  tileGradient: {
    flex: 1,
    padding: 3,
  },
  tileContent: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 21,
    padding: 24,
    backdropFilter: "blur(20px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  tileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tileIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  seatsIconContainer: {
    backgroundColor: "#764ba2",
  },
  insightsIconContainer: {
    backgroundColor: "#764ba2",
  },
  arrowContainer: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(118, 75, 162, 0.1)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(118, 75, 162, 0.2)",
  },
  tileTextContainer: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d1b4e",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  tileSubtitle: {
    fontSize: 16,
    color: "#6b5b73",
    lineHeight: 24,
    marginBottom: 20,
  },

  // Stats Container
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#764ba2",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8b7db8",
    textAlign: "center",
  },

  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    zIndex: 1,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d1b4e",
    marginBottom: 16,
    textAlign: "center",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionButton: {
    width: (screenWidth - 60) / 2,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(118, 75, 162, 0.1)",
    shadowColor: "#764ba2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    color: "#2d1b4e",
    marginTop: 8,
    fontWeight: "500",
  },
});

export default LandingPage;
