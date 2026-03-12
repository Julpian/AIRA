"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiFetch } from "@/services/api";
import {
  ClipboardCheck,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Clock,
  AlertCircle,
  Zap,
  LayoutList,
  Target,
  Circle
} from "lucide-react";

type Task = {
  ID: string;
  UnitCode: string;
  Period: string;
  Status: string;
  StartDate: string;
  EndDate: string;
};

export default function InspectionTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/inspection/tasks")
      .then((res) => {
        setTasks(Array.isArray(res) ? res : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getTaskStatus = (start: string, end: string) => {
    const today = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    today.setHours(0,0,0,0);
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);

    if (today < startDate) return "scheduled";
    if (today >= startDate && today <= endDate) return "active";
    if (today > endDate) return "overdue";
    return "scheduled";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-[#8E8E93] text-[13px] font-semibold tracking-tight">
          Memuat Jadwal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans antialiased pb-24">
      
      {/* IOS TOP NAVIGATION */}
      <nav className="sticky top-0 z-30 bg-[#F2F2F7]/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between">
        <Link href="/inspection/dashboard" className="flex items-center gap-1 text-blue-500 group">
          <ChevronLeft size={24} strokeWidth={2.5} />
          <span className="text-[17px] font-medium">Dashboard</span>
        </Link>
        <div className="h-8 w-8 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
           <LayoutList size={14} className="text-gray-400" />
        </div>
      </nav>

      <div className="px-5">
        {/* HEADER */}
        <header className="mt-4 mb-8">
          <h1 className="text-3xl font-extrabold text-black tracking-tight">
            Tugas Inspeksi
          </h1>
          <p className="text-[#8E8E93] text-[15px] mt-1 font-medium">
            Jadwal pemeliharaan unit AHU hari ini.
          </p>
        </header>

        {/* TASK LIST */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck size={32} className="text-gray-200" />
              </div>
              <p className="text-[#8E8E93] text-sm font-medium px-10">
                Semua tugas telah selesai atau belum ada jadwal tersedia.
              </p>
            </div>
          ) : (
            tasks.map((t, idx) => {
              const status = getTaskStatus(t.StartDate, t.EndDate);
              const active = status === "active";
              const overdue = status === "overdue";

              return (
                <motion.div
                  key={t.ID ?? idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href="/inspection/scan-nfc"
                    className="block bg-white rounded-[1.5rem] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden active:scale-[0.98] transition-transform"
                  >
                    <div className="p-5 flex items-center gap-4">
                      
                      {/* ICON BOX - Unique iOS Style */}
                      <div className={`relative h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center transition-colors ${
                        overdue ? "bg-red-50 text-red-500" : 
                        active ? "bg-amber-50 text-amber-500" : 
                        "bg-blue-50 text-blue-500"
                      }`}>
                        {overdue ? <AlertCircle size={28} /> : 
                         active ? <Zap size={28} className="fill-amber-500/20" /> : 
                         <Target size={28} />}
                        
                        {/* Indicator Dot */}
                        <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                           overdue ? "bg-red-500" : active ? "bg-amber-500" : "bg-blue-500"
                        }`} />
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-[17px] text-black tracking-tight truncate">
                            {t.UnitCode}
                          </h3>
                          {overdue && (
                             <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase">Late</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col mt-1 gap-0.5">
                          <div className="flex items-center gap-1.5 text-[#8E8E93]">
                            <Calendar size={13} strokeWidth={2.5} />
                            <span className="text-[13px] font-semibold">
                              {formatDate(t.StartDate)} — {formatDate(t.EndDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-blue-500/80">
                            <Clock size={13} strokeWidth={2.5} />
                            <span className="text-[12px] font-bold uppercase tracking-tight">{t.Period}</span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight size={18} className="text-gray-300" strokeWidth={3} />
                    </div>
                    
                    {/* Bottom Micro-Bar */}
                    <div className={`h-1 w-full opacity-20 ${
                      overdue ? "bg-red-500" : active ? "bg-amber-500" : "bg-blue-500"
                    }`} />
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>

        {/* SYSTEM NOTE */}
        <div className="mt-10 px-6 py-5 bg-white/50 rounded-3xl border border-dashed border-gray-300">
           <div className="flex gap-3">
              <div className="mt-1 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <Circle size={8} className="text-white fill-white" />
              </div>
              <p className="text-[13px] text-[#8E8E93] font-medium leading-relaxed">
                <span className="text-black font-bold">Instruksi:</span> Silahkan menuju lokasi unit dan lakukan scan tag NFC untuk membuka formulir inspeksi digital.
              </p>
           </div>
        </div>

        {/* STATUS FOOTER */}
        <footer className="mt-8 text-center pb-10">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">
            Sync Status: <span className="text-green-500">Online</span> • {tasks.length} Assigned Tasks
          </p>
        </footer>
      </div>
    </div>
  );
}