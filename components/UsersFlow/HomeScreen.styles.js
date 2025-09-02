const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.headerPadding,
    paddingTop:
      Platform.OS === "android"
        ? verticalScale(15) + safeArea.top
        : verticalScale(10) + safeArea.top,
    paddingBottom: verticalScale(15),
    minHeight: getHeaderHeight(),
  },
  headerLeft: {
    flex: 1,
    maxWidth: wp(deviceType.isTablet ? 75 : 65),
    justifyContent: "flex-start",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: wp(deviceType.isTablet ? 20 : 30),
  },
  greetingText: {
    fontSize: font(deviceType.isSmallDevice ? 13 : 14),
    color: "#999",
    lineHeight: font(deviceType.isSmallDevice ? 16 : 18),
  },
  welcomeText: {
    fontSize: font(
      deviceType.isSmallDevice ? 18 : deviceType.isTablet ? 24 : 20
    ),
    fontWeight: "bold",
    color: "#000",
    lineHeight: font(
      deviceType.isSmallDevice ? 22 : deviceType.isTablet ? 28 : 24
    ),
    marginTop: verticalScale(2),
  },

  // Enhanced Filter Button Styles
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingVertical: verticalScale(deviceType.isSmallDevice ? 6 : 8),
    paddingHorizontal: scale(deviceType.isSmallDevice ? 8 : 12),
    borderRadius: borderRadius.button,
    marginRight: scale(deviceType.isSmallDevice ? 6 : 10),
    borderWidth: 1,
    borderColor: "#9370DB",
    minHeight: getButtonHeight() * 0.8,
    maxWidth: wp(25),
  },
  filterButtonText: {
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#9370DB",
    fontWeight: "500",
    marginHorizontal: scale(4),
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },

  // Enhanced Filter Dropdown Styles
  filterDropdown: {
    position: "absolute",
    top: getHeaderHeight() + verticalScale(10),
    right: spacing.headerPadding,
    backgroundColor: "#fff",
    borderRadius: borderRadius.lg,
    paddingVertical: verticalScale(8),
    minWidth: scale(120),
    maxWidth: wp(40),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    minHeight: verticalScale(44),
  },
  selectedFilterOption: {
    backgroundColor: "#F8F6FF",
  },
  filterOptionText: {
    fontSize: font(14),
    color: "#333",
    lineHeight: font(18),
    flex: 1,
  },
  selectedFilterOptionText: {
    color: "#9370DB",
    fontWeight: "600",
  },
  filterIndicator: {
    fontSize: font(deviceType.isSmallDevice ? 12 : 14),
    color: "#9370DB",
    fontWeight: "normal",
  },
  notificationButton: {
    width: scale(deviceType.isSmallDevice ? 36 : 40),
    height: scale(deviceType.isSmallDevice ? 36 : 40),
    borderRadius: scale(deviceType.isSmallDevice ? 18 : 20),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },

  // Enhanced Location status styles
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(6),
    maxWidth: wp(deviceType.isTablet ? 60 : 55),
    minHeight: verticalScale(20),
    flexWrap: deviceType.isSmallDevice ? "wrap" : "nowrap",
  },
  locationStatusText: {
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#4CAF50",
    marginLeft: scale(4),
    marginRight: scale(4),
    flex: 1,
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },
  locationStatusTextGray: {
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#666",
    marginLeft: scale(4),
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },
  locationRetryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    backgroundColor: "#f0f0f0",
    borderRadius: borderRadius.button,
    minHeight: verticalScale(28),
    marginBottom: deviceType.isSmallDevice ? verticalScale(4) : 0,
  },
  locationRetryText: {
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#9370DB",
    marginLeft: scale(4),
    fontWeight: "500",
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },
  manualLocationButton: {
    marginLeft: deviceType.isSmallDevice ? 0 : scale(8),
    marginTop: deviceType.isSmallDevice ? verticalScale(4) : 0,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    backgroundColor: "#f8f8f8",
    borderRadius: borderRadius.button,
    minHeight: verticalScale(28),
  },
  manualLocationText: {
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#9370DB",
    fontWeight: "500",
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },

  // Enhanced Search container
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.headerPadding,
    marginTop: verticalScale(deviceType.isSmallDevice ? 12 : 15),
    alignItems: "center",
    marginBottom: verticalScale(5),
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    height: getButtonHeight(),
    minHeight: getButtonHeight(),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: font(deviceType.isSmallDevice ? 13 : 14),
    color: "#999",
    lineHeight: font(deviceType.isSmallDevice ? 16 : 18),
  },
  searchFilterButton: {
    width: getButtonHeight(),
    height: getButtonHeight(),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: borderRadius.md,
    marginLeft: scale(10),
  },

  // Enhanced ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.headerPadding,
    paddingBottom: verticalScale(20),
  },

  // Enhanced Categories
  categoriesContainer: {
    marginTop: spacing.sectionMargin,
    marginBottom: verticalScale(10),
  },
  categoryItem: {
    alignItems: "center",
    marginRight: scale(deviceType.isSmallDevice ? 15 : 20),
    minWidth: scale(60),
  },
  categoryIconContainer: {
    width: scale(deviceType.isSmallDevice ? 45 : deviceType.isTablet ? 60 : 50),
    height: scale(
      deviceType.isSmallDevice ? 45 : deviceType.isTablet ? 60 : 50
    ),
    borderRadius: scale(
      deviceType.isSmallDevice ? 22.5 : deviceType.isTablet ? 30 : 25
    ),
    backgroundColor: "#9370DB",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    marginTop: verticalScale(6),
    fontSize: font(deviceType.isSmallDevice ? 11 : 12),
    color: "#333",
    textAlign: "center",
    lineHeight: font(deviceType.isSmallDevice ? 14 : 16),
  },

  // Enhanced Sections
  sectionContainer: {
    marginTop: spacing.sectionMargin,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(15),
    minHeight: verticalScale(24),
  },
  sectionTitle: {
    fontSize: font(
      deviceType.isSmallDevice ? 16 : deviceType.isTablet ? 20 : 18
    ),
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    lineHeight: font(
      deviceType.isSmallDevice ? 20 : deviceType.isTablet ? 24 : 22
    ),
  },
  seeAllText: {
    fontSize: font(deviceType.isSmallDevice ? 13 : 14),
    color: "#9370DB",
    fontWeight: "500",
    lineHeight: font(deviceType.isSmallDevice ? 16 : 18),
  },

  // Enhanced Salon list styles
  salonsList: {
    paddingBottom: verticalScale(20),
  },
  salonRow: {
    justifyContent: "space-between",
    marginBottom: verticalScale(15),
  },
  salonRowTablet: {
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
  },

  // Enhanced Nearby Salon Card Styles
  nearbyCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.card,
    width: getCardWidth(deviceType.isTablet ? 3 : 2, spacing.headerPadding / 2),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    minHeight: verticalScale(
      deviceType.isSmallDevice ? 220 : deviceType.isTablet ? 280 : 250
    ),
  },
  nearbyImage: {
    width: "100%",
    height: verticalScale(
      deviceType.isSmallDevice ? 100 : deviceType.isTablet ? 140 : 120
    ),
    backgroundColor: "#f0f0f0",
  },
  nearbyInfo: {
    padding: spacing.cardPadding,
    flex: 1,
    justifyContent: "space-between",
  },
  nearbyName: {
    fontSize: font(
      deviceType.isSmallDevice ? 13 : deviceType.isTablet ? 16 : 14
    ),
    fontWeight: "600",
    color: "#333",
    marginBottom: verticalScale(4),
    lineHeight: font(
      deviceType.isSmallDevice ? 16 : deviceType.isTablet ? 20 : 18
    ),
  },
  nearbyLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(4),
    minHeight: verticalScale(16),
  },
  nearbyLocation: {
    fontSize: font(
      deviceType.isSmallDevice ? 10 : deviceType.isTablet ? 13 : 11
    ),
    color: "#666",
    marginLeft: scale(3),
    flex: 1,
    lineHeight: font(
      deviceType.isSmallDevice ? 13 : deviceType.isTablet ? 16 : 15
    ),
  },
  nearbyAddress: {
    fontSize: font(
      deviceType.isSmallDevice ? 9 : deviceType.isTablet ? 12 : 10
    ),
    color: "#999",
    marginBottom: verticalScale(8),
    lineHeight: font(
      deviceType.isSmallDevice ? 12 : deviceType.isTablet ? 15 : 14
    ),
  },
  nearbyBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: verticalScale(20),
    marginBottom: verticalScale(4),
  },
  nearbyRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: borderRadius.xs,
    minHeight: verticalScale(20),
  },
  nearbyRatingText: {
    fontSize: font(
      deviceType.isSmallDevice ? 10 : deviceType.isTablet ? 13 : 11
    ),
    color: "#333",
    marginLeft: scale(2),
    fontWeight: "500",
    lineHeight: font(
      deviceType.isSmallDevice ? 13 : deviceType.isTablet ? 16 : 15
    ),
  },
  nearbyDistance: {
    fontSize: font(
      deviceType.isSmallDevice ? 9 : deviceType.isTablet ? 12 : 10
    ),
    color: "#9370DB",
    fontWeight: "500",
    lineHeight: font(
      deviceType.isSmallDevice ? 12 : deviceType.isTablet ? 15 : 14
    ),
  },

  // Enhanced Salon Type Badge
  salonTypeBadge: {
    backgroundColor: "#9370DB",
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: borderRadius.xs,
    alignSelf: "flex-start",
    marginTop: verticalScale(6),
    minHeight: verticalScale(16),
    justifyContent: "center",
  },
  salonTypeText: {
    fontSize: font(deviceType.isSmallDevice ? 8 : deviceType.isTablet ? 11 : 9),
    color: "#fff",
    fontWeight: "600",
    lineHeight: font(
      deviceType.isSmallDevice ? 10 : deviceType.isTablet ? 13 : 12
    ),
  },

  // Enhanced Loading and error states
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    minHeight: verticalScale(60),
  },
  loadingText: {
    marginLeft: scale(10),
    fontSize: font(14),
    color: "#999",
    lineHeight: font(18),
  },
  errorContainer: {
    alignItems: "center",
    padding: spacing.lg,
    minHeight: verticalScale(80),
  },
  errorText: {
    fontSize: font(14),
    color: "#666",
    marginBottom: verticalScale(15),
    textAlign: "center",
    lineHeight: font(20),
    paddingHorizontal: spacing.sm,
  },
  retryButton: {
    backgroundColor: "#9370DB",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: borderRadius.button,
    minHeight: getButtonHeight(),
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: font(14),
    fontWeight: "600",
    lineHeight: font(18),
  },
  noDataContainer: {
    alignItems: "center",
    padding: spacing.lg,
    minHeight: verticalScale(120),
  },
  noDataText: {
    fontSize: font(14),
    color: "#666",
    marginBottom: verticalScale(15),
    textAlign: "center",
    lineHeight: font(20),
    paddingHorizontal: spacing.sm,
  },
  refreshButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: borderRadius.button,
    marginTop: verticalScale(10),
    minHeight: getButtonHeight(),
    justifyContent: "center",
  },
  refreshButtonText: {
    color: "#9370DB",
    fontSize: font(14),
    fontWeight: "600",
    lineHeight: font(18),
  },
  searchCityButton: {
    backgroundColor: "#9370DB",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: borderRadius.button,
    marginBottom: verticalScale(10),
    minHeight: getButtonHeight(),
    justifyContent: "center",
  },
  searchCityButtonText: {
    color: "#fff",
    fontSize: font(14),
    fontWeight: "600",
    lineHeight: font(18),
  },

  // Enhanced Bottom Tab Bar
  bottomTabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    backgroundColor: "#fff",
    paddingVertical: verticalScale(deviceType.isSmallDevice ? 8 : 10),
    paddingBottom:
      Platform.OS === "android"
        ? verticalScale(deviceType.isSmallDevice ? 8 : 10)
        : verticalScale(deviceType.isSmallDevice ? 12 : 15) + safeArea.bottom,
    minHeight:
      verticalScale(
        deviceType.isSmallDevice ? 55 : deviceType.isTablet ? 70 : 60
      ) + safeArea.bottom,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: scale(4),
  },
  activeTab: {
    borderTopColor: "#9370DB",
  },
  tabText: {
    fontSize: font(
      deviceType.isSmallDevice ? 9 : deviceType.isTablet ? 12 : 10
    ),
    color: "#999",
    marginTop: verticalScale(3),
    lineHeight: font(
      deviceType.isSmallDevice ? 11 : deviceType.isTablet ? 14 : 12
    ),
    textAlign: "center",
  },
  activeTabText: {
    fontSize: font(
      deviceType.isSmallDevice ? 9 : deviceType.isTablet ? 12 : 10
    ),
    color: "#9370DB",
    marginTop: verticalScale(3),
    lineHeight: font(
      deviceType.isSmallDevice ? 11 : deviceType.isTablet ? 14 : 12
    ),
    textAlign: "center",
  },
});
