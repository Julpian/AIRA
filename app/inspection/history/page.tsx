"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft,
  ClipboardCheck,
  ScanLine,
  FileCheck,
  Clock,
  Loader2,
  LogIn,
  ShieldAlert
} from "lucide-react";

interface AuditMetadata {
  ahu_id?: string;
  inspection_id?: string;
  [key: string]: string | number | boolean | undefined;
}

type Audit = {
  id: string;
  action: string;
  created_at: string;
  metadata?: AuditMetadata;
};

export default function InspectionHistoryPage() {
  const [logs, setLogs] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await apiFetch("/inspection/history");
        if (Array.isArray(data)) setLogs(data);
      } catch (err) {
        console.error("Failed fetch audit:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionDetails = (action: string) => {
    switch (action) {
      case "SCAN_NFC":
        return { icon: ScanLine, label: "Unit AHU di-scan", color: "text-blue-500", bg: "bg-blue-50" };
      case "SUBMIT_INSPECTION":
        return { icon: ClipboardCheck, label: "Laporan dikirim", color: "text-orange-500", bg: "bg-orange-50" };
      case "SIGN_INSPECTION":
        return { icon: FileCheck, label: "Laporan diverifikasi", color: "text-green-500", bg: "bg-green-50" };
      case "LOGIN_SUCCESS":
        return { icon: LogIn, label: "Login Berhasil", color: "text-gray-400", bg: "bg-gray-50" };
      default:
        return { icon: ShieldAlert, label: action, color: "text-red-400", bg: "bg-red-50" };
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<string, Audit[]> = {};
    logs.forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return Object.entries(groups);
  }, [logs]);

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F]">
      {/* HEADER - Sticky Apple Style */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-xl mx-auto flex items-center h-16 px-5 gap-4">
          <Link href="/inspection/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-black transition-colors">
            <ChevronLeft size={22} strokeWidth={2.5} />
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight">Riwayat Aktivitas</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={24} />
            <p className="text-sm font-medium tracking-tight">Menyinkronkan...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-32 text-gray-400 text-sm">Belum ada aktivitas.</div>
        ) : (
          <div>
            {grouped.map(([date, items], groupIndex) => (
              /* EFEK SELANG SELING: Abu-abu Muda vs Putih */
              <section 
                key={date} 
                className={`py-8 px-6 ${groupIndex % 2 === 0 ? 'bg-[#FBFBFD]' : 'bg-white'}`}
              >
                <div className="max-w-md mx-auto">
                  {/* DATE LABEL */}
                  <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-8">
                    {date}
                  </h2>

                  <div className="space-y-8">
                    <AnimatePresence>
                      {items.map((log, index) => {
                        const { icon: Icon, label, color, bg } = getActionDetails(log.action);
                        return (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.03 }}
                            className="flex gap-4 group"
                          >
                            {/* ICON BOX - Dibuat lebih elegan */}
                            <div className={`h-10 w-10 shrink-0 rounded-xl ${bg} flex items-center justify-center`}>
                              <Icon size={18} className={color} strokeWidth={2} />
                            </div>

                            {/* CONTENT */}
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="text-[15px] font-semibold text-gray-900 leading-none mb-1.5 truncate">
                                  {label}
                                </p>
                                <time className="text-[12px] font-medium text-gray-400 tabular-nums ml-2">
                                  {new Date(log.created_at).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </time>
                              </div>

                              <div className="flex flex-col gap-0.5">
                                {log.metadata?.ahu_id && (
                                  <p className="text-[13px] text-gray-500 truncate leading-relaxed">
                                    ID Unit: {log.metadata.ahu_id}
                                  </p>
                                )}
                                
                                {/* ID Dibuat lebih manis, bukan cuma # kode warna */}
                                {log.metadata?.inspection_id && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-bold uppercase">
                                      REF
                                    </span>
                                    <span className="text-[12px] text-gray-400 font-mono">
                                      {log.metadata.inspection_id.slice(-6).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}