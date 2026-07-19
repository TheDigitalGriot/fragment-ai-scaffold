// Mirrors packages/ui/src/styles/bridge.css :root tokens for React Native
// (no CSS custom properties on native). Keep in sync with the web tokens.
export const tokens = {
  color: {
    bgPrimary: "#0a0a12",
    bgSecondary: "#12121e",
    bgTertiary: "#1a1a2e",
    textPrimary: "#e0e0e0",
    textSecondary: "#888",
    textDim: "#555",
    border: "#222",
    accent: "#ff8c32",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 12 },
  fontSize: { xs: 11, sm: 13, md: 14, lg: 16 },
} as const;
