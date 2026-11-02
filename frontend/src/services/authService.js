import api from "./api";

export async function register(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data.data;
}

export async function login(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data.data.user;
}

export async function updateProfile(payload) {
  const response = await api.put("/auth/profile", payload);
  return response.data.data.user;
}
