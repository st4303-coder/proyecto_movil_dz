import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const APP_TOKEN = process.env.EXPO_PUBLIC_API_APP_TOKEN;

let onUnauthorizedCallback = null;

export function setUnauthorizedHandler(fn) {
  onUnauthorizedCallback = fn;
}

export async function apiAuth(endpoint, options = {}) {
  const userToken = await SecureStore.getItemAsync("user_token");

  const headers = {
    "Content-Type": "application/json",
    "app-token": APP_TOKEN, 
    ...options.headers,
  };

  if (userToken) {
    headers.Authorization = `Bearer ${userToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 401) {
    await SecureStore.deleteItemAsync("user_token");
    await SecureStore.deleteItemAsync("user_data");
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
    throw new Error("Sesión expirada o no autorizada (401).");
  }

  if (response.status === 403) {
    Alert.alert("Acceso restringido (403)", "No tienes permisos para realizar esta acción.");
    throw new Error("Acceso restringido (403).");
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.msg || `Error HTTP ${response.status}`);
  }

  return data;
}