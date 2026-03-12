"use client";

import { useEffect, useState } from "react";
import { Users, Plus } from "lucide-react";

import UserTable from "@/components/admin/UserTable";
import UserCreateModal from "@/components/admin/UserCreateModal";
import UserEditModal from "@/components/admin/UserEditModal";
import { apiFetch } from "@/services/api";
import { User } from "@/types/user";

type UpdateUserPayload = {
  name?: string;
  jabatan?: string;
  password?: string;
};

type UserApiResponse = {
  id?: string | number;
  ID?: string | number;
  user_id?: string | number;
  npp?: string | number;
  NPP?: string | number;
  name?: string;
  Name?: string;
  jabatan?: string;
  Jabatan?: string;
  role?: string;
  Role?: string;
  is_active?: boolean | number;
  IsActive?: boolean | number;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await apiFetch<UserApiResponse[]>("/admin/users");

      const mapped: User[] = res.map((u, i) => ({
        id: String(u.id ?? u.ID ?? u.user_id ?? i),
        npp: String(u.npp ?? u.NPP ?? "-"),
        name: String(u.name ?? u.Name ?? "-"),
        jabatan: String(u.jabatan ?? u.Jabatan ?? "-"),
        role: String(u.role ?? u.Role ?? "-"),
        is_active: Boolean(Number(u.is_active ?? u.IsActive ?? 0)),
      }));

      setUsers(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (id: string, data: UpdateUserPayload) => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined && v !== "")
    );

    if (Object.keys(payload).length === 0)
      throw new Error("Tidak ada data yang diubah");

    await apiFetch(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-6 py-6 text-slate-200">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <Users className="text-teal-400" />
          <div>
            <h1 className="text-xl font-semibold text-white">
              User Management
            </h1>
            <p className="text-sm text-slate-400">
              Kelola akun pengguna sistem
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-teal-400 transition"
        >
          <Plus size={16} />
          Tambah User
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-lg p-4">

        {loading ? (
          <p className="py-10 text-center text-slate-400">
            Loading users...
          </p>
        ) : (
          <UserTable
            users={users}
            onEdit={setEditingUser}
            onActivate={async (id) => {
              await apiFetch(`/admin/users/${id}/activate`, {
                method: "PATCH",
              });
              fetchUsers();
            }}
            onDeactivate={async (id) => {
              await apiFetch(`/admin/users/${id}/deactivate`, {
                method: "PATCH",
              });
              fetchUsers();
            }}
          />
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <UserCreateModal
          onClose={() => setShowCreate(false)}
          onCreate={async (data) => {
            await apiFetch("/admin/users", {
              method: "POST",
              body: JSON.stringify(data),
            });

            setShowCreate(false);
            fetchUsers();
          }}
        />
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(data) => updateUser(editingUser.id, data)}
        />
      )}
    </div>
  );
}