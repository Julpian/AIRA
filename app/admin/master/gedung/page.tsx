"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Pencil,
  Power,
  X,
} from "lucide-react";

import {
  getBuildings,
  createBuilding,
  updateBuilding,
  deactivateBuilding,
  type Building,
} from "@/services/buildingService";

type ApiListResponse<T> = {
  data: T[];
};

const badgeGreen =
  "rounded-full bg-teal-500/20 px-3 py-1 text-xs font-medium text-teal-300";

const badgeRed =
  "rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-300";

export default function MasterGedungPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const res = await getBuildings();

      const data: Building[] = Array.isArray(res)
        ? res
        : "data" in res &&
          Array.isArray((res as ApiListResponse<Building>).data)
        ? (res as ApiListResponse<Building>).data
        : [];

      setBuildings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Nama gedung wajib diisi");

    if (editing) {
      await updateBuilding(editing.id, {
        name: name.trim(),
        description: description.trim(),
      });
    } else {
      await createBuilding({
        name: name.trim(),
        description: description.trim(),
      });
    }

    resetForm();
    fetchBuildings();
  };

  const openEdit = (b: Building) => {
    setEditing(b);
    setName(b.name);
    setDescription(b.description ?? "");
    setShowForm(true);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Nonaktifkan gedung ini?")) return;
    await deactivateBuilding(id);
    fetchBuildings();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setName("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-4 py-6">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-6xl space-y-6 text-slate-200"
      >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="text-teal-400" />
          <div>
            <h1 className="text-xl font-semibold text-white">
              Master Gedung
            </h1>
            <p className="text-sm text-slate-400">
              Manajemen lokasi AHU
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-teal-400"
        >
          <Plus size={16} />
          Tambah Gedung
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="p-3 text-left">Gedung</th>
              <th className="p-3">Keterangan</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {buildings.map((b) => (
              <tr key={b.id} className="border-t border-white/5">
                <td className="p-3 font-medium">{b.name}</td>
                <td className="p-3 text-slate-400">
                  {b.description || "-"}
                </td>
                <td className="p-3 text-center">
                  <span className={b.is_active ? badgeGreen : badgeRed}>
                    {b.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="p-3 text-center space-x-4">
                  <button
                    onClick={() => openEdit(b)}
                    className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  {b.is_active && (
                    <button
                      onClick={() => handleDeactivate(b.id)}
                      className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
                    >
                      <Power size={14} />
                      Nonaktif
                    </button>
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
                  {editing ? "Edit Gedung" : "Tambah Gedung"}
                </p>
                <button onClick={resetForm}>
                  <X />
                </button>
              </div>

              <input
                placeholder="Nama gedung"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200"
              />

              <textarea
                placeholder="Keterangan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200"
              />

              <div className="flex gap-2">
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
    </motion.div>
    </div>
  );
}
