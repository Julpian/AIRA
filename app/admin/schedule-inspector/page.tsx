"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarRange,
  Search,
  UserCheck,
  AlertTriangle,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  PenTool,
  CalendarDays,
  Maximize2
} from "lucide-react";
import { apiFetch } from "@/services/api";
import { getAuth } from "@/services/auth";
import SignaturePad from "@/components/signature/SignaturePad";
import ScheduleCalendar from "@/components/ScheduleCalendar";

/* ================= TYPES ================= */

type Inspector = {
  id: string;
  name: string;
};

type Schedule = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  unit_code?: string | null;
  room_name?: string | null;
  period?: string;
  week_of_month?: number | null;
  inspector_id: string | null;
  inspector_name?: string | null;
  nfc_bypass: boolean;
};

/* ================= HELPERS ================= */

function isOverdue(s: Schedule) {
  if (s.status === "selesai") return false;
  return new Date() > new Date(s.end_date);
}

function normalizeArray<T>(
  res: T[] | { data?: T[] | null } | null | undefined
): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

function formatWeekRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  })} – ${e.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
}

function formatPeriod(s: Schedule) {
  if (s.period === "bulanan")
    return `Bulanan • Minggu ${s.week_of_month}`;
  if (s.period === "enam_bulan") return "6 Bulanan";
  if (s.period === "tahunan") return "Tahunan";
  if (s.period === "ganti_filter")
    return "Ganti Filter";
  return "-";
}

function periodColor(period?: string) {
  switch (period) {
    case "bulanan":
      return "text-sky-300";
    case "enam_bulan":
      return "text-purple-300";
    case "tahunan":
      return "text-teal-300";
    case "ganti_filter":
      return "text-orange-400";
    default:
      return "text-slate-400";
  }
}

function getStatusBadge(status: string, overdue: boolean) {
  if (overdue) return "bg-red-500/10 text-red-400 border-red-500/20";
  switch (status) {
    case "siap_diperiksa": return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "dalam_pemeriksaan": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "selesai": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

/* ================= PAGE ================= */

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loading, setLoading] = useState(true);

  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [search, setSearch] = useState("");
  const [showSign, setShowSign] = useState(false);
  const [signature, setSignature] = useState("");
  const [calendarMode, setCalendarMode] = useState<"month" | "semester">("month");
  const [showYearCalendar, setShowYearCalendar] = useState(false);

  /* PAGINATION */
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const year = new Date().getFullYear();

  /* LOAD DATA */
  useEffect(() => {
    Promise.all([
      apiFetch<Schedule[] | { data: Schedule[] }>("/admin/schedules"),
      apiFetch<Inspector[] | { data: Inspector[] }>("/admin/inspectors"),
    ])
      .then(([s, i]) => {
        setSchedules(normalizeArray(s));
        setInspectors(normalizeArray(i));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* FILTERING LOGIC */
  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const matchPeriod = selectedPeriod === "all" || s.period === selectedPeriod;
      const keyword = search.toLowerCase();
      const matchSearch =
        s.unit_code?.toLowerCase().includes(keyword) ||
        s.room_name?.toLowerCase().includes(keyword);

      return matchPeriod && (search === "" || matchSearch);
    });
  }, [schedules, selectedPeriod, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  /* CALENDAR EVENTS */
  const calendarEvents = useMemo(() => 
    schedules
      .filter((s) => s.inspector_id)
      .map((s) => ({
        id: s.id,
        title: `${s.unit_code} • ${s.inspector_name}`,
        start: s.start_date,
        end: s.end_date,
        extendedProps: { period: s.period },
        className: [
          "fc-event-custom",
          s.period === "ganti_filter"
            ? "fc-filter-change"
            : isOverdue(s)
            ? "fc-overdue"
            : s.status === "siap_diperiksa"
            ? "fc-ready"
            : s.status === "dalam_pemeriksaan"
            ? "fc-progress"
            : "fc-done",
        ],
      })), [schedules]);

  const hasAssignedSchedule = schedules.some(s => s.inspector_id);

  /* ACTIONS */
  async function signSchedule() {
    if (!signature) return;
    await apiFetch(`/admin/schedule/${year}/sign`, {
      method: "POST",
      body: JSON.stringify({ signature }),
    });
    setShowSign(false);
    alert("Schedule berhasil ditandatangani");
  }

  async function downloadPDF() {
    const auth = getAuth();
    if (!auth?.token) {
      alert("Sesi berakhir, silakan login ulang.");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API || "";

    const res = await fetch(`${API_URL}/admin/schedule/${year}/pdf`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    if (!res.ok) {
      alert("PDF belum tersedia");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedule-${year}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleAssignInspector(scheduleId: string, inspectorId: string) {
    if (!inspectorId) return;
    setAssigningId(scheduleId);

    await apiFetch(`/admin/schedules/${scheduleId}/assign-inspector`, {
      method: "PATCH",
      body: JSON.stringify({ inspector_id: inspectorId }),
    });

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              inspector_id: inspectorId,
              inspector_name: inspectors.find((i) => i.id === inspectorId)?.name ?? null,
            }
          : s
      )
    );
    setAssigningId(null);
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-teal-500/30">
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-teal-500/10 p-2.5 rounded-xl border border-teal-500/20">
              <CalendarRange className="text-teal-400 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight italic">Schedule Inspector</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">AHU System Monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700 text-sm font-semibold">
              <Download size={16} /> Export PDF
            </button>
            <button 
              disabled={!hasAssignedSchedule}
              onClick={() => setShowSign(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-indigo-500/20"
            >
              <PenTool size={16} /> Sign Schedule
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/40 p-2 rounded-2xl border border-white/5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari Unit AHU atau Ruangan..."
                className="w-full bg-transparent border-none focus:ring-0 pl-11 pr-4 py-3 text-sm placeholder:text-slate-600 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pr-2">
              <Filter size={14} className="text-slate-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => { setSelectedPeriod(e.target.value); setPage(1); }}
                className="bg-slate-800 border-none rounded-xl text-xs py-2 px-4 cursor-pointer outline-none"
              >
                <option value="all">Semua Periode</option>
                <option value="bulanan">Bulanan</option>
                <option value="enam_bulan">6 Bulanan</option>
                <option value="tahunan">Tahunan</option>
                <option value="ganti_filter">Ganti Filter</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-sm shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/30 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">Waktu Inspeksi</th>
                    <th className="px-6 py-4">Unit & Periode</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={3} className="py-20 text-center text-slate-500 animate-pulse">Loading data...</td></tr>
                  ) : paginated.map((s) => (
                    <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white italic">{formatWeekRange(s.start_date, s.end_date)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(s.status, isOverdue(s))}`}>
                            {isOverdue(s) ? "TERLEWAT" : s.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-teal-400 tracking-tight">{s.unit_code}</div>
                        <div className="text-[10px] font-bold uppercase tracking-tighter opacity-60 italic">{formatPeriod(s)}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {s.inspector_id ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/5 text-teal-300 border border-teal-500/20 rounded-xl text-xs font-semibold">
                            <UserCheck size={14} /> {s.inspector_name}
                          </div>
                        ) : (
                          <select
                            disabled={assigningId === s.id}
                            onChange={(e) => handleAssignInspector(s.id, e.target.value)}
                            className="bg-slate-800 border border-white/10 rounded-xl text-[11px] py-1.5 px-3 outline-none transition-all"
                          >
                            <option value="">Assign Inspector</option>
                            {inspectors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-800/20 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-20 transition-all"><ChevronLeft size={16}/></button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-20 transition-all"><ChevronRight size={16}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-28 bg-slate-900/60 border border-white/5 rounded-4xl p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h3 className="font-bold text-white flex items-center gap-2 italic">
                <CalendarDays className="w-4 h-4 text-teal-400" /> Kalender
              </h3>
              <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/5">
                <button onClick={() => setCalendarMode("month")} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${calendarMode === 'month' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>MO</button>
                <button onClick={() => setCalendarMode("semester")} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${calendarMode === 'semester' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>SM</button>
              </div>
            </div>
            <div className="calendar-mini rounded-2xl overflow-hidden bg-slate-950/20 p-2">
              <ScheduleCalendar events={calendarEvents} mode={calendarMode} />
            </div>
            <button onClick={() => setShowYearCalendar(true)} className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-bold tracking-widest text-slate-300 transition-all uppercase flex items-center justify-center gap-2">
               <Maximize2 size={12}/> View Year Outlook
            </button>
          </div>
        </aside>
      </main>

      {/* MODALS */}
      {showYearCalendar && (
        <div className="fixed inset-0 z-100 flex flex-col bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="flex items-center justify-between px-10 py-6 border-b border-white/5">
              <h2 className="text-2xl font-bold text-white italic tracking-tighter">Full Schedule {year}</h2>
              <button onClick={() => setShowYearCalendar(false)} className="p-3 hover:bg-red-500/20 text-red-400 rounded-full transition-all"><X size={24}/></button>
           </div>
           <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <ScheduleCalendar events={calendarEvents} mode="year" />
           </div>
        </div>
      )}

      {showSign && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in zoom-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-4xl p-8 shadow-2xl overflow-hidden">
            <h3 className="text-2xl font-bold text-white mb-2 italic tracking-tight">Digital Approval</h3>
            <p className="text-slate-400 text-sm mb-6">Penandatanganan jadwal resmi periode {year}</p>
            <div className="bg-white rounded-2xl p-1 shadow-inner overflow-hidden mb-6">
              <SignaturePad onSave={setSignature} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSign(false)} className="flex-1 py-3 text-slate-400 hover:bg-white/5 rounded-2xl font-semibold transition-all">Cancel</button>
              <button disabled={!signature} onClick={signSchedule} className="flex-2 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 transition-all">Confirm Sign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}