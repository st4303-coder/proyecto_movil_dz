// src/screens/RegisterScreen.js
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import ojoIcon from "../assets/ojo.png";
import invisibleIcon from "../assets/invisible.png";

export default function RegisterScreen({ navigation }) {
  const { handleRegister, loading } = useAuth();

  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async () => {
    setErrorMsg("");

    if (!nombre.trim() || !matricula.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Todos los campos son obligatorios.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    try {
      await handleRegister({
        nombre: nombre.trim(),
        matricula: matricula.trim(),
        email: email.trim(),
        password,
      });
      navigation?.navigate?.("Login");
    } catch (err) {
      setErrorMsg(err.message || "No se pudo completar el registro.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.page}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>Biblioteca Universitaria</Text>
          </View>

          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Completa tus datos institucionales</Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej.Ana López Ruiz"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Matrícula</Text>
            <TextInput
              value={matricula}
              onChangeText={setMatricula}
              placeholder="Ej.1234"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              style={[styles.input, styles.monoInput]}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo institucional</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="st1234@utr.edu.mx"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Crea una contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.passInput}
              />
              <Pressable
                onPress={() => setShowPass((prev) => !prev)}
                hitSlop={8}
                accessibilityLabel={showPass ? "Ocultar contraseña" : "Ver contraseña"}
                style={styles.eyeBtn}
              >
                <Image
                  source={showPass ? invisibleIcon : ojoIcon}
                  style={styles.eyeImg}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.passContainer}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPass}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.passInput}
              />
              <Pressable
                onPress={() => setShowConfirmPass((prev) => !prev)}
                hitSlop={8}
                accessibilityLabel={showConfirmPass ? "Ocultar confirmación" : "Ver confirmación"}
                style={styles.eyeBtn}
              >
                <Image
                  source={showConfirmPass ? invisibleIcon : ojoIcon}
                  style={styles.eyeImg}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={loading}
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Crear cuenta</Text>
            )}
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <Pressable onPress={() => navigation?.navigate?.("Login")}>
              <Text style={styles.linkText}>Inicia sesión</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E6EE",
    borderRadius: 16,
    padding: 24,
  },
  brandBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  brandText: {
    color: "#1E3A8A",
    fontSize: 12.5,
    fontWeight: "700",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 18,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E3E6EE",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  monoInput: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  passContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderWidth: 1,
    borderColor: "#E3E6EE",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingRight: 6,
  },
  passInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#111827",
  },
  eyeBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeImg: {
    width: 20,
    height: 20,
  },
  infoBox: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    borderRadius: 8,
    padding: 10,
    marginTop: 2,
    marginBottom: 6,
  },
  infoText: {
    color: "#1E3A8A",
    fontSize: 12.5,
  },
  boldText: {
    fontWeight: "700",
  },
  primaryBtn: {
    height: 46,
    borderRadius: 8,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  btnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "#FDE8E8",
    borderWidth: 1,
    borderColor: "#F3A5A5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    flexWrap: "wrap",
  },
  footerText: {
    fontSize: 13.5,
    color: "#4B5563",
  },
  linkText: {
    fontSize: 13.5,
    color: "#1E3A8A",
    fontWeight: "600",
  },
});