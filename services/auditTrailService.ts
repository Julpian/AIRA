import { apiFetch } from "./api";

export type AuditTrail = {
  id: string;
  created_at: string;

  user_id: string;
  name: string;
  role: string;

  action: string;
  entity: string;
  entity_id: string;

  metadata: Record<string, unknown> | null;
};

export const getAuditTrails = () =>
  apiFetch<AuditTrail[]>("/admin/audit-trails");

export const getAuditTrailDetail = (entity: string, id: string) =>
  apiFetch<AuditTrail[]>(`/admin/audit-trails/${entity}/${id}`);
