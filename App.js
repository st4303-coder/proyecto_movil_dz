// App.js
import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import CatalogoScreen from "./src/screens/CatalogoScreen";
import SolicitudPrestamoScreen from "./src/screens/SolicitudPrestamoScreen";
import MisPrestamosScreen from "./src/screens/MisPrestamosScreen";

function MainNavigator() {
  const { isAuthenticated, booting, handleLogout } = useAuth();
  const [authScreen, setAuthScreen] = useState("Login"); // "Login" | "Register"
  const [appScreen, setAppScreen] = useState("Catalogo"); // "Catalogo" | "SolicitudPrestamo" | "MisPrestamos"
  const [selectedBook, setSelectedBook] = useState(null);

  const navigation = {
    navigate: (screenName, params = {}) => {
      if (screenName === "Login" || screenName === "Register") {
        setAuthScreen(screenName);
        return;
      }
      if (params.book) {
        setSelectedBook(params.book);
      }
      setAppScreen(screenName);
    },
    goBack: () => {
      setAppScreen("Catalogo");
    },
  };

  if (booting) {
    return (
      <View style={styles.center}>
        <Text>Cargando sesión...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    if (authScreen === "Register") {
      return <RegisterScreen navigation={navigation} />;
    }
    return <LoginScreen navigation={navigation} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {appScreen === "Catalogo" && <CatalogoScreen navigation={navigation} />}
        {appScreen === "SolicitudPrestamo" && (
          <SolicitudPrestamoScreen
            route={{ params: { book: selectedBook } }}
            navigation={navigation}
          />
        )}
        {appScreen === "MisPrestamos" && <MisPrestamosScreen navigation={navigation} />}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E3E6EE",
    alignItems: "center",
  },
  navBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
  },
  navBtnActive: {
    backgroundColor: "#1E3A8A",
  },
  navText: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 13,
  },
  navTextActive: {
    color: "#FFFFFF",
  },
  logoutBtn: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FDE8E8",
  },
  logoutText: {
    color: "#B91C1C",
    fontWeight: "600",
    fontSize: 13,
  },
  content: { flex: 1 },
});