"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { useMediaQuery } from "@/lib/useMedia";
import { HandheldEmbed, WebAdminEmbed } from "./DemoEmbeds";

/**
 * วางสองเดโม่คู่กัน (จอกว้าง) หรือสลับด้วยแท็บ (จอแคบ)
 * ทั้งคู่อ่าน store เดียวกัน — ทำรายการฝั่งหนึ่ง อีกฝั่งเปลี่ยนตามทันที
 */
export function Playground({ locale }: { locale: Locale }) {
  const [tab, setTab] = useState<"handheld" | "admin">("handheld");
  const wide = useMediaQuery("(min-width: 1280px)", true);
  const phone = useMediaQuery("(max-width: 480px)");

  const th = locale === "th";
  return (
    <div>
      {!wide && (
        <div className="mb-5 flex justify-center">
          <div className="flex rounded-full border border-line bg-white p-1">
            {(
              [
                ["handheld", Smartphone, "Handheld"],
                ["admin", Monitor, "Web Admin"],
              ] as const
            ).map(([k, Icon, label]) => (
              <button key={k} type="button" onClick={() => setTab(k)} className={cn("flex h-9 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition", tab === k ? "bg-ink text-white" : "text-ink-2")}>
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={cn("gap-8", wide ? "grid grid-cols-[auto_minmax(0,1fr)] items-start" : "block")}>
        {/* ซ่อนด้วย CSS แทนการถอดออก — สลับแท็บแล้วหน้าจอในแต่ละเดโม่ยังค้างอยู่ที่เดิม */}
        <div className={cn(!wide && tab !== "handheld" && "hidden")}>
          {phone ? (
            // จอมือถือ : แสดงแอปเต็มความกว้าง ไม่ต้องมีกรอบเครื่อง
            <div className="mx-auto h-[min(760px,calc(100dvh-150px))] max-w-[420px] overflow-hidden rounded-[24px] shadow-xl ring-1 ring-black/10">
              <HandheldEmbed locale={locale} framed={false} />
            </div>
          ) : (
            <HandheldEmbed locale={locale} scale="fit" fitOffset={wide ? 150 : 170} />
          )}
          {wide && <p className="mt-3 text-center text-[12.5px] text-mute">{th ? "Handheld · พนักงานเก็บเงิน" : "Handheld · collector"}</p>}
        </div>
        <div className={cn("min-w-0 pt-2", !wide && tab !== "admin" && "hidden")}>
          <WebAdminEmbed locale={locale} height={wide ? 860 : 820} />
          {wide && <p className="mt-3 text-center text-[12.5px] text-mute">{th ? "Web Admin · แอดมินสาขา" : "Web Admin · branch admin"}</p>}
        </div>
      </div>
    </div>
  );
}
