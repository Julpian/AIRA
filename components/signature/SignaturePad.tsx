"use client";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturePad({
  onSave,
}: {
  onSave: (value: string) => void;
}) {
  const ref = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ width: 300, height: 180 });

  useEffect(() => {
    function resizeCanvas() {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;
      const height = width < 500 ? 200 : 240;

      setSize({ width, height });
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  function save() {
    if (!ref.current || ref.current.isEmpty()) return;

    const data = ref.current.getTrimmedCanvas().toDataURL("image/png");
    onSave(data);
  }

  function clear() {
    ref.current?.clear();
    onSave("");
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none touch-none"
    >
      {/* Center Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">
          Signature Area
        </span>
      </div>

      <SignatureCanvas
        ref={ref}
        onEnd={save}
        canvasProps={{
          width: size.width,
          height: size.height,
          className:
            "w-full rounded-xl bg-white cursor-crosshair touch-none",
        }}
      />

      {/* Clear Button */}
      <button
        onClick={clear}
        className="absolute bottom-3 right-3 px-3 py-1 text-[11px] font-semibold bg-white/90 backdrop-blur border border-gray-200 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 transition"
      >
        Clear
      </button>
    </div>
  );
}