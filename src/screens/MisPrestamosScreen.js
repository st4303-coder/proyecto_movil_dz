// src/screens/MisPrestamosScreen.js
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getMyLoans } from "../services/loansService";
import usuarioIcon from "../assets/usuario.png";
import regresar from "../assets/atras.png";
import BottomNavBar from "../components/BottomNavBar";

const FILTROS = ["Todos", "Prestados", "Devueltos"];

export default function MisPrestamosScreen({ navigation }) {
  const { user, handleLogout } = useAuth();

  const [loans, setLoans] = useState([]);
  const [filtro, setFiltro] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const nombreUsuario =
    user?.nombre ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "Alumno Demo equipo-a2");

  const matriculaUsuario =
    user?.matricula ||
    user?.codigo ||
    (user?.email ? user.email.toUpperCase() : "DEMO-EQUIPO-A2");

  const cargarPrestamos = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getMyLoans();
      setLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || "No se pudieron cargar tus préstamos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPrestamos();
  }, []);

  const prestamosFiltrados = loans.filter((item) => {
    const estadoRaw = String(
      item?.estado || item?.status || ""
    ).toUpperCase();
    if (filtro === "Prestados") {
      return estadoRaw.includes("PREST") || estadoRaw.includes("ACTIVO");
    }
    if (filtro === "Devueltos") {
      return estadoRaw.includes("DEVU") || estadoRaw.includes("ENTREG");
    }
    return true;
  });

  const handleBackToCatalog = () => {
    setMenuOpen(false);
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation?.navigate?.("Catalogo");
    }
  };

  const renderPrestamo = ({ item }) => {
    const tituloLibro =
      item?.libroTitulo ||
      item?.libro?.titulo ||
      item?.titulo ||
      item?.bookTitle ||
      "Libro sin título";
    const fechaPrestamo =
      item?.fechaPrestamo || item?.loanDate || item?.createdAt?.slice(0, 10) || "—";
    const fechaLimite =
      item?.fechaLimite || item?.fechaDevolucionLimite || item?.dueDate || "—";
    const estadoRaw = String(item?.estado || item?.status || "PRESTADO").toUpperCase();
    const esDevuelto = estadoRaw.includes("DEVU");

    return (
      <View style={styles.loanCard}>
        <Text style={styles.bookTitle}>{tituloLibro}</Text>
        <Text style={styles.datesText}>
          Préstamo: {fechaPrestamo} | Límite: {fechaLimite}
        </Text>

        <View
          style={[
            styles.statusBadge,
            esDevuelto ? styles.statusReturned : styles.statusActive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              esDevuelto ? styles.statusTextReturned : styles.statusTextActive,
            ]}
          >
            {esDevuelto ? "DEVUELTO" : "PRESTADO"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.leftNav}>
            <Pressable
              onPress={handleBackToCatalog}
              style={styles.backBtn}
              accessibilityLabel="Regresar al catálogo"
            >
              <Image
                source={regresar}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </Pressable>
          </View>

          <View style={styles.topUserAnchor}>
            <Pressable
              onPress={() => setMenuOpen((prev) => !prev)}
              style={styles.topUserBox}
              accessibilityRole="button"
              accessibilityExpanded={menuOpen}
            >
              <Text style={styles.topChevron}>{menuOpen ? "▴" : "▾"}</Text>

              <View style={styles.topUserTextCol}>
                <Text style={styles.topWelcome}>BIENVENIDO(A)</Text>
                <Text style={styles.topUserName} numberOfLines={1}>
                  {nombreUsuario}
                </Text>
                <Text style={styles.topUserSub} numberOfLines={1}>
                  Matrícula: {matriculaUsuario}
                </Text>
              </View>

              <View style={styles.topAvatarBox}>
                <Image
                  source={usuarioIcon}
                  style={styles.topAvatarImg}
                  resizeMode="contain"
                />
              </View>
            </Pressable>

            {menuOpen && (
              <View style={styles.topDropdown}>
                <Pressable
                  onPress={async () => {
                    setMenuOpen(false);
                    await handleLogout();
                  }}
                  style={styles.topLogoutBtn}
                >
                  <Text style={styles.topLogoutText}>Salir</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.titleCol}>
            <Text style={styles.title}>Mis préstamos</Text>
            <Text style={styles.subtitle}>Consulta tus libros activos e historial</Text>
          </View>
        </View>

        <View style={styles.filtersRow}>
          {FILTROS.map((item) => {
            const active = filtro === item;
            return (
              <Pressable
                key={item}
                onPress={() => setFiltro(item)}
                style={[styles.filterBtn, active && styles.filterBtnActive]}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    active && styles.filterBtnTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingText}>Cargando préstamos...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Pressable onPress={cargarPrestamos} style={styles.retryBtn}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={prestamosFiltrados}
            keyExtractor={(item, idx) =>
              String(item?.id ?? item?._id ?? item?.prestamoId ?? idx)
            }
            renderItem={renderPrestamo}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  No hay préstamos en esta categoría.
                </Text>
              </View>
            }
          />
        )}
        <BottomNavBar activeRoute="MisPrestamos" navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E3E6EE",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    zIndex: 20,
  },
  leftNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topUserAnchor: {
    position: "relative",
  },
  topUserBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 8,
  },
  topChevron: {
    fontSize: 13,
    color: "#4B5563",
  },
  topUserTextCol: {
    alignItems: "flex-end",
    maxWidth: 180,
  },
  topWelcome: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#1E3A8A",
    textTransform: "uppercase",
  },
  topUserName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
  },
  topUserSub: {
    fontSize: 11,
    color: "#4B5563",
  },
  topAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  topAvatarImg: {
    width: 22,
    height: 22,
  },
  topDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
    borderRadius: 10,
    padding: 8,
    minWidth: 120,
    alignItems: "flex-end",
    zIndex: 30,
    elevation: 5,
  },
  topLogoutBtn: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#FDE8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  topLogoutText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B91C1C",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 12,
    gap: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
  },
  backIcon: {
    width: 18,
    height: 18,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 1,
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 8,
  },
  filterBtn: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  filterBtnTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  loanCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
    borderRadius: 12,
    padding: 16,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  datesText: {
    fontSize: 13.5,
    color: "#4B5563",
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: "#DBEAFE",
  },
  statusReturned: {
    backgroundColor: "#DCFCE7",
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  statusTextActive: {
    color: "#1E40AF",
  },
  statusTextReturned: {
    color: "#15803D",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#4B5563",
  },
  errorBox: {
    marginHorizontal: 16,
    backgroundColor: "#FDE8E8",
    borderWidth: 1,
    borderColor: "#F3A5A5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13.5,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#B91C1C",
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#4B5563",
    fontSize: 14,
  },
});