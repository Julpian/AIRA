"use client";

import React, { useEffect, useState, ChangeEvent, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/services/api";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  // AlertCircle, <-- Dihapus karena tidak terpakai
  ChevronDown,
  Info,
  Layers,
  Wrench,
  X,
  FileText,
  Search
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
  ahu_description?: string;
  sections: FormSection[];
}

interface SubmitItem {
  form_item_id: string;
  value_text: string;
}

// Menentukan Type untuk data Mezzanine agar tidak menggunakan 'any'
type MezzanineData = [string, string, number | string, number | string];

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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isGantiFilter = useMemo(() => {
    if (!form?.name) return false;
    const name = form.name.toLowerCase();
    return name.includes("ganti filter") || name.includes("penggantian filter");
  }, [form]);

  // Pindahkan data ke dalam useMemo atau buat variabel statis di luar komponen
  const mezzanine1pharma = useMemo<MezzanineData[]>(() => [
    ["AHU 15101A", "Row Material Warehouse II", 9, ""],
    ["AHU 15101B", "Row Material Warehouse I", 6, ""],
    ["AHU 15101C", "Primary Packaging Warehouse Corridor", 1, 2],
    ["AHU 15102", "Primary Packaging Warehouse", 6, ""],
    ["AHU 15102A", "Sampling", 2, ""],
    ["AHU 15102B", "Reject and Quarantine Warehouse", 4, ""],
    ["AHU 15103", "Corridor Produksi Non BL", 2, ""],
    ["AHU 15104A", "Corridor Produksi Non BL (IGL 2,3)", 4, 2],
    ["AHU 15104B", "Produksi RH Tableting dan Couting", 9, 3],
    ["AHU 15104B01", "Produksi RH Tableting dan Couting", 1, 1],
    ["AHU 15105", "Produksi Capsule", 2, ""],
    ["AHU 1510501", "Produksi Capsule", 1, 1],
    ["AHU 15106", "Main Corridor", 4, ""],
    ["AHU 15107", "Corridor Primary Packaging", 1, 1],
    ["AHU 15108", "Weighing", 4, 2],
    ["AHU 15109", "Produksi Liquid", 4, ""],
    ["AHU 15110", "Small Scale", 1, 1],
    ["AHU 15111", "TB Production", 6, 3],
    ["AHU 15112", "Primary Packaging", 4, ""],
    ["AHU 15113", "Secondery Packaging", 7, 2],
    ["AHU 15114A", "Bottle Warehouse", 4, 2],
    ["AHU 15114B", "Finished Good Warehouse", 9, 3],
    ["AHU 15115", "Black Corridor", 2, 2],
    ["AHU 15116", "Grey Locker", 2, ""],
    ["AHU 15117", "Black Locker", 2, 2],
    ["AHU 15118", "Viewing Gallery", 2, 2],
    ["AHU 15M101", "Canteen", 4, ""],
    ["AHU 15203", "Document and Meeting", 2, 2],
  ], []);

  const mezzanine2pharma = useMemo<MezzanineData[]>(() => [
    ["AHU 15201", "Black Locker", 1, 1],
    ["AHU 15202", "Grey Locker", 1, 1],
    ["AHU 15204", "Main Corridor", 1, 1],
    ["AHU 15205", "Corridor Oral Powder Non BL", 1, 1],
    ["AHU 15206", "Oral Powder Non BL", 9, 3],
    ["AHU 15207", "Corridor Produksi Non BL 2", 1, 1],
    ["AHU 15208", "Produksi Non BL 2", 6, 3],
    ["AHU 15209", "Secondary Packaging", 6, ""],
    ["AHU 15210", "Lab Mikrobiologi", 9, ""],
    ["AHU 15211", "QC Laboratories", 6, ""],
    ["AHU 15212", "Labolatory", 4, ""],
    ["AHU 15212A", "Climatic Chamber", 1, 1],
    ["AHU 15213", "Black Corridor", 2, ""],
    ["AHU 15214", "Laundry", 1, 1],
    ["AHU 15215", "Viewing Gallery", 1, 1],
    ["AHU 15M201", "Secondary Packaging Warehouse", 6, ""],
    ["AHU 15M202", "Primary Packaging Warehouse", 18, ""],
    ["AHU 15M203", "Retained Sample Finished Good", 4, 2],
    ["AHU 15M204", "Dokumen Produksi", 6, 3],
  ], []);

   const mezzanine1herbal = useMemo<MezzanineData[]>(() => [
    ["AHU 17101", "Extractor dan Evaporator", 6, ""],
    ["AHU 17102", "Dry extraction", 6, 3],
    ["AHU 17103", "Simplicia Processing", 4, 2],
    ["AHU 17104", "Weighing", 4, 2],
    ["AHU 17105", "Filling", 4, 2],
    ["AHU 17105A", "Liquid Process", 9, ""],
    ["AHU 17106", "Secondary Packaging", 4, 2],
    ["AHU 17107", "Warehouse dan Sampling Simplicia", 4, 2],
    ["AHU 17108", "Finished Good Warehouse", 4, 2],
    ["AHU 17109", "Receiving Material", 1, 1],
    ["AHU 171010", "Street Clothes 1", 1, 1],
    ["AHU 17M101", "Secondary Packaging Warehouse", 6, 3],
  ], []);

   const mezzanine2herbal = useMemo<MezzanineData[]>(() => [
    ["AHU 17202", "Cosmetic Area", 4, 2],
    ["AHU 17204", "Formulation Corridor", 14, ""],
    ["AHU 17205", "Solid Production", 6, 3],
    ["AHU 17206", "Primary Packaging", 4, 2],
    ["AHU 17207", "Secondary Packaging", 9, ""],
    ["AHU 17208", "Street Clothes 2", 2, 2],
  ], []);

  const firewarehouse = useMemo<MezzanineData[]>(() => [
    ["AHU 18101", "Flammable Warehouse", 2, 2],
  ], []);

  // Gunakan useCallback agar filterTable stabil dan bisa masuk dependency useMemo
  const filterTable = useCallback((data: MezzanineData[]) => 
    data.filter(row => 
      row[0].toLowerCase().includes(searchQuery.toLowerCase()) || 
      row[1].toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const filteredMez1 = useMemo(() => filterTable(mezzanine1pharma), [filterTable, mezzanine1pharma]);
  const filteredMez2 = useMemo(() => filterTable(mezzanine2pharma), [filterTable, mezzanine2pharma]);
  const filteredMez3 = useMemo(() => filterTable(mezzanine1herbal), [filterTable, mezzanine1herbal]);
  const filteredMez4 = useMemo(() => filterTable(mezzanine2herbal), [filterTable, mezzanine2herbal]);
  const filteredMez5 = useMemo(() => filterTable(firewarehouse), [filterTable, firewarehouse]);

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
          <h1 className="text-sm font-bold text-slate-900 truncate max-w-50 leading-tight">
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
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60"
              />
              
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-lg bg-white rounded-t-4xl md:rounded-4xl shadow-2xl z-70 overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 md:hidden" />

                <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                        <FileText size={20} />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">Detail & Prosedur</h3>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 active:scale-90 transition-all">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mt-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Cari unit atau area..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto p-6 space-y-8 flex-1 text-left">
                  
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Unit</p>
                        <p className="text-sm font-bold text-slate-700">{form.ahu_name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. Seri</p>
                        <p className="text-sm font-bold text-slate-700">#{form.ahu_no}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-teal-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Layers size={14} /> Database Mezzanine
                    </h4>

                    {filteredMez1.length > 0 && (
                      <MezzanineSection title="Mezzanine 1 Pharma" data={filteredMez1} />
                    )}

                    {filteredMez2.length > 0 && (
                      <MezzanineSection title="Mezzanine 2 Pharma" data={filteredMez2} />
                    )}

                    {filteredMez3.length > 0 && (
                      <MezzanineSection title="Mezzanine 1 Herbal" data={filteredMez3} />
                    )}

                    {filteredMez4.length > 0 && (
                      <MezzanineSection title="Mezzanine 2 Herbal" data={filteredMez4} />
                    )}

                    {filteredMez5.length > 0 && (
                      <MezzanineSection title="Gudang Api" data={filteredMez5} />
                    )}

                    {filteredMez1.length === 0 && filteredMez2.length === 0 && filteredMez3.length === 0 && filteredMez4.length === 0 && filteredMez5.length === 0 && (
                      <div className="text-center py-10 opacity-50">
                        <Search size={32} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-sm text-slate-500">Data tidak ditemukan</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-100">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold active:scale-[0.98] transition-transform shadow-xl shadow-slate-200"
                  >
                    Selesai Membaca
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* INFO BOX */}
        <div className="mb-8 flex items-start gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="p-2 bg-blue-50 rounded-xl"><Info className="text-blue-500" size={18} /></div>
          <div className="space-y-0.5 text-left">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Input Data</h4>
            <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
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

            <div className="bg-white rounded-4xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
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

function MezzanineSection({ title, data }: { title: string, data: MezzanineData[] }) {
  return (
    <div className="space-y-3">
      <h5 className="text-sm font-bold text-slate-800 px-1">{title}</h5>
      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-tighter">
            <tr>
              <th className="px-3 py-3">AHU</th>
              <th className="px-3 py-3">Area</th>
              <th className="px-3 py-3 text-center">F</th>
              <th className="px-3 py-3 text-center">H</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map(([a, b, c, d], i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-3 py-3 font-bold text-teal-600">{a}</td>
                <td className="px-3 py-3 text-slate-600">{b}</td>
                <td className="px-3 py-3 text-center font-bold">{c}</td>
                <td className="px-3 py-3 text-center font-bold">{d || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}