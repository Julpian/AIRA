"use client";

import { useEffect, useState } from "react";
import { getAuditTrails, AuditTrail } from "@/services/auditTrailService";
import AuditTrailTable from "@/components/admin/AuditTrailTable";
import AuditTrailFilter from "@/components/admin/AuditTrailFilter";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function AuditTrailsPage() {
  const [list, setList] = useState<AuditTrail[]>([]);
  const [filtered, setFiltered] = useState<AuditTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    getAuditTrails()
      .then((res) => {
        setList(res);
        setFiltered(res);
        setLastUpdated(new Date());
      })
      .finally(() => setLoading(false));
  }, []);

  // Hitung total halaman
  const totalPages = Math.ceil(filtered.length / perPage);

  // Data yang ditampilkan di halaman
  const paginatedData = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 min-h-screen bg-[#020617] text-slate-200"
    >
      {/* Header */}
      <header className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <div className="grid grid-cols-4 gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-blue-500 rounded-full" />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                System Live Monitoring
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tighter text-white">
              AUDIT <span className="text-blue-500">TRAILS</span>
            </h1>

            <p className="text-slate-400 text-sm mt-2 max-w-md">
              Log aktivitas terenkripsi. Sinkronisasi terakhir:
              <span className="text-slate-200 ml-1 font-mono">
                {formatDistanceToNow(lastUpdated, {
                  addSuffix: true,
                  locale: id,
                })}
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[120px]">
              <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">
                Total Events
              </p>
              <p className="text-2xl font-mono font-bold text-white">
                {filtered.length}
              </p>
            </div>

            <div className="bg-blue-500/10 backdrop-blur-md border border-blue-500/20 p-4 rounded-2xl min-w-[120px]">
              <p className="text-[10px] uppercase text-blue-400 font-bold mb-1">
                Security Level
              </p>
              <p className="text-2xl font-mono font-bold text-blue-400">High</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter */}
      <section className="bg-slate-900/50 backdrop-blur-xl p-2 rounded-2xl border border-white/5 shadow-inner">
        <AuditTrailFilter
          data={list}
          onChange={(data) => {
            setFiltered(data);
            setPage(1);
          }}
        />
      </section>

      {/* Table */}
      <main className="bg-slate-900/30 rounded-3xl border border-white/5 overflow-hidden">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="relative">
                <div className="w-16 h-16 border-2 border-blue-500/20 rounded-full" />
                <div className="absolute top-0 w-16 h-16 border-t-2 border-blue-500 rounded-full animate-spin" />
              </div>

              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-blue-500 font-bold animate-pulse">
                Decrypting Logs
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-x-auto custom-scrollbar"
              >
                <AuditTrailTable data={paginatedData} />
              </motion.div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-slate-900/40">
                <p className="text-xs text-slate-400">
                  Page{" "}
                  <span className="text-white font-mono">{page}</span> of{" "}
                  <span className="text-white font-mono">
                    {totalPages || 1}
                  </span>
                </p>

                <div className="flex gap-2">
                  {/* Prev */}
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 text-xs rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
                  >
                    Prev
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (num) => (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`px-3 py-1 text-xs rounded-lg border ${
                          page === num
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {num}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 text-xs rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}