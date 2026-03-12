"use client";

import { useEffect, useState, useMemo } from "react";
import { CalendarDays, Clock, AlertTriangle, Activity, Maximize2, X } from "lucide-react"; // Sesuaikan jika lucide-react
import { getToken } from "@/services/auth";
import { apiFetch } from "@/services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  // Legend dihapus karena tidak digunakan (mengatasi error eslint no-unused-vars)
  CartesianGrid,
} from "recharts";

import ScheduleCalendar from "@/components/ScheduleCalendar";

/* ================= TYPES ================= */

type Schedule = {
  id: string;
  unit_code: string;
  room_name: string;
  inspector_name: string;
  status: string;
  start_date: string;
  end_date: string;
  period?: string;
};

type DashboardData = {
  today_schedule: number;
  running: number;
  overdue: number;
  running_schedules: Schedule[];
  all_schedules?: Schedule[];
};

type ChartRow = { Month: string; Label: string; Value: number };
type ChartData = { month: string; g4?: number; f6?: number; f9?: number; h13?: number };

export default function AdminDashboard() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [calendarMode, setCalendarMode] = useState<"month" | "semester">("month");
  const [showYearCalendar, setShowYearCalendar] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const dashboardData: DashboardData = await apiFetch("/admin/dashboard");
        setData(dashboardData);

        const chartRows: ChartRow[] = await apiFetch("/admin/dashboard/filter-pressure");
        
        const grouped: Record<string, ChartData> = {};
        if (Array.isArray(chartRows)) {
          chartRows.forEach((r) => {
            const month = new Date(r.Month).toLocaleDateString("en-US", { month: "short" });
            if (!grouped[month]) grouped[month] = { month };
            if (r.Label.includes("Pre Filter")) grouped[month].g4 = r.Value;
            if (r.Label.includes("Medium Filter (F6)")) grouped[month].f6 = r.Value;
            if (r.Label.includes("Medium Filter (F9)")) grouped[month].f9 = r.Value;
            if (r.Label.includes("Hepa")) grouped[month].h13 = r.Value;
          });
          setChartData(Object.values(grouped));
        }
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      }
    };

    loadDashboard();
  }, []);

  // Solusi Purity: Gunakan index fallback sebagai pengganti Math.random()
  const calendarEvents = useMemo(() => {
    // Pastikan sourceSchedules selalu array, bahkan jika data belum ada
    const sourceSchedules = data?.all_schedules ?? data?.running_schedules ?? [];
    
    return sourceSchedules.map((s, index) => ({
      id: s.id || `temp-id-${index}`,
      title: `${s.unit_code} • ${s.inspector_name || 'No Inspector'}`,
      start: s.start_date,
      end: s.end_date,
      extendedProps: { period: s.period },
    }));
  }, [data]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="animate-pulse text-teal-500 font-bold tracking-widest">LOADING SYSTEM...</div>
      </div>
    );
  }

  const stats = [
    { title: "Jadwal Hari Ini", value: data.today_schedule, icon: CalendarDays, color: "text-blue-400" },
    { title: "Sedang Berjalan", value: data.running, icon: Clock, color: "text-teal-400" },
    { title: "Terlambat", value: data.overdue, icon: AlertTriangle, color: "text-rose-400" },
  ];

  return (
    // Perbaikan Tailwind: Menghapus spasi di dalam var() dan menyederhanakan opacity
    <div className="min-h-screen bg-[#0F172A] bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-[#0F172A] to-teal-950/30 p-8 text-slate-200">
      
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white italic">
            Admin <span className="font-extrabold text-teal-400">DASHBOARD</span>
          </h1>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
            <Activity size={14} className="text-teal-500" />
            Operational AHU Real-time Data
          </div>
        </div>
      </header>

      <div className="mb-10 grid gap-6 md:grid-cols-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/3 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{s.title}</p>
                <p className={`mt-2 text-4xl font-black ${s.color}`}>{s.value}</p>
              </div>
              <div className={`rounded-xl bg-white/3 p-3 ${s.color}`}><s.icon size={24} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden">
            <div className="border-b border-white/5 px-6 py-4 bg-white/2">
              <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase italic">Monitoring Pekerjaan</h2>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter border-b border-white/5">
                    <th className="pb-4 text-left">Unit Code</th>
                    <th className="pb-4 text-left">Area</th>
                    <th className="pb-4 text-left">Inspector</th>
                    <th className="pb-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/3">
                  {(data?.running_schedules || []).map((s, i) => (
  <tr key={i} className="hover:bg-white/1">
                      <td className="py-4 font-bold text-teal-400">{s.unit_code}</td>
                      <td className="py-4 text-slate-400">{s.room_name}</td>
                      <td className="py-4 text-slate-400">{s.inspector_name}</td>
                      <td className="py-4 text-right">
                        <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold border border-teal-500/20">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/2 p-8">
            <h2 className="mb-8 text-xs font-bold tracking-widest text-slate-400 uppercase italic">Grafik Tekanan Filter</h2>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="g4" stroke="#22c55e" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="f6" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="h13" stroke="#ef4444" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-8 rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h3 className="font-bold text-white flex items-center gap-2 italic">
                <CalendarDays className="w-4 h-4 text-teal-400" /> Kalender
              </h3>
              <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/5">
                <button 
                  onClick={() => setCalendarMode("month")} 
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${calendarMode === 'month' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                >MO</button>
                <button 
                  onClick={() => setCalendarMode("semester")} 
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${calendarMode === 'semester' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                >SM</button>
              </div>
            </div>

            <div className="calendar-mini rounded-2xl overflow-hidden bg-slate-950/40 p-2">
              <ScheduleCalendar events={calendarEvents} mode={calendarMode} />
            </div>

            <button 
              onClick={() => setShowYearCalendar(true)} 
              className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-extrabold tracking-[0.2em] text-slate-300 transition-all uppercase flex items-center justify-center gap-2"
            >
              <Maximize2 size={12}/> Full Year Outlook
            </button>
          </div>
        </div>
      </div>

      {showYearCalendar && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="flex items-center justify-between px-10 py-6 border-b border-white/5">
              <h2 className="text-2xl font-black text-white italic tracking-tighter">Full Schedule View</h2>
              <button onClick={() => setShowYearCalendar(false)} className="p-3 hover:bg-red-500/20 text-red-400 rounded-full transition-all">
                <X size={28}/>
              </button>
           </div>
           <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <ScheduleCalendar events={calendarEvents} mode="year" />
           </div>
        </div>
      )}
    </div>
  );
}