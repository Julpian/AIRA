// services/areaService.ts
import { apiFetch } from "./api";

export type Area = {
  id: string;
  building_id: string;
  name: string;
  floor?: string | null;

  // ⛔ DIHAPUS dari Area
  // cleanliness_class?: string | null;

  is_active: boolean;
};

/* ================= API ================= */

export const getAreas = () => apiFetch<Area[]>("/admin/areas");

export const createArea = (payload: {
  building_id: string;
  name: string;
  floor?: string | null;
}) =>
  apiFetch("/admin/areas", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateArea = (
  id: string,
  payload: Partial<Omit<Area, "id" | "is_active">>
) =>
  apiFetch(`/admin/areas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deactivateArea = (id: string) =>
  apiFetch(`/admin/areas/${id}/deactivate`, {
    method: "PATCH",
  });
