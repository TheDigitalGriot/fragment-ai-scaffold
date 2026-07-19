import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "{{PACKAGE_SCOPE}}:host-url";
// Simulator: localhost works. Physical device: use the machine's LAN IP
// (ws://192.168.x.x:PORT) or a relay wss:// URL. EXPO_PUBLIC_HOST_URL overrides.
const DEFAULT_URL = process.env.EXPO_PUBLIC_HOST_URL ?? "ws://localhost:6767";

export async function loadHostUrl(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEY)) ?? DEFAULT_URL;
  } catch {
    return DEFAULT_URL;
  }
}

export async function saveHostUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, url.trim());
  } catch {}
}
