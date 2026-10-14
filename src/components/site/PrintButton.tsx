"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="flex h-9 items-center gap-1.5 rounded-full border border-ink/15 bg-white px-4 text-[13.5px] font-medium text-ink hover:border-ink/40">
      <Printer className="size-4" /> {label}
    </button>
  );
}
