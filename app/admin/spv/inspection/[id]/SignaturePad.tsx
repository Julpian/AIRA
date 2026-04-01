"use client";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
  onSave: (base64: string) => void;
};

export default function SignaturePad({ onSave }: Props) {
  const ref = useRef<SignatureCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [size, setSize] = useState({ width: 400, height: 200 });

  useEffect(() => {
    function resize() {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const height = width < 500 ? 180 : 220;
      setSize({ width, height });
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function clear() {
    ref.current?.clear();
    setIsSaved(false);
  }

  function save() {
    if (!ref.current || ref.current.isEmpty()) {
      alert("Tanda tangan masih kosong!");
      return;
    }

    const data = ref.current
      .getTrimmedCanvas()
      .toDataURL("image/png");

    onSave(data);
    setIsSaved(true);
  }

  return (
    <div ref={containerRef} className="space-y-3 w-full">
      {/* CANVAS */}
      <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner">
        {!isSaved && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[11px] text-slate-300 font-semibold tracking-wider uppercase">
              Sign Here
            </span>
          </div>
        )}

        <div className="absolute bottom-8 left-6 right-6 border-t border-dashed border-slate-300 pointer-events-none" />

        <SignatureCanvas
          ref={ref}
          penColor="black"
          minWidth={1.2}
          maxWidth={2.5}
          onBegin={() => setIsSaved(false)}
          canvasProps={{
            width: size.width,
            height: size.height,
            className: "w-full touch-none cursor-crosshair",
          }}
        />
      </div>

      {/* BUTTON */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={clear}
          className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm hover:bg-slate-800"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={save}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${
            isSaved
              ? "bg-green-500 text-white"
              : "bg-teal-500 text-slate-900"
          }`}
        >
          {isSaved ? "Saved ✅" : "Save Signature"}
        </button>
      </div>
    </div>
  );
}