const TOKEN_KEY = "splitcircle.session.token";
const USER_KEY = "splitcircle.session.user";

export const getStoredToken = () =>
  window.localStorage.getItem(TOKEN_KEY) || window.sessionStorage.getItem(TOKEN_KEY);

export const storeToken = (token) => {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.sessionStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = () => {
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  try {
    const raw =
      window.localStorage.getItem(USER_KEY) ||
      window.sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const storeUser = (user) => {
  try {
    const raw = JSON.stringify(user);
    window.localStorage.setItem(USER_KEY, raw);
    window.sessionStorage.setItem(USER_KEY, raw);
  } catch (e) {
    console.error("Failed to store user session:", e);
  }
};
