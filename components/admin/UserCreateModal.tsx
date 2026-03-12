"use client";

import { useState } from "react";

type Props = {
  onClose: () => void;
  onCreate: (data: {
    npp: string;
    name: string;
    jabatan: string;
    password: string;
    role: string;
  }) => Promise<void>;
};

export default function UserCreateModal({ onClose, onCreate }: Props) {
  const [form, setForm] = useState({
    npp: "",
    name: "",
    jabatan: "",
    password: "",
    role: "inspector",
  });

  const submit = async () => {
    if (!form.npp || !form.name || !form.password) return;
    await onCreate(form);
    onClose();
  };

  const inputClass =
    "w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white">
          Tambah User
        </h2>

        {/* NPP */}
        <div>
          <label className="mb-1 block text-sm text-slate-400">
            NPP / Username
          </label>
          <input
            type="text"
            placeholder="contoh: ADM-001"
            className={inputClass}
            value={form.npp}
            onChange={(e) =>
              setForm({ ...form, npp: e.target.value })
            }
          />
        </div>

        {/* Nama */}
        <div>
          <label className="mb-1 block text-sm text-slate-400">
            Nama
          </label>
          <input
            type="text"
            placeholder="Nama lengkap"
            className={inputClass}
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        </div>

        {/* Jabatan */}
        <div>
          <label className="mb-1 block text-sm text-slate-400">
            Jabatan
          </label>
          <input
            type="text"
            placeholder="Contoh: Staff Teknik"
            className={inputClass}
            value={form.jabatan}
            onChange={(e) =>
              setForm({ ...form, jabatan: e.target.value })
            }
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-1 block text-sm text-slate-400">
            Password
          </label>
          <input
            type="password"
            placeholder="Minimal 6 karakter"
            className={inputClass}
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </div>

        {/* Role */}
        <div>
          <label className="mb-1 block text-sm text-slate-400">
            Role
          </label>
          <select
            className={inputClass}
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="admin">Admin</option>
            <option value="svp">SVP</option>
            <option value="asmen">Asmen</option>
            <option value="inspector">Inspector</option>
          </select>
        </div>

        {/* Action */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white"
          >
            Batal
          </button>
          <button
            onClick={submit}
            className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
