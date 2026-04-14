"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CircleHelp, 
  ShieldCheck, 
  AlertCircle,
  Smartphone
} from "lucide-react";
import { apiFetch } from "@/services/api";

export default function ScanNFCPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  // Menggunakan useCallback agar fungsi stabil dan aman masuk ke dependency useEffect
  const submit = useCallback(async (uidValue: string) => {
    try {
      setLoading(true);
      setError(null);
      if (navigator.vibrate) navigator.vibrate(50);

      const res = await apiFetch<{
        inspection_id: string;
        scan_token: string;
      }>("/inspection/scan-nfc", {
        method: "POST",
        body: JSON.stringify({ nfc_uid: uidValue }),
      });

      // Redirect ke halaman form inspeksi
      router.push(`/inspection/${res.inspection_id}?token=${res.scan_token}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tag tidak dikenal");
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Menangkap nfc_id dari link: /scan-nfc?nfc_id=...
    const nfcUID = params.get("nfc_id") || params.get("nfc_uid");
    
    if (nfcUID) {
      submit(nfcUID);
    }
  }, [params, submit]);

  return (
    <div className="relative min-h-dvh bg-[#F2F2F7] flex flex-col items-center justify-between py-12 px-6 overflow-hidden font-sans text-left">
      
      {/* STATUS BAR EMULATION */}
      <div className="fixed top-0 w-full h-12 bg-[#F2F2F7]/80 backdrop-blur-md z-40 flex items-center justify-center px-6">
         <div className="flex items-center gap-1.5 bg-gray-200/50 px-3 py-1 rounded-full">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">NFC Ready</span>
         </div>
      </div>

      {/* HELP BUTTON */}
      <div className="w-full flex justify-end pt-4">
        <button 
          onClick={() => setShowManual(true)}
          className="p-3 bg-white rounded-full shadow-sm border border-gray-200 active:scale-90 transition-all"
        >
          <CircleHelp size={22} className="text-blue-500" />
        </button>
      </div>

      {/* CENTER VISUALIZATION */}
      <div className="flex flex-col items-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 3, delay: i * 0.8, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border border-blue-400/30"
            />
          ))}

          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-44 h-44 bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-2">
              <Smartphone size={60} strokeWidth={1.5} className="text-blue-500" />
              <div className="flex gap-1">
                 <div className="h-1 w-1 rounded-full bg-gray-300" />
                 <div className="h-1 w-3 rounded-full bg-blue-500" />
                 <div className="h-1 w-1 rounded-full bg-gray-300" />
              </div>
            </div>
            
            <motion.div 
              animate={{ top: ["20%", "70%", "20%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-8 h-0.5 bg-linear-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_10px_#60a5fa]"
            />
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Siap Memindai
          </h1>
          <p className="mt-2 text-[15px] text-[#8E8E93] max-w-60 leading-snug font-medium text-center">
            Dekatkan bagian atas iPhone Anda ke titik sensor unit AHU.
          </p>
        </div>
      </div>

      {/* LOADING INDICATOR */}
      <div className="h-20 flex flex-col items-center">
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3"
            >
              <div className="h-4 w-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm font-bold text-gray-700">Memproses Data...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM LOGO */}
      <div className="flex flex-col items-center gap-2 opacity-30">
        <ShieldCheck size={20} className="text-black" />
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black">AIRA SECURE</span>
      </div>

      {/* MODAL POPUP */}
      <AnimatePresence>
        {(error || showManual) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-75 bg-white/90 backdrop-blur-xl rounded-[22px] overflow-hidden shadow-2xl"
            >
              <div className="p-6 text-center">
                {error ? (
                  <>
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle size={24} className="text-red-500" />
                    </div>
                    <h2 className="text-lg font-bold text-black text-center">Gagal Membaca</h2>
                    <p className="text-[13px] text-gray-600 mt-2 text-center">{error}</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-black text-center">Input Manual</h2>
                    <p className="text-[13px] text-gray-600 mt-1 mb-4 text-center">Masukkan ID Unit jika NFC tidak terbaca.</p>
                    <input
                      value={uid}
                      onChange={(e) => setUid(e.target.value)}
                      placeholder="Contoh: 04:A2:E5:22:29:5E:82"
                      className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-[15px] font-semibold text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-2"
                    />
                  </>
                )}
              </div>
              
              <div className="flex flex-col border-t border-gray-200/50">
                <button 
                  onClick={error ? () => setError(null) : () => { submit(uid); setShowManual(false); }}
                  disabled={!error && !uid}
                  className="py-4 text-[17px] font-bold text-blue-500 active:bg-gray-100 transition-colors disabled:opacity-30"
                >
                  {error ? "Coba Lagi" : "Lanjutkan"}
                </button>
                <button 
                  onClick={() => { setError(null); setShowManual(false); }}
                  className="py-4 text-[17px] font-medium text-gray-500 border-t border-gray-200/50 active:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}