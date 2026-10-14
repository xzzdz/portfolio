"use client";

import { Camera, Keyboard, ScanLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { invoiceState } from "../../selectors";
import { useApp } from "../AppContext";
import { Button, Segment } from "../ui/parts";
import { SheetFrame } from "../ui/Overlays";

/**
 * สแกน QR หน้าล็อก — แท็บกล้อง / กรอกเอง
 * แอปจริงสั่ง MobileScannerController.stop() ทุกครั้งที่ออกจากแท็บกล้อง (กล้องกินไฟ +500 mA)
 */
export function ScannerSheet() {
  const { t, d, closeSheet, setScan, notify } = useApp();
  const idx = useDemoIndex();
  const invoices = useDemoStore((s) => s.invoices);
  const today = useDemoStore((s) => s.today);
  const areas = useDemoStore((s) => s.areas);
  const [tab, setTab] = useState<"camera" | "manual">("camera");
  const [found, setFound] = useState<string | null>(null);

  // ล็อกที่มีผู้เช่าค้างชำระ — สแกนแล้วจะได้ลองกด "ไปหน้าชำระเงินด่วน" ต่อได้
  const candidates = useMemo(() => {
    const owing = new Set(invoices.filter((iv) => invoiceState(iv, today) !== "paid").map((iv) => iv.customerId));
    return areas.filter((a) => {
      const c = idx.contractByArea.get(a.id);
      return c?.kind === "contract" && owing.has(c.customerId);
    });
  }, [areas, idx, invoices, today]);

  const [manualArea, setManualArea] = useState(candidates[0]?.id ?? areas[0]?.id);

  useEffect(() => {
    if (tab !== "camera" || found) return;
    const timer = window.setTimeout(() => {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      if (pick) setFound(pick.id);
    }, 1900);
    return () => window.clearTimeout(timer);
  }, [tab, found, candidates]);

  useEffect(() => {
    if (!found) return;
    const area = idx.areaById.get(found);
    const timer = window.setTimeout(() => {
      setScan({ code: `LCK-${area?.code}`, areaId: found });
      closeSheet();
      notify(t("สแกนสำเร็จ"), t("สแกนและบันทึกข้อมูลเรียบร้อย: {code}", { code: `LCK-${area?.code}` }), "success");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [found, idx, setScan, closeSheet, notify, t]);

  const foundArea = found ? idx.areaById.get(found) : undefined;
  const occupied = areas.filter((a) => idx.contractByArea.get(a.id)?.kind === "contract");

  return (
    <SheetFrame title={t("สแกน QR / Barcode ล็อค")} subtitle={t("ข้อมูลจะถูกส่งต่อไปหน้าพื้นที่เช่าและชำระบิล")} icon={ScanLine}>
      <Segment
        value={tab}
        onChange={(v) => {
          setTab(v);
          setFound(null);
        }}
        options={[
          { value: "camera", label: t("กล้อง"), icon: Camera },
          { value: "manual", label: t("กรอกเอง"), icon: Keyboard },
        ]}
      />

      {tab === "camera" ? (
        <div className="mt-4">
          <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_30%_20%,#334155,#020617_70%)]">
            {/* ภาพ "หน้าล็อก" ที่กล้องเห็น */}
            <div className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-2 shadow-lg">
              <div className="grid aspect-square grid-cols-7 gap-[2px]">
                {Array.from({ length: 49 }, (_, i) => (
                  <span key={i} className={cn("rounded-[1px]", (i * 7 + (i % 5)) % 3 === 0 || [0, 1, 7, 8, 5, 6, 12, 13, 35, 36, 42, 43].includes(i) ? "bg-slate-900" : "bg-white")} />
                ))}
              </div>
              <div className="mt-1 text-center text-[9px] font-bold text-slate-700">{foundArea ? `LCK-${foundArea.code}` : "LCK-•••"}</div>
            </div>
            {/* กรอบเล็ง */}
            {["left-5 top-5 border-l-4 border-t-4 rounded-tl-xl", "right-5 top-5 border-r-4 border-t-4 rounded-tr-xl", "bottom-5 left-5 border-b-4 border-l-4 rounded-bl-xl", "bottom-5 right-5 border-b-4 border-r-4 rounded-br-xl"].map((c) => (
              <span key={c} className={cn("absolute size-10 border-white/90", c, found && "border-emerald-400")} />
            ))}
            {!found && <span className="absolute inset-x-8 h-0.5 animate-scan-line rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.8)]" />}
            <div className="absolute inset-x-0 bottom-3 text-center text-[12px] font-semibold text-white/85">
              {found ? t("พบ QR แล้ว — กำลังอ่านข้อมูล...") : t("เล็งกล้องไปที่ QR หน้าล็อก")}
            </div>
          </div>
          <p className="mt-3 text-center text-[11.5px] leading-relaxed text-slate-500">{t("กล้องจะปิดเองทันทีเมื่อสลับแท็บหรือปิดหน้านี้ เพื่อประหยัดแบตเตอรี่")}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-[12px] font-semibold text-slate-500">{t("เลือกล็อก")}</span>
            <select
              value={manualArea}
              onChange={(e) => setManualArea(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-800 outline-none focus:border-[#0F52BA]"
            >
              {occupied.map((a) => {
                const c = idx.contractByArea.get(a.id);
                const cust = c ? idx.customerById.get(c.customerId) : undefined;
                return (
                  <option key={a.id} value={a.id}>
                    {a.name} · {cust ? d(cust.shop) : ""}
                  </option>
                );
              })}
            </select>
          </label>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-[12px] text-slate-500">
            {t("รหัส")}: <b className="text-slate-800">LCK-{idx.areaById.get(manualArea)?.code}</b>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              const area = idx.areaById.get(manualArea);
              if (!area) return;
              setScan({ code: `LCK-${area.code}`, areaId: area.id });
              closeSheet();
              notify(t("บันทึกข้อมูลสำเร็จ"), t("บันทึกข้อมูลเรียบร้อย: {code} ({lock})", { code: `LCK-${area.code}`, lock: area.name }), "success");
            }}
          >
            {t("บันทึก")}
          </Button>
        </div>
      )}
    </SheetFrame>
  );
}
