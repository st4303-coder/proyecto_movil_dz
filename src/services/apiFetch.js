// src/services/apiFetch.js
import { Alert } from "react-native";
import { getItem, deleteItem } from "../utils/storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const APP_TOKEN = process.env.EXPO_PUBLIC_API_APP_TOKEN;

let onUnauthorizedCallback = null;

export function setUnauthorizedHandler(fn) {
  onUnauthorizedCallback = fn;
}

export async function apiFetch(endpoint, options = {}) {
  const userToken = await getItem("user_token");

  const headers = {
    "Content-Type": "application/json",
    "x-api-token": APP_TOKEN,
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

  const normalizedEndpoint = endpoint.startsWith("/api")
    ? endpoint
    : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(`${API_URL}${normalizedEndpoint}`, config);

  if (response.status === 401) {
    await deleteItem("user_token");
    await deleteItem("user_data");
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
    const fieldErrors = Array.isArray(data?.errors) && data.errors.length > 0
      ? data.errors.map((e) => e.mensaje || e.message).filter(Boolean).join(" • ")
      : "";
    throw new Error(fieldErrors || data?.message || data?.msg || `Error HTTP ${response.status}`);
  }

  return data;
}