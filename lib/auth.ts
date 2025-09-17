// Authentication utilities for frontend
export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "user";
  token: string;
}

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
};

export const removeAuthToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};