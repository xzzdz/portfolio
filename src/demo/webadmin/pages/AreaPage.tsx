"use client";

import { LayoutGrid, Map as MapIcon, Store, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { money, shortDate } from "@/lib/format";
import type { Area, AreaStatus } from "../../data/types";
import { statusOrder } from "../../selectors";
import { statusLabelTh, statusPalette } from "../../shared/status";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useAdmin } from "../AdminContext";
import { Badge, PageHeader, Panel, SearchInput, Tabs } from "../ui/kit";
import { AreaDrawer } from "./shared";

export function AreaPage() {
  const { t, d, lang, params, openDrawer } = useAdmin();
  const zones = useDemoStore((s) => s.zones);
  const areas = useDemoStore((s) => s.areas);
  const idx = useDemoIndex();
  const [zoneId, setZoneId] = useState("all");
  const [status, setStatus] = useState<AreaStatus | "all">((params.status as AreaStatus) ?? "all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "plan">("plan");

  const q = query.trim().toLowerCase();
  const matchQuery = (a: Area) => {
    if (!q) return true;
    const c = idx.contractByArea.get(a.id);
    const cust = c ? idx.customerById.get(c.customerId) : undefined;
    return [a.name, a.code, cust?.shop.th, cust?.shop.en, cust?.name.th, cust?.name.en].some((v) => v?.toLowerCase().includes(q));
  };
  const scoped = useMemo(() => areas.filter((a) => (zoneId === "all" || a.zoneId === zoneId) && matchQuery(a)), [areas, zoneId, q, idx]); // eslint-disable-line react-hooks/exhaustive-deps
  const matches = (a: Area) => scoped.includes(a) && (status === "all" || idx.statusOfArea(a) === status);
  const visible = scoped.filter(matches);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("พื้นที่เช่า")}
        subtitle={t("ผังล็อก {n} พื้นที่ · สีบอกสถานะสัญญา (ชุดสีเดียวกับเครื่อง Handheld)", { n: areas.length })}
        icon={Store}
        actions={
          <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
            {(
              [
                ["plan", MapIcon, t("Floorplans แผนผังพื้นที่")],
                ["grid", LayoutGrid, t("มุมมองการ์ด")],
              ] as const
            ).map(([v, Icon, label]) => (
              <button key={v} type="button" onClick={() => setView(v)} className={cn("flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold", view === v ? "bg-leaf-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
        }
      />

      <Panel bodyClass="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            className="flex-1 border-b-0"
            value={zoneId}
            onChange={setZoneId}
            items={[{ value: "all", label: t("โซน ทั้งหมด"), count: areas.length }, ...zones.map((z) => ({ value: z.id, label: d(z.name).replace(/^(โซน|Zone)\s*/, ""), count: areas.filter((a) => a.zoneId === z.id).length }))]}
          />
          <SearchInput value={query} onChange={setQuery} placeholder={t("ค้นหา: ล็อก / ร้าน / ผู้เช่า")} className="w-64" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip label={t("ทั้งหมด")} count={scoped.length} active={status === "all"} onClick={() => setStatus("all")} />
          {statusOrder.map((s) => (
            <Chip key={s} status={s} label={t(statusLabelTh[s])} count={scoped.filter((a) => idx.statusOfArea(a) === s).length} active={status === s} onClick={() => setStatus(s)} />
          ))}
        </div>
      </Panel>

      {view === "plan" ? (
        <FloorPlan matches={matches} onPick={(id) => openDrawer(<AreaDrawer areaId={id} />)} />
      ) : (
        <div className="grid grid-cols-6 gap-3">
          {visible.map((a) => {
            const st = idx.statusOfArea(a);
            const p = statusPalette[st];
            const c = idx.contractByArea.get(a.id);
            const cust = c ? idx.customerById.get(c.customerId) : undefined;
            return (
              <button key={a.id} type="button" onClick={() => openDrawer(<AreaDrawer areaId={a.id} />)} className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold" style={{ background: p.bg, color: p.strong }}>
                  <span>{t(statusLabelTh[st])}</span>
                  <span className="flex gap-1">
                    {c?.cancelDate && <span className="rounded bg-slate-700 px-1 text-[9px] text-white">CC</span>}
                    {a.maintenance > 0 && <Wrench className="size-3.5 text-red-600" />}
                  </span>
                </div>
                <div className="px-3 pb-3 pt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[19px] font-bold text-slate-900">{a.name}</span>
                    <span className="text-[11px] text-slate-400">{a.code}</span>
                  </div>
                  <div className="mt-1 truncate text-[12px] font-semibold text-slate-700">{cust ? d(cust.shop) : t("ว่าง พร้อมให้เช่า")}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      ฿{money(a.rate)}/{a.term === "daily" ? t("วัน") : t("เดือน")}
                    </span>
                    {c && <span>{shortDate(c.end, lang)}</span>}
                  </div>
                </div>
                <div className="h-1" style={{ background: p.fg }} />
              </button>
            );
          })}
          {visible.length === 0 && <div className="col-span-6 rounded-xl bg-white py-12 text-center text-slate-500">{t("ไม่พบข้อมูล")}</div>}
        </div>
      )}
    </div>
  );
}

function Chip({ label, count, active, status, onClick }: { label: string; count: number; active: boolean; status?: AreaStatus; onClick: () => void }) {
  const p = status ? statusPalette[status] : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition", !active && "border-slate-200 bg-white text-slate-600 hover:border-slate-300")}
      style={active ? { background: p?.bg ?? "#E6F2D6", borderColor: p?.fg ?? "#6E9B3E", color: p?.strong ?? "#2E4219" } : undefined}
    >
      {p && <span className="size-2.5 rounded-full" style={{ background: p.fg }} />}
      {label}
      <span className="rounded-full bg-black/5 px-1.5 text-[11px]">{count}</span>
    </button>
  );
}

/** แผนผังพื้นที่ — วาดโซน/ล็อกจากพิกัดในข้อมูล (แบบเดียวกับ Floorplans ของระบบจริง) */
function FloorPlan({ matches, onPick }: { matches: (a: Area) => boolean; onPick: (id: string) => void }) {
  const { t, d } = useAdmin();
  const zones = useDemoStore((s) => s.zones);
  const areas = useDemoStore((s) => s.areas);
  const idx = useDemoIndex();
  const [tip, setTip] = useState<{ x: number; y: number; area: Area } | null>(null);
  const W = 870;
  const H = 600;

  const tipArea = tip?.area;
  const tipContract = tipArea ? idx.contractByArea.get(tipArea.id) : undefined;
  const tipCustomer = tipContract ? idx.customerById.get(tipContract.customerId) : undefined;

  return (
    <Panel
      title={t("Floorplans แผนผังพื้นที่")}
      subtitle={t("แตะล็อกเพื่อดูรายละเอียด สัญญา และรับชำระ")}
      actions={
        <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
          {statusOrder.map((s) => (
            <span key={s} className="flex items-center gap-1 text-[11px] text-slate-600">
              <span className="size-2.5 rounded-sm" style={{ background: statusPalette[s].fg }} />
              {t(statusLabelTh[s])}
            </span>
          ))}
        </div>
      }
    >
      <div className="relative" onPointerLeave={() => setTip(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[#F7F7F2]" role="img" aria-label={t("แผนผังพื้นที่")}>
          <defs>
            <pattern id="plan-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="#E7E6DE" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#plan-grid)" />
          {/* ทางเดิน */}
          <rect x="20" y="206" width={W - 40} height="30" rx="6" fill="#EDEBE3" />
          <text x={W / 2} y="225" textAnchor="middle" fontSize="11" fill="#9A988F" letterSpacing="2">
            {t("ทางเดินหลัก")}
          </text>
          <rect x="20" y="414" width={W - 40} height="22" rx="6" fill="#EDEBE3" />
          <rect x="474" y="20" width="12" height="400" rx="4" fill="#EDEBE3" />
          {/* ทางเข้า */}
          <g transform={`translate(${W / 2 - 60}, ${H - 34})`}>
            <rect width="120" height="26" rx="13" fill="#2E4219" />
            <text x="60" y="17" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">
              ▲ {t("ทางเข้า")}
            </text>
          </g>

          {zones.map((z) => {
            const za = areas.filter((a) => a.zoneId === z.id);
            const cols = Math.max(...za.map((a) => a.slot.col)) + 1;
            const rows = Math.max(...za.map((a) => a.slot.row)) + 1;
            const pad = 10;
            const head = 24;
            const gap = 6;
            const tw = (z.plan.w - pad * 2 - gap * (cols - 1)) / cols;
            const th = (z.plan.h - head - pad - gap * (rows - 1)) / rows;
            return (
              <g key={z.id}>
                <rect x={z.plan.x} y={z.plan.y} width={z.plan.w} height={z.plan.h} rx="12" fill="#FFFFFF" stroke="#DCDAD0" />
                <text x={z.plan.x + 12} y={z.plan.y + 17} fontSize="12" fontWeight="700" fill="#2B2F36">
                  {d(z.name)}
                </text>
                {za.map((a) => {
                  const st = idx.statusOfArea(a);
                  const p = statusPalette[st];
                  const x = z.plan.x + pad + a.slot.col * (tw + gap);
                  const y = z.plan.y + head + a.slot.row * (th + gap);
                  const on = matches(a);
                  return (
                    <g
                      key={a.id}
                      className="cursor-pointer"
                      opacity={on ? 1 : 0.18}
                      tabIndex={0}
                      role="button"
                      aria-label={`${a.name} ${t(statusLabelTh[st])}`}
                      onClick={() => onPick(a.id)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPick(a.id)}
                      onPointerMove={() => setTip({ x: x + tw / 2, y, area: a })}
                      onFocus={() => setTip({ x: x + tw / 2, y, area: a })}
                    >
                      <rect x={x} y={y} width={tw} height={th} rx="5" fill={p.bg} stroke={tip?.area.id === a.id ? p.strong : p.border} strokeWidth={tip?.area.id === a.id ? 2 : 1} />
                      <rect x={x} y={y + th - 4} width={tw} height="4" fill={p.fg} />
                      <text x={x + tw / 2} y={y + th / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={tw < 40 ? 10 : 11.5} fontWeight="700" fill="#0F172A">
                        {a.name}
                      </text>
                      {a.maintenance > 0 && <circle cx={x + tw - 5} cy={y + 5} r="4.5" fill="#DC2626" stroke="#fff" strokeWidth="1.5" />}
                      {idx.contractByArea.get(a.id)?.cancelDate && <circle cx={x + 5} cy={y + 5} r="4.5" fill="#334155" stroke="#fff" strokeWidth="1.5" />}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        {tipArea && tip && (
          <div className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-full rounded-xl border border-slate-200 bg-white p-3 text-[12px] shadow-xl" style={{ left: `${(tip.x / W) * 100}%`, top: `calc(${(tip.y / H) * 100}% - 8px)` }}>
            <div className="flex items-center justify-between">
              <b className="text-[14px]">{tipArea.name}</b>
              <Badge tone="slate">{tipArea.code}</Badge>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-slate-600">
              <span className="size-2 rounded-full" style={{ background: statusPalette[idx.statusOfArea(tipArea)].fg }} />
              {t(statusLabelTh[idx.statusOfArea(tipArea)])}
            </div>
            <div className="mt-1 truncate font-semibold text-slate-800">{tipCustomer ? d(tipCustomer.shop) : t("ว่าง พร้อมให้เช่า")}</div>
            <div className="text-slate-500">
              ฿{money(tipArea.rate)} / {tipArea.term === "daily" ? t("วัน") : t("เดือน")} · {tipArea.sizeSqm} {t("ตร.ม.")}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
