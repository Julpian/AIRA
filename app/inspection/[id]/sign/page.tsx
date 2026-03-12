"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import SignaturePad from "@/components/signature/SignaturePad";
import { apiFetch } from "@/services/api";
import { ChevronLeft, CheckCircle2, Trash2, Send, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignInspectionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [capturedSignature, setCapturedSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = (signature: string) => {
    setCapturedSignature(signature);
  };

  async function handleSubmit() {
    if (!capturedSignature) return;
    setLoading(true);
    try {
      await apiFetch(`/inspection/${id}/sign`, {
        method: "POST",
        body: JSON.stringify({ signature: capturedSignature }),
      });
      router.push(`/inspection/${id}/preview`);
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim tanda tangan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F7] font-sans antialiased text-[#1C1C1E]">
      
      {/* IOS HEADER NAVIGATION */}
      <nav className="sticky top-0 z-20 flex items-center justify-between bg-[#F2F2F7]/80 px-4 py-4 backdrop-blur-xl border-b border-gray-200/50">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-[17px] text-blue-500 font-medium active:opacity-50 transition-opacity"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
          <span>Batal</span>
        </button>
        <h1 className="text-[17px] font-semibold">Tanda Tangan</h1>
        <div className="w-20" /> {/* Spacer */}
      </nav>

      <main className="max-w-lg mx-auto p-6">
        
        {/* HEADER SECTION */}
        <header className="text-center mb-8">
          <div className="h-14 w-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-blue-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-black">Verifikasi Identitas</h2>
          <p className="text-[#8E8E93] text-[15px] font-medium mt-2 leading-relaxed px-4">
            Gunakan jari atau stylus Anda untuk membubuhkan tanda tangan resmi pada area di bawah ini.
          </p>
        </header>

        {/* SIGNATURE AREA */}
        <div className="space-y-4">
          <div className="relative bg-white rounded-[2rem] border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Label Petunjuk */}
            {!capturedSignature && (
              <div className="absolute top-4 left-6 pointer-events-none">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Signature Area</span>
              </div>
            )}
            
            <div className="p-2 min-h-[250px] flex items-center justify-center">
               <SignaturePad onSave={handleCapture} />
            </div>
          </div>

          {/* STATUS NOTIFICATION */}
          <AnimatePresence>
            {capturedSignature && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-blue-600">Tanda Tangan Terbaca</span>
                </div>
                <button 
                  onClick={() => setCapturedSignature(null)}
                  className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm border border-gray-100 active:scale-90 transition-transform"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTION BUTTON */}
        <div className="mt-10 space-y-6">
          <button
            disabled={loading || !capturedSignature}
            onClick={handleSubmit}
            className={`w-full py-4.5 rounded-[1.2rem] font-bold text-[17px] flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] ${
              loading || !capturedSignature
                ? "bg-gray-300 text-white shadow-none"
                : "bg-blue-600 text-white shadow-blue-200"
            }`}
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} strokeWidth={2.5} />
                <span>Simpan & Kirim Laporan</span>
              </>
            )}
          </button>

          {/* SECURITY FOOTER */}
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="flex items-center gap-2 text-gray-400">
               <ShieldCheck size={14} />
               <span className="text-[11px] font-bold uppercase tracking-[0.2em]">AIRA Cryptographic Signature</span>
            </div>
            <p className="text-[11px] text-center text-[#8E8E93] font-medium leading-relaxed px-6 italic">
              Dokumen ini akan dikunci secara digital setelah tanda tangan dikirimkan.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}