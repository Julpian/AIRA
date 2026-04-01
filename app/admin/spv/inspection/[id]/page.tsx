"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import SignaturePad from "./SignaturePad";
import { apiFetch } from "@/services/api";

export default function SPVInspectionPage() {
  const params = useParams();
  const router = useRouter();

  // 🔥 SAFE ID
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [signature, setSignature] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const handleSaveSignature = (data: string) => {
    setSignature(data);
    setIsSaved(true);
  };

  async function approve() {
    if (!signature) {
      alert("Tanda tangan dulu!");
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`/inspection/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ signature }),
      });

      alert("Approved!");
      router.push("/admin/spv/inspection");
    } catch (err) {
      console.error(err);
      alert("Gagal approve");
    } finally {
      setLoading(false);
    }
  }

  async function reject() {
    if (!note.trim()) {
      alert("Isi catatan revisi!");
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`/inspection/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });

      alert("Dikembalikan untuk revisi!");
      router.push("/admin/spv/inspection");
    } catch (err) {
      console.error(err);
      alert("Gagal reject");
    } finally {
      setLoading(false);
    }
  }

  const pdfUrl = id
    ? `${process.env.NEXT_PUBLIC_API}/files/inspection/${id}.pdf`
    : "";

  if (!id) {
    return <div className="p-8 text-red-500">ID tidak ditemukan</div>;
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-xl font-bold mb-4">Review Inspection</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* PDF */}
        <div className="col-span-8">
          {pdfUrl ? (
            <iframe src={pdfUrl} className="w-full h-[700px]" />
          ) : (
            <div className="text-red-400">PDF tidak tersedia</div>
          )}
        </div>

        {/* PANEL */}
        <div className="col-span-4 space-y-4">
          <SignaturePad onSave={handleSaveSignature} />

          {/* REJECT */}
          <div className="bg-slate-900 p-4 rounded-xl">
            <textarea
              placeholder="Catatan revisi..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 bg-slate-800 rounded"
            />

            <button
              disabled={loading}
              onClick={reject}
              className="w-full mt-2 bg-red-500 py-2 rounded disabled:opacity-50"
            >
              Reject
            </button>
          </div>

          {/* APPROVE */}
          <button
            disabled={!isSaved || loading}
            onClick={approve}
            className="w-full bg-teal-500 py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "Loading..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}