
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as authService from "../services/authService";
import { SESSION_EXPIRED_EVENT } from "../services/api";

import {
  clearStoredToken,
  getStoredToken,
  getStoredUser,
  storeToken,
  storeUser,
} from "../utils/authSession";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setSessionExpired(true);
      clearStoredToken();
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function restoreSession() {
      const token = getStoredToken();
      if (!token) return;

      try {
        const currentUser = await authService.getCurrentUser();

        if (!isCancelled && currentUser) {
          setUser(currentUser);
          storeUser(currentUser);
        }
      } catch {
        if (!isCancelled) {
          clearStoredToken();
          setUser(null);
        }
      }
    }

    restoreSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  const startSession = useCallback(({ user: nextUser, token }) => {
    if (token) {
      storeToken(token);
    }

    setSessionExpired(false);
    setUser(nextUser);
    storeUser(nextUser);
  }, []);

  const register = useCallback(
    async (payload) => {
      const result = await authService.register(payload);
      startSession(result);
      return result.user;
    },
    [startSession]
  );

  const login = useCallback(
    async (credentials) => {
      const result = await authService.login(credentials);
      startSession(result);
      return result.user;
    },
    [startSession]
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setSessionExpired(false);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (payload) => {
      const updatedUser = {
        ...user,
        ...payload,
      };

      try {
        if (getStoredToken()) {
          const backendUser = await authService.updateProfile(payload);
          Object.assign(updatedUser, backendUser);
        }
      } catch (error) {
        throw error;
      }

      setUser(updatedUser);
      storeUser(updatedUser);
      return updatedUser;
    },
    [user]
  );

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
    [
      user,
      isLoading,
      sessionExpired,
      register,
      login,
      logout,
      updateProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
