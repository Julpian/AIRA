"use client";

import React, { useEffect, useState, ChangeEvent, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/services/api";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  ChevronDown,
  Info,
  Layers,
  Wrench,
  X,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ================= TYPES ================= */
interface FormItem {
  id: string;
  label: string;
  input_type: string;
  required: boolean;
  value_text?: string;
}

interface FormSection {
  id: string;
  code: string;
  title: string;
  items: FormItem[];
}

interface FormTemplate {
  id: string;
  name: string;
  ahu_name?: string;
  ahu_no?: string;
  ahu_description?: string; // Tambahkan field ini jika ada dari API
  sections: FormSection[];
}

interface SubmitItem {
  form_item_id: string;
  value_text: string;
}

export default function InspectionFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [form, setForm] = useState<FormTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  // State untuk Modal Deskripsi
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isGantiFilter = useMemo(() => {
    if (!form?.name) return false;
    const name = form.name.toLowerCase();
    return name.includes("ganti filter") || name.includes("penggantian filter");
  }, [form]);

  useEffect(() => {
    if (!id || !token) return;
    setLoading(true);
    
    apiFetch<FormTemplate>(`/inspection/${id}/form?token=${token}`)
      .then((data) => {
        setForm(data);
        if (data.sections) {
          const initialValues: Record<string, string> = {};
          data.sections.forEach((section) => {
            section.items.forEach((item) => {
              if (item.value_text) {
                initialValues[item.id] = item.value_text;
              }
            });
          });
          setValues(initialValues);
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [id, token]);

  const updateValue = (itemId: string, value: string) => {
    setValues((prev) => ({ ...prev, [itemId]: value }));
    if (value.trim() !== "") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[itemId];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!form) return;
    const newErrors: Record<string, boolean> = {};
    let firstErrorId: string | null = null;

    form.sections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.required && (!values[item.id] || values[item.id].trim() === "")) {
          newErrors[item.id] = true;
          if (!firstErrorId) firstErrorId = item.id;
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const element = document.getElementById(`field-${firstErrorId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setIsSubmitting(true);
      const items: SubmitItem[] = Object.entries(values).map(([itemId, value]) => ({
        form_item_id: itemId,
        value_text: value,
      }));
      await apiFetch(`/inspection/${id}/form/submit?token=${token}`, {
        method: "POST",
        body: JSON.stringify({ items }),
      });
      router.push(`/inspection/${id}/sign`);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (item: FormItem) => {
    const type = item.input_type.toLowerCase();
    const commonProps = {
      required: item.required,
      className: `w-full rounded-xl px-4 py-3.5 outline-none transition-all appearance-none placeholder:text-slate-300 border
        ${errors[item.id] ? "bg-red-50 border-red-300 focus:border-red-500 text-red-900" : "bg-slate-50 border-slate-200 focus:bg-white focus:border-teal-500 text-slate-700"}`,
      value: values[item.id] || "",
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
        updateValue(item.id, e.target.value),
      id: `field-${item.id}`
    };

    if (type === "number") return <input type="number" placeholder="0.00" {...commonProps} />;
    if (["boolean_clean", "boolean_ok", "boolean_normal"].includes(type)) {
      const options = type === "boolean_clean" ? ["BERSIH", "TIDAK BERSIH"] : 
                      type === "boolean_ok" ? ["OK", "TIDAK OK"] : ["NORMAL", "TIDAK NORMAL"];
      return (
        <div className="relative group">
          <select {...commonProps}>
            <option value="" disabled>Pilih Status</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={18} />
        </div>
      );
    }
    if (type === "textarea") return <textarea {...commonProps} placeholder="Tulis catatan..." rows={3} />;
    return <input type="text" placeholder="Ketik jawaban..." {...commonProps} />;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-teal-100 rounded-full border-t-teal-500" />
        <Layers className="absolute w-6 h-6 text-teal-600" />
      </motion.div>
    </div>
  );

  if (!form) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-32">
      {/* 🍎 HEADER AREA */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        
        <div className="text-center flex flex-col items-center">
          <h1 className="text-sm font-bold text-slate-900 truncate max-w-[200px] leading-tight">
            {form.name}
          </h1>
          <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest leading-tight">
            {form.ahu_name || "AHU SYSTEM"}
          </span>
          
          {form.ahu_no && (
            <div className="mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] rounded-md font-bold border border-slate-200">
              AHU #{form.ahu_no}
            </div>
          )}
        </div>
        
        <div className="w-10" />
      </header>

      <main className="mx-auto max-w-xl px-4 pt-6">
        
        {/* 🫧 FLOATING ICON BUTTON KHUSUS GANTI FILTER */}
        <AnimatePresence>
          {isGantiFilter && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed bottom-24 right-6 z-40"
            >
              <button 
                onClick={() => setIsModalOpen(true)}
                className="relative flex items-center justify-center w-14 h-14 bg-teal-600 text-white rounded-full shadow-2xl shadow-teal-500/40 active:scale-90 transition-transform group"
              >
                {/* Efek Berdenyut (Pulse) */}
                <span className="absolute inset-0 rounded-full bg-teal-500 animate-ping opacity-25"></span>
                <Wrench size={24} className="relative z-10 group-hover:rotate-12 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL DESKRIPSI & PROSEDUR */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              {/* Overlay Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
              />
              
              {/* Modal Content */}
              <motion.div 
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.9 }}
                className="fixed inset-x-4 bottom-10 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-[32px] shadow-2xl z-[70] overflow-hidden border border-slate-100"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                        <FileText size={20} />
                      </div>
                      <h3 className="font-bold text-slate-900">Detail Unit & Prosedur</h3>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:text-slate-600">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Info Mesin */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Unit</p>
                          <p className="text-sm font-bold text-slate-700">{form.ahu_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. Seri AHU</p>
                          <p className="text-sm font-bold text-slate-700">#{form.ahu_no}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deskripsi Sistem</p>
                        <p className="text-[13px] text-slate-600 leading-relaxed">
                          {form.ahu_description || "Unit Air Handling System ini melayani area produksi dengan standar filtrasi tinggi (Hepa Filter)."}
                        </p>
                      </div>
                    </div>

                    {/* Prosedur Kerja */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-teal-600 uppercase tracking-widest flex items-center gap-2">
                        <Wrench size={14} /> Instruksi Penggantian
                      </h4>
                      <ul className="space-y-2">
                        {[
                          "Gunakan APD lengkap sebelum membuka panel.",
                          "Pastikan unit dalam kondisi 'OFF' sebelum penggantian.",
                          "Catat nomor batch filter baru pada form ini.",
                          "Pastikan tidak ada kebocoran pada gasket filter."
                        ].map((txt, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium leading-snug">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] flex items-center justify-center font-bold">
                              {i + 1}
                            </span>
                            {txt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold active:scale-[0.98] transition-transform"
                  >
                    Mengerti
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* INFO BOX TETAP ADA SEBAGAI PETUNJUK INPUT */}
        <div className="mb-8 flex items-start gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="p-2 bg-blue-50 rounded-xl"><Info className="text-blue-500" size={18} /></div>
          <div className="space-y-0.5">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left">Input Data</h4>
            <p className="text-[13px] text-slate-600 leading-relaxed font-medium text-left">
              Isi semua parameter mesin di bawah ini dengan teliti.
            </p>
          </div>
        </div>

        {/* FORM SECTIONS */}
        {[...form.sections].sort((a, b) => a.code.localeCompare(b.code)).map((section) => (
          <section key={section.id} className="mb-10">
            <div className="flex items-center gap-3 mb-4 px-2">
              <span className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold text-sm">{section.code}</span>
              <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest text-left">{section.title}</h2>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
              {section.items.map((item) => (
                <div key={item.id} className="p-6 space-y-3" id={`field-${item.id}`}>
                  <div className="flex justify-between items-start gap-4">
                    <label className={`text-[14px] font-bold leading-snug text-left ${errors[item.id] ? "text-red-600" : "text-slate-700"}`}>
                      {item.label}
                    </label>
                    {item.required && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${errors[item.id] ? "bg-red-500 text-white border-red-500" : "bg-red-50 text-red-500 border-red-100"}`}>
                        WAJIB
                      </span>
                    )}
                  </div>
                  {renderInput(item)}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
        <div className="mx-auto max-w-xl">
          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-14 bg-teal-600 text-white font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> SELESAIKAN INSPEKSI</>}
          </button>
        </div>
      </footer>
    </div>
  );
}