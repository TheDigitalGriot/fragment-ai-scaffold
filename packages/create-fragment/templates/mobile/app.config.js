const fs = require("node:fs");
const path = require("node:path");
const pkg = require("./package.json");
const appVariant = process.env.APP_VARIANT ?? "production";

// Single-source the version from repo-root VERSION so mobile versions in lockstep
// with every other surface; fall back to pkg.version (e.g. on EAS build machines).
function resolveVersion() {
  try {
    const v = fs.readFileSync(path.resolve(__dirname, "../../VERSION"), "utf8").trim();
    if (v) return v;
  } catch {}
  return pkg.version;
}

// NOTE: replace `com.example.*` with your own reverse-DNS bundle IDs before release.
const variants = {
  production: { name: "{{PROJECT_NAME}}", packageId: "com.example.{{PROJECT_NAME}}" },
  development: { name: "{{PROJECT_NAME}} Debug", packageId: "com.example.{{PROJECT_NAME}}.debug" },
};
const variant = variants[appVariant] ?? variants.production;

module.exports = {
  expo: {
    name: variant.name,
    slug: "{{PROJECT_NAME}}",
    scheme: "{{PROJECT_NAME}}",
    version: resolveVersion(),
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    runtimeVersion: { policy: "appVersion" },
    ios: { supportsTablet: true, bundleIdentifier: variant.packageId },
    android: {
      package: variant.packageId,
      edgeToEdgeEnabled: true,
      // Required so RELEASE builds may reach ws://<LAN-IP>:<port> local hosts.
      usesCleartextTraffic: true,
    },
    web: { output: "single" },
    plugins: [
      "expo-router",
      ["expo-splash-screen", { resizeMode: "contain", backgroundColor: "#0a0a12", dark: { backgroundColor: "#0a0a12" } }],
      ["expo-build-properties", { android: { usesCleartextTraffic: true } }],
    ],
    experiments: { typedRoutes: true },
    // EAS project id + owner come from env — never hardcode. Omit blocks when unset.
    ...(process.env.EAS_PROJECT_ID
      ? {
          updates: { url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID}` },
          extra: { eas: { projectId: process.env.EAS_PROJECT_ID } },
        }
      : {}),
    ...(process.env.EAS_OWNER ? { owner: process.env.EAS_OWNER } : {}),
  },
};
