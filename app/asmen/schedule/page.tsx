"use client";

import { motion, AnimatePresence } from "framer-motion";
import RequireRole from "@/components/RequireRole";
import SignaturePad from "@/components/signature/SignaturePad";
import { apiFetch } from "@/services/api";
import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { 
  Calendar as CalendarIcon, 
  Maximize2, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  FileSignature,
  ChevronRight
} from "lucide-react";

interface ScheduleApprovalResponse { Status: string; }
interface SchedulePreview { id: number; unit_code: string; start_date: string; end_date: string; inspector_name: string; }

export default function AsmenSignSchedulePage() {
  const [signature, setSignature] = useState("");
  const [schedules, setSchedules] = useState<SchedulePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);

  const year = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i);

  useEffect(() => {
    apiFetch<SchedulePreview[]>(`/asmen/schedule/${year}/preview`).then(setSchedules);
    apiFetch<ScheduleApprovalResponse>(`/asmen/schedule/${year}`).then((res) => setApprovalStatus(res.Status));
  }, [year]);

  const calendarEvents = useMemo(() => schedules.map((s) => ({
    id: String(s.id),
    title: `${s.unit_code} • ${s.inspector_name}`,
    start: s.start_date,
    end: s.end_date,
    backgroundColor: "#6366f120",
    borderColor: "#6366f1",
    textColor: "#818cf8",
  })), [schedules]);

  const isLocked = approvalStatus !== "signed_by_svp";

  const sign = async () => {
    if (!signature) return;
    try {
      setLoading(true);
      await apiFetch(`/asmen/schedule/${year}/sign`, { method: "POST", body: JSON.stringify({ signature }) });
      alert("Jadwal tahunan berhasil ditandatangani.");
    } finally { setLoading(false); }
  };

  return (
    <RequireRole roles={["AssistantManager"]}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Persetujuan Jadwal <span className="text-indigo-500 font-medium italic">{year}</span></h1>
            <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-semibold text-[10px]">Validasi Final Penjadwalan Inspeksi</p>
          </div>
          <button onClick={() => setIsYearModalOpen(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl border border-white/5 transition-all text-xs font-bold uppercase tracking-wider">
            <Maximize2 size={16} className="text-indigo-400" /> Lihat Outlook Tahunan
          </button>
        </div>

        {isLocked && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-400 animate-pulse">
            <AlertTriangle size={18} className="shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wide">Status: Menunggu Approval Senior Vice President (SVP)</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CALENDAR */}
          <div className="lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="bg-white/[0.02] p-4 border-b border-white/5 flex justify-between items-center px-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon size={16} className="text-indigo-500" /> Pratinjau Jadwal Kerja
              </span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-bold">{schedules.length} Inspeksi Terdaftar</span>
            </div>
            <div className="p-6 fc-custom-theme">
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                firstDay={1}
                events={calendarEvents}
                headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                height="600px"
              />
            </div>
          </div>

          {/* SIGNATURE PANEL */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
              <h3 className="text-white font-bold tracking-tight text-lg italic border-b border-white/5 pb-4">Digital Approval</h3>
              
              <div className={`transition-all duration-500 ${isLocked ? "opacity-30 grayscale pointer-events-none" : "opacity-100"}`}>
                <div className="bg-white rounded-2xl p-1 shadow-inner overflow-hidden ring-4 ring-slate-800">
                  <SignaturePad onSave={setSignature} />
                </div>
                <p className="text-[10px] text-slate-500 mt-3 text-center uppercase tracking-widest font-bold">Gunakan mouse/touch untuk tanda tangan</p>
              </div>

              <button
                disabled={!signature || loading || isLocked}
                onClick={sign}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/20"
              >
                {loading ? "Sinkronisasi..." : "Sahkan Jadwal Tahunan"} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL YEAR */}
        <AnimatePresence>
          {isYearModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl p-6 flex flex-col overflow-hidden">
               <div className="flex justify-between items-center mb-8 px-4">
                  <h2 className="text-3xl font-bold text-white italic">Yearly <span className="text-indigo-500 font-medium not-italic tracking-tighter">Outlook {year}</span></h2>
                  <button onClick={() => setIsYearModalOpen(false)} className="p-3 hover:bg-red-500/20 text-red-400 rounded-full transition-all"><X size={32}/></button>
               </div>
               <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-4 pb-12">
                  {months.map((month) => (
                    <div key={month} className="bg-slate-900 border border-white/5 rounded-3xl p-4 flex flex-col h-80">
                      <div className="text-center mb-4 font-bold text-indigo-400 uppercase text-xs tracking-[0.2em] italic border-b border-white/5 pb-2">
                        {new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(year, month))}
                      </div>
                      <div className="flex-1 text-[9px] mini-calendar">
                        <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" firstDay={1} headerToolbar={false} initialDate={new Date(year, month, 1)} events={calendarEvents} height="100%" />
                      </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .fc { --fc-border-color: rgba(255, 255, 255, 0.05); --fc-page-bg-color: transparent; }
        .fc .fc-toolbar-title { font-size: 1.1rem !important; font-weight: 800; color: #f8fafc; text-transform: italic; }
        .fc .fc-button-primary { background-color: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; font-size: 10px !important; font-weight: 700; transition: all 0.2s; text-transform: uppercase; }
        .fc .fc-button-primary:hover { background-color: rgba(255,255,255,0.1) !important; }
        .fc .fc-daygrid-day-number { color: #475569 !important; font-size: 11px !important; font-weight: 600; }
        .fc .fc-col-header-cell-cushion { color: #64748b !important; font-size: 10px !important; font-weight: 800; text-transform: uppercase; }
        .fc .fc-event { border-radius: 6px; padding: 2px 4px; font-size: 9px; font-weight: 800; }
      `}</style>
    </RequireRole>
  );
}