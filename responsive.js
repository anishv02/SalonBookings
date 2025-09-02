// Enhanced responsive.js
import { Dimensions, PixelRatio, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// Enhanced device categorization
const DEVICE_SIZES = {
  // Small phones (iPhone SE, small Android)
  SMALL: { minWidth: 0, maxWidth: 375, minHeight: 0, maxHeight: 667 },
  // Regular phones (iPhone 12/13, most Android)
  MEDIUM: { minWidth: 376, maxWidth: 414, minHeight: 668, maxHeight: 896 },
  // Large phones (iPhone Pro Max, large Android)
  LARGE: { minWidth: 415, maxWidth: 480, minHeight: 897, maxHeight: 950 },
  // Tablets and foldables
  TABLET: {
    minWidth: 481,
    maxWidth: Infinity,
    minHeight: 951,
    maxHeight: Infinity,
  },
};

// Determine device category
const getDeviceCategory = () => {
  for (const [category, dimensions] of Object.entries(DEVICE_SIZES)) {
    if (
      width >= dimensions.minWidth &&
      width <= dimensions.maxWidth &&
      height >= dimensions.minHeight &&
      height <= dimensions.maxHeight
    ) {
      return category;
    }
  }
  // Fallback based on width only
  if (width <= 375) return "SMALL";
  if (width <= 414) return "MEDIUM";
  if (width <= 480) return "LARGE";
  return "TABLET";
};

const deviceCategory = getDeviceCategory();
const isSmallDevice = deviceCategory === "SMALL";
const isMediumDevice = deviceCategory === "MEDIUM";
const isLargeDevice = deviceCategory === "LARGE";
const isTablet = deviceCategory === "TABLET";

// Base dimensions for scaling
const baseWidth = 390; // iPhone 12/13 width
const baseHeight = 844; // iPhone 12/13 height

// Enhanced scaling with device-specific multipliers
const getScaleMultiplier = (type = "horizontal") => {
  const multipliers = {
    SMALL: { horizontal: 0.85, vertical: 0.9, font: 0.88 },
    MEDIUM: { horizontal: 1.0, vertical: 1.0, font: 1.0 },
    LARGE: { horizontal: 1.1, vertical: 1.05, font: 1.05 },
    TABLET: { horizontal: 1.3, vertical: 1.2, font: 1.15 },
  };

  return multipliers[deviceCategory]?.[type] || 1.0;
};

// Enhanced scale function
export const scale = (size) => {
  const ratio = width / baseWidth;
  const multiplier = getScaleMultiplier("horizontal");
  let newSize = size * ratio * multiplier;

  // Apply bounds to prevent extreme scaling
  const minScale = size * 0.6;
  const maxScale = size * 1.5;

  newSize = Math.max(minScale, Math.min(maxScale, newSize));

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Enhanced vertical scale function
export const verticalScale = (size) => {
  const ratio = height / baseHeight;
  const multiplier = getScaleMultiplier("vertical");
  let newSize = size * ratio * multiplier;

  // Apply bounds for vertical scaling
  const minScale = size * 0.7;
  const maxScale = size * 1.3;

  newSize = Math.max(minScale, Math.min(maxScale, newSize));

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Enhanced moderate scale
export const moderateScale = (size, factor = 0.5) => {
  const scaledSize = scale(size);
  return size + (scaledSize - size) * factor;
};

// Enhanced font scaling with better device support
export const responsiveFontSize = (fontSize) => {
  const ratio = Math.min(width / baseWidth, height / baseHeight);
  const multiplier = getScaleMultiplier("font");
  let scaledSize = fontSize * ratio * multiplier;

  // Platform-specific adjustments
  if (Platform.OS === "android") {
    scaledSize = scaledSize * 0.95;
  }

  // Pixel density consideration
  const pixelRatio = PixelRatio.get();
  if (pixelRatio >= 3) {
    scaledSize = scaledSize * 1.02; // Slight increase for high-density screens
  }

  // Enhanced device-specific adjustments
  const adjustments = {
    SMALL: 0.88,
    MEDIUM: 1.0,
    LARGE: 1.05,
    TABLET: 1.15,
  };

  scaledSize = scaledSize * (adjustments[deviceCategory] || 1.0);

  // Stricter bounds for fonts
  const minSize = fontSize * 0.75;
  const maxSize = fontSize * 1.4;

  scaledSize = Math.max(minSize, Math.min(maxSize, scaledSize));

  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

// Enhanced width percentage
export const wp = (percentage) => {
  const value = (percentage * width) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Enhanced height percentage
export const hp = (percentage) => {
  const value = (percentage * height) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Device-aware spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
  // Add device-specific spacing
  cardPadding: isSmallDevice ? scale(10) : scale(12),
  sectionMargin: isSmallDevice ? verticalScale(15) : verticalScale(20),
  headerPadding: isSmallDevice ? scale(12) : scale(16),
};

// Device-aware border radius
export const borderRadius = {
  xs: scale(2),
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  xxl: scale(24),
  round: scale(50),
  // Card specific radius
  card: isSmallDevice ? scale(8) : scale(12),
  button: isSmallDevice ? scale(6) : scale(8),
};

// Enhanced device type detection
export const deviceType = {
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  category: deviceCategory,
  width,
  height,
  pixelRatio: PixelRatio.get(),
  isAndroid: Platform.OS === "android",
  isIOS: Platform.OS === "ios",
};

// Responsive dimensions helper
export const getDimensions = () => ({
  window: Dimensions.get("window"),
  screen: Dimensions.get("screen"),
});

// Safe area helpers for different devices
export const safeArea = {
  top: Platform.OS === "ios" ? (height >= 812 ? 44 : 20) : 0,
  bottom: Platform.OS === "ios" ? (height >= 812 ? 34 : 0) : 0,
};

// Enhanced component-specific helpers
export const getCardWidth = (columns = 2, margin = 5) => {
  const totalMargin = margin * 2 * columns;
  const spacing = margin * (columns - 1);
  return (wp(100) - totalMargin - spacing) / columns;
};

export const getButtonHeight = () => {
  if (isSmallDevice) return verticalScale(40);
  if (isTablet) return verticalScale(50);
  return verticalScale(44);
};

export const getHeaderHeight = () => {
  if (isSmallDevice) return verticalScale(60);
  if (isTablet) return verticalScale(80);
  return verticalScale(70);
};

// Export screen dimensions
export const screenWidth = width;
export const screenHeight = height;
