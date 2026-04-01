"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  CalendarDays, Clock, AlertTriangle, Activity, 
  Search, ArrowUpRight, CheckCircle2, ListFilter
} from "lucide-react"; // Hapus 'Filter' yang tidak terpakai
import { apiFetch } from "@/services/api"; // Hapus 'getToken' jika tidak digunakan langsung di sini
import {
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, AreaChart, Area
} from "recharts"; // Hapus 'LineChart' & 'Line' karena sudah ganti ke AreaChart
import { motion } from "framer-motion";

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
};

type ChartRow = {
  Month: string;
  Label: string;
  Value: number;
  unit_code?: string;
};

type ChartData = {
  month: string;
  g4?: number;
  f6?: number;
  f9?: number;
  h13?: number;
};

export default function EnhancedAdminDashboard() {
  const [chartRows, setChartRows] = useState<ChartRow[]>([]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedAHU, setSelectedAHU] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        // 🔥 PERBAIKAN: Gunakan Type Casting 'as' agar TS tidak menganggap 'unknown'
        const [dbData, pressureData] = await Promise.all([
          apiFetch("/admin/dashboard") as Promise<DashboardData>,
          apiFetch("/admin/dashboard/filter-pressure") as Promise<ChartRow[]>
        ]);
        
        setData(dbData);
        setChartRows(Array.isArray(pressureData) ? pressureData : []);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setChartRows([]);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const ahuList = useMemo(() => {
    const units = (chartRows || []).map((r) => r.unit_code).filter(Boolean);
    return ["ALL", ...Array.from(new Set(units as string[]))];
  }, [chartRows]);

  const chartData = useMemo(() => {
    const grouped: Record<string, ChartData> = {};
    (chartRows || [])
      .filter((r) => selectedAHU === "ALL" || r.unit_code === selectedAHU)
      .forEach((r) => {
        const month = new Date(r.Month).toLocaleDateString("id-ID", { month: "short" });
        if (!grouped[month]) grouped[month] = { month };
        
        if (r.Label.includes("Pre Filter")) grouped[month].g4 = r.Value;
        if (r.Label.includes("Medium Filter (F6)")) grouped[month].f6 = r.Value;
        if (r.Label.includes("Medium Filter (F9)")) grouped[month].f9 = r.Value;
        if (r.Label.includes("Hepa")) grouped[month].h13 = r.Value;
      });
    return Object.values(grouped);
  }, [chartRows, selectedAHU]);

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
          <p className="animate-pulse text-teal-500 font-bold tracking-widest">INITIALIZING AIRA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 md:p-8 text-slate-200">
      
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Admin <span className="text-teal-400">DASHBOARD</span>
        </h1>
        <p className="text-slate-400 mt-1">Monitoring Pemeliharaan AHU PT Kimia Farma</p>
      </div>
      
      <div className="flex items-center gap-4 self-end md:self-center">
        {/* FILTER AHU */}
        <div className="relative group">
          <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-teal-400 transition-colors" />
          <select
            value={selectedAHU}
            onChange={(e) => setSelectedAHU(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all cursor-pointer hover:bg-slate-700/70 text-sm font-semibold text-white min-w-[160px]"
          >
            {ahuList.map((ahu) => (
              <option key={ahu} value={ahu}>
                {ahu === "ALL" ? "Semua Unit AHU" : `Unit: ${ahu}`}
              </option>
            ))}
          </select>
        </div>

        {/* 🔥 LOGO KIMIA FARMA LOKAL - LEBIH BESAR & LEBAR */}
        <div 
          className="h-16 w-28 md:h-20 md:w-36 bg-white rounded-3xl px-4 py-1.5 shadow-2xl shadow-teal-500/10 border border-white/10 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer ml-2"
          onClick={() => {
            if(confirm("Apakah Anda yakin ingin Sign Out?")) {
              // Tambahkan logic logout kamu di sini
              window.location.href = "/login";
            }
          }}
          title="User Profile / Sign Out"
        >
          <img 
            src="/logo-kf.png" // 👈 SESUAIKAN: ganti dengan nama file aslimu di folder public
            alt="Logo Kimia Farma" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>

      {/* STATS GRID */}
      <div className="mb-10 grid gap-6 grid-cols-1 md:grid-cols-3">
        {[
          { title: "Jadwal Hari Ini", value: data.today_schedule, icon: CalendarDays, color: "from-blue-500/20 to-blue-600/5", border: "border-blue-500/50", text: "text-blue-400" },
          { title: "Dalam Pemeriksaan", value: data.running, icon: Clock, color: "from-teal-500/20 to-teal-600/5", border: "border-teal-500/50", text: "text-teal-400" },
          { title: "Melewati Tenggat", value: data.overdue, icon: AlertTriangle, color: "from-rose-500/20 to-rose-600/5", border: "border-rose-500/50", text: "text-rose-400" },
        ].map((s, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={i} 
            className={`p-6 bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl shadow-xl backdrop-blur-sm relative overflow-hidden group`}
          >
            <s.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-500 ${s.text}`} />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-2">{s.title}</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-black text-white">{s.value}</p>
              <p className="text-slate-400 text-sm mb-1.5 font-medium">Laporan</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Analisa Tekanan Filter</h2>
            </div>
          </div>

          <div className="h-80 w-full"> {/* Pakai utilitas Tailwind h-80 (20rem) daripada pixel custom */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorG4" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorF6" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorH13" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit=" Pa" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '600' }} />
                <Area type="monotone" name="Pre Filter (G4)" dataKey="g4" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorG4)" />
                <Area type="monotone" name="Medium (F6)" dataKey="f6" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorF6)" />
                <Area type="monotone" name="HEPA (H13)" dataKey="h13" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorH13)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDE SECTION */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Sedang Berjalan</h2>
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
          
          <div className="space-y-4 overflow-y-auto max-h-96 pr-2"> {/* Pakai max-h-96 (24rem) */}
            {(data.running_schedules?.length ?? 0) > 0 ? (
              data.running_schedules.map((s) => (
                <div key={s.id} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-teal-500/30 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-teal-400 font-bold text-sm tracking-wide">{s.unit_code}</span>
                    <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase rounded-md border border-teal-500/20">
                      {s.period || 'Routine'}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm line-clamp-1">{s.room_name}</h3>
                  <div className="flex items-center gap-2 mt-3 text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {s.inspector_name?.charAt(0)}
                    </div>
                    <p className="text-xs font-medium">{s.inspector_name}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 opacity-30 text-center">
                <Search className="w-12 h-12 mb-3" />
                <p className="text-sm font-medium">Tidak ada inspeksi aktif</p>
              </div>
            )}
          </div>
          
          <button className="mt-auto w-full py-3 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
            Lihat Semua Jadwal <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}