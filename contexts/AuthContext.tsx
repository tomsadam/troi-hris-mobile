import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import setUnauthorizedHandler dari api.ts
import { authApi, LoginResponse, setUnauthorizedHandler, setLocalAuthToken } from "@/services/api";

interface AuthContextType {
  user: LoginResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi logout didefinisikan sebelum useEffect
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.log("Error during logout api call", e);
    } finally {
      // Penting: Set state null agar UI otomatis pindah ke Login Screen
      setUser(null);
    }
  };

  useEffect(() => {
    // 1. Daftarkan fungsi logout ke interceptor API
    // Ketika API menerima 401, fungsi logout ini akan dijalankan
    setUnauthorizedHandler(logout);

    // 2. Cek status auth saat ini
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = await authApi.getStoredUser();
      const isAuth = await authApi.isAuthenticated(); // This will prime the memory cache due to getAuthToken logic update if we wanted, but let's be explicit
      const token = await AsyncStorage.getItem("authToken");
      if (token) setLocalAuthToken(token); // Sync to memory explicitly

      if (isAuth && storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Opsional: jika check auth gagal total, bisa logout
      // logout(); 
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password });
    setUser(response);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}