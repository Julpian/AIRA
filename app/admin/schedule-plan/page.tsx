"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  Wind,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  FileEdit,
  X,
} from "lucide-react";

import { getAHUs } from "@/services/ahuService";
import {
  getSchedulePlans,
  createSchedulePlan,
  updateSchedulePlan,
  deleteSchedulePlan,
  generateSchedules,
  createFilterSchedule,
  type SchedulePlan,
} from "@/services/schedulePlanService";

type AHU = {
  id: string;
  unit_code: string;
  is_active: boolean;
};

type ApiListResponse<T> = T[] | { data: T[] };

const MONTH_LABELS = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function normalizeList<T>(res: ApiListResponse<T> | null | undefined): T[] {
  if (!res) return []; // Jika null atau undefined, langsung kembalikan array kosong []
  
  if (Array.isArray(res)) {
    return res;
  }
  
  // Cek apakah properti 'data' ada di dalam objek res
  if (typeof res === "object" && "data" in res && Array.isArray(res.data)) {
    return res.data;
  }
  
  return [];
}

const StatusBadge = ({ status }: { status: SchedulePlan["status"] }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
      status === "draft"
        ? "bg-amber-500/20 text-amber-300"
        : "bg-teal-500/20 text-teal-300"
    }`}
  >
    {status === "draft" ? (
      <FileEdit size={12} />
    ) : (
      <CheckCircle2 size={12} />
    )}
    {status === "draft" ? "Draft" : "Generated"}
  </span>
);

export default function SchedulePlanPage() {
  const [ahus, setAhus] = useState<AHU[]>([]);
  const [plans, setPlans] = useState<SchedulePlan[]>([]);
  const [ahuId, setAhuId] = useState("");
  const [period, setPeriod] = useState<SchedulePlan["period"]>("bulanan");
  const [week, setWeek] = useState(1);
  const [month, setMonth] = useState<number | "">("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SchedulePlan["status"]>("draft");
  const [showForm, setShowForm] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false)
const [filterAHU, setFilterAHU] = useState("")
const [filterDate, setFilterDate] = useState("")

  const loadAll = async () => {
    try {
      const ahuRes = await getAHUs();
      const planRes = await getSchedulePlans();
      
      // normalizeList sekarang aman digunakan meskipun res bernilai null
      setAhus(normalizeList(ahuRes));
      setPlans(normalizeList(planRes));
    } catch (error) {
      console.error("Gagal memuat data Schedule Plan:", error);
      // Optional: set ke array kosong jika error
      setAhus([]);
      setPlans([]);
    }
  };

  const handleCreateFilterSchedule = async () => {
    if (!filterAHU || !filterDate) {
      alert("AHU dan tanggal wajib diisi")
      return
    }

      try {
      await createFilterSchedule({
        ahu_id: filterAHU,
        start_date: filterDate
      })

      await loadAll()

      setShowFilterModal(false)
      setFilterAHU("")
      setFilterDate("")

      alert("Schedule ganti filter berhasil dibuat")

    } catch (err) {
      console.error(err)
      alert("Gagal membuat schedule")
    }


    await createFilterSchedule({
      ahu_id: filterAHU,
      start_date: filterDate
    })

    await loadAll()

    setShowFilterModal(false)
    setFilterAHU("")
    setFilterDate("")

    alert("Schedule ganti filter berhasil dibuat")
  }

  useEffect(() => {
    const init = async () => await loadAll();
    init();
  }, []);

  const filteredPlans = plans
  .filter((p) => p.status === activeTab)
  .filter((p) => p.period !== "ganti_filter")

  const resetForm = () => {
    setAhuId("");
    setPeriod("bulanan");
    setWeek(1);
    setMonth("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!ahuId) return alert("AHU wajib dipilih");

    const payload = {
      period,
      week_of_month: week,
      month: period === "bulanan" ? null : Number(month),
    };

    if (editingId) {
      await updateSchedulePlan(editingId, payload);
    } else {
      await createSchedulePlan({ ahu_id: ahuId, ...payload });
    }

    resetForm();
    loadAll();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-4 py-6">

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-6xl space-y-6 text-slate-200"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-800/60 border border-white/10 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <CalendarClock className="text-teal-400" />
            <div>
              <h1 className="text-xl font-semibold text-white">
                Schedule Plan AHU
              </h1>
              <p className="text-sm text-slate-400">
                Industrial inspection scheduler
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              <Wind size={16} />
              Ganti Filter
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-teal-400"
            >
              <Plus size={16} /> Plan Baru
            </button>

            <button
              onClick={async () => {
                if (!confirm("Generate jadwal tahun ini?")) return;
                const year = new Date().getFullYear();
                await generateSchedules(year);
                alert(`Jadwal ${year} berhasil dibuat`);
                loadAll();
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              <Wind size={16} /> Generate
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-6 border-b border-white/10">
          {(["draft", "generated"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-2 text-sm ${
                activeTab === t
                  ? "border-b-2 border-teal-400 text-teal-300"
                  : "text-slate-400"
              }`}
            >
              {t === "draft" ? "Draft" : "Generated"} (
              {plans.filter((p) => p.status === t).length})
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border bg-slate-800/60 bg-slate-800/60 backdrop-blur">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-slate-400">
              <tr>
                <th className="p-3 text-left">AHU</th>
                <th className="p-3 text-center">Periode</th>
                <th className="p-3 text-center">Minggu</th>
                <th className="p-3 text-center">Bulan</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredPlans.map((p) => (
                <tr key={p.id} className="border-t bg-slate-800/60">
                  <td className="p-3">{p.unit_code}</td>
                  <td className="p-3 text-center capitalize">{p.period}</td>
                  <td className="p-3 text-center">Minggu {p.week_of_month}</td>
                  <td className="p-3 text-center">
                    {p.period === "bulanan"
                      ? "Setiap Bulan"
                      : p.month
                      ? MONTH_LABELS[p.month]
                      : "-"}
                  </td>
                  <td className="p-3 text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="p-3 text-center space-x-3">
                    {p.status === "draft" ? (
                      <>
                        <button
                          onClick={() => {
                            setAhuId(p.ahu_id);
                            setPeriod(p.period);
                            setWeek(p.week_of_month);
                            setMonth(p.month ?? "");
                            setEditingId(p.id);
                            setShowForm(true);
                          }}
                          className="inline-flex items-center gap-1 text-teal-400"
                        >
                          <Pencil size={14} /> Edit
                        </button>

                        <button
                          onClick={async () => {
                            if (!confirm("Hapus plan ini?")) return;
                            await deleteSchedulePlan(p.id);
                            loadAll();
                          }}
                          className="inline-flex items-center gap-1 text-red-400"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </>
                    ) : (
                      <span className="italic text-slate-500">Terkunci</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-medium">
                    {editingId ? "Edit Plan" : "Tambah Plan"}
                  </p>
                  <button onClick={resetForm}>
                    <X />
                  </button>
                </div>

                <select
                  value={ahuId}
                  onChange={(e) => setAhuId(e.target.value)}
                  disabled={!!editingId}
                  className="mb-3 w-full rounded-xl border bg-slate-800/60 bg-slate-800/60 px-4 py-2"
                >
                  <option value="">Pilih AHU</option>
                  {ahus.filter(a=>a.is_active).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.unit_code}
                    </option>
                  ))}
                </select>

                <select
                  value={period}
                  onChange={(e) =>
                    setPeriod(e.target.value as SchedulePlan["period"])
                  }
                  className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2"
                >
                  <option value="bulanan">Bulanan</option>
                  <option value="enam_bulan">6 Bulanan</option>
                  <option value="tahunan">Tahunan</option>
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                    className="rounded-xl border bg-slate-800/60 bg-slate-800/60 px-4 py-2"
                  >
                    {[1, 2, 3, 4].map((w) => (
                      <option key={w} value={w}>
                        Minggu {w}
                      </option>
                    ))}
                  </select>

                  {period !== "bulanan" && (
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="rounded-xl border bg-slate-800/60 bg-slate-800/60 px-4 py-2"
                    >
                      <option value="">Bulan</option>
                      {MONTH_LABELS.slice(1).map((m, i) => (
                        <option key={i + 1} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 rounded-xl bg-teal-500 py-2 font-medium text-slate-900 hover:bg-teal-400"
                  >
                    Simpan
                  </button>

                  <button
                    onClick={resetForm}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2"
                  >
                    Batal
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-medium">
                  Buat Schedule Ganti Filter
                </p>

                <button onClick={() => setShowFilterModal(false)}>
                  <X />
                </button>
              </div>

              {/* AHU */}
              <select
                value={filterAHU}
                onChange={(e) => setFilterAHU(e.target.value)}
                className="mb-3 w-full rounded-xl border bg-slate-800/60 px-4 py-2"
              >
                <option value="">Pilih AHU</option>
                {ahus.filter(a=>a.is_active).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.unit_code}
                  </option>
                ))}
              </select>

              {/* DATE */}
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="mb-3 w-full rounded-xl border bg-slate-800/60 px-4 py-2"
              />

              <p className="text-xs text-slate-400 mb-4">
                Schedule akan dibuat dengan durasi 1 minggu.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateFilterSchedule}
                  className="flex-1 rounded-xl bg-teal-500 py-2 font-medium text-slate-900 hover:bg-teal-400"
                >
                  Simpan
                </button>

                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}
