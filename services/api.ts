import { getAuth } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API; // backend kamu

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const auth = getAuth();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": auth?.token ? `Bearer ${auth.token}` : "",
      "ngrok-skip-browser-warning": "true",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;

    try {
      const data = await res.json();
      if (data?.error) message = data.error;
      if (data?.message) message = data.message;
    } catch {}

    throw new Error(message);
  }

  if (res.status === 204) return null as T;

  const text = await res.text();
  if (!text) return null as T;

  return JSON.parse(text);
}

// ================= APPROVAL HELPERS =================

export function getInspectionForApproval(status: string) {
  return apiFetch(`/inspection?status=${status}`);
}

export function getInspectionDetail(id: string) {
  return apiFetch(`/inspection/${id}`);
}

export function approveInspection(id: string, signature: string) {
  return apiFetch(`/asmen/inspection/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ signature }),
  });
}

export function rejectInspection(id: string, reason: string) {
  return apiFetch(`/asmen/inspection/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
