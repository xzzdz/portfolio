"use client";

import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useDemoStore } from "./store";

/** คืนค่าข้อมูลเดโม่ทั้งชุด (ใช้ร่วมกันทั้งสองเดโม่) */
export default function ResetButton({ label, doneLabel }: { label: string; doneLabel: string }) {
  const reset = useDemoStore((s) => s.reset);
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        reset();
        setDone(true);
        window.setTimeout(() => setDone(false), 1600);
      }}
      className="flex h-10 items-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-[14px] font-medium text-ink transition hover:border-ink/40"
    >
      {done ? <Check className="size-4 text-emerald-600" /> : <RotateCcw className="size-4" />}
      {done ? doneLabel : label}
    </button>
  );
}
