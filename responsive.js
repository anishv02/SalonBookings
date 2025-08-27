// Enhanced responsive.js
import { Dimensions, PixelRatio, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// Guideline sizes (iPhone 12/13 as base)
const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

// Get device info
const isTablet = width >= 768;
const isSmallDevice = width <= 375;
const isLargeDevice = width >= 414;

// Enhanced scaling functions
export const scale = (size) => {
  const newSize = (width / guidelineBaseWidth) * size;

  // Add bounds to prevent extreme scaling
  if (newSize < size * 0.7) return size * 0.7;
  if (newSize > size * 1.3) return size * 1.3;

  return newSize;
};

export const verticalScale = (size) => {
  const newSize = (height / guidelineBaseHeight) * size;

  // Add bounds for vertical scaling
  if (newSize < size * 0.8) return size * 0.8;
  if (newSize > size * 1.2) return size * 1.2;

  return newSize;
};

export const moderateScale = (size, factor = 0.5) => {
  const scaledSize = scale(size);
  return size + (scaledSize - size) * factor;
};

// Enhanced font scaling with platform consideration
export const responsiveFontSize = (fontSize) => {
  let scaledSize = (width / guidelineBaseWidth) * fontSize;

  // Platform-specific adjustments
  if (Platform.OS === "android") {
    scaledSize = scaledSize * 0.95; // Slightly smaller for Android
  }

  // Device-specific adjustments
  if (isSmallDevice) {
    scaledSize = scaledSize * 0.9;
  } else if (isLargeDevice) {
    scaledSize = scaledSize * 1.05;
  } else if (isTablet) {
    scaledSize = scaledSize * 1.1;
  }

  // Ensure minimum and maximum font sizes
  const minSize = 10;
  const maxSize = fontSize * 1.5;

  scaledSize = Math.max(minSize, Math.min(maxSize, scaledSize));

  return PixelRatio.roundToNearestPixel(scaledSize);
};

// Helper functions for common responsive values
export const wp = (percentage) => {
  const value = (percentage * width) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

export const hp = (percentage) => {
  const value = (percentage * height) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Responsive spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
};

// Responsive border radius
export const borderRadius = {
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  round: scale(50),
};

// Device type helpers
export const deviceType = {
  isSmallDevice,
  isLargeDevice,
  isTablet,
  width,
  height,
};

// Export dimensions for direct use
export const screenWidth = width;
export const screenHeight = height;
