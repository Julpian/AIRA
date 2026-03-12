"use client";

import { useState } from "react";
import { User } from "@/types/user";

type UpdateUserPayload = {
  name?: string;
  jabatan?: string;
  password?: string;
};

type Props = {
  user: User;
  onClose: () => void;
  onSave: (data: UpdateUserPayload) => Promise<void>;
};

export default function UserEditModal({
  user,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(user.name);
  const [jabatan, setJabatan] = useState(user.jabatan);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await onSave({
        name,
        jabatan,
        password: password || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 w-full max-w-md rounded space-y-4">
        <h2 className="text-lg font-bold text-white">
          Edit User
        </h2>

        <input
          className="w-full bg-slate-800 p-2 rounded text-white"
          placeholder="Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full bg-slate-800 p-2 rounded text-white"
          placeholder="Jabatan"
          value={jabatan}
          onChange={(e) => setJabatan(e.target.value)}
        />

        <input
          type="password"
          className="w-full bg-slate-800 p-2 rounded text-white"
          placeholder="Password baru (opsional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="text-gray-300"
          >
            Batal
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="bg-green-600 px-4 py-2 rounded text-white"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
