// frontend/lib/api.js
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  let data = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    const msg = data?.detail || data?.message || data?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.response = res;
    err.data = data;
    throw err;
  }
  return data ?? {};
}

// === SESSION HELPERS =================================================

/** Accept raw Cognito or flattened bundle */
export function normalizeTokens(raw) {
  if (!raw || typeof raw !== "object") return null;

  // NEW: unwrap if nested under AuthenticationResult
  const src = raw.AuthenticationResult ? raw.AuthenticationResult : raw;

  const accessToken  = src.accessToken  ?? src.AccessToken;
  const idToken      = src.idToken      ?? src.IdToken;
  const refreshToken = src.refreshToken ?? src.RefreshToken ?? null;
  const tokenType    = src.tokenType    ?? src.TokenType ?? "Bearer";
  const expiresIn    = src.expiresIn    ?? src.ExpiresIn ?? 3600;

  if (!accessToken || !idToken) return null;
  return { accessToken, idToken, refreshToken, tokenType, expiresIn };
}

export function storeAuth(rawTokens) {
  if (typeof window === "undefined") return;
  const tokens = normalizeTokens(rawTokens);
  if (!tokens) throw new Error("Invalid token bundle from server");
  localStorage.setItem("auth", JSON.stringify(tokens));
  localStorage.removeItem("user");
}

export function getStoredAuth() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth");
  localStorage.removeItem("user");
}

export function getAccessToken() {
  const a = getStoredAuth();
  return a?.accessToken || null;
}

export async function authFetch(path, options = {}) {
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated");
  return apiFetch(path, {
    ...options,
    headers: { ...(options.headers ?? {}), Authorization: `Bearer ${token}` },
  });
}

// optional convenience API
export const api = {
  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};
