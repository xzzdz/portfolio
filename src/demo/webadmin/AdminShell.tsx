"use client";

import {
  BadgeCheck,
  Bell,
  Building2,
  ChartColumn,
  ChevronDown,
  CircleCheck,
  Contact,
  Info,
  LayoutDashboard,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Store,
  TriangleAlert,
  Users,
  Wallet,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useDemoStore } from "../store";
import { useAdmin, type AdminPage } from "./AdminContext";
import { AccountPage } from "./pages/AccountPage";
import { AreaPage } from "./pages/AreaPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ManagePage } from "./pages/ManagePage";
import { RegistryPage } from "./pages/RegistryPage";
import { ReportPage } from "./pages/ReportPage";
import { SettingPage } from "./pages/SettingPage";
import { TenantPage } from "./pages/TenantPage";
import { VerifyPage } from "./pages/VerifyPage";

export const adminMenu: { page: AdminPage; label: string; route: string; icon: LucideIcon }[] = [
  { page: "home", label: "หน้าหลัก", route: "หน้าหลัก", icon: LayoutDashboard },
  { page: "area", label: "พื้นที่เช่า", route: "พื้นที่เช่า", icon: Store },
  { page: "tenant", label: "ผู้เช่า", route: "ผู้เช่า", icon: Users },
  { page: "account", label: "บัญชี", route: "บัญชี", icon: Wallet },
  { page: "verify", label: "ตรวจสอบการชำระเงิน", route: "ตรวจสอบการชำระเงิน", icon: BadgeCheck },
  { page: "manage", label: "จัดการ", route: "จัดการ", icon: Wrench },
  { page: "report", label: "รายงาน", route: "รายงาน", icon: ChartColumn },
  { page: "registry", label: "ทะเบียน", route: "ทะเบียน", icon: Contact },
  { page: "setting", label: "ตั้งค่า", route: "ตั้งค่า", icon: Settings },
];

const pages: Record<AdminPage, () => React.ReactNode> = {
  home: DashboardPage,
  area: AreaPage,
  tenant: TenantPage,
  account: AccountPage,
  verify: VerifyPage,
  manage: ManagePage,
  report: ReportPage,
  registry: RegistryPage,
  setting: SettingPage,
};

export function AdminShell() {
  const { page, sidebarOpen, drawer, closeDrawer, modal, closeModal } = useAdmin();
  const Page = pages[page];
  useSlipReader();
  return (
    <div className="flex h-full flex-col bg-[#EDEFF3] font-sans text-slate-800">
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <Sidebar />
        <main className={cn("thin-scroll min-w-0 flex-1 overflow-y-auto px-6 py-5 transition-[padding]", !sidebarOpen && "pl-6")}>
          <div key={page} className="animate-fade-in">
            <Page />
          </div>
        </main>

        {drawer && (
          <div className="absolute inset-0 z-30">
            <button type="button" aria-label="close" onClick={closeDrawer} className="absolute inset-0 animate-fade-in bg-slate-900/25" />
            <aside className="absolute inset-y-0 right-0 w-[460px] max-w-[92%] animate-[push-in_220ms_ease-out] border-l border-slate-200 bg-white shadow-2xl">{drawer}</aside>
          </div>
        )}
        {modal && (
          <div className="absolute inset-0 z-40 grid place-items-center p-6">
            <button type="button" aria-label="close" onClick={closeModal} className="absolute inset-0 animate-fade-in bg-slate-900/40" />
            <div className={cn("relative flex max-h-full w-full animate-pop flex-col overflow-hidden rounded-2xl bg-white shadow-2xl", modal.xl ? "h-full max-w-[1060px]" : modal.wide ? "max-w-[920px]" : "max-w-[520px]")}>{modal.node}</div>
          </div>
        )}
        <Toasts />
      </div>
    </div>
  );
}

/**
 * สลิปที่แนบเข้ามาใช้เวลาอ่านราว 15 วินาที — ตั้งเวลาให้ store ใส่ผลตรวจเมื่อถึงกำหนด
 * (เปิดเว็บแอดมินทีหลังก็ประมวลผลรายการที่เลยเวลาไปแล้วทันที)
 */
function useSlipReader() {
  const approvals = useDemoStore((s) => s.approvals);
  const settle = useDemoStore((s) => s.settleApprovals);
  const nextAt = approvals.reduce<number | null>((min, a) => (a.status === "pending" && a.estimatedAt ? Math.min(min ?? Infinity, Date.parse(a.estimatedAt)) : min), null);
  useEffect(() => {
    if (nextAt === null) return;
    const timer = window.setTimeout(settle, Math.max(0, nextAt - Date.now()) + 50);
    return () => window.clearTimeout(timer);
  }, [nextAt, settle]);
}

function TopBar() {
  const { t, d, lang, setLang, toggleSidebar, sidebarOpen, staff, toast, go } = useAdmin();
  const market = useDemoStore((s) => s.market);
  const users = useDemoStore((s) => s.staff);
  const intents = useDemoStore((s) => s.intents);
  const approvals = useDemoStore((s) => s.approvals);
  const [showUsers, setShowUsers] = useState(false);
  const online = users.filter((u) => u.lastSeenMinutes <= 15);
  const pendingQr = intents.filter((i) => i.status === "pending").length;
  const slips = approvals.filter((a) => a.status === "pending").length;
  const pending = pendingQr + slips;

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 bg-[linear-gradient(90deg,#7DAE4B,#8DB95A_40%,#9AC76A)] px-3 text-white shadow-[0_2px_8px_rgba(46,66,25,0.25)]">
      <button type="button" onClick={toggleSidebar} className="grid size-9 place-items-center rounded-lg hover:bg-white/15" aria-label={sidebarOpen ? t("ซ่อนเมนู") : t("แสดงเมนู")} title={sidebarOpen ? t("ซ่อนเมนู") : t("แสดงเมนู")}>
        {sidebarOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
      </button>
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-full bg-white text-leaf-700 shadow">
          <Building2 className="size-5" />
        </span>
        <div className="leading-tight">
          <div className="text-[16px] font-bold tracking-tight">Chaoperty</div>
          <div className="text-[10.5px] font-medium text-white/85">Property Manager</div>
        </div>
        <span className="ml-1 rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wider">DEMO</span>
      </div>

      <button type="button" onClick={() => toast(t("สาขาเดียวในบัญชีนี้"), "info")} className="ml-4 flex h-9 items-center gap-2 rounded-xl bg-white/15 px-3 text-[13px] font-semibold ring-1 ring-white/25 hover:bg-white/20">
        <MapPin className="size-4" />
        {d(market.name)} · {d(market.branch)}
        <ChevronDown className="size-4 opacity-70" />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button type="button" onClick={() => setShowUsers(!showUsers)} className="flex h-9 items-center gap-2 rounded-xl px-2.5 text-[12.5px] font-semibold hover:bg-white/15">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-white" />
            </span>
            {t("ผู้ใช้งานระบบขณะนี้")} {online.length}
          </button>
          {showUsers && (
            <div className="absolute right-0 top-11 w-[300px] animate-pop rounded-2xl border border-slate-200 bg-white p-3 text-slate-800 shadow-2xl">
              <div className="mb-2 text-[13px] font-bold">{t("ผู้ใช้งานระบบขณะนี้")}</div>
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-2.5 py-1.5">
                  <span className={cn("size-2.5 rounded-full", u.lastSeenMinutes <= 1 ? "bg-emerald-500" : u.lastSeenMinutes <= 15 ? "bg-red-500" : "bg-slate-300")} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold">{d(u.name)}</div>
                    <div className="truncate text-[11px] text-slate-500">
                      {d(u.role)} · {u.device === "handheld" ? "Handheld" : "Web"}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500">{u.lastSeenMinutes <= 1 ? t("ออนไลน์ภายใน 1 นาที") : t("ใช้งานเมื่อ {m} นาทีที่แล้ว", { m: u.lastSeenMinutes })}</span>
                </div>
              ))}
              <p className="mt-2 border-t border-slate-100 pt-2 text-[10.5px] leading-relaxed text-slate-500">
                {t("**หมายเหตุ : สีเขียว กำลังใช้งาน (ไม่เกิน 1 นาที) , สีแดง ใช้งานล่าสุด (ไม่เกิน 15 นาที)")}
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            if (slips) {
              go("verify");
              toast(t("สลิปรอตรวจสอบ {n} รายการ", { n: slips }), "info");
            } else toast(pendingQr ? t("มีรายการรอชำระ {n} รายการ", { n: pendingQr }) : t("ไม่มีการแจ้งเตือนใหม่"), "info");
          }}
          className="relative grid size-9 place-items-center rounded-xl hover:bg-white/15"
          aria-label={t("แจ้งเตือน")}
        >
          <Bell className="size-5" />
          {pending > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-red-500 text-[9.5px] font-bold">{pending}</span>}
        </button>
        <div className="flex h-8 overflow-hidden rounded-lg bg-white/15 text-[11.5px] font-bold ring-1 ring-white/25">
          {(["th", "en"] as const).map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} className={cn("px-2.5", lang === l ? "bg-white text-leaf-800" : "hover:bg-white/10")}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="ml-1 flex items-center gap-2 rounded-xl px-1.5 py-1">
          <span className="grid size-8 place-items-center rounded-full bg-white/90 text-[13px] font-bold text-leaf-800">{d(staff).slice(0, 1)}</span>
          <div className="hidden leading-tight xl:block">
            <div className="text-[12.5px] font-semibold">{d(staff)}</div>
            <div className="text-[10.5px] text-white/80">{t("แอดมิน")}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  const { t, page, go, sidebarOpen } = useAdmin();
  const today = useDemoStore((s) => s.today);
  return (
    <nav className={cn("flex shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200", sidebarOpen ? "w-[212px]" : "w-[64px]")}>
      <div className={cn("px-3 pb-1 pt-4 text-[10.5px] font-bold uppercase tracking-wider text-slate-400", !sidebarOpen && "text-center")}>{sidebarOpen ? t("เมนูหลัก") : "•••"}</div>
      <ul className="flex-1 space-y-0.5 px-2">
        {adminMenu.map((m) => {
          const active = m.page === page;
          return (
            <li key={m.page}>
              <button
                type="button"
                onClick={() => go(m.page)}
                title={t(m.label)}
                className={cn(
                  "group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[13.5px] font-semibold transition",
                  active ? "bg-[#E7F5D3] text-leaf-900 shadow-[inset_3px_0_0_#6E9B3E]" : "text-slate-600 hover:bg-slate-100",
                  !sidebarOpen && "justify-center px-0",
                )}
              >
                <m.icon className={cn("size-[19px] shrink-0", active ? "text-leaf-700" : "text-slate-400 group-hover:text-slate-600")} />
                {sidebarOpen && <span className="truncate">{t(m.label)}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {sidebarOpen && (
        <div className="m-3 rounded-xl bg-[#F4F4EC] p-3 text-[11px] leading-relaxed text-slate-500">
          <div className="font-bold text-slate-700">Chaoperty Web Admin</div>
          <div>Flutter Web · v1.0 · DEMO</div>
          <div className="mt-1 text-slate-400">{today}</div>
        </div>
      )}
    </nav>
  );
}

const toastIcon = { success: CircleCheck, info: Info, warning: TriangleAlert, error: XCircle };
const toastColor = { success: "text-emerald-400", info: "text-sky-400", warning: "text-amber-400", error: "text-red-400" };

function Toasts() {
  const { toasts } = useAdmin();
  return (
    <div className="pointer-events-none absolute right-4 top-3 z-50 flex flex-col items-end gap-2">
      {toasts.map((x) => {
        const Icon = toastIcon[x.type];
        return (
          <div key={x.id} className="flex max-w-[360px] animate-[rise_260ms_ease-out] items-center gap-2.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-[12.5px] font-medium text-white shadow-xl">
            <Icon className={cn("size-4 shrink-0", toastColor[x.type])} />
            {x.text}
          </div>
        );
      })}
    </div>
  );
}
