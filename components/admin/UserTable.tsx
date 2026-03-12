"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCog,
  UserCheck,
  UserX,
  Pencil,
  Filter,
} from "lucide-react";
import { User } from "@/types/user";

type Props = {
  users: User[];
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => Promise<void>;
  onEdit: (user: User) => void;
};

/**
 * ROLE NORMALIZATION
 * Backend   -> Frontend
 * Svp       -> spv
 * SPV       -> spv
 * spv       -> spv
 */
const ROLE_NORMALIZER: Record<string, string> = {
  admin: "admin",
  inspector: "inspector",
  asmen: "asmen",
  svp: "spv",
  spv: "spv",
};

const ROLE_OPTIONS = [
  { label: "Semua Role", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "Inspector", value: "inspector" },
  { label: "Assistant Manager", value: "assistantmanager" },
  { label: "Supervisor", value: "supervisor" },
];

function normalizeRole(role?: string) {
  if (!role) return "";
  return ROLE_NORMALIZER[role.toLowerCase()] ?? role.toLowerCase();
}

export default function UserTable({
  users,
  onActivate,
  onDeactivate,
  onEdit,
}: Props) {
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users;

    return users.filter(
      (u) => normalizeRole(u.role) === roleFilter
    );
  }, [users, roleFilter]);

  return (
    <div className="space-y-4">

      {/* HEADER + FILTER */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <UserCog className="h-5 w-5 text-indigo-400" />
          Manajemen User
        </h2>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md bg-slate-800 border border-slate-700 px-3 py-1 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-slate-800/80 text-gray-200">
            <tr>
              <th className="px-4 py-3">NPP</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {filteredUsers.length === 0 && (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Tidak ada user dengan role tersebut
                  </td>
                </motion.tr>
              )}

              {filteredUsers.map((u) => (
                <motion.tr
                  key={u.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-slate-800 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {u.npp}
                  </td>

                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.jabatan}</td>

                  {/* ROLE BADGE */}
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                      {normalizeRole(u.role).toUpperCase()}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    {u.is_active ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <UserCheck className="h-4 w-4" />
                        Aktif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400">
                        <UserX className="h-4 w-4" />
                        Nonaktif
                      </span>
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onEdit(u)}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      {u.is_active ? (
                        <button
                          onClick={() => onDeactivate(u.id)}
                          className="flex items-center gap-1 text-red-400 hover:text-red-300 transition"
                        >
                          <UserX className="h-4 w-4" />
                          Nonaktif
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivate(u.id)}
                          className="flex items-center gap-1 text-green-400 hover:text-green-300 transition"
                        >
                          <UserCheck className="h-4 w-4" />
                          Aktifkan
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
