// src/components/BottomNavBar.js
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import catalogoIcon from "../assets/folleto.png";
import prestamosIcon from "../assets/libro.png";

export default function BottomNavBar({ activeRoute = "Catalogo", navigation }) {
  const goTo = (routeName) => {
    if (activeRoute === routeName) return;
    navigation?.navigate?.(routeName);
  };

  return (
    <View style={styles.bottomNavBar}>
      <Pressable
        onPress={() => goTo("Catalogo")}
        style={styles.bottomNavItem}
        accessibilityLabel="Ir a Catálogo"
      >
        <Image
          source={catalogoIcon}
          style={[
            styles.bottomNavIcon,
            activeRoute !== "Catalogo" && styles.bottomNavIconInactive,
          ]}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.bottomNavLabel,
            activeRoute === "Catalogo" && styles.bottomNavLabelActive,
          ]}
        >
          Catálogo
        </Text>
      </Pressable>

      <Pressable
        onPress={() => goTo("MisPrestamos")}
        style={styles.bottomNavItem}
        accessibilityLabel="Ir a Mis préstamos"
      >
        <Image
          source={prestamosIcon}
          style={[
            styles.bottomNavIcon,
            activeRoute !== "MisPrestamos" && styles.bottomNavIconInactive,
          ]}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.bottomNavLabel,
            activeRoute === "MisPrestamos" && styles.bottomNavLabelActive,
          ]}
        >
          Mis préstamos
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E3E6EE",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bottomNavItem: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bottomNavIcon: {
    width: 22,
    height: 22,
  },
  bottomNavIconInactive: {
    opacity: 0.55,
  },
  bottomNavLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#6B7280",
  },
  bottomNavLabelActive: {
    color: "#1E3A8A",
    fontWeight: "700",
  },
});