// services/ahuService.ts
import { apiFetch } from "./api";

export type AHU = {
  id: string;
  building_id: string;
  area_id: string;
  unit_code: string;
  room_name?: string | null;
  vendor?: string | null;
  nfc_uid?: string | null;
  cleanliness_class?: string | null;
  is_active: boolean;
  created_at: string;
};

// Gunakan unknown untuk keamanan tipe data
const unwrap = <T>(res: unknown): T[] => {
  if (!res || typeof res !== "object") return [];
  if (Array.isArray(res)) return res as T[];
  
  // Type assertion untuk mengecek property 'data'
  const obj = res as { data?: T[] };
  if (obj.data && Array.isArray(obj.data)) return obj.data;
  
  return [];
};

/* ================= API ================= */

export const getAHUs = async () => {
  const res = await apiFetch("/admin/ahus");
  return unwrap<AHU>(res);
};

export const createAHU = (payload: {
  building_id: string;
  area_id: string;
  unit_code: string;
  room_name?: string | null;
  vendor?: string | null;
  nfc_uid?: string | null;
  cleanliness_class?: string | null;
}) =>
  apiFetch("/admin/ahus", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAHU = (
  id: string,
  payload: Partial<Omit<AHU, "id" | "created_at">>
) =>
  apiFetch(`/admin/ahus/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deactivateAHU = (id: string) =>
  apiFetch(`/admin/ahus/${id}/deactivate`, { method: "PATCH" });
