"use client";

import RequireRole from "@/components/RequireRole";
import { apiFetch } from "@/services/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CalendarCheck, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  FileSignature, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";

/* ================= TYPES ================= */
interface ScheduleStatus {
  Status: string;
}

interface SchedulePreview {
  id: number;
}

export default function AsmenDashboardPage() {
  const [status, setStatus] = useState<string>("");
  const [totalInspeksi, setTotalInspeksi] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const year = new Date().getFullYear();

  useEffect(() => {
    // Ambil Status dan Preview secara paralel
    Promise.all([
      apiFetch<ScheduleStatus>(`/asmen/schedule/${year}`),
      apiFetch<SchedulePreview[]>(`/asmen/schedule/${year}/preview`)
    ])
    .then(([statusRes, previewRes]) => {
      setStatus(statusRes.Status);
      setTotalInspeksi(previewRes.length);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [year]);

  const isReadyToSign = status === "signed_by_svp";
  const isAlreadySigned = status === "signed_by_asmen";

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* WELCOME HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight italic">
            ASMEN <span className="text-indigo-500 text-normal font-medium">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitoring & Final Approval Penjadwalan AHU Tahun <span className="text-white font-bold">{year}</span>
          </p>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg">
          <Clock size={16} className="text-indigo-400" />
          <span className="text-xs text-slate-300 font-mono uppercase">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Unit */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <CalendarCheck size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Inspeksi</span>
          </div>
          <div className="text-4xl font-bold text-white tracking-tighter">{totalInspeksi}</div>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Unit AHU Terdaftar di {year}</p>
        </div>

        {/* Card 2: Status Approval */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status Dokumen</span>
            </div>
            
            {/* Status Badge */}
            <div className={`px-4 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${
              isReadyToSign ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
              isAlreadySigned ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              "bg-slate-800 text-slate-400 border-white/5"
            }`}>
              {status?.replace(/_/g, ' ') || "Menunggu Data"}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              {isReadyToSign ? (
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                  <AlertCircle size={16} /> Jadwal siap untuk disahkan (Sudah di-sign SVP)
                </div>
              ) : isAlreadySigned ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 size={16} /> Seluruh proses approval tahun {year} selesai
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">Menunggu verifikasi tanda tangan dari SVP...</p>
              )}
            </div>

            <Link href="/asmen/schedule" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-900/20">
              {isAlreadySigned ? "Lihat Jadwal" : "Menuju Approval"} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK ACTION / INFORMATION SECTION */}
      <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner">
        <div className="h-20 w-20 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-indigo-500/5">
          <FileSignature size={32} className="text-indigo-400" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-lg font-bold text-white tracking-tight">Tanda Tangan Elektronik Jadwal Tahunan</h3>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Sebagai Asisten Manajer, peran Anda adalah melakukan verifikasi akhir terhadap distribusi beban kerja inspektur di seluruh unit AHU sebelum jadwal diterbitkan secara resmi oleh sistem AIRA.
          </p>
        </div>
      </div>

    </div>
  );
}