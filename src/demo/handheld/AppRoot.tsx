"use client";

import { BatteryMedium, Home, QrCode, Signal, Undo2, Wallet, Wifi } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/cn";
import { useApp } from "./AppContext";
import { AreaScreen } from "./screens/AreaScreen";
import { ContractScreen } from "./screens/ContractScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { InvoicesScreen } from "./screens/InvoicesScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { MeterScreen } from "./screens/MeterScreen";
import { AccountScreen, CustomerScreen, PrintScreen } from "./screens/MiscScreens";
import { PaymentScreen } from "./screens/PaymentScreen";
import { ScannerSheet } from "./screens/ScannerSheet";
import { TenantScreen } from "./screens/TenantScreen";
import { Drawer } from "./ui/Drawer";
import { DialogHost, NoticeHost, SheetHost } from "./ui/Overlays";

const screens = {
  login: LoginScreen,
  home: HomeScreen,
  area: AreaScreen,
  tenant: TenantScreen,
  contract: ContractScreen,
  payment: PaymentScreen,
  invoices: InvoicesScreen,
  history: HistoryScreen,
  meter: MeterScreen,
  customer: CustomerScreen,
  account: AccountScreen,
  print: PrintScreen,
};

/** จอของเครื่อง : แถบสถานะ Android + หน้าปัจจุบัน + ชีต/แจ้งเตือน + ปุ่มนำทางล่าง */
export function AppRoot({ showSystemBars = true }: { showSystemBars?: boolean }) {
  const { route, depth, loggedIn } = useApp();
  const Screen = screens[route.name];
  return (
    <div className="flex h-full flex-col bg-black font-device text-slate-900 antialiased">
      {showSystemBars && <StatusBar dark={route.name === "login"} />}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#F1F5F9]">
        <div key={route.key} className={cn("h-full", depth > 1 && "animate-push-in")}>
          <Screen />
        </div>
        <SheetHost />
        <Drawer />
        <DialogHost />
        <NoticeHost />
        {loggedIn && <AssistiveTouch />}
      </div>
      {showSystemBars && <NavBar />}
    </div>
  );
}

function StatusBar({ dark }: { dark: boolean }) {
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const timer = window.setInterval(tick, 15_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className={cn("flex h-6 shrink-0 items-center justify-between px-3 text-[11.5px] font-semibold", dark ? "bg-[#0F52BA] text-white" : "bg-[#0B2E66] text-white")}>
      <span>{clock}</span>
      <span className="flex items-center gap-1.5">
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <span className="flex items-center gap-0.5">
          <BatteryMedium className="size-4" /> 84%
        </span>
      </span>
    </div>
  );
}

/** ปุ่มนำทางของ Android 7.1 : ย้อนกลับ / หน้าหลัก / แอปล่าสุด */
function NavBar() {
  const { back, root, loggedIn, notify, t } = useApp();
  return (
    <div className="flex h-10 shrink-0 items-center justify-around bg-black text-white/80">
      <button type="button" onClick={back} aria-label="Back" className="grid h-full w-20 place-items-center active:bg-white/10">
        <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
          <path d="M17 4L6 12l11 8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" onClick={() => loggedIn && root("home")} aria-label="Home" className="grid h-full w-20 place-items-center active:bg-white/10">
        <span className="size-[17px] rounded-full border-2 border-current" />
      </button>
      <button type="button" onClick={() => notify(t("แอปล่าสุด"), "Chaoperty Handheld", "info")} aria-label="Recent apps" className="grid h-full w-20 place-items-center active:bg-white/10">
        <span className="size-[15px] rounded-[3px] border-2 border-current" />
      </button>
    </div>
  );
}

/**
 * ปุ่มลอยแบบ AssistiveTouch — ลากไปวางขอบไหนก็ได้ (ต้องลากเกิน 14px ถึงขยับ
 * กันนิ้วสะกิดแล้วปุ่มกระเด็น) ไม่ได้แตะ 4 วินาทีจะจางลง
 */
function AssistiveTouch() {
  const { t, root, back, openSheet, go, route } = useApp();
  const [pos, setPos] = useState({ x: 0, y: 0, ready: false });
  const [open, setOpen] = useState(false);
  const [idle, setIdle] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<number | null>(null);

  const wake = () => {
    setIdle(false);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 4000);
  };

  useEffect(() => {
    const parent = box.current?.parentElement;
    if (parent) setPos({ x: parent.clientWidth - 56, y: parent.clientHeight * 0.76, ready: true });
    wake();
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, []);

  if (route.name === "login") return null;

  function onDown(e: ReactPointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false };
    wake();
  }
  function onMove(e: ReactPointerEvent) {
    const dg = drag.current;
    if (!dg) return;
    const zoom = box.current ? box.current.getBoundingClientRect().width / box.current.offsetWidth || 1 : 1;
    const dx = (e.clientX - dg.sx) / zoom;
    const dy = (e.clientY - dg.sy) / zoom;
    if (!dg.moved && Math.hypot(dx, dy) < 14) return;
    if (!dg.moved) setDragging(true);
    dg.moved = true;
    setPos((p) => ({ ...p, x: dg.ox + dx, y: dg.oy + dy }));
  }
  function onUp() {
    const dg = drag.current;
    drag.current = null;
    setDragging(false);
    const parent = box.current?.parentElement;
    if (!dg || !parent) return;
    if (!dg.moved) return setOpen((o) => !o);
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    setPos((p) => ({ ...p, x: p.x + 24 < w / 2 ? 8 : w - 56, y: Math.min(h - 70, Math.max(10, p.y)) }));
    wake();
  }

  const actions = [
    { icon: Home, label: t("หน้าหลัก"), run: () => root("home") },
    { icon: QrCode, label: t("สแกน"), run: () => openSheet(<ScannerSheet />, { tall: true }) },
    { icon: Wallet, label: t("ชำระบิล"), run: () => go("payment") },
    { icon: Undo2, label: t("ย้อนกลับ"), run: back },
  ];

  return (
    <>
      {open && <button type="button" aria-label="close" className="absolute inset-0 z-[55]" onClick={() => setOpen(false)} />}
      <div
        ref={box}
        className={cn("absolute z-[56] transition-opacity duration-500", !pos.ready && "opacity-0", idle && !open && "opacity-[0.42]", !dragging && "transition-[left,top,opacity]")}
        style={{ left: pos.x, top: pos.y }}
      >
        {open && (
          <div className={cn("absolute top-1/2 grid w-[196px] -translate-y-1/2 animate-pop grid-cols-2 gap-1.5 rounded-[22px] border border-white/10 bg-[#1C1C1E]/[0.97] p-2 shadow-2xl", pos.x > 150 ? "right-[60px]" : "left-[60px]")}>
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  a.run();
                }}
                className="flex flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold text-white active:bg-white/10"
              >
                <a.icon className="size-5" />
                {a.label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          aria-label="Assistive touch"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          className="grid size-12 touch-none place-items-center rounded-[16px] bg-[#2C2C2E]/[0.92] shadow-[0_6px_16px_rgba(0,0,0,0.35)]"
        >
          <span className="grid size-8 place-items-center rounded-full border-2 border-white/40">
            <span className="size-[18px] rounded-full bg-white/85" />
          </span>
        </button>
      </div>
    </>
  );
}
