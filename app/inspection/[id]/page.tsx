"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/services/api";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  ChevronDown,
  Info,
  Layers
} from "lucide-react";

/* ================= TYPES (DIPERLUKAN UNTUK MEMPERBAIKI 'CANNOT FIND NAME') ================= */

interface FormItem {
  id: string;
  label: string;
  input_type: string;
  required: boolean;
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

  useEffect(() => {
    if (!id || !token) return;
    setLoading(true);
    apiFetch<FormTemplate>(`/inspection/${id}/form?token=${token}`)
      .then(setForm)
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

    form.sections.forEach((section: FormSection) => {
      section.items.forEach((item: FormItem) => {
        if (item.required && (!values[item.id] || values[item.id].trim() === "")) {
          newErrors[item.id] = true;
          if (!firstErrorId) firstErrorId = item.id;
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Mohon isi semua parameter yang wajib (tanda merah).");
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
      alert("Gagal mengirim data. Cek koneksi internet Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (itemId: string) => `
    w-full rounded-xl px-4 py-3.5 outline-none transition-all appearance-none placeholder:text-slate-300 border
    ${errors[itemId] 
      ? "bg-red-50 border-red-300 focus:border-red-500 focus:ring-red-500/10 text-red-900" 
      : "bg-slate-50 border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500/5 text-slate-700"}
  `;

  const renderInput = (item: FormItem) => {
    const type = item.input_type.toLowerCase();
    const commonProps = {
      required: item.required,
      className: getInputClass(item.id),
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
        updateValue(item.id, e.target.value),
      id: `field-${item.id}`
    };

    if (type === "number") {
      return <input type="number" placeholder="0.00" {...commonProps} />;
    }

    if (["boolean_clean", "boolean_ok", "boolean_normal"].includes(type)) {
      const options = type === "boolean_clean" ? ["BERSIH", "TIDAK BERSIH"] : 
                      type === "boolean_ok" ? ["OK", "TIDAK OK"] : ["NORMAL", "TIDAK NORMAL"];

      return (
        <div className="relative group">
          <select {...commonProps} value={values[item.id] || ""}>
            <option value="" disabled>Pilih Status</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${errors[item.id] ? "text-red-400" : "text-slate-400"}`} size={18} />
        </div>
      );
    }

    if (type === "textarea") {
      return <textarea className={commonProps.className} id={commonProps.id} onChange={(e) => updateValue(item.id, e.target.value)} placeholder="Tulis catatan di sini..." rows={3} />;
    }

    return <input type="text" placeholder="Ketik jawaban..." {...commonProps} />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-teal-100 rounded-full animate-spin border-t-teal-500"></div>
          <Layers className="absolute w-6 h-6 text-teal-600" />
        </div>
        <p className="mt-6 text-slate-500 font-medium animate-pulse text-sm">Menyiapkan Form Inspeksi...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-8 text-center bg-[#F8FAFC] min-h-screen flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-slate-800 text-xl font-bold">Sesi Berakhir</h2>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">Sesi inspeksi Anda sudah tidak valid atau telah selesai.</p>
        <button onClick={() => router.back()} className="mt-8 w-full max-w-xs py-4 bg-slate-900 text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs">Kembali</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-sm font-bold text-slate-900 leading-tight truncate max-w-50">{form.name}</h1>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{form.ahu_name || "System AHU"}</span>
          </div>
          <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
             <Layers size={18} />
          </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pt-6 pb-32">
        <div className="mb-8 flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50">
          <div className="p-2 bg-blue-50 rounded-lg shrink-0">
            <Info className="text-blue-500" size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight text-left">Petunjuk Inspeksi</h4>
            <p className="text-[13px] text-slate-500 leading-relaxed font-medium text-left">
              Pastikan data sesuai dengan parameter mesin. Gunakan titik untuk desimal.
            </p>
          </div>
        </div>

        {[...form.sections].sort((a, b) => a.code.localeCompare(b.code)).map((section: FormSection) => (
          <section key={section.id} className="mb-10 text-left">
            <div className="flex items-baseline gap-3 mb-4 px-2">
              <span className="text-lg font-bold text-teal-500 opacity-50">{section.code}</span>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{section.title}</h2>
            </div>

            <div className="bg-white rounded-4xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
              {section.items.map((item: FormItem) => (
                <div key={item.id} className="p-5 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <label className={`text-[14px] font-semibold leading-snug ${errors[item.id] ? "text-red-600" : "text-slate-700"}`}>
                      {item.label}
                    </label>
                    {item.required && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tight border shrink-0 transition-colors
                        ${errors[item.id] ? "bg-red-600 text-white border-red-600" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                        Wajib
                      </span>
                    )}
                  </div>
                  {renderInput(item)}
                  {errors[item.id] && (
                    <p className="text-[11px] text-red-500 font-bold italic px-1 flex items-center gap-1">
                      <AlertCircle size={12} /> Parameter ini tidak boleh kosong
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-slate-100 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <div className="mx-auto max-w-xl">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-14 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span className="text-sm tracking-wide uppercase font-bold">Selesaikan Inspeksi</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}