"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Download, FileText, Share, Home } from "lucide-react";
import { motion, Transition } from "framer-motion";

export default function InspectionPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const pdfUrl = `${process.env.NEXT_PUBLIC_API}/files/inspection/${id}.pdf`;

  /**
   * Perbaikan: Menggunakan tipe 'Transition' 
   * agar properti 'type: "spring"' dikenali dengan benar oleh TypeScript.
   */
  const springTransition: Transition = {
    type: "spring",
    stiffness: 260,
    damping: 25,
    mass: 0.5, // Sedikit massa agar terasa lebih premium
  };

  return (
    <div className="h-dvh flex flex-col bg-[#F2F2F7] font-sans antialiased overflow-hidden">
      
      {/* MINIMALIST NAV BAR */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-gray-200/30 px-4 h-14 flex justify-between items-center">
        <button
          onClick={() => router.push("/inspection/dashboard")}
          className="flex items-center text-[#007AFF] active:opacity-30 transition-opacity"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-1" />
          <span className="text-[17px] font-medium">Selesai</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <p className="text-[13px] font-semibold text-gray-900 tracking-tight">Preview Laporan</p>
          <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase italic">AIRA Official</p>
        </div>

        <button
          onClick={() => router.push("/inspection/dashboard")}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 active:scale-90 transition-transform"
        >
          <Home size={18} />
        </button>
      </header>

      {/* PDF PREVIEW AREA */}
      <main className="flex-1 relative pt-14 pb-24 bg-[#525659] flex items-center justify-center p-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={springTransition}
          className="w-full h-full relative z-10 rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
        >
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 -z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Opening Document</span>
            </div>
          </div>

          <iframe
            src={`${pdfUrl}#view=FitH&toolbar=0&navpanes=0`}
            className="w-full h-full border-none"
            title="PDF Preview"
          />
        </motion.div>

        <div className="absolute top-20 right-6 z-20">
          <div className="bg-black/30 backdrop-blur-lg px-3 py-1.5 rounded-full border border-white/10 text-white/70 text-[10px] font-mono tracking-tight shadow-sm">
            ID: {id?.substring(0, 8).toUpperCase()}
          </div>
        </div>
      </main>

      {/* ACTION BAR (Apple Floating Style) */}
      <footer className="fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur-2xl border-t border-gray-200/50 px-5 pt-4 pb-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 flex items-center justify-center rounded-xl border border-blue-100/50">
              <FileText size={20} className="text-[#007AFF]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-gray-900 leading-none truncate max-w-[140px]">
                {id?.substring(0, 8)}_report.pdf
              </span>
              <span className="text-[11px] text-[#007AFF] font-bold mt-1 uppercase tracking-tighter opacity-70">
                Digital Signature Verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 flex items-center justify-center bg-gray-100 text-[#007AFF] rounded-full active:scale-90 transition-all border border-gray-200/50"
            >
              <Share size={20} />
            </a>

            <motion.a
              whileTap={{ scale: 0.96 }}
              href={pdfUrl}
              download
              className="flex items-center gap-2 bg-[#007AFF] text-white h-11 px-6 rounded-full font-bold text-[15px] shadow-lg shadow-blue-500/30"
            >
              <Download size={18} strokeWidth={2.5} />
              <span>Simpan</span>
            </motion.a>
          </div>
        </div>
      </footer>

      {/* iOS HOME BAR INDICATOR */}
      <div className="fixed bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-black/10 rounded-full z-50 pointer-events-none" />
    </div>
  );
}