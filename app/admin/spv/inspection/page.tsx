"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";
import Link from "next/link";
import { ClipboardCheck, Eye, Calendar, User, FileText, CheckCircle } from "lucide-react";

interface Inspection {
  ID: string;
  InspectorID: string;
  Status: string;
  CreatedAt: string;
}

export default function ApprovalListPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

  useEffect(() => {
    async function fetchInspections() {
      setLoading(true);
      try {
        // Jika tab pending -> waiting_spv, jika tab approved -> approved
        const status = activeTab === "pending" ? "waiting_spv" : "approved";
        const data = await apiFetch(`/inspection?status=${status}`);
        setInspections(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch approvals", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInspections();
  }, [activeTab]); // Fetch ulang setiap kali tab berubah

  const openPdf = (id: string) => {
    // Membuka PDF di tab baru
    const baseUrl = process.env.NEXT_PUBLIC_API;
  window.open(`${baseUrl}/files/inspection/${id}.pdf`, "_blank");
};

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Inspection Management</h1>
          <p className="text-slate-400">Kelola dan tinjau laporan inspeksi AHU PT Kimia Farma.</p>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "pending" ? "bg-teal-500 text-slate-900" : "text-slate-400 hover:text-white"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "approved" ? "bg-teal-500 text-slate-900" : "text-slate-400 hover:text-white"
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-teal-500 animate-pulse">
           <div className="h-2 w-2 bg-teal-500 rounded-full animate-bounce"></div>
           Loading data...
        </div>
      ) : inspections.length === 0 ? (
        <div className="bg-slate-800/30 border border-dashed border-white/10 p-16 rounded-3xl text-center">
          <ClipboardCheck size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500">Tidak ada inspeksi dalam kategori ini.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inspections.map((item) => (
            <div 
              key={item.ID} 
              className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:border-teal-500/30 transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  item.Status === "approved" ? "bg-teal-500/10 text-teal-500" : "bg-yellow-500/10 text-yellow-500"
                }`}>
                  {item.Status === "approved" ? <CheckCircle size={24} /> : <Calendar size={24} />}
                </div>
                <div>
                  <h3 className="text-white font-semibold">Inspection ID: {item.ID.substring(0, 8)}...</h3>
                  <div className="flex gap-4 mt-1 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><User size={14} className="text-slate-600"/> {item.InspectorID}</span>
                    <span className="flex items-center gap-1.5">
                      Status: 
                      <b className={item.Status === "approved" ? "text-teal-400" : "text-yellow-500"}>
                        {item.Status.toUpperCase()}
                      </b>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {item.Status === "approved" ? (
                  // TOMBOL PREVIEW HASIL (Hanya muncul jika sudah approved)
                  <button 
                    onClick={() => openPdf(item.ID)}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all border border-white/5"
                  >
                    <FileText size={18} />
                    View Result PDF
                  </button>
                ) : (
                  // TOMBOL REVIEW & SIGN (Untuk yang pending)
                  <Link href={`/admin/spv/inspection/${item.ID}`}>
                    <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-teal-500/10 active:scale-95">
                      <Eye size={18} />
                      Review & Sign
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}