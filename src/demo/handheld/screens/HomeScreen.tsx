"use client";

import { Building2, ChevronDown, Menu, Pencil, QrCode, ScanLine, Search, Store, User, Zap } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useApp } from "../AppContext";
import { hLanguages } from "../i18n";
import { appIcons } from "../icons";
import { themeBackground, themes } from "../themes";
import type { RouteParams, ScreenName } from "../types";
import { Flag } from "../ui/Flag";
import { LanguageDialog } from "../ui/Pickers";
import { ScannerSheet } from "./ScannerSheet";

type QuickAction = {
  id: string;
  title: string;
  subtitle: string;
  icon: (typeof appIcons)[keyof typeof appIcons];
  colors: [string, string];
  screen: ScreenName;
  params?: RouteParams;
};

const ACTIONS: QuickAction[] = [
  { id: "area", title: "พื้นที่เช่า", subtitle: "Stall & Zone Overview", icon: appIcons.area, colors: ["#059669", "#047857"], screen: "area" },
  { id: "tenant", title: "ผู้เช่า", subtitle: "Tenant Database", icon: appIcons.tenant, colors: ["#7C3AED", "#6D28D9"], screen: "tenant" },
  { id: "invoice", title: "ประวัติวางบิล", subtitle: "Billing History", icon: appIcons.billing, colors: ["#0284C7", "#0369A1"], screen: "history", params: { tab: "billing" } },
  { id: "history", title: "ประวัติการชำระเงิน", subtitle: "Payment History & Records", icon: appIcons.paymentHistory, colors: ["#EC4899", "#DB2777"], screen: "history", params: { tab: "payment" } },
  { id: "payment", title: "ชำระบิล", subtitle: "Payment & Receipts", icon: appIcons.payBill, colors: ["#2563EB", "#1D4ED8"], screen: "payment" },
  { id: "meter", title: "มิเตอร์น้ำไฟฟ้า", subtitle: "Water & Electric Meters", icon: appIcons.meter, colors: ["#0891B2", "#0E7490"], screen: "meter" },
];

const SCANNER_STYLES: { name: string; colors: string[] }[] = [
  { name: "Royal Sapphire", colors: ["#0F52BA", "#002366"] },
  { name: "Aurora Teal", colors: ["#0D9488", "#0284C7", "#0F52BA"] },
  { name: "Neon Mesh", colors: ["#8B5CF6", "#EC4899", "#3B82F6"] },
  { name: "Emerald Sage", colors: ["#059669", "#064E3B"] },
  { name: "Sunset Amber", colors: ["#D97706", "#78350F"] },
  { name: "Midnight Dark", colors: ["#1E293B", "#0F172A"] },
];

export function HomeScreen() {
  const { t, d, lang, theme, setDrawerOpen, openDialog, openSheet, go, scan, setScan, notify } = useApp();
  const market = useDemoStore((s) => s.market);
  const th = themes[theme];
  const dark = th.dark;
  const langInfo = hLanguages.find((l) => l.code === lang)!;

  const [order, setOrder] = useState(ACTIONS.map((a) => a.id));
  const [editMode, setEditMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [styleIdx, setStyleIdx] = useState(0);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  useEffect(() => () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
  }, []);

  const actions = order.map((id) => ACTIONS.find((a) => a.id === id)!);

  function onCardPointerDown(e: ReactPointerEvent, id: string) {
    longPressed.current = false;
    if (editMode) {
      setDragId(id);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      setEditMode(true);
      notify(t("โหมดจัดเรียงเมนู"), t("ลากสลับตำแหน่งเมนูตามต้องการ แล้วกดเสร็จสิ้น"), "info");
    }, 520);
  }

  function onCardPointerMove(e: ReactPointerEvent) {
    if (!dragId) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-card]");
    setOverId(el?.dataset.card && el.dataset.card !== dragId ? el.dataset.card : null);
  }

  function onCardPointerUp() {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    if (dragId) {
      if (overId) {
        const next = [...order];
        const a = next.indexOf(dragId);
        const b = next.indexOf(overId);
        [next[a], next[b]] = [next[b], next[a]];
        setOrder(next);
        notify(t("สลับตำแหน่งเมนูสำเร็จ"), t("สลับตำแหน่งเมนู \"{title}\" เรียบร้อยแล้ว", { title: t(ACTIONS.find((x) => x.id === dragId)!.title) }), "info");
      }
      setDragId(null);
      setOverId(null);
    }
  }

  const scannerColors = styleIdx === 0 && theme !== "aurora" && theme !== "slate" ? [themes[theme].orbs[0], "#0F172A"] : SCANNER_STYLES[styleIdx].colors;

  return (
    <div className="thin-scroll h-full overflow-y-auto" style={{ background: themeBackground(theme) }} onClick={() => editMode && !dragId && setEditMode(false)}>
      <div className="px-5 pb-6 pt-3">
        {/* หัวจอ : ปุ่มเมนู + ชื่อตลาด + เลือกภาษา */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t("เมนู")}
            className={cn("grid size-10 shrink-0 place-items-center rounded-xl border", dark ? "border-white/20 bg-white/10 text-white" : "border-slate-200 bg-white text-slate-900")}
          >
            <Menu className="size-[22px]" />
          </button>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0F52BA] text-white shadow-[0_3px_8px_rgba(15,82,186,0.3)]">
            <Building2 className="size-5" />
          </span>
          <div className="min-w-0 flex-1 pl-0.5">
            <div className={cn("truncate text-[17px] font-bold leading-tight tracking-tight", dark ? "text-white" : "text-slate-900")}>{d(market.name)}</div>
            <div className={cn("flex items-center gap-1 whitespace-nowrap text-[10px] font-medium", dark ? "text-white/70" : "text-slate-500")}>
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Chaoperty Handheld
              <span className={cn("ml-0.5 rounded px-1 py-px text-[8.5px] font-bold tracking-wider", dark ? "bg-white/15 text-white" : "bg-[#0F52BA]/10 text-[#0F52BA]")}>DEMO</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openDialog(<LanguageDialog />)}
            className={cn("flex h-8 shrink-0 items-center gap-1 rounded-2xl border px-2 text-[11px] font-bold shadow-sm", dark ? "border-white/20 bg-white/10 text-white" : "border-slate-200 bg-white text-slate-900")}
          >
            <Flag lang={lang} size={16} />
            {langInfo.short}
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => go("area", { focus: "search" })}
          className={cn("mt-3.5 flex w-full items-center gap-2 rounded-[20px] border px-3.5 py-[11px] text-left shadow-[0_3px_10px_rgba(0,0,0,0.04)]", dark ? "border-white/15 bg-white/10" : "border-white/60 bg-white/75")}
        >
          <Search className={cn("size-[18px]", dark ? "text-white/70" : "text-slate-500")} />
          <span className={cn("text-[13px] font-medium", dark ? "text-white/60" : "text-slate-400")}>{t("ค้นหาเมนู หรือ ล็อกเช่า...")}</span>
        </button>

        {/* การ์ดสแกน */}
        <ScannerCard
          colors={scannerColors}
          onOpen={() => openSheet(<ScannerSheet />, { tall: true })}
          onCycleStyle={() => {
            const next = (styleIdx + 1) % SCANNER_STYLES.length;
            setStyleIdx(next);
            notify(t("ปรับแต่งสไตล์การ์ดสแกนเนอร์ 🎨"), SCANNER_STYLES[next].name, "info");
          }}
          scanned={scan}
          onClear={() => setScan(null)}
        />

        <div className="mb-3.5 mt-6 flex items-center justify-between">
          <span className={cn("text-[15px] font-bold", dark ? "text-white" : "text-slate-800")}>Quick Actions</span>
          {editMode ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditMode(false);
              }}
              className="rounded-2xl bg-linear-to-br from-[#0F52BA] to-[#002366] px-3.5 py-1 text-[12px] font-bold text-white shadow"
            >
              {t("เสร็จสิ้น")}
            </button>
          ) : (
            <span className={cn("text-[10.5px]", dark ? "text-white/50" : "text-slate-400")}>{t("กดค้างเพื่อจัดเรียง")}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {actions.map((a, i) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                type="button"
                data-card={a.id}
                onPointerDown={(e) => onCardPointerDown(e, a.id)}
                onPointerMove={onCardPointerMove}
                onPointerUp={onCardPointerUp}
                onPointerCancel={onCardPointerUp}
                onPointerLeave={() => pressTimer.current && window.clearTimeout(pressTimer.current)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!editMode && !longPressed.current) go(a.screen, a.params);
                }}
                onContextMenu={(e) => e.preventDefault()}
                style={editMode ? { animationDelay: `${(i % 2) * 140}ms` } : undefined}
                className={cn(
                  "relative flex aspect-[1.4] touch-none select-none flex-col justify-between rounded-[22px] border p-3.5 text-left shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition",
                  dark ? "border-white/15 bg-[#1E293B]" : "border-slate-200 bg-white",
                  editMode && "jiggle",
                  dragId === a.id && "opacity-40",
                  overId === a.id && "ring-[2.5px] ring-[#0F52BA]",
                  !editMode && "active:scale-[0.97]",
                )}
              >
                {editMode && (
                  <span className="absolute -left-1.5 -top-1.5 grid size-5 place-items-center rounded-full border-2 border-white bg-slate-500 text-[13px] font-bold leading-none text-white shadow">−</span>
                )}
                <span
                  className="grid size-[43px] place-items-center rounded-2xl text-white"
                  style={{ background: `linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})`, boxShadow: `0 3px 6px ${a.colors[0]}40` }}
                >
                  <Icon className="size-[22px]" />
                </span>
                <span className="min-w-0">
                  <span className={cn("block truncate text-[14px] font-extrabold tracking-tight", dark ? "text-white" : "text-slate-900")}>{t(a.title)}</span>
                  <span className={cn("block truncate text-[10px] font-semibold", dark ? "text-white/80" : "text-slate-600")}>{a.subtitle}</span>
                </span>
              </button>
            );
          })}
        </div>

        <TodayCard dark={dark} />
      </div>
    </div>
  );
}

function ScannerCard({
  colors,
  onOpen,
  onCycleStyle,
  scanned,
  onClear,
}: {
  colors: string[];
  onOpen: () => void;
  onCycleStyle: () => void;
  scanned: { code: string; areaId: string } | null;
  onClear: () => void;
}) {
  const { t, d, go } = useApp();
  const idx = useDemoIndex();
  const timer = useRef<number | null>(null);
  const long = useRef(false);
  const gradient = `linear-gradient(135deg, ${colors.join(", ")})`;

  const area = scanned ? idx.areaById.get(scanned.areaId) : undefined;
  const contract = area ? idx.contractByArea.get(area.id) : undefined;
  const customer = contract ? idx.customerById.get(contract.customerId) : undefined;

  if (scanned && area) {
    return (
      <div className="relative mt-5 overflow-hidden rounded-[24px] p-4 text-white shadow-[0_8px_22px_rgba(15,82,186,0.35)]" style={{ background: gradient }}>
        <CardPattern />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-white/90">
              <QrCode className="size-4" /> {t("ข้อมูลที่สแกนล่าสุด")}
            </span>
            <button type="button" onClick={onClear} className="rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-semibold">
              {t("ล้าง")}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 rounded-lg border border-white/25 bg-white/12 px-2 py-1 text-[11.5px] font-bold">#{" "}{t("รหัส: {activeQuery}", { activeQuery: scanned.code })}</span>
            <span className="flex items-center gap-1 rounded-lg border border-emerald-300/40 bg-emerald-500/20 px-2 py-1 text-[11.5px] font-bold text-emerald-200">
              <Store className="size-3.5" /> {t("ล็อค: {lockName}", { lockName: area.name })}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-white/90">
            <User className="size-3.5" />
            <span className="truncate">{t("ผู้เช่า: {tenantName}", { tenantName: customer ? d(customer.shop) : t("ว่าง") })}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={onOpen} className="flex items-center gap-1 rounded-xl border border-white/25 bg-white/12 px-3 py-1.5 text-[12px] font-bold">
              <Pencil className="size-3.5" /> {t("แก้ไข")}
            </button>
            <button
              type="button"
              disabled={!customer}
              onClick={() => customer && go("invoices", { customerId: customer.id })}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 py-1.5 text-[12px] font-bold shadow disabled:opacity-50"
            >
              <Zap className="size-4" /> {t("ไปหน้าชำระเงินด่วน")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onPointerDown={() => {
        long.current = false;
        timer.current = window.setTimeout(() => {
          long.current = true;
          onCycleStyle();
        }, 560);
      }}
      onPointerUp={() => timer.current && window.clearTimeout(timer.current)}
      onPointerLeave={() => timer.current && window.clearTimeout(timer.current)}
      onClick={() => !long.current && onOpen()}
      onContextMenu={(e) => e.preventDefault()}
      className="relative mt-5 w-full touch-none select-none overflow-hidden rounded-[24px] px-5 py-5 text-left text-white shadow-[0_8px_22px_rgba(15,82,186,0.35)] transition active:scale-[0.99]"
      style={{ background: gradient }}
    >
      <CardPattern />
      <span className="relative flex items-center gap-4">
        <span className="grid size-[58px] shrink-0 place-items-center rounded-full border-2 border-white/40 bg-white/20">
          <ScanLine className="size-7" />
        </span>
        <span className="min-w-0">
          <span className="block text-[16px] font-bold leading-tight">{t("สแกน QR / Barcode ล็อค")}</span>
          <span className="mt-1 block text-[12px] leading-snug text-white/85">{t("แตะเพื่อเปิดกล้องสแกนด่วน กรอกข้อมูลอัตโนมัติ")}</span>
          <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-[11.5px] font-bold shadow-[0_3px_8px_rgba(245,158,11,0.35)]">
            <QrCode className="size-3.5" /> {t("เริ่มสแกน")}
          </span>
        </span>
      </span>
    </button>
  );
}

/** ลายวงจรจางๆ บนการ์ดสแกน */
function CardPattern() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]" aria-hidden>
      <defs>
        <pattern id="hh-circuit" width="46" height="46" patternUnits="userSpaceOnUse">
          <path d="M0 23h14l6-6h12M23 0v10l6 6M46 30H32l-5 5v11" fill="none" stroke="white" strokeWidth="1.2" />
          <circle cx="32" cy="17" r="2" fill="white" />
          <circle cx="27" cy="35" r="2" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hh-circuit)" />
      <circle cx="92%" cy="-10%" r="90" fill="white" opacity="0.35" />
    </svg>
  );
}

/** สรุปงานวันนี้ของเครื่องนี้ — อ่านจาก "หลังบ้าน" เดียวกับเว็บแอดมิน */
function TodayCard({ dark }: { dark: boolean }) {
  const { t, go } = useApp();
  const receipts = useDemoStore((s) => s.receipts);
  const meters = useDemoStore((s) => s.meters);
  const today = useDemoStore((s) => s.today);
  const todays = receipts.filter((r) => r.paidAt.startsWith(today) && r.channel === "handheld");
  const total = todays.reduce((sum, r) => sum + r.total, 0);
  const period = today.slice(0, 7);
  const cycle = meters.filter((m) => m.period.startsWith(period));
  const done = cycle.filter((m) => m.current !== null).length;
  const pct = cycle.length ? Math.round((done / cycle.length) * 100) : 0;

  return (
    <div className={cn("mt-5 rounded-[22px] border p-4", dark ? "border-white/15 bg-white/10 text-white" : "border-slate-200 bg-white/85")}>
      <div className="flex items-center justify-between">
        <span className={cn("text-[13px] font-bold", dark ? "text-white" : "text-slate-800")}>{t("สรุปวันนี้ (เครื่องนี้)")}</span>
        <span className={cn("text-[10.5px]", dark ? "text-white/60" : "text-slate-400")}>{t("ซิงก์กับระบบหลังบ้าน")}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => go("history", { tab: "payment" })} className="text-left">
          <div className={cn("text-[11px]", dark ? "text-white/70" : "text-slate-500")}>{t("เก็บเงินแล้ว {n} รายการ", { n: todays.length })}</div>
          <div className="text-[18px] font-extrabold tracking-tight text-emerald-600">฿{money(total)}</div>
        </button>
        <button type="button" onClick={() => go("meter")} className="text-left">
          <div className={cn("text-[11px]", dark ? "text-white/70" : "text-slate-500")}>{t("จดมิเตอร์ {done}/{total}", { done, total: cycle.length })}</div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className={cn("mt-1 text-[11px] font-bold", dark ? "text-white" : "text-slate-700")}>{pct}%</div>
        </button>
      </div>
    </div>
  );
}
