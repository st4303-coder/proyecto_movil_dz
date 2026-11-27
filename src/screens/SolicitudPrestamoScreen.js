import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { createBookLoan } from "../services/loansService";

function getMaxReturnDateISO() {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 15);
  return maxDate.toISOString().split("T")[0];
}

export default function SolicitudPrestamoScreen({ route, navigation }) {
  const { book } = route.params;
  const { user } = useAuth();

  const todayISO = new Date().toISOString().split("T")[0];
  const maxISO = getMaxReturnDateISO();

  const [fechaDevolucionEstimada, setFechaDevolucionEstimada] = useState(maxISO);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!fechaDevolucionEstimada.trim()) {
      setErrorMsg("Ingresa la fecha de devolución estimada (YYYY-MM-DD).");
      return;
    }
    if (fechaDevolucionEstimada < todayISO || fechaDevolucionEstimada > maxISO) {
      setErrorMsg("La fecha debe estar entre hoy y máximo 15 días.");
      return;
    }

    setLoading(true);
    try {
      await createBookLoan({
        bookId: book.id || book._id,
        userId: user?.id || user?._id,
        fechaDevolucionEstimada,
      });
      navigation.navigate("MisPrestamos");
    } catch (err) {
      setErrorMsg(err.message || "Error al solicitar préstamo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{book.titulo}</Text>
      <Text style={styles.meta}>Autor: {book.autor} | ISBN: {book.isbn}</Text>
      <Text style={styles.label}>Fecha devolución estimada (máx. 15 días, YYYY-MM-DD):</Text>
      <TextInput
        value={fechaDevolucionEstimada}
        onChangeText={setFechaDevolucionEstimada}
        placeholder="2026-12-05"
        style={styles.input}
      />
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      <Pressable onPress={handleSubmit} disabled={loading} style={styles.primaryBtn}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryText}>Confirmar préstamo</Text>
        )}
      </Pressable>

      <Pressable onPress={() => navigation.goBack()} style={styles.secondaryBtn}>
        <Text style={styles.secondaryText}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB", padding: 16, gap: 10 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  meta: { color: "#4B5563", fontSize: 13 },
  label: { color: "#111827", fontWeight: "600", marginTop: 6 },
  input: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  error: { color: "#B91C1C", fontSize: 13 },
  primaryBtn: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryText: { color: "#FFFFFF", fontWeight: "600" },
  secondaryBtn: {
    height: 44,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: "#111827", fontWeight: "600" },
});