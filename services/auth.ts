"use client";

import { Role } from "@/services/role";

type AuthData = {
  token: string;
  role: Role;
};

const AUTH_KEY = "ahu_auth";

export function saveAuth(token: string, role: Role) {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ token, role })
  );
}

export function getAuth(): AuthData | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthData;
  } catch {
    return null;
  }
}

export function getToken() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  return JSON.parse(raw).token;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "/login";
}