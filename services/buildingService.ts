// services/buildingService.ts
import { apiFetch } from "./api";

export type Building = {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
};

export const getBuildings = () =>
  apiFetch<Building[] | { data: Building[] }>("/admin/buildings");

export const createBuilding = (payload: {
  name: string;
  description?: string;
}) =>
  apiFetch("/admin/buildings", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateBuilding = (
  id: string,
  payload: { name: string; description?: string }
) =>
  apiFetch(`/admin/buildings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deactivateBuilding = (id: string) =>
  apiFetch(`/admin/buildings/${id}/deactivate`, {
    method: "PATCH",
  });
