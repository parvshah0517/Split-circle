const TOKEN_KEY = "splitcircle.session.token";

export const getStoredToken = () => window.sessionStorage.getItem(TOKEN_KEY);

export const storeToken = (token) => window.sessionStorage.setItem(TOKEN_KEY, token);

export const clearStoredToken = () => window.sessionStorage.removeItem(TOKEN_KEY);
