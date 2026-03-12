"use client";

import { AuditTrail } from "@/services/auditTrailService";
import AuditDetailModal from "./AuditDetailModal";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  formatAuditRelative,
  formatAuditDate,
  formatAuditClock,
} from "@/utils/time";

export default function AuditTrailTable({ data }: { data: AuditTrail[] }) {
  const [selected, setSelected] = useState<AuditTrail | null>(null);

  // styling label action
  const getActionStyle = (action: string) => {
    switch (action) {

      // CREATE / GENERATE
      case "GENERATE_SCHEDULE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      // SIGN
      case "SIGN_SCHEDULE_SVP":
      case "SIGN_SCHEDULE_ASMEN":
      case "SIGN_INSPECTION":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

      // SUBMIT
      case "SUBMIT_INSPECTION":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      // APPROVAL
      case "APPROVE_INSPECTION":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

      // NFC
      case "SCAN_NFC":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

      // DELETE
      case "DELETE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";

      case "CREATE_USER":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

      case "UPDATE_USER":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";

      case "ACTIVATE_USER":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "DEACTIVATE_USER":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";

      case "CREATE_FORM_TEMPLATE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      case "NEW_FORM_TEMPLATE_VERSION":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

      case "ACTIVATE_FORM_TEMPLATE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

      case "DEACTIVATE_FORM_TEMPLATE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/1">
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                  Event Timestamp
                </th>

                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                  Actor
                </th>

                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                  Action Type
                </th>

                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                  Target Entity
                </th>

                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold text-right">
                  Control
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/2">
              {data.map((a, index) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="group hover:bg-blue-500/2 transition-all duration-200"
                >
                  {/* TIME */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-slate-200">
                        {formatAuditRelative(a.created_at)}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-blue-400/80">
                          {formatAuditDate(a.created_at)}
                        </span>

                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter bg-white/5 px-1 rounded">
                          {formatAuditClock(a.created_at)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* USER */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/10 shadow-lg group-hover:border-blue-500/30 text-[11px] font-bold text-slate-300">
                        {a.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm text-slate-200 font-bold group-hover:text-blue-400 transition-colors">
                          {a.name}
                        </span>

                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">
                          {a.role}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-widest ${getActionStyle(
                        a.action
                      )}`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current mr-2 animate-pulse" />
                      {a.action}
                    </span>
                  </td>

                  {/* ENTITY */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />

                      <span className="text-sm font-mono text-slate-400 italic">
                        {a.entity}
                      </span>
                    </div>
                  </td>

                  {/* CONTROL */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelected(a)}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 px-5 py-2 rounded-xl bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-blue-400 shadow-xl"
                    >
                      Inspect
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selected && (
          <AuditDetailModal
            audit={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}