"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { sha256 as jsSha256 } from 'js-sha256';
import { 
  ShieldCheck, Calendar, CheckCircle2, CircleDashed, 
  Clock, ChevronRight, Info, AlertCircle, UploadCloud,
  CheckCircle, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ================= TYPES ================= */

type VerifyResponse = {
  year: number;
  status: string;
  svp_signed_at?: string | null;
  asmen_signed_at?: string | null;
  sha256: string; // Backend WAJIB mengirimkan ini sekarang
};

/* ================= PAGE ================= */

export default function VerifyPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk Fitur Baru: Integrity Check
  const [integrityStatus, setIntegrityStatus] = useState<"idle" | "checking" | "match" | "mismatch">("idle");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
      if (!token) return;
      fetch(`${process.env.NEXT_PUBLIC_API}/public/verify/${token}`, {
        headers: {
          "ngrok-skip-browser-warning": "69420", // Melewati halaman peringatan ngrok
        },
      })
      .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
      })
      .then((res: VerifyResponse) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [token]);

  // Fungsi Hitung Hash SHA-256 di Browser
  const calculateHash = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        // Hitung hash menggunakan library js-sha256 yang baru diinstal
        const hash = jsSha256(arrayBuffer);
        resolve(hash);
      };
      reader.onerror = () => reject("Gagal membaca file");
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    setFileName(file.name);
    setIntegrityStatus("checking");

    try {
      const fileHash = await calculateHash(file);
      // Bandingkan dengan hash asli dari database
      if (fileHash === data.sha256) {
        setIntegrityStatus("match");
      } else {
        setIntegrityStatus("mismatch");
      }
    } catch (err) {
      setIntegrityStatus("idle");
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#F2F2F7] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-gray-200 border-t-[#007AFF] rounded-full animate-spin mb-4" />
      <p className="text-[15px] font-medium text-[#8E8E93]">Memvalidasi Dokumen...</p>
    </div>
  );

  if (!data) return (
    <div className="fixed inset-0 bg-[#F2F2F7] flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl max-w-[320px] w-full">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
        <h1 className="text-lg font-bold">Link Tidak Valid</h1>
        <p className="text-gray-500 text-sm mt-2">Dokumen tidak ditemukan atau token kadaluarsa.</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#F2F2F7] overflow-y-auto font-sans text-gray-900 pb-10">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 h-14 flex items-center justify-center">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="text-[#007AFF]" size={18} strokeWidth={2.5} />
          <span className="font-bold text-[15px]">AIRA System Verification</span>
        </div>
      </nav>

      <main className="px-5 pt-8 pb-12 max-w-sm mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* HEADER INFO */}
          <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-white mb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-4 text-[#007AFF]">
              <Calendar size={32} />
            </div>
            <h1 className="text-[22px] font-black">Jadwal AHU {data.year}</h1>
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-[10px] font-bold uppercase text-gray-500">{data.status}</span>
            </div>
          </div>

          {/* FITUR BARU: UPLOAD & INTEGRITY CHECK */}
          <h3 className="px-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Integrity Check</h3>
          <section className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-white mb-6">
            <p className="text-[12px] text-gray-500 mb-4 leading-tight">
              Unggah file PDF untuk memastikan isinya belum diubah (Anti-Tamper).
            </p>
            
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-100 rounded-3xl hover:border-blue-200 cursor-pointer transition-all bg-gray-50/30">
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              <UploadCloud className="text-gray-300 mb-2" size={28} />
              <span className="text-[13px] font-bold text-gray-400">Pilih File PDF</span>
            </label>

            <AnimatePresence mode="wait">
              {integrityStatus !== "idle" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`mt-6 rounded-3xl overflow-hidden border ${
                    integrityStatus === "match" 
                      ? "bg-emerald-50/50 border-emerald-100" 
                      : "bg-rose-50/50 border-rose-100"
                  }`}
                >
                  <div className={`p-5 flex items-start gap-4 ${
                    integrityStatus === "match" ? "text-emerald-900" : "text-rose-900"
                  }`}>
                    {integrityStatus === "checking" ? (
                      <CircleDashed className="animate-spin text-blue-500 mt-1" size={24} />
                    ) : integrityStatus === "match" ? (
                      <div className="bg-emerald-500 p-1.5 rounded-full text-white">
                        <CheckCircle size={18} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="bg-rose-500 p-1.5 rounded-full text-white">
                        <AlertCircle size={18} strokeWidth={3} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold leading-tight truncate mb-1">
                        {fileName}
                      </p>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.1em] opacity-70">
                        {integrityStatus === "checking" ? "Analisis Kriptografi..." : 
                        integrityStatus === "match" ? "Integritas Dokumen Terjamin" : "Manipulasi Terdeteksi"}
                      </h4>
                    </div>
                  </div>

                  {/* TECHNICAL DETAILS BOX: Inilah yang membuat tampilan terlihat profesional */}
                  <div className={`px-5 py-4 border-t text-[11px] leading-relaxed ${
                    integrityStatus === "match" ? "bg-emerald-100/30 border-emerald-100 text-emerald-800" : "bg-rose-100/30 border-rose-100 text-rose-800"
                  }`}>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold opacity-60">Status:</span>
                        <span className="font-bold">
                          {integrityStatus === "match" ? "Biner Identik (100%)" : "Ketidakcocokan Sidik Jari Digital"}
                        </span>
                      </div>
                      
                      <div className="space-y-1 mt-1 p-2 bg-white/40 rounded-lg font-mono text-[10px] break-all border border-current/10">
                        <p className="opacity-60 uppercase font-bold text-[9px] mb-1">Fingerprint (SHA-256)</p>
                        <div className="flex gap-2">
                          <span className="shrink-0 w-8 opacity-50">DB:</span>
                          <span className="truncate">{data?.sha256}</span>
                        </div>
                        {integrityStatus === "mismatch" && (
                          <div className="flex gap-2 text-rose-600 font-bold">
                            <span className="shrink-0 w-8 opacity-50">FILE:</span>
                            <span className="truncate">Analisis biner tidak cocok dengan record server.</span>
                          </div>
                        )}
                      </div>

                      {integrityStatus === "mismatch" && (
                        <p className="mt-1 text-[10px] italic font-medium opacity-80">
                          Peringatan: Dokumen ini telah dimodifikasi setelah proses otorisasi selesai. Isinya tidak dapat lagi dipercaya secara hukum.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* SIGNATURE TIMELINE */}
          <h3 className="px-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Otorisasi Digital</h3>
          <section className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-white mb-6">
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-[1.5px] bg-gray-100" />
              <SignRow role="SVP (Senior Vice President)" isSigned={!!data.svp_signed_at} date={data.svp_signed_at} />
              <SignRow role="ASMEN (Asisten Manajer)" isSigned={!!data.asmen_signed_at} date={data.asmen_signed_at} />
            </div>
          </section>

          <p className="mt-8 text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            © 2026 PT Kimia Farma Tbk
          </p>
        </motion.div>
      </main>
    </div>
  );
}

function SignRow({ role, isSigned, date }: { role: string, isSigned: boolean, date?: string | null }) {
  return (
    <div className="flex gap-4 relative z-10">
      <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center ${isSigned ? 'bg-[#34C759] text-white' : 'bg-gray-100 text-gray-300'}`}>
        {isSigned ? <CheckCircle2 size={16} strokeWidth={3} /> : <CircleDashed size={16} className="animate-spin" />}
      </div>
      <div className="flex-1">
        <h4 className={`text-[15px] font-bold ${isSigned ? 'text-gray-900' : 'text-gray-400'}`}>{role}</h4>
        <span className="text-[12px] text-gray-500">{isSigned ? `Verified: ${date}` : 'Menunggu Approval...'}</span>
      </div>
    </div>
  );
}