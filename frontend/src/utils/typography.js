/**
 * Typography Utilities
 * Predefined text style combinations for consistent typography across the app
 * 
 * Usage:
 * import { textStyles } from "../utils/typography";
 * 
 * // In JSX
 * <p className={textStyles.heading.large}>Large Heading</p>
 * <p className={textStyles.body.medium}>Body text</p>
 */

export const textStyles = {
  // Heading styles
  heading: {
    "4xl": "font-poppins font-bold text-4xl leading-[3rem]", // 40px, 48px line-height
    "3xl": "font-poppins font-bold text-3xl leading-[2.5rem]", // 32px, 40px line-height
    "2xl": "font-poppins font-bold text-2xl leading-[2rem]", // 24px, 32px line-height
    xl: "font-poppins font-bold text-xl leading-[1.75rem]", // 20px, 28px line-height
    large: "font-poppins font-bold text-lg leading-[1.75rem]", // 18px, 28px line-height
    medium: "font-poppins font-bold text-lg leading-[1.75rem]", // 18px, 28px line-height
    small: "font-poppins font-semibold text-base leading-6", // 16px, 24px line-height
  },
  // Body text styles
  body: {
    large: "font-poppins font-normal text-lg leading-[1.75rem]", // 18px, 28px line-height
    medium: "font-poppins font-normal text-base leading-6", // 16px, 24px line-height
    small: "font-poppins font-normal text-sm leading-[1.25rem]", // 14px, 20px line-height
    xs: "font-poppins font-normal text-xs leading-4", // 12px, 16px line-height
  },
  // Caption styles (smaller, lighter text)
  caption: {
    medium: "font-poppins font-normal text-sm leading-[1.25rem] text-text-secondary", // 14px
    small: "font-poppins font-normal text-xs leading-4 text-text-secondary", // 12px
  },
  // Label styles (for form labels, etc.)
  label: {
    medium: "font-poppins font-semibold text-sm leading-[1.25rem]", // 14px
    small: "font-poppins font-semibold text-xs leading-4", // 12px
  },
};

/**
 * Helper function to combine typography classes with color classes
 * @param {string} style - The text style key (e.g., "heading.large")
 * @param {string} color - Optional color class (e.g., "text-text-primary")
 * @returns {string} Combined className string
 */
export const getTextStyle = (style, color = "") => {
  const [category, variant] = style.split(".");
  if (!textStyles[category] || !textStyles[category][variant]) {
    console.warn(`Text style "${style}" not found. Using default.`);
    return textStyles.body.medium + (color ? ` ${color}` : "");
  }
  return textStyles[category][variant] + (color ? ` ${color}` : "");
};
