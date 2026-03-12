export type FormItemType =
  | "text"
  | "number"
  | "select"
  | "boolean_clean"
  | "boolean_ok"
  | "boolean_normal";

export interface FormItem {
  id: string;
  label: string;
  input_type: FormItemType;
  required: boolean;
  order: number;
}

export interface FormSection {
  id: string;
  code: string;
  title: string;
  order: number;
  items: FormItem[];
}

export interface FormTemplate {
  id: string;
  name: string;
  period: string;
  description?: string;
  version: number;
  is_active: boolean;
  created_at: string;
  sections: FormSection[];
}

/* =========================
   CREATE (UI DRAFT ONLY)
========================= */

export interface CreateFormItem {
  id: string;
  label: string;
  input_type: FormItemType;
  required: boolean;
}

export interface CreateFormSection {
  id: string;
  code: string;
  title: string;
  items: CreateFormItem[];
}

export interface CreateFormTemplateDraft {
  name: string;
  period: string;
  description?: string;
  sections: CreateFormSection[];
}

/* =========================
   API PAYLOAD
========================= */

export interface FormTemplatePayload {
  name: string;
  period: string;
  description?: string;
  sections: {
    code: string;
    title: string;
    items: {
      label: string;
      input_type: FormItemType;
      required: boolean;
    }[];
  }[];
}