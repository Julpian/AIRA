"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Pencil,
  Eye,
  Power,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react";

import {
  getFormTemplates,
  setFormTemplateActive,
} from "@/services/form";
import type { FormTemplate } from "@/types/form";

export default function FormTemplateListPage() {
  const [data, setData] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [confirm, setConfirm] = useState<{
    id: string;
    active: boolean;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");

  useEffect(() => {
    getFormTemplates()
      .then((res) => setData(res || []))
      .finally(() => setLoading(false));
  }, []);

  async function toggleActive(id: string, active: boolean) {
    setTogglingId(id);

    await setFormTemplateActive(id, active);

    setData((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, is_active: active } : f
      )
    );

    setTogglingId(null);
  }

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return data.filter((f) => {
      const matchPeriod =
        periodFilter === "all" || f.period === periodFilter;

      const matchSearch =
        f.name.toLowerCase().includes(search.toLowerCase());

      return matchPeriod && matchSearch;
    });
  }, [data, search, periodFilter]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded bg-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <FileText size={20} />
          <h1 className="text-lg font-semibold">
            Form Templates
          </h1>
        </div>

        <Link
          href="/admin/forms/create"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 transition"
        >
          <Plus size={16} />
          Create Form
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-3">

        {/* SEARCH */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama form..."
            className="w-64 rounded-lg bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* PERIOD FILTER */}
        <div className="relative">
          <Filter
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-lg bg-slate-900 border border-slate-800 pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua periode</option>
            <option value="bulanan">Bulanan</option>
            <option value="enam_bulan">6 Bulanan</option>
            <option value="tahunan">Tahunan</option>
            <option value="ganti_filter">Ganti Filter</option>
          </select>
        </div>

        <span className="ml-auto text-xs text-slate-400">
          Total {filtered.length} data
        </span>
      </div>

      {/* TABLE CARD */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur overflow-hidden">

        {/* TABLE HEADER */}
        <div className="grid grid-cols-5 gap-4 bg-slate-950 px-5 py-3 text-xs uppercase tracking-wide text-slate-400">
          <div>Nama</div>
          <div>Periode</div>
          <div>Versi</div>
          <div>Status</div>
          <div className="text-right">Action</div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Tidak ada hasil
          </div>
        ) : (
          filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="group grid grid-cols-5 gap-4 border-t border-slate-800 px-5 py-4 text-sm hover:bg-white/5 transition"
            >
              <div className="font-medium text-white">
                {item.name}
              </div>

              <div className="text-slate-300">
                {item.period}
              </div>

              <div className="text-slate-400">
                v{item.version}
              </div>

              <div>
                {item.is_active ? (
                  <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-500/20 px-3 py-1 text-xs font-semibold text-slate-300">
                    Inactive
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-3 opacity-70 group-hover:opacity-100 transition">
                <Link
                  href={`/admin/forms/${item.id}`}
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  <Eye size={16} />
                </Link>

                <Link
                  href={`/admin/forms/${item.id}/edit`}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <Pencil size={16} />
                </Link>

                <button
                  onClick={() =>
                    setConfirm({
                      id: item.id,
                      active: !item.is_active,
                    })
                  }
                  className={`${
                    item.is_active
                      ? "text-red-400 hover:text-red-300"
                      : "text-emerald-400 hover:text-emerald-300"
                  }`}
                >
                  <Power size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* CONFIRM MODAL */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-indigo-500/20 p-2 text-indigo-400">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-white font-semibold">
                  Konfirmasi
                </h3>
              </div>

              <p className="mt-3 text-sm text-slate-400">
                {confirm.active
                  ? "Aktifkan form template ini?"
                  : "Nonaktifkan form template ini?"}
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setConfirm(null)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>

                <button
                  disabled={togglingId === confirm.id}
                  onClick={async () => {
                    await toggleActive(confirm.id, confirm.active);
                    setConfirm(null);
                  }}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  Ya, lanjutkan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
