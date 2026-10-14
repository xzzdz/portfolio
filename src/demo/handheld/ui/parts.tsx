"use client";

import { Building2, ChevronLeft, Inbox, Menu, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { AreaStatus } from "../../data/types";
import { statusPalette } from "../../shared/status";
import { useApp } from "../AppContext";

/** หัวจอหน้าย่อย — ไล่เฉดน้ำเงิน มุมล่างโค้ง (ความสูงประหยัดสำหรับจอ 720dp) */
export function SubHeader({
  title,
  subtitle,
  onBack,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  children?: ReactNode;
}) {
  const { setDrawerOpen, t } = useApp();
  return (
    <div className="relative z-10 shrink-0 rounded-b-[22px] bg-linear-to-br from-[#0F52BA] to-[#002366] px-2 pb-2.5 pt-1.5 text-white shadow-[0_4px_10px_rgba(15,82,186,0.2)]">
      <div className="flex items-center gap-1.5">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label={t("ย้อนกลับ")} className="grid size-10 place-items-center rounded-full hover:bg-white/10 active:bg-white/20">
            <ChevronLeft className="size-6" />
          </button>
        ) : (
          <button type="button" onClick={() => setDrawerOpen(true)} aria-label={t("เมนู")} className="grid size-10 place-items-center rounded-full hover:bg-white/10 active:bg-white/20">
            <Menu className="size-6" />
          </button>
        )}
        <span className="grid size-8 place-items-center rounded-full border border-white/35 bg-white/20">
          <Building2 className="size-[18px]" />
        </span>
        <div className="ml-1 min-w-0 flex-1">
          <div className="truncate text-[17px] font-bold leading-tight tracking-[0.01em]">{title}</div>
          <div className="flex items-center gap-1 text-[10px] font-medium text-white/80">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span className="truncate">{subtitle ?? "Chaoperty Handheld"}</span>
            <span className="ml-1 rounded bg-white/15 px-1 py-px text-[8.5px] font-bold tracking-wider text-white/90">DEMO</span>
          </div>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "block w-full rounded-2xl border border-slate-200 bg-white text-left shadow-[0_4px_10px_rgba(0,0,0,0.04)]",
        onClick && "transition active:scale-[0.99] active:bg-slate-50",
        className,
      )}
    >
      {children}
    </Comp>
  );
}

/** ชิปกรองสถานะ : จุดสี = คำอธิบายสี / กด = กรองเหลือสถานะนั้น */
export function StatusChip({
  label,
  count,
  selected,
  status,
  onClick,
}: {
  label: string;
  count: number;
  selected: boolean;
  status?: AreaStatus;
  onClick: () => void;
}) {
  const p = status ? statusPalette[status] : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex h-8 shrink-0 items-center gap-1.5 rounded-2xl border px-2.5 text-[12px] font-semibold transition", selected ? "" : "border-slate-200 bg-white text-slate-600")}
      style={selected ? { background: p?.bg ?? "#EFF6FF", borderColor: p?.fg ?? "#0F52BA", color: p?.strong ?? "#0F52BA", borderWidth: 1.5 } : undefined}
    >
      {p && <span className="size-2.5 rounded-full" style={{ background: p.fg }} />}
      <span className="whitespace-nowrap">{label}</span>
      <span className={cn("rounded-full px-1.5 text-[10.5px] font-bold", selected ? "bg-white/70" : "bg-slate-100 text-slate-500")}>{count}</span>
    </button>
  );
}

export function StatusTag({ status, label, className }: { status: AreaStatus; label: string; className?: string }) {
  const p = statusPalette[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10.5px] font-bold", className)} style={{ background: p.bg, borderColor: p.border, color: p.strong }}>
      <span className="size-1.5 rounded-full" style={{ background: p.fg }} />
      {label}
    </span>
  );
}

export function Pill({ children, tone = "slate", className }: { children: ReactNode; tone?: "slate" | "blue" | "green" | "red" | "amber" | "violet"; className?: string }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-lg border px-1.5 py-px text-[10.5px] font-semibold", tones[tone], className)}>{children}</span>;
}

export function EmptyState({ icon: Icon = Inbox, title, subtitle, action }: { icon?: LucideIcon; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 py-12 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="size-8" />
      </span>
      <div className="mt-4 text-[15px] font-bold text-slate-800">{title}</div>
      {subtitle && <div className="mt-1 text-[12.5px] leading-relaxed text-slate-500">{subtitle}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Segment<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { value: T; label: string; icon?: LucideIcon }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex rounded-xl bg-slate-200/70 p-1", className)}>
      {options.map((o) => {
        const Icon = o.icon;
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-bold transition",
              active ? "bg-white text-[#0F52BA] shadow-sm" : "text-slate-500",
            )}
          >
            {Icon && <Icon className="size-4" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  className,
  disabled,
  icon: Icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "amber" | "green" | "danger";
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  const variants = {
    primary: "bg-linear-to-br from-[#0F52BA] to-[#0B3D8C] text-white shadow-[0_4px_10px_rgba(15,82,186,0.28)]",
    outline: "border border-slate-300 bg-white text-slate-700",
    ghost: "bg-slate-100 text-slate-700",
    amber: "bg-linear-to-br from-amber-500 to-amber-600 text-white shadow-[0_4px_10px_rgba(245,158,11,0.3)]",
    green: "bg-linear-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_4px_10px_rgba(16,185,129,0.3)]",
    danger: "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-bold transition active:scale-[0.98] disabled:opacity-45 disabled:shadow-none",
        variants[variant],
        className,
      )}
    >
      {Icon && <Icon className="size-[18px]" />}
      {children}
    </button>
  );
}

export function DetailRow({ label, value, strong, valueClass }: { label: string; value: ReactNode; strong?: boolean; valueClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-[13px]">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className={cn("text-right font-semibold text-slate-800", strong && "text-[15px] font-extrabold", valueClass)}>{value}</span>
    </div>
  );
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2 mt-1 flex items-center gap-2">
      <span className="h-[18px] w-1 rounded-sm bg-[#0F52BA]" />
      <span className="flex-1 text-[14px] font-bold text-slate-900">{children}</span>
      {right}
    </div>
  );
}

export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className={cn("grid size-[22px] shrink-0 place-items-center rounded-md border-2 transition", checked ? "border-[#0F52BA] bg-[#0F52BA] text-white" : "border-slate-300 bg-white")}>
      {checked && (
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
          <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
