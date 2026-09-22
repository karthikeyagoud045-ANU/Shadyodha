import { Platform } from "react-native";

// On Android Emulator localhost is 10.0.2.2, on iOS simulator it's localhost
export const DEFAULT_API_URL = Platform.select({
  android: "http://10.0.2.2:5001/api",
  ios: "http://localhost:5001/api",
  default: "http://localhost:5001/api",
});

let currentApiUrl = DEFAULT_API_URL;
let authToken: string | null = null;

export function setApiUrl(url: string) {
  currentApiUrl = url;
}

export function getApiUrl(): string {
  return currentApiUrl;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${currentApiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}
