"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";
import Link from "next/link";
import { 
  Eye, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronRight 
} from "lucide-react";

interface Inspection {
  id: string;
  inspector_id: string;
  status: string;
  created_at: string;
  unit_code?: string;
}

export default function ApprovalListPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

  useEffect(() => {
    async function fetchInspections() {
      setLoading(true);
      try {
        // Logika Status: 
        // Jika tab Pending, ambil yang 'waiting_spv'
        // Jika tab Approved, ambil yang 'approved'
        const queryStatus = activeTab === "pending" ? "waiting_spv" : "approved";
        const data = await apiFetch(`/inspection?status=${queryStatus}`);
        
        setInspections(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch approvals", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInspections();
  }, [activeTab]); // Refetch data setiap kali tab berubah

  const openPdf = (id: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API;
    const finalUrl = `${baseUrl}/files/inspection/${id}.pdf`;
    
    // 🔥 CEK DI CONSOLE (F12) SAAT KLIK TOMBOL
    console.log("BASE URL:", baseUrl);
    console.log("FINAL URL:", finalUrl);
    window.open(`${baseUrl}/files/inspection/${id}.pdf`, "_blank");
  };

  return (
    <div className="p-8 min-h-screen bg-[#0f172a]">
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Inspection Review
          </h1>
          <p className="text-slate-400 mt-1">
            Kelola persetujuan laporan pemeliharaan AHU.
          </p>
        </div>

        {/* TAB SWITCHER (Tombol Pending & Approved) */}
        <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-white/5 shadow-inner">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "pending" 
                ? "bg-teal-500 text-slate-900 shadow-lg" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock size={16} />
            Pending
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "approved" 
                ? "bg-teal-500 text-slate-900 shadow-lg" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle size={16} />
            Approved
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex items-center gap-3 text-teal-500 font-medium">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          Memuat data inspeksi...
        </div>
      ) : inspections.length === 0 ? (
        <div className="bg-slate-800/20 border border-dashed border-slate-700 rounded-3xl p-20 text-center">
          <FileText className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 font-medium">Tidak ada laporan dalam daftar ini.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inspections.map((item) => {
            const currentStatus = item.status?.toLowerCase() || "";
            const isApproved = currentStatus === "approved";
            const isRevision = currentStatus === "revision_required";

            return (
              <div
                key={item.id}
                className="group bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 p-5 rounded-[2rem] flex justify-between items-center transition-all"
              >
                <div className="flex gap-5 items-center">
                  {/* Status Icon */}
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    isApproved ? "bg-teal-500/10 text-teal-500" : 
                    isRevision ? "bg-red-500/10 text-red-500" : 
                    "bg-amber-500/10 text-amber-500"
                  }`}>
                    {isApproved ? <CheckCircle size={28} /> : (isRevision ? <AlertCircle size={28} /> : <Calendar size={28} />)}
                  </div>

                  <div>
                    <h3 className="text-white font-bold text-lg group-hover:text-teal-400 transition-colors">
                      {item.unit_code || `ID: ${item.id.substring(0, 8)}`}
                    </h3>

                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                       Inspector ID: <span className="text-slate-300">
                        {item.inspector_id ? item.inspector_id.substring(0, 8) : "N/A"}
                      </span>
                      </p>
                      <span className="h-1 w-1 bg-slate-600 rounded-full"></span>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${
                        isApproved ? "text-teal-400" : 
                        isRevision ? "text-red-400" : 
                        "text-amber-400"
                      }`}>
                        {item.status?.replace('_', ' ').toUpperCase() || "UNKNOWN"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isApproved ? (
                    <button 
                      onClick={() => openPdf(item.id)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg active:scale-95"
                    >
                      <FileText size={18} /> View PDF
                    </button>
                  ) : (
                    <Link href={`/admin/spv/inspection/${item.id}`}>
                      <button className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-2.5 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95">
                        <Eye size={18} /> Review
                        <ChevronRight size={16} className="opacity-50" />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}