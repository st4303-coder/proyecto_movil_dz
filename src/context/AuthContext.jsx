import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, setUnauthorizedHandler } from "../services/apiFetch";
import { getItem, saveItem, deleteItem } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  const handleLogout = async () => {
    await deleteItem("user_token");
    await deleteItem("user_data");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
    (async () => {
      try {
        const savedToken = await getItem("user_token");
        const savedUser = await getItem("user_data");
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error("Error recuperando sesión:", err);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      if (data.token) {
        await saveItem("user_token", data.token);
        setToken(data.token);
      }
      if (data.user) {
        await saveItem("user_data", JSON.stringify(data.user));
        setUser(data.user);
      }
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setLoading(true);
    try {
      return await apiFetch("/auth/register", {
        method: "POST",
        body: { ...formData, rol: "USER" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        booting,
        isAuthenticated: Boolean(token),
        handleLogin,
        handleRegister,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}