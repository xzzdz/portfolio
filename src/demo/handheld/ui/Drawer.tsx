"use client";

import { ChevronRight, Languages, LogOut, Palette } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDemoStore } from "../../store";
import { useApp } from "../AppContext";
import { hLanguages } from "../i18n";
import { navItems } from "../icons";
import { Flag } from "./Flag";
import { LanguageDialog, ThemeSheet } from "./Pickers";

export function Drawer() {
  const { drawerOpen, setDrawerOpen, route, root, t, d, staff, lang, openDialog, openSheet, logout } = useApp();
  const market = useDemoStore((s) => s.market);
  if (!drawerOpen) return null;

  const sections = ["", "งานเช่า", "การเงิน", "ตั้งค่า"] as const;
  const initials = d(staff).slice(0, 1);
  const langInfo = hLanguages.find((l) => l.code === lang)!;

  return (
    <div className="absolute inset-0 z-50">
      <button type="button" aria-label="close" className="absolute inset-0 animate-fade-in bg-slate-950/45" onClick={() => setDrawerOpen(false)} />
      <aside className="absolute inset-y-0 left-0 flex w-[82%] animate-drawer flex-col bg-white shadow-2xl">
        <div className="shrink-0 bg-linear-to-br from-[#0F52BA] to-[#002366] px-5 pb-5 pt-6 text-white">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full border-2 border-white/40 bg-white/20 text-[20px] font-bold">{initials}</span>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold">{d(staff)}</div>
              <div className="truncate text-[11.5px] text-white/80">{t("พนักงานเก็บเงิน (Handheld)")}</div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 truncate text-[13px] font-bold">{d(market.name)}</div>
              <span className="shrink-0 rounded bg-white/20 px-1.5 py-px text-[9px] font-bold tracking-wider">DEMO</span>
            </div>
            <div className="text-[11px] text-white/75">{d(market.branch)}</div>
          </div>
        </div>

        <nav className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {sections.map((section) => (
            <div key={section || "root"} className="mb-1">
              {section && <div className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{t(section)}</div>}
              {navItems
                .filter((n) => n.section === section)
                .map((n) => {
                  const active = route.name === n.screen || (n.screen === "history" && route.name === "history");
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.label}
                      type="button"
                      onClick={() => root(n.screen, n.params)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition",
                        active ? "bg-[#EFF6FF] text-[#0F52BA]" : "text-slate-700 active:bg-slate-100",
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      <span className="flex-1">{t(n.label)}</span>
                      {active && <span className="size-1.5 rounded-full bg-[#0F52BA]" />}
                    </button>
                  );
                })}
            </div>
          ))}

          <div className="mt-2 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => openDialog(<LanguageDialog />)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-slate-700 active:bg-slate-100">
              <Languages className="size-5" />
              <span className="flex-1 text-left">{t("ภาษา")}</span>
              <Flag lang={lang} size={18} />
              <span className="text-[12px] text-slate-500">{langInfo.label}</span>
              <ChevronRight className="size-4 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                openSheet(<ThemeSheet />);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-slate-700 active:bg-slate-100"
            >
              <Palette className="size-5" />
              <span className="flex-1 text-left">{t("ปรับแต่งธีมพื้นหลัง")}</span>
              <ChevronRight className="size-4 text-slate-400" />
            </button>
          </div>
        </nav>

        <div className="shrink-0 border-t border-slate-100 px-3 py-3">
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-red-600 active:bg-red-50">
            <LogOut className="size-5" />
            {t("ออกจากระบบ")}
          </button>
          <div className="px-3 pt-1 text-[10.5px] text-slate-400">Chaoperty Handheld v2.0.0 · Sunmi V2</div>
        </div>
      </aside>
    </div>
  );
}
