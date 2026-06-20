import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, getAccessToken, setAccessToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setTokenState] = useState(() => getAccessToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAccessToken()));

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setTokenState(null);
    setCurrentUser(null);
    setAuthError(null);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (!getAccessToken()) {
      setLoading(false);
      setCurrentUser(null);
      setAuthError(null);
      return null;
    }

    setLoading(true);
    setAuthError(null);
    try {
      const user = await apiClient.get("/api/auth/me");
      setCurrentUser(user);
      return user;
    } catch (error) {
      if (error.isNetworkError) {
        setCurrentUser(null);
        setAuthError(error);
        return null;
      }

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
    if (!authResponse?.accessToken) {
      clearAuth();
      return authResponse;
    }

    setAccessToken(authResponse.accessToken);
    setTokenState(authResponse.accessToken);
    setAuthError(null);

    try {
      const user = await apiClient.get("/api/auth/me");
      setCurrentUser(user);
    } catch {
      setCurrentUser(authResponse.user || null);
    }

    return authResponse;
  }, [clearAuth]);

  const login = useCallback(
    async (email, password) => {
      const response = await apiClient.post("/api/auth/login", { email, password });
      return applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const register = useCallback(
    async (registerData) => {
      const response = await apiClient.post("/api/auth/register", registerData);
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
      authError,
      currentUser,
      loading,
      isAuthenticated: Boolean(accessToken && currentUser),
      login,
      register,
      logout,
      refreshCurrentUser,
    }),
    [accessToken, authError, currentUser, loading, login, logout, refreshCurrentUser, register],
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
