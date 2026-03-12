"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Layers, Save, AlertCircle } from "lucide-react";

import {
  getFormTemplateDetail,
  createNewFormTemplateVersion,
} from "@/services/form";
import type { FormTemplate, FormItemType, FormSection } from "@/types/form";

interface APIResponse<T> {
  data: T;
  message?: string;
}

// Field yang boleh diedit di item
type EditableItemField = "label" | "input_type" | "required";

export default function EditFormTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    async function loadData() {
      const res = (await getFormTemplateDetail(
        id
      )) as APIResponse<FormTemplate> | FormTemplate;

      const rawData =
        "data" in res ? res.data : res;

      setForm({
        ...rawData,
        sections: (rawData.sections || []).map((s: FormSection) => ({
          ...s,
          items: s.items || [],
        })),
      });
    }

    loadData();
  }, [id]);

  if (!form) return <p className="text-slate-400 p-10">Loading...</p>;

  if (!form.is_active) {
    return (
      <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400 flex items-center gap-2">
        <AlertCircle size={16} />
        Form ini sudah non-aktif.
      </div>
    );
  }

  // ================= HANDLERS =================

  function updateSection(si: number, value: string) {
    const next = structuredClone(form);
    
    // Guard clause: Jika next null, hentikan eksekusi
    if (!next) return; 

    next.sections[si].title = value;
    setForm(next);
  }

  function updateItem(
    si: number,
    ii: number,
    field: EditableItemField,
    value: string | boolean
  ) {
    const next = structuredClone(form);

    // Guard clause: Memastikan next tidak null sebelum mengakses propertinya
    if (!next) return;

    // TypeScript sekarang tahu bahwa 'next' pasti ada (bukan null)
    next.sections[si].items[ii] = {
      ...next.sections[si].items[ii],
      [field]: value,
    };

    setForm(next);
  }

  async function save() {
    if (!form) return;

    setLoading(true);

    try {
      await createNewFormTemplateVersion(form.id, {
        name: form.name,
        period: form.period,
        description: form.description || "",
        sections: form.sections.map((s) => ({
          code: s.code,
          title: s.title,
          items: s.items.map((i) => ({
            label: i.label,
            input_type: i.input_type,
            required: i.required,
          })),
        })),
      });

      router.push("/admin/forms");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan versi baru");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 pb-24 p-6 text-slate-200">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-white">
          Edit Form — Versi {form.version + 1}
        </h1>
        <p className="text-sm text-slate-400">
          Perubahan akan disimpan sebagai versi baru (v{form.version} tetap
          terjaga)
        </p>
      </div>

      {/* SECTIONS */}
      <div className="space-y-6">
        {form.sections.map((sec, si) => (
          <motion.div
            key={sec.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.05 }}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-5"
          >
            <div className="mb-4 flex items-center gap-2 text-white">
              <Layers size={16} className="opacity-70 text-indigo-400" />
              <span className="text-sm text-slate-400">
                Section {si + 1} ({sec.code})
              </span>
            </div>

            <input
              value={sec.title}
              onChange={(e) => updateSection(si, e.target.value)}
              placeholder="Judul Section"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            {/* ITEMS */}
            <div className="mt-4 space-y-3">
              {sec.items.map((it, ii) => (
                <div
                  key={it.id}
                  className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-xs font-mono text-slate-500">
                      {si + 1}.{ii + 1}
                    </span>

                    <input
                      value={it.label}
                      onChange={(e) =>
                        updateItem(si, ii, "label", e.target.value)
                      }
                      placeholder="Label pertanyaan"
                      className="flex-1 min-w-50 bg-transparent text-sm text-slate-200 focus:outline-none border-b border-slate-800 focus:border-indigo-500 transition"
                    />

                    <select
                      value={it.input_type}
                      onChange={(e) =>
                        updateItem(
                          si,
                          ii,
                          "input_type",
                          e.target.value as FormItemType
                        )
                      }
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="boolean_clean">Bersih / Tidak Bersih</option>
                      <option value="boolean_ok">OK / Tidak OK</option>
                      <option value="boolean_normal">Normal / Tidak Normal</option>
                      <option value="select">Select</option>
                    </select>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={it.required}
                        onChange={(e) =>
                          updateItem(si, ii, "required", e.target.checked)
                        }
                        className="accent-indigo-500"
                      />
                      <span className="text-xs text-slate-400">Required</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* SAVE BAR */}
      <div className="fixed bottom-0 left-64 right-0 z-20 border-t border-slate-800 bg-slate-950/90 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm text-slate-400">
            v{form.version} akan dinonaktifkan setelah simpan
          </span>

          <button
            onClick={save}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            <Save size={16} />
            {loading ? "Menyimpan..." : "Simpan Versi Baru"}
          </button>
        </div>
      </div>
    </div>
  );
}