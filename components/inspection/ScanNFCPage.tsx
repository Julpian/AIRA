"use client";

import { useState } from "react";
import { apiFetch } from "@/services/api";

type Props = {
  onSuccess: (inspectionId: string) => void;
};

export default function ScanNFCPage({ onSuccess }: Props) {
  const [nfcUID, setNfcUID] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
    if (!nfcUID) {
      setError("NFC UID wajib diisi");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await apiFetch<{ id: string }>(
        "/inspection/scan-nfc",
        {
          method: "POST",
          body: JSON.stringify({
            nfc_uid: nfcUID,
          }),
        }
      );

      // backend return inspection object → ambil ID
      onSuccess(res.id);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Gagal scan NFC");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold text-white">Scan NFC</h1>

      <p className="text-sm text-gray-400">
        Tempelkan kartu NFC atau input manual
      </p>

      <input
        type="text"
        placeholder="NFC UID"
        value={nfcUID}
        onChange={(e) => setNfcUID(e.target.value)}
        className="w-full rounded border px-3 py-2 text-black"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleScan}
        disabled={loading}
        className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Scanning..." : "Scan NFC"}
      </button>
    </div>
  );
}
