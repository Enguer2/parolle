// src/lib/auth.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787"

export function getToken() {
  return localStorage.getItem("token")
}

export function setToken(token: string) {
  localStorage.setItem("token", token)
}

export function clearToken() {
  localStorage.removeItem("token")
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "API error")
  }
  return res.json()
}

export async function auth(email: string, password: string) {
  const res = await apiFetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  if (res.token) setToken(res.token)
  return res
}

// src/lib/auth.ts
export async function register(email: string, username: string, password: string) {
  const res = await apiFetch("/api/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  })
  if (res.token) setToken(res.token)
  return res
}
