import { apiFetch } from "./api";
import type {
  FormTemplate,
  FormTemplatePayload,
} from "@/types/form";

/* =========================
   GENERIC RESPONSE
========================= */

type ApiResponse<T> = {
  data: T;
};

/* =========================
   LIST
========================= */

export async function getFormTemplates(): Promise<FormTemplate[]> {
  const res = (await apiFetch(
    "/admin/form-templates"
  )) as ApiResponse<FormTemplate[]>;

  return res?.data ?? [];
}

/* =========================
   DETAIL
========================= */

export async function getFormTemplateDetail(
  id: string
): Promise<FormTemplate> {
  const res = (await apiFetch(
    `/admin/form-templates/${id}`
  )) as ApiResponse<FormTemplate>;

  return {
    ...res.data,
    sections: (res.data?.sections ?? []).map((section) => ({
      ...section,
      items: section.items ?? [],
    })),
  };
}

/* =========================
   ACTIVE
========================= */

export async function setFormTemplateActive(
  id: string,
  active: boolean
) {
  return apiFetch(`/admin/form-templates/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

/* =========================
   VERSIONING
========================= */

export async function createNewFormTemplateVersion(
  id: string,
  payload: FormTemplatePayload
) {
  return apiFetch(`/admin/form-templates/${id}/version`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================
   COMPARE
========================= */

export async function compareFormTemplates(
  fromId: string,
  toId: string
) {
  return apiFetch(
    `/admin/form-templates/compare/${fromId}/${toId}`
  );
}

/* =========================
   VERSIONS
========================= */

export type FormTemplateVersion = {
  id: string;
  version: number;
};

type VersionsResponse = {
  data: FormTemplateVersion[];
};

export async function getFormTemplateVersions(
  id: string
): Promise<FormTemplateVersion[]> {
  const res = await apiFetch<VersionsResponse>(
    `/admin/form-templates/${id}/versions`
  );

  return res?.data ?? [];
}

/* =========================
   INSPECTION FORM TYPES
========================= */

export type FormValue = {
  value_text?: string;
  value_number?: number;
  value_bool?: boolean;
};

export type FormItem = {
  id: string;
  label: string;
  input_type: "text" | "number" | "boolean" | "select" | "checkbox";
  required: boolean;
  target_min?: number; 
  target_max?: number;
  unit?: string;
};

export type InspectionFormSection = {
  code: string;
  title: string;
  items: FormItem[];
};
