"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Minus,
  Pencil,
  GitCompare,
  ArrowLeft,
} from "lucide-react";

import {
  compareFormTemplates,
  getFormTemplateVersions,
} from "@/services/form";

/* =========================
    TYPES & INTERFACES
   ========================= */

// Deklarasi APIResponse agar tidak error "Cannot find name"
interface APIResponse<T> {
  data: T;
  message?: string;
}

type DiffStatus = "added" | "removed" | "modified" | "unchanged";

type DiffItem = {
  label: string;
  status: DiffStatus;
};

type DiffSection = {
  code: string;
  title: string;
  status: DiffStatus;
  items: DiffItem[];
};

type FormTemplateVersion = {
  id: string;
  version: number;
};

/* =========================
    HELPERS
   ========================= */

function statusMeta(status: DiffStatus) {
  switch (status) {
    case "added":
      return {
        icon: <Plus size={12} />,
        row: "bg-emerald-500/5",
        badge: "bg-emerald-500/20 text-emerald-300",
        text: "text-emerald-300",
      };
    case "removed":
      return {
        icon: <Minus size={12} />,
        row: "bg-red-500/5",
        badge: "bg-red-500/20 text-red-300",
        text: "text-red-300 line-through",
      };
    case "modified":
      return {
        icon: <Pencil size={12} />,
        row: "bg-indigo-500/5",
        badge: "bg-indigo-500/20 text-indigo-300",
        text: "text-indigo-300",
      };
    default:
      return {
        icon: null,
        row: "",
        badge: "bg-slate-700 text-slate-300",
        text: "text-slate-300",
      };
  }
}

/* =========================
    PAGE COMPONENT
   ========================= */

export default function CompareFormTemplatePage() {
  const { id } = useParams<{ id: string }>();

  const [diff, setDiff] = useState<DiffSection[]>([]);
  const [from, setFrom] = useState<FormTemplateVersion | null>(null);
  const [to, setTo] = useState<FormTemplateVersion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // 1. Ambil list versi
        const versionsRes = (await getFormTemplateVersions(id)) as APIResponse<FormTemplateVersion[]> | FormTemplateVersion[];
        
        // Cek apakah response dibungkus .data atau langsung array
        const list = Array.isArray(versionsRes) ? versionsRes : versionsRes.data;

        if (!list || list.length < 2) {
          return;
        }

        // Ambil 2 versi terakhir untuk dibandingkan
        const currentVersion = list[list.length - 1];
        const oldVersion = list[list.length - 2];

        // 2. Ambil data perbandingan
        const res = (await compareFormTemplates(oldVersion.id, currentVersion.id)) as APIResponse<{
          from: FormTemplateVersion;
          to: FormTemplateVersion;
          sections: DiffSection[];
        }>;

        const compareData = res.data;

        setFrom(compareData.from);
        setTo(compareData.to);
        setDiff(compareData.sections);
      } catch (error) {
        console.error("Gagal memuat data compare:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center gap-2 p-10 text-slate-400">
        <GitCompare className="animate-spin" size={18} />
        <p>Loading compare data...</p>
      </div>
    );

  if (!from || !to)
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-10 text-center">
        <p className="text-slate-400">Tidak ada cukup versi untuk dibandingkan.</p>
        <Link href="/admin/forms" className="mt-4 inline-block text-sm text-indigo-400 underline">
          Kembali ke Form List
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* BACK BUTTON */}
      <Link
        href="/admin/forms"
        className="inline-flex items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-1 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white"
      >
        <ArrowLeft size={16} />
        Kembali ke Form List
      </Link>

      {/* HEADER */}
      <div className="flex items-center gap-3 text-white">
        <GitCompare size={20} className="text-indigo-400" />
        <h1 className="text-xl font-semibold">
          Compare v{from.version} → v{to.version}
        </h1>
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300">
          + Added
        </span>
        <span className="rounded-full bg-red-500/20 px-3 py-1 text-red-300">
          − Removed
        </span>
        <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-indigo-300">
          ✎ Modified
        </span>
      </div>

      {/* SECTIONS */}
      <div className="space-y-5">
        {diff.map((sec, sIndex) => (
          <motion.div
            key={sec.code}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIndex * 0.05 }}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-5"
          >
            {/* SECTION HEADER */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium text-white">
                {sec.code} — {sec.title}
              </h2>
              <span className="text-xs text-slate-500">
                {sec.items.length} item
              </span>
            </div>

            {/* ITEMS */}
            <div className="space-y-1">
              {sec.items.map((it, i) => {
                const meta = statusMeta(it.status);

                return (
                  <div
                    key={i}
                    className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-white/5 ${meta.row}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="opacity-60">{meta.icon}</span>
                      <span className={meta.text}>{it.label}</span>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${meta.badge}`}
                    >
                      {it.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}