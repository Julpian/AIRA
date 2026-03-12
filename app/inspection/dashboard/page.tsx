"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ClipboardList,
  ScanLine,
  Clock,
  ChevronRight,
  Activity,
  History,
  Fan,
  Box,
  Bell
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";

type InspectionStatus = {
  ID: string;
  Status: string;
  UnitCode?: string;
};

export default function InspectorDashboard() {
  const [recentStatus, setRecentStatus] = useState<InspectionStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await apiFetch("/inspection?limit=3");
        if (Array.isArray(data)) setRecentStatus(data);
      } catch (err) {
        console.error("Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    // Background Apple: Light Gray yang sangat bersih
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] font-sans antialiased">
      
      {/* ================= IOS STATUS BAR SPACE ================= */}
      <div className="h-12 w-full bg-transparent" />

      {/* ================= CLEAN HEADER ================= */}
      <header className="px-6 mb-8 flex justify-between items-start">
        <div>
          <p className="text-[13px] font-semibold text-[#8E8E93] tracking-tight">
            Kamis, 5 Maret 2026
          </p>
          <h1 className="text-3xl font-extrabold text-black tracking-tight mt-1">
            Dashboard
          </h1>
        </div>
        <button className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
          <Bell size={20} className="text-blue-500" />
        </button>
      </header>

      <main className="px-5 pb-12">
        
        {/* ================= HERO: SCAN ACTION ================= */}
        <Link href="/inspection/scan-nfc">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden p-7 rounded-[2.5rem] bg-white shadow-[0_10px_25px_rgba(0,0,0,0.04)] mb-6 border border-gray-100/50"
          >
            <div className="flex flex-col gap-4">
              <div className="h-14 w-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <ScanLine size={30} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black tracking-tight">
                  Scan Unit AHU
                </h2>
                <p className="text-[#8E8E93] text-[14px] mt-1 font-medium">
                  Gunakan NFC untuk identifikasi unit otomatis
                </p>
              </div>
            </div>
            {/* Dekorasi halus */}
            <div className="absolute top-[-20px] right-[-20px] h-32 w-32 bg-blue-50 rounded-full opacity-50 blur-3xl" />
          </motion.div>
        </Link>

        {/* ================= GRID MENU ================= */}
        <div className="grid grid-cols-2 gap-4 mb-9">
          <Link href="/inspection/tasks">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="p-5 rounded-[2rem] bg-white shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3"
            >
              <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                <ClipboardList size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black">Tugas</h3>
                <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Jadwal Hari Ini</p>
              </div>
            </motion.div>
          </Link>

          <Link href="/inspection/history">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="p-5 rounded-[2rem] bg-white shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3"
            >
              <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
                <History size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black">Riwayat</h3>
                <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Log Aktivitas</p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* ================= RECENT ACTIVITY ================= */}
        <section>
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
              Status Laporan
            </h2>
            <Link href="/inspection/history" className="text-sm font-semibold text-blue-500">Lihat Semua</Link>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden px-2">
            {loading ? (
              <div className="py-12 text-center text-[#8E8E93] text-sm font-medium italic">Menghubungkan ke sistem...</div>
            ) : recentStatus.length === 0 ? (
              <div className="py-12 text-center">
                <Activity size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-[#8E8E93] font-medium tracking-tight">Belum ada transmisi data</p>
              </div>
            ) : (
              recentStatus.map((item, index) => {
                const isApproved = item.Status === "approved";
                return (
                  <div
                    key={item.ID}
                    className={`p-5 flex items-center gap-4 transition-colors active:bg-gray-50 ${
                      index !== recentStatus.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                  >
                    <div className={`h-11 w-11 rounded-full flex items-center justify-center ${
                      isApproved ? "bg-green-50 text-green-500" : "bg-amber-50 text-amber-500"
                    }`}>
                      {isApproved ? <Fan size={22} /> : <Box size={22} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[15px] font-bold text-black truncate">
                          {item.UnitCode || `ID-${item.ID.substring(0, 6)}`}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {isApproved ? "Approved" : "Pending"}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#8E8E93] mt-0.5 font-medium">
                        {isApproved ? "Terverifikasi oleh SPV" : "Menunggu verifikasi"}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ================= SYSTEM STATUS FOOTER ================= */}
        <div className="mt-8 flex flex-col items-center gap-2">
           <div className="flex items-center gap-2 py-2 px-4 bg-white rounded-full shadow-sm border border-gray-50">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <p className="text-[11px] text-[#8E8E93] font-bold uppercase tracking-wider">
                Sistem Terkoneksi Cloud
              </p>
           </div>
           <p className="text-[10px] text-gray-300 font-medium italic">AIRA Control Center v2.4</p>
        </div>

      </main>

      {/* ================= OPTIONAL FLOATING CLOCK ================= */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-black/80 backdrop-blur-md rounded-full shadow-lg">
         <div className="flex items-center gap-2 text-white text-[12px] font-bold">
            <Clock size={14} className="text-blue-400" />
            <span className="tracking-widest font-mono">08:16:04 AM</span>
         </div>
      </div>

    </div>
  );
}