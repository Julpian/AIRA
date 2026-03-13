"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface InspectionVerifyResponse {
  inspection_id: string;
  unit_code: string;
  period: string;
  inspector_name: string;
  spv_name: string;
  inspected_at: string;
}

export default function VerifyInspectionPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [data, setData] = useState<InspectionVerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API}/public/verify/inspection/${id}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not Found");
        return res.json();
      })
      .then((json: InspectionVerifyResponse) => setData(json))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="fixed inset-0 bg-[#F2F2F7] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-[3px] border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-[15px] font-medium text-gray-500 tracking-tight">Verifikasi Keamanan...</p>
      </div>
    );

  if (error)
    return (
      <div className="fixed inset-0 bg-[#F2F2F7] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl text-center w-full max-w-[320px] border border-red-50"
        >
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Dokumen Tidak Valid</h1>
          <p className="text-gray-500 text-sm mt-2">QR Code tidak terdaftar atau telah kadaluwarsa.</p>
          <button onClick={() => window.location.reload()} className="mt-6 w-full py-3 bg-gray-100 rounded-2xl font-bold text-gray-900 active:scale-95 transition-transform">Coba Lagi</button>
        </motion.div>
      </div>
    );

  return (
    // fixed inset-0 digunakan agar bg tidak pecah saat scroll di mobile
    <div className="fixed inset-0 bg-[#F2F2F7] overflow-y-auto font-sans antialiased text-gray-900 selection:bg-blue-100">
      
      {/* HEADER - Sticky & Translucent */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 h-14 flex items-center justify-center">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="text-blue-500" size={18} strokeWidth={2.5} />
          <span className="font-bold tracking-tight text-[15px]">AIRA Official Verify</span>
        </div>
      </nav>

      <main className="px-5 pt-8 pb-12 max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* STATUS SECTION */}
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="relative"
            >
              <div className="h-20 w-20 bg-white rounded-[1.8rem] shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center justify-center mb-4 relative z-10">
                <CheckCircle2 size={48} className="text-[#34C759]" strokeWidth={1.5} />
              </div>
              <div className="absolute inset-0 bg-green-400/20 blur-2xl rounded-full scale-110" />
            </motion.div>
            
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Valid & Sah</h2>
            <p className="text-[#8E8E93] text-[13px] font-semibold uppercase tracking-[0.1em] mt-0.5">Authentic Record</p>
          </div>

          {/* MAIN INFORMATION CARD */}
          <section className="bg-white rounded-[2.2rem] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-white mb-6">
            <div className="space-y-5">
              <InfoRow 
                label="ID Laporan" 
                value={data?.inspection_id.substring(0, 12).toUpperCase()} 
                icon={<FileText size={16} className="text-blue-500" />} 
                isMono
              />
              <InfoRow 
                label="Unit AHU" 
                value={data?.unit_code} 
                icon={<Building2 size={16} className="text-orange-500" />} 
              />
              <InfoRow 
                label="Periode" 
                value={data?.period} 
                icon={<Clock size={16} className="text-purple-500" />} 
              />
              
              {/* SUB-CARD UNTUK PERSONIL */}
              <div className="p-4 bg-gray-50/80 rounded-[1.4rem] space-y-4 border border-gray-100">
                <InfoRow 
                    label="Inspector" 
                    value={data?.inspector_name} 
                    icon={<User size={16} className="text-gray-400" />} 
                    noBorder
                    compact
                />
                <InfoRow 
                    label="Supervisor" 
                    value={data?.spv_name} 
                    icon={<User size={16} className="text-gray-400" />} 
                    noBorder
                    compact
                />
              </div>

              <InfoRow 
                label="Tanggal Inspeksi" 
                value={data?.inspected_at} 
                icon={<Calendar size={16} className="text-red-400" />} 
                noBorder
              />
            </div>
          </section>

          {/* SECURITY STATEMENT */}
          <div className="px-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-200/50 rounded-full mb-4">
               <ShieldCheck size={10} className="text-gray-500" />
               <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">Encrypted Verification</span>
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed font-medium">
              Informasi ini dihasilkan secara otomatis oleh sistem pusat. Pastikan ID Laporan sesuai dengan yang tertera pada dokumen fisik.
            </p>
          </div>

          {/* ACTION BUTTON */}
          <div className="mt-8">
            <button className="w-full flex items-center justify-center gap-2 bg-white h-12 rounded-2xl font-bold text-[15px] text-blue-500 shadow-sm border border-gray-100 active:scale-[0.98] active:bg-gray-50 transition-all">
              <ExternalLink size={16} />
              Portal Kimia Farma
            </button>
          </div>
        </motion.div>
      </main>

      {/* iOS HOME INDICATOR (AESTHETIC ONLY) */}
      <div className="fixed bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/10 rounded-full z-50 pointer-events-none" />
    </div>
  );
}

function InfoRow({ 
  label, 
  value, 
  icon, 
  isMono = false,
  noBorder = false,
  compact = false
}: { 
  label: string; 
  value?: string; 
  icon: ReactNode; 
  isMono?: boolean;
  noBorder?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${!noBorder && 'pb-4 border-b border-gray-100/60'}`}>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="opacity-80 shrink-0">{icon}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="pl-6">
        <span className={`leading-tight block ${compact ? 'text-[14px]' : 'text-[16px]'} font-bold tracking-tight ${isMono ? 'font-mono text-blue-600' : 'text-gray-900'}`}>
          {value || "-"}
        </span>
      </div>
    </div>
  );
}