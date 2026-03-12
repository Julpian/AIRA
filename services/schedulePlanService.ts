import { apiFetch } from "./api";

export type SchedulePlan = {
  id: string;
  ahu_id: string;
  unit_code?: string;
  period: "bulanan" | "enam_bulan" | "tahunan" | "ganti_filter";
  week_of_month: number;
  month?: number | null;
  status: "draft" | "generated";
};

export type CreateSchedulePlanPayload = {
  ahu_id: string;
  period: "bulanan" | "enam_bulan" | "tahunan" | "ganti_filter";
  week_of_month: number;
  month?: number | null;
};

export type UpdateSchedulePlanPayload = {
  period: "bulanan" | "enam_bulan" | "tahunan" | "ganti_filter";
  week_of_month: number;
  month?: number | null;
};

export function getSchedulePlans() {
  return apiFetch<SchedulePlan[]>("/admin/schedule-plan");
}

export function createSchedulePlan(
  payload: CreateSchedulePlanPayload
) {
  return apiFetch("/admin/schedule-plan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSchedulePlan(
  id: string,
  payload: UpdateSchedulePlanPayload
) {
  return apiFetch(`/admin/schedule-plan/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteSchedulePlan(id: string) {
  return apiFetch(`/admin/schedule-plan/${id}`, {
    method: "DELETE",
  });
}

export function generateSchedules(year: number) {
  return apiFetch("/admin/schedules/generate", {
    method: "POST",
    body: JSON.stringify({ year }),
  });
}

export async function createFilterSchedule(payload: {
  ahu_id: string
  start_date: string
}) {
  return apiFetch("/admin/filter-schedules", {
    method: "POST",
    body: JSON.stringify(payload)
  })
}