"use client";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
  onSave: (base64: string) => void;
};

export default function SignaturePad({ onSave }: Props) {
  const ref = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
  }

  function save() {
    const data = ref.current?.getTrimmedCanvas().toDataURL("image/png");
    if (data) onSave(data);
  }

  return (
    <div ref={containerRef} className="space-y-3 w-full">

      {/* CANVAS */}
      <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden">

        {/* guide text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[11px] text-slate-300 font-semibold tracking-wider uppercase">
            Sign Here
          </span>
        </div>

        {/* signature line */}
        <div className="absolute bottom-8 left-6 right-6 border-t border-dashed border-slate-300 pointer-events-none" />

        <SignatureCanvas
          ref={ref}
          penColor="black"
          minWidth={0.8}
          maxWidth={2.2}
          velocityFilterWeight={0.7}
          canvasProps={{
            width: size.width,
            height: size.height,
            className: "w-full touch-none",
          }}
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={clear}
          className="flex-1 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-100 transition"
        >
          Clear
        </button>

        <button
          onClick={save}
          className="flex-1 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
}