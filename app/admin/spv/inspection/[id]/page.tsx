"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import SignaturePad from "./SignaturePad";
import { apiFetch } from "@/services/api";

export default function SPVInspectionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [isSaved, setIsSaved] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSaveSignature = (data: string) => {
    setSignature(data);
    setIsSaved(true);
  };

  async function approve() {
    if (!signature) return alert("Silakan simpan tanda tangan terlebih dahulu!");

    setLoading(true);
    try {
      await apiFetch(`/inspection/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ signature }),
      });

      alert("Inspection Approved Successfully!");
      router.push("/admin/spv/inspection");
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan approval.");
    } finally {
      setLoading(false);
    }
  }

  const pdfUrl = `${process.env.NEXT_PUBLIC_API}/files/inspection/${id}.pdf`;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inspection Review</h1>
          <p className="text-sm text-slate-400">
            Review laporan sebelum melakukan approval
          </p>
        </div>

        <span className="text-xs text-slate-400 font-mono bg-slate-800 px-3 py-1 rounded-full border border-white/10">
          ID: {id}
        </span>
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">

        {/* PDF PREVIEW */}
        <div className="col-span-8">
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-xl">
            <iframe
              src={pdfUrl}
              className="w-full h-[780px]"
              title="Inspection PDF Preview"
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-4 space-y-6">

          {/* SIGNATURE BOX */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-200">
                SPV Digital Signature
              </h2>

              {isSaved && (
                <span className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-1 rounded">
                  Ready
                </span>
              )}
            </div>

            <SignaturePad onSave={handleSaveSignature} />
          </div>

          {/* INFO BOX */}
          <div className="bg-slate-900 border border-teal-500/10 rounded-2xl p-5">
            <p className="text-sm text-slate-400 leading-relaxed">
              Dengan melakukan approval, Anda menyatakan bahwa laporan inspeksi
              AHU telah diperiksa dan disetujui sesuai standar operasional
              perusahaan.
            </p>
          </div>

          {/* APPROVE BUTTON */}
          <button
            disabled={loading || !isSaved}
            onClick={approve}
            className={`w-full py-4 rounded-xl font-semibold transition-all ${
              loading || !isSaved
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                : "bg-teal-500 hover:bg-teal-400 shadow-lg shadow-teal-500/20"
            }`}
          >
            {loading ? "Processing Approval..." : "Approve Inspection"}
          </button>

        </div>
      </div>
    </div>
  );
}