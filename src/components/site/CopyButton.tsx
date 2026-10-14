"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ value, labels }: { value: string; labels: { copy: string; copied: string } }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          window.setTimeout(() => setDone(false), 1800);
        } catch {
          // คลิปบอร์ดใช้ไม่ได้ (เช่น ไม่ใช่ https) — ปล่อยให้ผู้ใช้เลือกข้อความเอง
        }
      }}
      className="flex h-12 items-center gap-2 rounded-full border border-ink/15 bg-white px-5 text-[14.5px] font-medium text-ink transition hover:border-ink/40"
    >
      {done ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
      {done ? labels.copied : labels.copy}
    </button>
  );
}
