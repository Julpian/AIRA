"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FileText,
  Layers,
  ListPlus,
  Save,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/services/api";
import type {
  CreateFormTemplateDraft,
  FormItemType,
} from "@/types/form";



/* =========================
   CONSTANTS
========================= */
const PERIOD_OPTIONS = [
  { value: "bulanan", label: "Bulanan" },
  { value: "enam_bulan", label: "6 Bulan" },
  { value: "tahunan", label: "Tahunan" },
  { value: "ganti_filter", label: "Ganti Filter" },
];

function generateFormName(period: string) {
  switch (period) {
    case "bulanan":
      return "Form Inspeksi AHU Bulanan";
    case "enam_bulan":
      return "Form Inspeksi AHU 6 Bulanan";
    case "tahunan":
      return "Form Inspeksi AHU Tahunan";
    case "ganti_filter":
      return "Form Penggantian Filter AHU"; // Nama otomatis untuk filter
    default:
      return "";
  }
}

/* =========================
   PAGE
========================= */

export default function CreateFormPage() {
  const [form, setForm] = useState<CreateFormTemplateDraft>({
    name: generateFormName("bulanan"),
    period: "bulanan",
    description: "",
    sections: [],
  });

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  /* =========================
     ACTIONS
  ========================= */

  function addSection() {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: nanoid(),
          code: String.fromCharCode(65 + prev.sections.length),
          title: "",
          items: [],
        },
      ],
    }));
  }

  function addItem(sectionId: string) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: [
                ...s.items,
                {
                  id: nanoid(),
                  label: "",
                  input_type: "text",
                  required: false,
                },
              ],
            }
          : s
      ),
    }));
  }

  /* =========================
     SUBMIT
  ========================= */

  async function handleSubmit() {
    // 1. Validasi awal di frontend
    if (form.sections.length === 0) {
      alert("Minimal harus ada 1 section");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        period: form.period,
        description: form.description,
        // 2. Tambahkan filter .filter() sebelum .map()
        sections: form.sections
          .filter((s) => s.title.trim() !== "") // Buang section tanpa judul
          .map((s, sectionIndex) => ({
            code: s.code,
            title: s.title,
            order: sectionIndex + 1,
            items: s.items
              .filter((i) => i.label.trim() !== "") // PENTING: Buang item yang labelnya kosong
              .map((i, itemIndex) => ({
                label: i.label,
                type: i.input_type, // Memastikan mapping ke 'type' sesuai kebutuhan backend
                required: i.required,
                order: itemIndex + 1,
              })),
          })),
      };

      // 3. Tambahkan pengecekan tambahan setelah filter
      const totalItems = payload.sections.reduce((acc, s) => acc + s.items.length, 0);
      if (totalItems === 0) {
        alert("Setiap section harus memiliki minimal 1 item yang terisi labelnya.");
        setLoading(false);
        return;
      }

      await apiFetch("/admin/form-templates", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Reset dan Redirect
      setForm({
        name: generateFormName(form.period),
        period: form.period,
        description: "",
        sections: [],
      });
      router.push("/admin/forms");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan form";

      alert("Gagal simpan: " + message);
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-sky-400" />
          Create Form Template
        </h1>
        <p className="text-sm text-gray-400">
          Template ini akan digunakan oleh inspector sesuai periode jadwal
        </p>
      </div>

      {/* BASIC INFO */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* PERIOD */}
          <select
            className="input"
            value={form.period}
            onChange={(e) => {
              const period = e.target.value;
              
              setForm((prev) => ({
                ...prev,
                period,
                name: generateFormName(period),
              }));
            }}
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* NAME (AUTO) */}
          <input
            className="input opacity-70"
            value={form.name}
            disabled
          />
        </div>

        <input
          className="input"
          placeholder="Deskripsi (opsional)"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      {/* SECTIONS */}
      <div className="space-y-6">
        <AnimatePresence>
          {form.sections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 space-y-4"
            >
              {/* SECTION HEADER */}
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <input
                  className="input flex-1"
                  placeholder={`Judul Section ${section.code}`}
                  value={section.title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sections: prev.sections.map((s) =>
                        s.id === section.id
                          ? { ...s, title: e.target.value }
                          : s
                      ),
                    }))
                  }
                />
              </div>

              {/* ITEMS */}
              <div className="space-y-3 pl-6">
                <AnimatePresence>
                  {section.items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* LABEL */}
                        <input
                          className="input md:col-span-2"
                          placeholder="Label Item"
                          value={item.label}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              sections: prev.sections.map((s) =>
                                s.id === section.id
                                  ? {
                                      ...s,
                                      items: s.items.map((i) =>
                                        i.id === item.id
                                          ? {
                                              ...i,
                                              label: e.target.value,
                                            }
                                          : i
                                      ),
                                    }
                                  : s
                              ),
                            }))
                          }
                        />

                        {/* TYPE */}
                        <select
                        className="input"
                        value={item.input_type}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            sections: prev.sections.map((s) =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    items: s.items.map((i) =>
                                      i.id === item.id
                                        ? {
                                            ...i,
                                            input_type: e.target.value as FormItemType,
                                          }
                                        : i
                                    ),
                                  }
                                : s
                            ),
                          }))
                        }
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>

                        <option value="boolean_clean">
                          Bersih / Tidak Bersih
                        </option>

                        <option value="boolean_ok">
                          OK / Tidak OK
                        </option>

                        <option value="boolean_normal">
                          Normal / Tidak Normal
                        </option>

                        <option value="select">Select</option>
                      </select>
                      </div>

                      {/* REQUIRED */}
                      <label className="flex items-center gap-2 text-xs text-gray-300">
                        <input
                          type="checkbox"
                          checked={item.required}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              sections: prev.sections.map((s) =>
                                s.id === section.id
                                  ? {
                                      ...s,
                                      items: s.items.map((i) =>
                                        i.id === item.id
                                          ? {
                                              ...i,
                                              required: e.target.checked,
                                            }
                                          : i
                                      ),
                                    }
                                  : s
                              ),
                            }))
                          }
                        />
                        Required
                      </label>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  onClick={() => addItem(section.id)}
                  className="btn-secondary"
                >
                  <ListPlus className="w-4 h-4" />
                  Tambah Item
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <button onClick={addSection} className="btn-primary w-full">
          <Plus className="w-5 h-5" />
          Tambah Section
        </button>
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-submit"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Simpan Template
          </>
        )}
      </button>
    </div>
  );
}
