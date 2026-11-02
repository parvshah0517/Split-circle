import axios from "axios";
import { clearStoredToken, getStoredToken } from "../utils/authSession";
import { normalizeApiError } from "../utils/apiError";

export const SESSION_EXPIRED_EVENT = "splitcircle:session-expired";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.authenticated = true;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.authenticated) {
      clearStoredToken();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(normalizeApiError(error));
  },
);

export default api;
