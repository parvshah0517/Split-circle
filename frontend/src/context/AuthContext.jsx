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
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  // Try to restore user on load if token exists
  useEffect(() => {
    let isCancelled = false;

    async function restoreSession() {
      const token = getStoredToken();
      if (!token) return;

      try {
        const currentUser = await authService.getCurrentUser();
        if (!isCancelled && currentUser) {
          const merged = { ...getStoredUser(), ...currentUser };
          setUser(merged);
          storeUser(merged);
        }
      } catch {
        // If backend fails, keep local stored user for seamless presentation
      }
    }

    restoreSession();
    return () => {
      isCancelled = true;
    };
  }, []);

  const startSession = useCallback(({ user: nextUser, token }) => {
    if (token) storeToken(token);
    setSessionExpired(false);
    setUser(nextUser);
    storeUser(nextUser);
  }, []);

  // Simple username-based entry (for presentation application)
  // Accepts a username composed of string with name and number (e.g. "alex24", "parv007")
  const loginWithUsername = useCallback(
    async (rawUsername) => {
      const username = String(rawUsername || "").trim().toLowerCase();
      if (!username) {
        throw new Error("Please enter a username.");
      }

      // Check format: string consisting of name & numbers
      const hasLetter = /[a-zA-Z]/.test(username);
      const hasNumber = /[0-9]/.test(username);
      if (!hasLetter || !hasNumber) {
        throw new Error("Username must contain both letters and numbers (e.g. alex24, user101).");
      }

      const email = `${username}@splitcircle.app`;
      const fallbackUser = {
        id: username,
        username,
        name: rawUsername.trim(),
        email,
        mobile: "",
        created_at: new Date().toISOString(),
      };

      // Try connecting to existing backend authentication endpoints in the background:
      try {
        const password = `Split_${username}1!`;
        let authResult;
        try {
          // Attempt login first
          authResult = await authService.login({ email, password });
        } catch {
          // If login fails, attempt register with the backend
          authResult = await authService.register({
            name: rawUsername.trim(),
            email,
            password,
          });
        }

        if (authResult?.user) {
          const userWithUsername = {
            ...authResult.user,
            username,
            mobile: fallbackUser.mobile,
          };
          startSession({ user: userWithUsername, token: authResult.token });
          return userWithUsername;
        }
      } catch {
        // Graceful fallback for offline / presentation mode:
      }

      startSession({ user: fallbackUser, token: "demo-jwt-token" });
      return fallbackUser;
    },
    [startSession]
  );

  const register = useCallback(
    async (payload) => {
      const result = await authService.register(payload);
      startSession(result);
    },
    [startSession]
  );

  const login = useCallback(
    async (credentials) => {
      const result = await authService.login(credentials);
      startSession(result);
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
        if (getStoredToken() && payload.name) {
          const backendUser = await authService.updateProfile({ name: payload.name });
          Object.assign(updatedUser, backendUser);
        }
      } catch (e) {
        console.warn("Backend profile update fallback:", e);
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
      loginWithUsername,
      register,
      login,
      logout,
      updateProfile,
    }),
    [
      user,
      isLoading,
      sessionExpired,
      loginWithUsername,
      register,
      login,
      logout,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
