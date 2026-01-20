/**
 * Medication Color Utilities
 * Dynamically generates consistent, accessible pastel colors for medication pill icons
 * based on medication names - no hardcoded palette needed!
 */

import { colors } from "../../tailwind.config.js";

// WCAG AA contrast threshold
const MIN_CONTRAST = 4.5;

/**
 * Enhanced hash function to convert string to number with better distribution
 * @param {string} str - String to hash
 * @returns {number} Hash value
 */
function hashString(str) {
  let hash = 0;
  if (str.length === 0) return hash;

  // Use a better hash algorithm for better distribution
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
    // Add rotation for better distribution
    hash = (hash << 13) | (hash >>> 19);
  }

  // Ensure positive and well-distributed
  return Math.abs(hash) >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * Generate multiple hash values from a string for more randomness
 * @param {string} str - String to hash
 * @param {number} count - Number of hash values to generate
 * @returns {number[]} Array of hash values
 */
function generateHashes(str, count = 3) {
  const hashes = [];
  for (let i = 0; i < count; i++) {
    // Use different seeds for each hash
    let hash = hashString(str + i.toString() + str.length.toString());
    // Mix in character positions for more variation
    for (let j = 0; j < str.length; j++) {
      hash = (hash << 3) ^ (hash >> 5) ^ (str.charCodeAt(j) * (i + 1));
    }
    hashes.push(Math.abs(hash));
  }
  return hashes;
}

/**
 * Convert hex to HSL
 * @param {string} hex - Hex color string
 * @returns {{h: number, s: number, l: number}} HSL values
 */
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {{r: number, g: number, b: number}} RGB values (0-255)
 */
function hslToRgb(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to hex string
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string
 */
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Calculate relative luminance for WCAG contrast calculation
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {number} Relative luminance (0-1)
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @param {number} lum1 - Luminance of first color
 * @param {number} lum2 - Luminance of second color
 * @returns {number} Contrast ratio
 */
function getContrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate color distance in HSL space (perceptual similarity)
 * Returns a value from 0-1 where 0 is identical and 1 is completely different
 * @param {string} hex1 - First hex color
 * @param {string} hex2 - Second hex color
 * @returns {number} Color distance (0-1)
 */
function getColorDistance(hex1, hex2) {
  const hsl1 = hexToHsl(hex1);
  const hsl2 = hexToHsl(hex2);

  // Calculate hue distance (circular, so account for wrap-around)
  let hueDiff = Math.abs(hsl1.h - hsl2.h);
  if (hueDiff > 180) {
    hueDiff = 360 - hueDiff; // Take the shorter path around the circle
  }
  const hueDistance = hueDiff / 180; // Normalize to 0-1

  // Calculate saturation and lightness differences
  const satDistance = Math.abs(hsl1.s - hsl2.s) / 100;
  const lightDistance = Math.abs(hsl1.l - hsl2.l) / 100;

  // Weighted distance (hue is most important for differentiation)
  // Hue: 60%, Saturation: 25%, Lightness: 15%
  const distance =
    hueDistance * 0.6 + satDistance * 0.25 + lightDistance * 0.15;

  return distance;
}

/**
 * Check if a color is too similar to existing colors
 * @param {string} newColorHex - New color to check
 * @param {string[]} existingColors - Array of existing color hex strings
 * @param {number} minDistance - Minimum distance threshold (0-1, default 0.15)
 * @returns {boolean} True if color is too similar to any existing color
 */
function isTooSimilar(newColorHex, existingColors = [], minDistance = 0.15) {
  if (!existingColors || existingColors.length === 0) {
    return false;
  }

  for (const existingColor of existingColors) {
    const distance = getColorDistance(newColorHex, existingColor);
    if (distance < minDistance) {
      return true; // Too similar
    }
  }

  return false; // Different enough
}

/**
 * Get design system color hues as seed values (for design system alignment)
 * @returns {Object} Object with hue values for each design system color
 */
function getDesignSystemHues() {
  try {
    return {
      primary: hexToHsl(colors.primary.DEFAULT).h,
      secondary: hexToHsl(colors.secondary.DEFAULT).h,
      success: hexToHsl(colors.success.DEFAULT).h,
      warning: hexToHsl(colors.warning.DEFAULT).h,
      danger: hexToHsl(colors.danger.DEFAULT).h,
      purple: hexToHsl(colors.patient?.purple || "#8b5cf6").h,
    };
  } catch {
    // Fallback if design system not available
    return {
      primary: 220, // Blue
      secondary: 350, // Pink
      success: 160, // Green
      warning: 40, // Amber
      danger: 0, // Red
      purple: 270, // Purple
    };
  }
}

/**
 * Generate a consistent, pastel color pair (background + icon) for a medication name
 * Dynamically generates colors using HSL - no hardcoded palette!
 * @param {string} medicationName - Name of the medication
 * @param {string[]} existingColors - Optional array of existing background color hex strings to avoid similarity
 * @param {number} minColorDistance - Minimum color distance threshold (0-1, default 0.15)
 * @returns {{bg: string, icon: string}} Object with background and icon colors
 */
export function getMedicationColor(
  medicationName,
  existingColors = [],
  minColorDistance = 0.15
) {
  if (!medicationName || typeof medicationName !== "string") {
    return { bg: "#f3f4f6", icon: "#6b7280" };
  }

  const normalizedName = medicationName.trim().toLowerCase();
  const hashes = generateHashes(normalizedName, 3);

  // Option 1: Use design system hues as seed (for alignment with design system)
  // Option 2: Use full 360-degree spectrum (for maximum variety)
  const useDesignSystemSeeds = true; // Set to false for completely random colors

  let hue;
  if (useDesignSystemSeeds) {
    // Pick a design system hue as base, then add variation
    const systemHues = getDesignSystemHues();
    const hueKeys = Object.keys(systemHues);
    const baseHueKey = hueKeys[hashes[0] % hueKeys.length];
    const baseHue = systemHues[baseHueKey];
    // Add variation: ±60 degrees for variety within color family
    const variation = (hashes[1] % 121) - 60; // -60 to +60
    hue = (baseHue + variation + 360) % 360;
  } else {
    // Completely random hue across full spectrum
    hue = hashes[0] % 360;
  }

  // Pastel saturation: 25-50% (soft, not too vibrant)
  const saturation = 25 + (hashes[1] % 26); // 25-50%

  // Pastel lightness for background: 80-92% (very light)
  let bgLightness = 80 + (hashes[2] % 13); // 80-92%

  // Generate initial background color
  let bgRgb = hslToRgb(hue, saturation, bgLightness);
  let bgHex = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);

  // Check if color is too similar to existing colors and adjust if needed
  if (existingColors && existingColors.length > 0) {
    let attempts = 0;
    const maxSimilarityAttempts = 20;
    const hueShiftIncrement = 30; // Shift hue by 30 degrees each attempt

    while (
      isTooSimilar(bgHex, existingColors, minColorDistance) &&
      attempts < maxSimilarityAttempts
    ) {
      // Shift hue to find a more distinct color
      hue = (hue + hueShiftIncrement) % 360;
      bgRgb = hslToRgb(hue, saturation, bgLightness);
      bgHex = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);
      attempts++;
    }

    // If still too similar after many attempts, try varying saturation/lightness
    if (
      isTooSimilar(bgHex, existingColors, minColorDistance) &&
      attempts >= maxSimilarityAttempts
    ) {
      // Try different saturation and lightness combinations
      for (let satOffset = 0; satOffset <= 20; satOffset += 5) {
        for (let lightOffset = 0; lightOffset <= 10; lightOffset += 2) {
          const trySat = Math.min(60, Math.max(20, saturation + satOffset));
          const tryLight = Math.min(
            95,
            Math.max(75, bgLightness + lightOffset)
          );
          bgRgb = hslToRgb(hue, trySat, tryLight);
          bgHex = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);

          if (!isTooSimilar(bgHex, existingColors, minColorDistance)) {
            bgLightness = tryLight;
            break;
          }
        }
        if (!isTooSimilar(bgHex, existingColors, minColorDistance)) {
          break;
        }
      }
    }
  }

  let bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // Generate icon color - darker version of same hue for contrast
  // Icon needs to be dark enough for good contrast on light background
  let iconLightness = 35 + (hashes[2] % 16); // 35-50% (darker)
  let iconSaturation = Math.min(70, saturation + 20); // More saturated for visibility

  let iconRgb = hslToRgb(hue, iconSaturation, iconLightness);
  let iconHex = rgbToHex(iconRgb.r, iconRgb.g, iconRgb.b);
  let iconLum = getLuminance(iconRgb.r, iconRgb.g, iconRgb.b);

  // Check contrast and adjust if needed
  let contrast = getContrastRatio(bgLum, iconLum);
  let attempts = 0;
  const maxAttempts = 10;

  while (contrast < MIN_CONTRAST && attempts < maxAttempts) {
    // Make icon darker for better contrast
    iconLightness = Math.max(20, iconLightness - 5);
    iconSaturation = Math.min(85, iconSaturation + 5);

    iconRgb = hslToRgb(hue, iconSaturation, iconLightness);
    iconHex = rgbToHex(iconRgb.r, iconRgb.g, iconRgb.b);
    iconLum = getLuminance(iconRgb.r, iconRgb.g, iconRgb.b);
    contrast = getContrastRatio(bgLum, iconLum);
    attempts++;
  }

  // If still insufficient, use a safe fallback
  if (contrast < MIN_CONTRAST) {
    // Use a darker version of the same hue
    iconLightness = 30;
    iconSaturation = 60;
    iconRgb = hslToRgb(hue, iconSaturation, iconLightness);
    iconHex = rgbToHex(iconRgb.r, iconRgb.g, iconRgb.b);
  }

  return {
    bg: bgHex,
    icon: iconHex,
  };
}

/**
 * Get medication color as a hex string (for backward compatibility)
 * @param {string} medicationName - Name of the medication
 * @returns {string} Background color as hex string
 */
export function getMedicationColorHex(medicationName) {
  return getMedicationColor(medicationName).bg;
}
