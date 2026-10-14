"use client";

import { ChevronDown, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDemoStore } from "../../store";
import { useApp } from "../AppContext";
import { ZoneSheet } from "./Pickers";

/** แถบ "ปุ่มโซน + ช่องค้นหา" แถวเดียว — ใช้เหมือนกันทั้งพื้นที่เช่า/ผู้เช่า/มิเตอร์ */
export function FilterBar({
  zoneId,
  onZone,
  query,
  onQuery,
  placeholder,
}: {
  zoneId?: string;
  onZone?: (id: string) => void;
  query: string;
  onQuery: (q: string) => void;
  placeholder: string;
}) {
  const { t, d, openSheet } = useApp();
  const zones = useDemoStore((s) => s.zones);
  const zone = zones.find((z) => z.id === zoneId);
  return (
    <div className="flex gap-2">
      {onZone && (
        <button
          type="button"
          onClick={() => openSheet(<ZoneSheet value={zoneId ?? "all"} onPick={onZone} />)}
          className={cn(
            "flex h-10 max-w-[44%] shrink-0 items-center gap-1 rounded-xl border px-2.5 text-[12.5px] font-bold",
            zone ? "border-[#0F52BA] bg-[#EFF6FF] text-[#0F52BA]" : "border-slate-200 bg-white text-slate-700",
          )}
        >
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{zone ? d(zone.name).split(" ").slice(0, 2).join(" ") : t("โซนทั้งหมด")}</span>
          <ChevronDown className="size-3.5 shrink-0" />
        </button>
      )}
      <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-[#0F52BA]">
        <Search className="size-4 shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
        />
        {query && (
          <button type="button" onClick={() => onQuery("")} aria-label="clear" className="text-slate-400">
            <X className="size-4" />
          </button>
        )}
      </label>
    </div>
  );
}
