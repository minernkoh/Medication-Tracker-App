export const colors = {
  primary: {
    DEFAULT: "#155dfc",
    hover: "#0d4cdb",
  },
  secondary: {
    DEFAULT: "#da7488",
  },
  text: {
    primary: "#181818",
    secondary: "#646464",
  },
  background: {
    default: "#f8faff",
    subtle: "#f1f5f9",
    hover: "#eef2ff",
  },
  border: {
    default: "#e2e8f0",
    subtle: "#f1f5f9",
  },
  icon: {
    primary: "#181818",
    secondary: "#646464",
  },
};

export const getPrimaryColor = (mode) => {
  return mode === "Caregiver"
    ? colors.secondary.DEFAULT
    : colors.primary.DEFAULT;
};

export const getModeColors = (mode) => {
  return mode === "Caregiver"
    ? { DEFAULT: colors.secondary.DEFAULT }
    : { DEFAULT: colors.primary.DEFAULT };
};
