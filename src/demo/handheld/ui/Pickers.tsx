"use client";

import { Check, CheckCircle2, MapPin, Palette } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDemoIndex } from "../../useIndex";
import { useDemoStore } from "../../store";
import { useApp } from "../AppContext";
import { hLanguages } from "../i18n";
import { themeBackground, themes } from "../themes";
import type { ThemeId } from "../types";
import { Flag } from "./Flag";
import { SheetFrame } from "./Overlays";

export function LanguageDialog() {
  const { lang, setLang, closeDialog, t, notify } = useApp();
  return (
    <div>
      <div className="mb-3 text-[16px] font-extrabold text-slate-900">{t("เลือกภาษา / Select Language")}</div>
      <div className="flex flex-col gap-1">
        {hLanguages.map((l) => {
          const selected = l.code === lang;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code);
                closeDialog();
                notify(l.label, undefined, "info");
              }}
              className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] transition", selected ? "bg-[#EFF6FF] font-bold text-[#0F52BA]" : "text-slate-800 active:bg-slate-100")}
            >
              <Flag lang={l.code} size={26} />
              <span className="flex-1">{l.label}</span>
              {selected && <CheckCircle2 className="size-5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ThemeSheet() {
  const { theme, setTheme, t, notify } = useApp();
  return (
    <SheetFrame title={t("ปรับแต่งธีมพื้นหลัง")} subtitle={t("ใช้กับหน้าหลักของแอป")} icon={Palette} iconTone="violet">
      <div className="grid grid-cols-2 gap-3 pb-2">
        {(Object.keys(themes) as ThemeId[]).map((id) => {
          const th = themes[id];
          const selected = id === theme;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTheme(id);
                notify(t("เปลี่ยนธีมสำเร็จ"), t("เปลี่ยนธีมพื้นหลังเป็น \"{name}\" เรียบร้อยแล้ว", { name: th.name }), "success");
              }}
              className={cn("relative h-24 overflow-hidden rounded-2xl border-2 text-left transition", selected ? "border-[#0F52BA]" : "border-slate-200")}
              style={{ background: themeBackground(id) }}
            >
              <span className={cn("absolute bottom-2 left-2.5 right-2.5 text-[11.5px] font-bold leading-tight", th.dark ? "text-white" : "text-slate-800")}>{t(th.label)}</span>
              {selected && (
                <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-[#0F52BA] text-white">
                  <Check className="size-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </SheetFrame>
  );
}

/** เลือกโซน — โซนทั้งหมด + จำนวนล็อกของแต่ละโซน */
export function ZoneSheet({ value, onPick }: { value: string; onPick: (zoneId: string) => void }) {
  const { t, d, closeSheet } = useApp();
  const zones = useDemoStore((s) => s.zones);
  const areas = useDemoStore((s) => s.areas);
  const idx = useDemoIndex();
  const options = [{ id: "all", name: t("โซนทั้งหมด"), count: areas.length, vacant: areas.filter((a) => idx.statusOfArea(a) === "vacant").length }].concat(
    zones.map((z) => {
      const za = areas.filter((a) => a.zoneId === z.id);
      return { id: z.id, name: d(z.name), count: za.length, vacant: za.filter((a) => idx.statusOfArea(a) === "vacant").length };
    }),
  );
  return (
    <SheetFrame title={t("เลือกโซนพื้นที่")} subtitle={t("พบทั้งหมด {count} รายการ", { count: zones.length })} icon={MapPin}>
      <div className="flex flex-col gap-2 pb-2">
        {options.map((o) => {
          const selected = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                onPick(o.id);
                closeSheet();
              }}
              className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition", selected ? "border-[#0F52BA] bg-[#EFF6FF]" : "border-slate-200 bg-white active:bg-slate-50")}
            >
              <span className={cn("grid size-9 place-items-center rounded-xl text-[13px] font-extrabold", selected ? "bg-[#0F52BA] text-white" : "bg-slate-100 text-slate-600")}>
                {o.id === "all" ? "∗" : o.id.replace("z-", "")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold text-slate-800">{o.name}</span>
                <span className="text-[12px] text-slate-500">
                  {t("{s} ล็อก", { s: o.count })} · {t("ว่าง {vacant}", { vacant: o.vacant })}
                </span>
              </span>
              {selected && <CheckCircle2 className="size-5 text-[#0F52BA]" />}
            </button>
          );
        })}
      </div>
    </SheetFrame>
  );
}
