import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const { width: screenWidth } = Dimensions.get("window");

const DashboardScreen = () => {
  const [selectedTab, setSelectedTab] = useState("today");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Sample data - replace with your actual data source
  const todayAppointments = [
    {
      id: "1",
      name: "Marvin McKinney",
      service: "Hair & Bear Cut",
      time: "10:30 AM",
      price: "$15.00",
      worker: "Jane Cooper",
      status: "confirmed",
    },
    {
      id: "2",
      name: "Arlene McCoy",
      service: "Hair & Bear Cut",
      time: "10:30 AM",
      price: "$15.00",
      worker: "Jane Cooper",
      status: "confirmed",
    },
    {
      id: "3",
      name: "Ralph Edwards",
      service: "Hair & Bear Cut",
      time: "10:30 AM",
      price: "$15.00",
      worker: "Jane Cooper",
      status: "confirmed",
    },
    {
      id: "4",
      name: "Eleanor Pena",
      service: "Hair & Bear Cut",
      time: "10:30 AM",
      price: "$15.00",
      worker: "Jane Cooper",
      status: "confirmed",
    },
    {
      id: "5",
      name: "Esther Howard",
      service: "Hair & Bear Cut",
      time: "10:30 AM",
      price: "$15.00",
      worker: "Jane Cooper",
      status: "confirmed",
    },
  ];

  const services = [
    { name: "Hair & Bear Cut", booked: 124, price: "$315.00" },
    { name: "Face Wash", booked: 35, price: "$445.00" },
    { name: "Hair Color", booked: 25, price: "$125.00" },
    { name: "Body Massage", booked: 25, price: "$1125.00" },
  ];

  const analyticsData = {
    profileView: { value: 8574, change: "↑", percentage: "34%" },
    aptBook: { value: 34, change: "↑", percentage: "15.6%" },
    conversation: { value: 156, change: "↑", percentage: "15.6%" },
  };

  const chartData = {
    labels: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 65],
        color: (opacity = 1) => `rgba(147, 112, 219, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const recentTransactions = [
    {
      id: "1",
      name: "Robert Fox",
      date: "Wednesday, 7 Aug 2024",
      amount: "$35.00",
    },
    {
      id: "2",
      name: "Jerome Bell",
      date: "Wednesday, 7 Aug 2024",
      amount: "$25.00",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const AppointmentCard = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentName}>{item.name}</Text>
          <Text style={styles.appointmentService}>{item.service}</Text>
          <Text style={styles.appointmentWorker}>with {item.worker}</Text>
        </View>
        <View style={styles.appointmentTime}>
          <Text style={styles.appointmentPrice}>{item.price}</Text>
          <Text style={styles.appointmentTimeText}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  const ServiceCard = ({ item }) => (
    <View style={styles.serviceCard}>
      <Text style={styles.serviceName}>{item.name}</Text>
      <Text style={styles.serviceBooked}>{item.booked} Booked</Text>
      <Text style={styles.servicePrice}>{item.price}</Text>
    </View>
  );

  const AnalyticsCard = ({ title, data }) => (
    <View style={styles.analyticsCard}>
      <Text style={styles.analyticsTitle}>{title}</Text>
      <Text style={styles.analyticsValue}>{data.value}</Text>
      <View style={styles.analyticsChange}>
        <Text style={styles.analyticsPercentage}>
          {data.change} {data.percentage}
        </Text>
        <Text style={styles.analyticsWeekly}>Avg Weekly</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTime}>{formatTime(currentTime)}</Text>
        <Text style={styles.headerDate}>{formatDate(currentTime)}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Day Navigation */}
        <View style={styles.dayNavigation}>
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
            (day, index) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  day === "THU" && styles.activeDayButton,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    day === "THU" && styles.activeDayText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Appointments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>15 Appointment</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={todayAppointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AppointmentCard item={item} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Most Service List</Text>
            <Text style={styles.sectionSubtitle}>Recent Reviews</Text>
          </View>

          <FlatList
            data={services}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => <ServiceCard item={item} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>

          <View style={styles.analyticsContainer}>
            <AnalyticsCard
              title="Profile View"
              data={analyticsData.profileView}
            />
            <AnalyticsCard title="Apt-Book" data={analyticsData.aptBook} />
            <AnalyticsCard
              title="Conversation"
              data={analyticsData.conversation}
            />
          </View>

          {/* Chart */}
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={200}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(147, 112, 219, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#9370DB",
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Wallet</Text>

          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletLabel}>Available amount</Text>
              <TouchableOpacity style={styles.withdrawButton}>
                <Text style={styles.withdrawText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.walletAmount}>$1,387.00</Text>
            <Text style={styles.bankInfo}>Bank info</Text>
            <Text style={styles.accountNumber}>4298 7298 485 ****</Text>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          </View>

          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionAvatar}>
                <Text style={styles.transactionAvatarText}>
                  {transaction.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionName}>{transaction.name}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={styles.transactionAmount}>{transaction.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {[
          { name: "Book", icon: "📅" },
          { name: "Insight", icon: "📊" },
          { name: "Wallet", icon: "💳" },
          { name: "Chat", icon: "💬" },
          { name: "Profile", icon: "👤" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.navTab,
              tab.name === "Insight" && styles.activeNavTab,
            ]}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.navText,
                tab.name === "Insight" && styles.activeNavText,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTime: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212529",
  },
  headerDate: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 4,
  },
  dayNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    marginBottom: 10,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeDayButton: {
    backgroundColor: "#9370DB",
  },
  dayText: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  activeDayText: {
    color: "#ffffff",
  },
  section: {
    backgroundColor: "#ffffff",
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  viewAllText: {
    fontSize: 14,
    color: "#9370DB",
    fontWeight: "500",
  },
  appointmentCard: {
    marginBottom: 15,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#495057",
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 2,
  },
  appointmentService: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 2,
  },
  appointmentWorker: {
    fontSize: 12,
    color: "#9370DB",
  },
  appointmentTime: {
    alignItems: "flex-end",
  },
  appointmentPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 2,
  },
  appointmentTimeText: {
    fontSize: 14,
    color: "#6c757d",
  },
  serviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#212529",
    flex: 1,
  },
  serviceBooked: {
    fontSize: 14,
    color: "#6c757d",
    marginRight: 15,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  analyticsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  analyticsCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    marginHorizontal: 5,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  analyticsTitle: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 8,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  analyticsChange: {
    alignItems: "center",
  },
  analyticsPercentage: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "500",
  },
  analyticsWeekly: {
    fontSize: 10,
    color: "#6c757d",
  },
  chartContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  walletCard: {
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundColor: "#9370DB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  walletLabel: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
  },
  withdrawButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  withdrawText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
  },
  walletAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  bankInfo: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
  },
  transactionsHeader: {
    marginBottom: 15,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  transactionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#495057",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212529",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#6c757d",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  navTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
  },
  activeNavTab: {
    backgroundColor: "rgba(147, 112, 219, 0.1)",
    borderRadius: 12,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: "#6c757d",
  },
  activeNavText: {
    color: "#9370DB",
    fontWeight: "500",
  },
});

export default DashboardScreen;
