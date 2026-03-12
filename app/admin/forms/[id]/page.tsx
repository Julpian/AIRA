"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Layers,
  CheckCircle2,
} from "lucide-react";

import { getFormTemplateDetail } from "@/services/form";
import type { FormTemplate } from "@/types/form";

function inputIcon(type?: string) {
  switch (type) {
    case "text":
      return "📝";
    case "number":
      return "🔢";
    case "select":
      return "📋";
    case "checkbox":
      return "☑️";
    case "date":
      return "📅";
    default:
      return "•";
  }
}

export default function FormTemplateDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [data, setData] = useState<FormTemplate | null>(null);

  useEffect(() => {
    if (!id) return;
    getFormTemplateDetail(id).then(setData);
  }, [id]);

  if (!data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-64 rounded bg-slate-800" />
        <div className="h-4 w-48 rounded bg-slate-800" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-40 rounded-xl bg-slate-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <FileText size={20} />
            <h1 className="text-xl font-semibold">
              {data.name}
            </h1>
          </div>

          <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
            <span className="rounded-full bg-indigo-500/15 px-3 py-0.5 text-indigo-300">
              {data.period}
            </span>
            <span>Version {data.version}</span>
          </div>
        </div>

        {data.version > 1 && (
          <Link
            href={`/admin/forms/${id}/compare`}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 transition"
          >
            Compare Versions
          </Link>
        )}
      </div>

      {/* SECTIONS */}
      <div className="space-y-6">
        {data.sections?.map((section, sIndex) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIndex * 0.05 }}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-6"
          >
            {/* Section title */}
            <div className="mb-4 flex items-center gap-2 text-white">
              <Layers size={16} className="opacity-70" />
              <h2 className="font-medium">
                {sIndex + 1}. {section.title}
              </h2>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {section.items.map((item, iIndex) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {iIndex + 1}.
                    </span>

                    <span className="text-sm text-slate-200">
                      {inputIcon(item.input_type)} {item.label}
                    </span>

                    {item.required && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-300">
                        <CheckCircle2 size={10} />
                        required
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">
                    {item.input_type}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
