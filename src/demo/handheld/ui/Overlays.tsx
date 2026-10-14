"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useApp } from "../AppContext";

/** ชีตล่างทั้งหมดของแอป — ซ้อนกันได้ ชีตบนสุดปิดก่อน */
export function SheetHost() {
  const { sheets, closeSheet } = useApp();
  return (
    <>
      {sheets.map((sheet, i) => (
        <div key={sheet.id} className="absolute inset-0 z-40 flex flex-col justify-end" style={{ zIndex: 40 + i }}>
          <button type="button" aria-label="close" className="absolute inset-0 animate-fade-in bg-slate-950/45" onClick={closeSheet} />
          <div
            className={cn(
              "relative flex animate-sheet-up flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.18)]",
              sheet.options.tall ? "h-[94%]" : "max-h-[88%]",
            )}
          >
            <div className="flex shrink-0 justify-center pb-1 pt-2.5">
              <span className="h-[5px] w-9 rounded-full bg-slate-300" />
            </div>
            {sheet.node}
          </div>
        </div>
      ))}
    </>
  );
}

/** โครงเนื้อหาของชีต : หัว + เนื้อ (เลื่อนได้) + ปุ่มล่าง */
export function SheetFrame({
  title,
  subtitle,
  icon: Icon,
  iconTone = "blue",
  headerRight,
  children,
  footer,
  bodyClass,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  iconTone?: "blue" | "green" | "amber" | "violet" | "red" | "cyan";
  headerRight?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  bodyClass?: string;
}) {
  const { closeSheet, t } = useApp();
  const tones = {
    blue: "from-[#0F52BA] to-[#0B3D8C]",
    green: "from-emerald-500 to-emerald-700",
    amber: "from-amber-500 to-amber-700",
    violet: "from-violet-500 to-violet-700",
    red: "from-red-500 to-red-700",
    cyan: "from-cyan-500 to-cyan-700",
  };
  return (
    <>
      <div className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-1">
        {Icon && (
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-white shadow-sm", tones[iconTone])}>
            <Icon className="size-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-extrabold text-slate-900">{title}</div>
          {subtitle && <div className="truncate text-[12px] text-slate-500">{subtitle}</div>}
        </div>
        {headerRight}
        <button type="button" onClick={closeSheet} aria-label={t("ปิด")} className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 active:bg-slate-200">
          <X className="size-4" />
        </button>
      </div>
      <div className={cn("thin-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-4", bodyClass)}>{children}</div>
      {footer && <div className="shrink-0 border-t border-slate-100 bg-white px-5 pb-4 pt-3">{footer}</div>}
    </>
  );
}

export function DialogHost() {
  const { dialog, closeDialog } = useApp();
  if (!dialog) return null;
  return (
    <div className="absolute inset-0 z-[60] grid place-items-center p-6">
      <button type="button" aria-label="close" className="absolute inset-0 animate-fade-in bg-slate-950/50" onClick={closeDialog} />
      <div className="relative w-full animate-pop rounded-[24px] bg-white p-5 shadow-2xl">{dialog}</div>
    </div>
  );
}

const noticeStyle: Record<string, { icon: LucideIcon; color: string }> = {
  success: { icon: CheckCircle2, color: "#10B981" },
  info: { icon: Info, color: "#3B82F6" },
  warning: { icon: AlertTriangle, color: "#F59E0B" },
  error: { icon: XCircle, color: "#EF4444" },
};

/** แจ้งเตือนแบบเลื่อนลงจากด้านบน (ไม่มี blur — เครื่อง Sunmi V2 ใช้ GPU Mali-400) */
export function NoticeHost() {
  const { notices, dismissNotice } = useApp();
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1.5 z-[70] flex flex-col items-center gap-2 px-3">
      {notices.map((n) => {
        const s = noticeStyle[n.type];
        const Icon = s.icon;
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => dismissNotice(n.id)}
            className="pointer-events-auto flex w-full animate-notice items-start gap-3 rounded-[20px] border border-slate-700 bg-[#2C2C2E]/[0.98] px-3.5 py-3 text-left text-white shadow-xl"
          >
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full" style={{ background: `${s.color}26`, color: s.color }}>
              <Icon className="size-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-bold leading-tight">{n.title}</span>
              {n.message && <span className="mt-0.5 block text-[12px] leading-snug text-white/75">{n.message}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
