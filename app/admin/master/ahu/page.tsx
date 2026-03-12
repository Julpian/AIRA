"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Plus, Pencil, X } from "lucide-react";

import { getBuildings, type Building } from "@/services/buildingService";
import { getAreas, type Area } from "@/services/areaService";
import {
  getAHUs,
  createAHU,
  updateAHU,
  type AHU,
} from "@/services/ahuService";

const extractData = <T,>(res: unknown): T[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (
    typeof res === "object" &&
    res !== null &&
    "data" in res &&
    Array.isArray((res as { data: unknown }).data)
  ) {
    return (res as { data: T[] }).data;
  }
  return [];
};

const badgeGreen = "rounded-full bg-teal-500/20 px-3 py-1 text-xs font-medium text-teal-300";
const badgeRed = "rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-300";

export default function MasterAHUPage() {
  const [ahus, setAHUs] = useState<AHU[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AHU | null>(null);

  const [buildingId, setBuildingId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [vendorType, setVendorType] = useState<"saiver" | "other">("saiver");
  const [vendor, setVendor] = useState("Saiver");
  const [nfcUID, setNfcUID] = useState("");
  const [cleanClass, setCleanClass] = useState("");

  const loadAll = useCallback(async () => {
    try {
      const [ahuRes, buildingRes, areaRes] = await Promise.all([
        getAHUs(),
        getBuildings(),
        getAreas(),
      ]);

      setAHUs(extractData<AHU>(ahuRes));
      setBuildings(extractData<Building>(buildingRes));
      setAreas(extractData<Area>(areaRes));
    } catch (error) {
      console.error("Gagal memuat data AHU:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadAll();
    };
    init();
  }, [loadAll]);

  const resetForm = () => {
    setEditing(null);
    setBuildingId("");
    setAreaId("");
    setUnitCode("");
    setRoomName("");
    setVendorType("saiver");
    setVendor("Saiver");
    setNfcUID("");
    setCleanClass("");
    setShowForm(false);
  };

  const openEdit = (a: AHU) => {
    setEditing(a);
    const parentArea = areas.find(ar => ar.id === a.area_id);
    setBuildingId(parentArea?.building_id || "");
    setAreaId(a.area_id);
    setUnitCode(a.unit_code);
    setRoomName(a.room_name || "");
    setNfcUID(a.nfc_uid || "");
    setCleanClass(a.cleanliness_class || "");
    setVendor(a.vendor || "Saiver");
    setVendorType(a.vendor === "Saiver" ? "saiver" : "other");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!buildingId || !areaId || !unitCode.trim())
      return alert("Gedung, Location, Unit Code wajib diisi");

    const payload = {
      area_id: areaId,
      unit_code: unitCode.trim(),
      room_name: roomName || null,
      vendor: vendor || "Saiver",
      nfc_uid: nfcUID || null,
      cleanliness_class: cleanClass || null,
    };

    try {
      if (editing) {
        await updateAHU(editing.id, payload);
      } else {
        await createAHU({ ...payload, building_id: buildingId });
      }
      resetForm();
      await loadAll();
    } catch { 
      alert("Gagal menyimpan data");
    }
  };

  const filteredAreas = areas.filter((a: Area) => 
    a.building_id === buildingId && a.is_active
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-200">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wind className="text-teal-400" />
            <div>
              <h1 className="text-xl font-semibold text-white">Master AHU</h1>
              <p className="text-sm text-slate-400">Manajemen unit Air Handling</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-teal-400">
            <Plus size={16} /> Tambah AHU
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="p-3 text-left">Unit</th>
                <th className="p-3 text-left">Room</th>
                {/* 🔥 KOLOM BARU: NFC TAG */}
                <th className="p-3 text-left">NFC Tag</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Vendor</th>
                <th className="p-3 text-center">Class</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ahus.map((a) => {
                const area = areas.find((x) => x.id === a.area_id);
                return (
                  <tr key={a.id} className="border-t border-white/5">
                    <td className="p-3 font-medium text-teal-400">{a.unit_code}</td>
                    <td className="p-3">{a.room_name || "-"}</td>
                    {/* 🔥 DATA BARU: NFC UID */}
                    <td className="p-3 font-mono text-[10px] text-slate-500 uppercase">
                      {a.nfc_uid || "-"}
                    </td>
                    <td className="p-3 text-slate-400">{area?.name || "-"}</td>
                    <td className="p-3 text-slate-400">{a.vendor || "-"}</td>
                    <td className="p-3 text-center">{a.cleanliness_class || "-"}</td>
                    <td className="p-3 text-center">
                      <span className={a.is_active ? badgeGreen : badgeRed}>
                        {a.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => openEdit(a)} className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1">
                        <Pencil size={14} /> Edit
                      </button>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold">{editing ? "Update AHU" : "Register AHU"}</h3>
                  <button onClick={resetForm} className="text-slate-400 hover:text-white"><X /></button>
                </div>

                <div className="space-y-3">
                  <select value={buildingId} onChange={(e) => { setBuildingId(e.target.value); setAreaId(""); }} className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-white">
                    <option value="">Pilih Gedung</option>
                    {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>

                  <select value={areaId} onChange={(e) => setAreaId(e.target.value)} disabled={!buildingId} className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-white disabled:opacity-50">
                    <option value="">Pilih Location</option>
                    {filteredAreas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>

                  <input placeholder="Unit Code" value={unitCode} onChange={(e) => setUnitCode(e.target.value.toUpperCase())} className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-white" />
                  <input placeholder="Room Name" value={roomName} onChange={(e) => setRoomName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-white" />

                  <div className="flex gap-2">
                    <select value={vendorType} onChange={(e) => {
                      const v = e.target.value as "saiver" | "other";
                      setVendorType(v);
                      setVendor(v === "saiver" ? "Saiver" : "");
                    }} className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-2">
                      <option value="saiver">Vendor: Saiver</option>
                      <option value="other">Lainnya</option>
                    </select>
                    {vendorType === "other" && (
                      <input placeholder="Nama Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-white" />
                    )}
                  </div>

                  <input placeholder="NFC UID Tag" value={nfcUID} onChange={(e) => setNfcUID(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-white font-mono" />

                  <select value={cleanClass} onChange={(e) => setCleanClass(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2">
                    <option value="">Kelas Kebersihan</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                  </select>
                </div>

                <div className="mt-8 flex gap-3">
                  <button onClick={handleSubmit} className="flex-1 rounded-xl bg-teal-500 py-3 font-bold text-slate-900 hover:bg-teal-400">Simpan</button>
                  <button onClick={resetForm} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3">Batal</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}