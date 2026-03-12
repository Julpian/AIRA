"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPinned,
  Plus,
  Pencil,
  Power,
  X,
} from "lucide-react";

import { getBuildings, type Building } from "@/services/buildingService";
import {
  getAreas,
  createArea,
  updateArea,
  deactivateArea,
  type Area,
} from "@/services/areaService";

type ApiListResponse<T> = {
  data: T[];
};

const badgeGreen =
  "rounded-full bg-teal-500/20 px-3 py-1 text-xs font-medium text-teal-300";

const badgeRed =
  "rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-300";

export default function MasterAreaPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Area | null>(null);

  const [buildingId, setBuildingId] = useState("");
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");

  const loadAll = async () => {
  try {
    const [areaRes, buildingRes] = await Promise.all([
      getAreas(),
      getBuildings(),
    ]);

    if (areaRes && Array.isArray(areaRes)) {
      setAreas(areaRes);
    } else if (areaRes && typeof areaRes === 'object' && "data" in areaRes) {
      setAreas((areaRes as ApiListResponse<Area>).data);
    } else {
      setAreas([]);
    }

    // 🔥 FIX: Handle Buildings secara aman agar tidak crash jika null
    if (buildingRes && Array.isArray(buildingRes)) {
      setBuildings(buildingRes);
    } else if (buildingRes && typeof buildingRes === 'object' && "data" in buildingRes) {
      setBuildings((buildingRes as ApiListResponse<Building>).data);
    } else {
      setBuildings([]); // Set kosong jika null atau error
    }
  } catch (error) {
    console.error("Gagal memuat data:", error);
    setBuildings([]);
    setAreas([]);
  }
};

  useEffect(() => {
    const init = async () => {
      await loadAll();
    };

    init();
  }, []);

  const resetForm = () => {
    setBuildingId("");
    setName("");
    setFloor("");
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (a: Area) => {
    setEditing(a);
    setBuildingId(a.building_id);
    setName(a.name);
    setFloor(a.floor || "");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!buildingId || !name.trim())
      return alert("Gedung & Location wajib diisi");

    if (editing) {
      await updateArea(editing.id, {
        building_id: buildingId,
        name: name.trim(),
        floor: floor.trim(),
      });
    } else {
      await createArea({
        building_id: buildingId,
        name: name.trim(),
        floor: floor.trim(),
      });
    }

    resetForm();
    loadAll();
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Nonaktifkan location ini?")) return;
    await deactivateArea(id);
    loadAll();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">

    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl space-y-6 px-4 py-6 text-slate-200"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPinned className="text-teal-400" />
          <div>
            <h1 className="text-xl font-semibold text-white">
              Master Location
            </h1>
            <p className="text-sm text-slate-400">
              Area berdasarkan gedung
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-teal-400"
        >
          <Plus size={16} />
          Tambah Location
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="p-3 text-left">Location</th>
              <th className="p-3">Gedung</th>
              <th className="p-3 text-center">Lantai</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {areas.map((a) => {
              const building = buildings.find((b) => b.id === a.building_id);

              return (
                <tr key={a.id} className="border-t border-white/5">
                  <td className="p-3 font-medium">{a.name}</td>
                  <td className="p-3 text-slate-400">
                    {building?.name || "-"}
                  </td>
                  <td className="p-3 text-center">
                    {a.floor || "-"}
                  </td>
                  <td className="p-3 text-center">
                    <span className={a.is_active ? badgeGreen : badgeRed}>
                      {a.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-4">
                    <button
                      onClick={() => openEdit(a)}
                      className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    {a.is_active && (
                      <button
                        onClick={() => handleDeactivate(a.id)}
                        className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
                      >
                        <Power size={14} />
                        Nonaktif
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
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
                  {editing ? "Edit Location" : "Tambah Location"}
                </p>
                <button onClick={resetForm}>
                  <X />
                </button>
              </div>

              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200"
              >
                <option value="">Pilih Gedung</option>

                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Nama Location"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200"
              />

              <input
                placeholder="Lantai (opsional)"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
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
