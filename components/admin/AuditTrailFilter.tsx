"use client";

import { AuditTrail } from "@/services/auditTrailService";
import { useState } from "react";

type Props = {
  data: AuditTrail[];
  onChange: (filtered: AuditTrail[]) => void;
};

export default function AuditTrailFilter({ data, onChange }: Props) {
  const [role, setRole] = useState("");
  const [action, setAction] = useState("");
  const [keyword, setKeyword] = useState("");

  const applyFilter = () => {
    let result = [...data];

    if (role) {
      result = result.filter((i) => i.role === role);
    }

    if (action) {
      result = result.filter((i) =>
        i.action.toLowerCase().includes(action.toLowerCase())
      );
    }

    if (keyword) {
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(keyword.toLowerCase()) ||
          i.entity.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    onChange(result);
  };

  return (
    <div className="flex gap-3">
      <input
        placeholder="Cari nama / entity"
        className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-700"
        onChange={(e) => setKeyword(e.target.value)}
      />

      <select
        className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-700"
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Semua Role</option>
        <option value="admin">Admin</option>
        <option value="AssistantManager">Assistant Manager</option>
        <option value="Supervisor">Supervisor</option>
        <option value="inspector">Inspector</option>
      </select>

      <input
        placeholder="Action"
        className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-700"
        onChange={(e) => setAction(e.target.value)}
      />

      <button
        onClick={applyFilter}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
      >
        Filter
      </button>
    </div>
  );
}
