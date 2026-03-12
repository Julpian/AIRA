"use client";

import { AuditTrail } from "@/services/auditTrailService";

export default function AuditDetailModal({
  audit,
  onClose,
}: {
  audit: AuditTrail;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg w-[500px] p-6 space-y-3">
        <h2 className="text-lg font-bold text-white">Audit Detail</h2>

        <pre className="bg-slate-800 p-3 rounded text-xs text-gray-200 overflow-auto max-h-60">
{JSON.stringify(audit.metadata, null, 2)}
        </pre>

        <div className="text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
