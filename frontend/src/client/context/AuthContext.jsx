import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { SESSION_EXPIRED_EVENT } from "../services/api";
import { clearStoredToken, getStoredToken, storeToken } from "../utils/authSession";
import { DEV_AUTH_BYPASS, DEV_PREVIEW_USER } from "../utils/devAuthBypass";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEV_AUTH_BYPASS ? DEV_PREVIEW_USER : null);
  const [isLoading, setIsLoading] = useState(!DEV_AUTH_BYPASS);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setSessionExpired(true);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function restoreSession() {
      if (DEV_AUTH_BYPASS || !getStoredToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authService.getCurrentUser();
        if (!isCancelled) setUser(currentUser);
      } catch {
        clearStoredToken();
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      isCancelled = true;
    };
  }, []);

  const startSession = useCallback(({ user: nextUser, token }) => {
    storeToken(token);
    setSessionExpired(false);
    setUser(nextUser);
  }, []);

  const register = useCallback(
    async (payload) => startSession(await authService.register(payload)),
    [startSession],
  );

  const login = useCallback(
    async (credentials) => startSession(await authService.login(credentials)),
    [startSession],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setSessionExpired(false);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updatedUser = await authService.updateProfile(payload);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      sessionExpired,
      register,
      login,
      logout,
      updateProfile,
    }),
    [user, isLoading, sessionExpired, register, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
