import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getBooks } from "../services/booksService";
import usuarioIcon from "../assets/usuario.png";
import buscador from "../assets/buscador.png";
import BottomNavBar from "../components/BottomNavBar";

const CATEGORIAS = [
  "Todas",
  "Software",
  "Literatura",
  "Redes",
  "Matemáticas",
  "Computación",
  "Física",
  "Ingeniería",
  "Química",
];

export default function CatalogoScreen({ navigation }) {
  const { user, handleLogout } = useAuth();

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todas");
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

  const cargarLibros = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getBooks({ search, categoria });
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || "No se pudo cargar el catálogo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarLibros();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoria]);

  const renderLibro = ({ item }) => {
    const titulo = item?.titulo || item?.title || "Libro sin título";
    const autor = item?.autor || item?.author || "Autor desconocido";
    const cat = item?.categoria || item?.category || "General";
    const disponibles =
      item?.disponibles ?? item?.stock ?? item?.cantidadDisponible ?? 0;
    const hayStock = Number(disponibles) > 0;

    return (
      <View style={styles.bookCard}>
        <View style={styles.bookTopRow}>
          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>{cat}</Text>
          </View>
          <Text
            style={[
              styles.stockText,
              { color: hayStock ? "#15803D" : "#B91C1C" },
            ]}
          >
            {hayStock ? `Disponibles: ${disponibles}` : "Sin stock"}
          </Text>
        </View>

        <Text style={styles.bookTitle}>{titulo}</Text>
        <Text style={styles.bookAuthor}>{autor}</Text>

        <Pressable
          disabled={!hayStock}
          onPress={() =>
            navigation?.navigate?.("SolicitudPrestamo", { libro: item })
          }
          style={[styles.requestBtn, !hayStock && styles.requestBtnDisabled]}
        >
          <Text
            style={[
              styles.requestBtnText,
              !hayStock && styles.requestBtnTextDisabled,
            ]}
          >
            {hayStock ? "Solicitar préstamo" : "No disponible"}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.leftNav}>
          </View>

          <View style={styles.topUserAnchor}>
            <Pressable
              onPress={() => setMenuOpen((prev) => !prev)}
              style={styles.topUserBox}
              accessibilityRole="button"
              accessibilityExpanded={menuOpen}
            >
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

              <Text style={styles.topChevron}>{menuOpen ? "▴" : "▾"}</Text>
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

        <View style={styles.headerTitles}>
          <Text style={styles.title}>Catálogo</Text>
          <Text style={styles.subtitle}>Busca por título o autor</Text>
        </View>

        <View style={styles.searchBox}>
          <Image
            source={buscador}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar libro o autor..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchField}
          />
        </View>

        <View style={styles.chipsWrapper}>
          <FlatList
            data={CATEGORIAS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.chipsContent}
            renderItem={({ item }) => {
              const active = categoria === item;
              return (
                <Pressable
                  onPress={() => setCategoria(item)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingText}>Cargando libros...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Pressable onPress={cargarLibros} style={styles.retryBtn}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={books}
            keyExtractor={(item, idx) => String(item?.id ?? item?._id ?? idx)}
            renderItem={renderLibro}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  No se encontraron libros con esa búsqueda.
                </Text>
              </View>
            }
          />
        )}
        <BottomNavBar activeRoute="Catalogo" navigation={navigation} />
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
  navPill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  navPillActive: {
    backgroundColor: "#1E3A8A",
  },
  navPillText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  navPillTextActive: {
    color: "#FFFFFF",
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
  topChevron: {
    fontSize: 13,
    color: "#4B5563",
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
  headerTitles: {
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13.5,
    color: "#4B5563",
    marginTop: 2,
  },
  searchInput: {
    height: 44,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14.5,
    color: "#111827",
    marginBottom: 10,
  },
  chipsWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  chipsContent: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E3E6EE",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 10,
  },
  searchIcon: {
    width: 18,
    height: 18,
    flexShrink: 0,
  },
  searchField: {
    flex: 1,
    height: "100%",
    fontSize: 14.5,
    color: "#111827",
  },
  bookCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
    borderRadius: 14,
    padding: 16,
  },
  bookTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  catBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  catBadgeText: {
    color: "#1E3A8A",
    fontSize: 12,
    fontWeight: "600",
  },
  stockText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  bookTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 13.5,
    color: "#4B5563",
    marginBottom: 14,
  },
  requestBtn: {
    height: 40,
    borderRadius: 8,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
  },
  requestBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  requestBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  requestBtnTextDisabled: {
    color: "#6B7280",
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
