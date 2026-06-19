import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, getAccessToken, setAccessToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setTokenState] = useState(() => getAccessToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAccessToken()));

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setTokenState(null);
    setCurrentUser(null);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (!getAccessToken()) {
      setLoading(false);
      setCurrentUser(null);
      return null;
    }

    setLoading(true);
    try {
      const user = await apiClient.get("/api/auth/me");
      setCurrentUser(user);
      return user;
    } catch {
      clearAuth();
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    refreshCurrentUser();
  }, [refreshCurrentUser]);

  const applyAuthResponse = useCallback(async (authResponse) => {
    setAccessToken(authResponse.accessToken);
    setTokenState(authResponse.accessToken);
    setCurrentUser(authResponse.user || null);
    return authResponse;
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await apiClient.post("/api/auth/login", credentials);
      return applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const register = useCallback(
    async (payload) => {
      const response = await apiClient.post("/api/auth/register", payload);
      return applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      accessToken,
      currentUser,
      loading,
      isAuthenticated: Boolean(accessToken && currentUser),
      login,
      register,
      logout,
      refreshCurrentUser,
    }),
    [accessToken, currentUser, loading, login, logout, refreshCurrentUser, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
