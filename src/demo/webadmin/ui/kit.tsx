"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Monitor, Search, Smartphone, X, type LucideIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { AreaStatus, Channel } from "../../data/types";
import type { InvoiceState } from "../../selectors";
import { statusLabelTh, statusPalette } from "../../shared/status";
import { useAdmin } from "../AdminContext";

export function PageHeader({ title, subtitle, icon: Icon, actions }: { title: string; subtitle?: ReactNode; icon?: LucideIcon; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid size-10 place-items-center rounded-xl bg-leaf-500 text-white shadow-sm">
            <Icon className="size-5" />
          </span>
        )}
        <div>
          <h2 className="text-[20px] font-bold leading-tight text-slate-900">{title}</h2>
          {subtitle && <div className="text-[12.5px] text-slate-500">{subtitle}</div>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, actions, children, className, bodyClass }: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            {title && <h3 className="truncate text-[14px] font-bold text-slate-900">{title}</h3>}
            {subtitle && <div className="truncate text-[11.5px] text-slate-500">{subtitle}</div>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("p-4", bodyClass)}>{children}</div>
    </section>
  );
}

export function Tabs<T extends string>({ value, onChange, items, className }: { value: T; onChange: (v: T) => void; items: { value: T; label: ReactNode; count?: number }[]; className?: string }) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto border-b border-slate-200", className)}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange(it.value)}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-semibold transition",
              active ? "border-leaf-600 text-leaf-800" : "border-transparent text-slate-500 hover:text-slate-800",
            )}
          >
            {it.label}
            {it.count !== undefined && <span className={cn("rounded-full px-1.5 text-[11px] font-bold", active ? "bg-leaf-100 text-leaf-800" : "bg-slate-100 text-slate-500")}>{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

type Tone = "slate" | "green" | "red" | "amber" | "blue" | "violet" | "leaf";
export function Badge({ children, tone = "slate", className, icon: Icon }: { children: ReactNode; tone?: Tone; className?: string; icon?: LucideIcon }) {
  const tones: Record<Tone, string> = {
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    leaf: "bg-leaf-50 text-leaf-800 ring-leaf-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset", tones[tone], className)}>
      {Icon && <Icon className="size-3" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: AreaStatus }) {
  const { t } = useAdmin();
  const p = statusPalette[status];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: p.bg, color: p.strong }}>
      <span className="size-2 rounded-full" style={{ background: p.fg }} />
      {t(statusLabelTh[status])}
    </span>
  );
}

export function InvoiceBadge({ state }: { state: InvoiceState }) {
  const { t } = useAdmin();
  if (state === "paid") return <Badge tone="green">{t("ชำระแล้ว")}</Badge>;
  if (state === "overdue") return <Badge tone="red">{t("เกินกำหนด")}</Badge>;
  if (state === "review") return <Badge tone="violet">{t("รอตรวจสอบสลิป")}</Badge>;
  if (state === "pending") return <Badge tone="amber">{t("รอชำระ (QR)")}</Badge>;
  return <Badge tone="slate">{t("ค้างชำระ")}</Badge>;
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  return channel === "handheld" ? (
    <Badge tone="violet" icon={Smartphone}>
      Handheld
    </Badge>
  ) : (
    <Badge tone="slate" icon={Monitor}>
      Web
    </Badge>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon: Icon,
  disabled,
  className,
  title,
}: {
  children?: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger" | "dark";
  size?: "sm" | "md";
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const variants = {
    primary: "bg-leaf-600 text-white hover:bg-leaf-700 shadow-sm",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    dark: "bg-slate-900 text-white hover:bg-slate-800",
  };
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition disabled:pointer-events-none disabled:opacity-45",
        size === "sm" ? "h-8 px-2.5 text-[12px]" : "h-9 px-3.5 text-[13px]",
        variants[variant],
        className,
      )}
    >
      {Icon && <Icon className={size === "sm" ? "size-3.5" : "size-4"} />}
      {children}
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <label className={cn("flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-leaf-600 focus-within:ring-2 focus-within:ring-leaf-100", className)}>
      <Search className="size-4 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400" />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="clear">
          <X className="size-3.5 text-slate-400" />
        </button>
      )}
    </label>
  );
}

export function Select<T extends string>({ value, onChange, options, className, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string; label?: string }) {
  return (
    <label className={cn("flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white pl-3 pr-1 text-[13px]", className)}>
      {label && <span className="whitespace-nowrap text-slate-500">{label}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="min-w-0 flex-1 bg-transparent py-1 font-semibold text-slate-800 outline-none">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  sort?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  className?: string;
};

/** ตารางข้อมูล : เรียงคอลัมน์ได้ + แบ่งหน้า */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  pageSize = 10,
  empty,
  initialSort,
  rowClass,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  empty?: ReactNode;
  initialSort?: { key: string; dir: "asc" | "desc" };
  rowClass?: (row: T) => string | undefined;
}) {
  const { t } = useAdmin();
  const [sort, setSort] = useState(initialSort ?? null);
  const [pageIdx, setPageIdx] = useState(0);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sort) return rows;
    const get = col.sort;
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      const r = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "th");
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, columns, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(pageIdx, pages - 1);
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[640px] border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-[#F4F4EC] text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
              {columns.map((c) => (
                <th key={c.key} className={cn("whitespace-nowrap px-3 py-2.5", c.align === "right" && "text-right", c.align === "center" && "text-center", c.className)}>
                  {c.sort ? (
                    <button
                      type="button"
                      onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "asc" }))}
                      className={cn("inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-800", sort?.key === c.key && "text-slate-900")}
                    >
                      {c.header}
                      {sort?.key === c.key && (sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-slate-500">
                  {empty ?? t("ไม่พบข้อมูล")}
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn("border-t border-slate-100 bg-white transition", onRowClick && "cursor-pointer hover:bg-leaf-50/60", rowClass?.(row))}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-3 py-2.5 align-middle text-slate-700", c.align === "right" && "text-right", c.align === "center" && "text-center", c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > pageSize && (
        <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
          <span>{t("แสดง {from}–{to} จาก {total} รายการ", { from: current * pageSize + 1, to: Math.min(sorted.length, (current + 1) * pageSize), total: sorted.length })}</span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={current === 0} onClick={() => setPageIdx(current - 1)} className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white disabled:opacity-40" aria-label={t("ก่อนหน้า")}>
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {current + 1} / {pages}
            </span>
            <button type="button" disabled={current >= pages - 1} onClick={() => setPageIdx(current + 1)} className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white disabled:opacity-40" aria-label={t("ถัดไป")}>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-100 py-2 text-[13px] last:border-0">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-800">{children}</span>
    </div>
  );
}

/** แผงข้างขวา (drawer) — โครงหัว/เนื้อ/ท้าย */
export function DrawerFrame({ title, subtitle, children, footer, headerExtra }: { title: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode; headerExtra?: ReactNode }) {
  const { closeDrawer, t } = useAdmin();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3 border-b border-slate-200 bg-[#F7F8F3] px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-bold text-slate-900">{title}</div>
          {subtitle && <div className="mt-0.5 text-[12.5px] text-slate-500">{subtitle}</div>}
          {headerExtra && <div className="mt-2">{headerExtra}</div>}
        </div>
        <button type="button" onClick={closeDrawer} aria-label={t("ปิด")} className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-200">
          <X className="size-4" />
        </button>
      </div>
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3">{footer}</div>}
    </div>
  );
}

export function ModalFrame({ title, subtitle, children, footer, icon: Icon }: { title: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode; icon?: LucideIcon }) {
  const { closeModal, t } = useAdmin();
  return (
    <div className="flex max-h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5">
        {Icon && (
          <span className="grid size-9 place-items-center rounded-xl bg-leaf-100 text-leaf-700">
            <Icon className="size-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-bold text-slate-900">{title}</div>
          {subtitle && <div className="truncate text-[12px] text-slate-500">{subtitle}</div>}
        </div>
        <button type="button" onClick={closeModal} aria-label={t("ปิด")} className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
          <X className="size-4" />
        </button>
      </div>
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>}
    </div>
  );
}
