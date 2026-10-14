"use client";

import { Lock, Monitor, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { AdminProvider, useAdmin, type AdminPage } from "./AdminContext";
import { adminMenu, AdminShell } from "./AdminShell";

/** ขนาดออกแบบของหน้าจอเว็บแอดมิน — ย่อลงด้วย CSS zoom เมื่อพื้นที่แคบกว่านี้ */
const DESIGN_W = 1280;

export type WebAdminDemoProps = {
  locale: Locale;
  /** ความสูงของหน้าต่าง (หน่วยเดียวกับขนาดออกแบบ ก่อนย่อ) */
  height?: number;
  framed?: boolean;
  initialPage?: AdminPage;
  className?: string;
};

export default function WebAdminDemo({ locale, height = 820, framed = true, initialPage, className }: WebAdminDemoProps) {
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setZoom(Math.min(1, Math.max(0.2, entry.contentRect.width / DESIGN_W))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className={cn("w-full", className)}>
      {zoom < 0.55 && (
        <p className="mb-2 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-[12.5px] leading-snug text-slate-600 ring-1 ring-slate-200">
          <Monitor className="size-4 shrink-0 text-leaf-700" />
          {locale === "th" ? "เว็บแอดมินออกแบบสำหรับจอคอมพิวเตอร์ — หมุนจอเป็นแนวนอนหรือเปิดบนคอมพิวเตอร์จะเห็นชัดกว่า" : "The web admin is built for desktop screens — rotate to landscape or open it on a computer for a clearer view."}
        </p>
      )}
      <div style={{ height: height * zoom }}>
        <div className="origin-top-left" style={{ zoom, width: DESIGN_W, height }}>
          <AdminProvider initialLang={locale} initialPage={initialPage}>
            {framed ? (
              <BrowserFrame>
                <AdminShell />
              </BrowserFrame>
            ) : (
              <AdminShell />
            )}
          </AdminProvider>
        </div>
      </div>
    </div>
  );
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  const { page, d, t } = useAdmin();
  const route = adminMenu.find((m) => m.page === page)?.route ?? "";
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_40px_80px_-30px_rgba(15,23,42,0.45),0_0_0_1px_rgba(15,23,42,0.12)]">
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-slate-200 bg-[#ECECEA] px-4">
        <div className="flex gap-2">
          <span className="size-3 rounded-full bg-[#FF5F57]" />
          <span className="size-3 rounded-full bg-[#FEBC2E]" />
          <span className="size-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="ml-2 flex h-7 max-w-[260px] items-center gap-2 rounded-t-lg bg-white px-3 text-[12px] font-medium text-slate-700 shadow-sm">
          <span className="grid size-4 place-items-center rounded-full bg-leaf-600 text-[9px] font-bold text-white">C</span>
          <span className="truncate">Chaoperty · {d({ th: "ระบบบริหารพื้นที่เช่า", en: "Property Manager" })}</span>
        </div>
        <div className="mx-auto flex h-7 w-[46%] items-center gap-2 rounded-lg bg-white px-3 text-[12px] text-slate-500 ring-1 ring-slate-200">
          <Lock className="size-3.5 text-slate-400" />
          <span className="truncate">
            admin.chaoperty.demo/#/<span className="text-slate-800">{route}</span>
          </span>
          <RotateCw className="ml-auto size-3.5 text-slate-400" />
        </div>
        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white" title={t("เดโม่")}>
          DEMO
        </span>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
