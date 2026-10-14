"use client";

import { Camera, CheckCircle2, Delete, Droplets, Gauge, ImageIcon, Smartphone, TriangleAlert, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { int, monthYear } from "@/lib/format";
import type { MeterReading } from "../../data/types";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useApp } from "../AppContext";
import { FilterBar } from "../ui/FilterBar";
import { SheetFrame } from "../ui/Overlays";
import { Button, Card, EmptyState, Pill, Segment, SubHeader } from "../ui/parts";

type TypeFilter = "all" | "water" | "electric";

export function MeterScreen() {
  const { t, d, lang, openSheet } = useApp();
  const idx = useDemoIndex();
  const meters = useDemoStore((s) => s.meters);
  const today = useDemoStore((s) => s.today);
  const [zoneId, setZoneId] = useState("all");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [onlyPending, setOnlyPending] = useState(false);
  const period = `${today.slice(0, 7)}-01`;

  const cycle = useMemo(() => meters.filter((m) => m.period === period), [meters, period]);
  const q = query.trim().toLowerCase();
  const filtered = cycle.filter((m) => {
    const area = idx.areaById.get(m.areaId)!;
    if (zoneId !== "all" && area.zoneId !== zoneId) return false;
    if (type !== "all" && m.type !== type) return false;
    if (onlyPending && m.current !== null) return false;
    if (!q) return true;
    const c = idx.customerById.get(m.customerId);
    return [area.name, m.meterNo, c?.shop.th, c?.shop.en].some((v) => v?.toLowerCase().includes(q));
  });
  const done = cycle.filter((m) => m.current !== null).length;
  const pendingIds = filtered.filter((m) => m.current === null).map((m) => m.id);

  return (
    <div className="relative flex h-full flex-col bg-[#F1F5F9]">
      <SubHeader title={t("มิเตอร์น้ำไฟฟ้า")}>
        <div className="mt-2 px-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-white/85">{t("รอบบิล {month}", { month: monthYear(period, lang, true) })}</span>
            <span className="font-bold">{t("จดแล้ว {done}/{total}", { done, total: cycle.length })}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${cycle.length ? (done / cycle.length) * 100 : 0}%` }} />
          </div>
        </div>
      </SubHeader>

      <div className="shrink-0 space-y-2 px-3 pb-2 pt-3">
        <FilterBar zoneId={zoneId} onZone={setZoneId} query={query} onQuery={setQuery} placeholder={t("ค้นหาล็อก / ร้าน / เลขเครื่อง")} />
        <div className="flex gap-2">
          <Segment
            className="flex-1"
            value={type}
            onChange={setType}
            options={[
              { value: "all", label: t("ทั้งหมด") },
              { value: "water", label: t("น้ำ"), icon: Droplets },
              { value: "electric", label: t("ไฟ"), icon: Zap },
            ]}
          />
          <button
            type="button"
            onClick={() => setOnlyPending(!onlyPending)}
            className={cn("shrink-0 rounded-xl border px-2.5 text-[11.5px] font-bold", onlyPending ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600")}
          >
            {t("ยังไม่จด")}
          </button>
        </div>
      </div>

      <div className="thin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-36 pt-1">
        {filtered.length === 0 ? (
          <EmptyState icon={Gauge} title={t("ไม่พบรายการที่ตรงกับตัวกรอง")} subtitle={t("ลองเปลี่ยนโซน ประเภท หรือคำค้น")} />
        ) : (
          filtered.map((m) => <MeterRow key={m.id} meter={m} onOpen={() => openSheet(<MeterEntrySheet queue={m.current === null ? [m.id, ...pendingIds.filter((x) => x !== m.id)] : [m.id]} />, { tall: true })} />)
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white px-4 pb-3 pt-2.5 shadow-[0_-6px_16px_rgba(0,0,0,0.06)]">
        {pendingIds.length > 0 ? (
          <Button className="w-full" icon={Gauge} onClick={() => openSheet(<MeterEntrySheet queue={pendingIds} />, { tall: true })}>
            {t("จดเลขมิเตอร์ · เหลือ {n} รายการ", { n: pendingIds.length })}
          </Button>
        ) : (
          <div className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-[13.5px] font-bold text-emerald-700">
            <CheckCircle2 className="size-5" /> {t("จดครบแล้ว · ตรวจทาน")}
          </div>
        )}
        <div className="mt-1 text-center text-[10.5px] text-slate-400">{d({ th: "ค่าน้ำ ฿18/หน่วย · ค่าไฟ ฿8/หน่วย", en: "Water ฿18/unit · Electricity ฿8/unit" })}</div>
      </div>
    </div>
  );
}

function MeterRow({ meter, onOpen }: { meter: MeterReading; onOpen: () => void }) {
  const { t, d } = useApp();
  const idx = useDemoIndex();
  const area = idx.areaById.get(meter.areaId)!;
  const c = idx.customerById.get(meter.customerId);
  const usage = meter.current !== null ? meter.current - meter.previous : null;
  const isWater = meter.type === "water";
  return (
    <Card className="flex items-center gap-3 p-3" onClick={onOpen}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", isWater ? "bg-sky-50 text-sky-600" : "bg-amber-50 text-amber-600")}>
        {isWater ? <Droplets className="size-5" /> : <Zap className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-bold text-slate-900">
          {t("ล็อค {ln}", { ln: area.name })} · {c ? d(c.shop) : ""}
        </div>
        <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
          {t("เครื่อง {no}", { no: meter.meterNo })}
          {meter.recordedVia && (
            <span className="inline-flex items-center gap-0.5 text-slate-400">
              · {meter.recordedVia === "handheld" ? <Smartphone className="size-3" /> : null}
              {meter.recordedVia === "handheld" ? "Handheld" : "Web"}
            </span>
          )}
          {meter.photo && <ImageIcon className="size-3 text-slate-400" />}
        </div>
      </div>
      <div className="text-right">
        {usage === null ? (
          <Pill tone="amber">{t("ยังไม่จด")}</Pill>
        ) : (
          <>
            <div className="text-[12px] text-slate-500">
              {int(meter.previous)} → <b className="text-slate-900">{int(meter.current!)}</b>
            </div>
            <div className={cn("text-[12px] font-bold", isWater ? "text-sky-600" : "text-amber-600")}>{t("{usage} หน่วย", { usage: int(usage) })}</div>
          </>
        )}
      </div>
    </Card>
  );
}

/** จดเลขมิเตอร์ทีละเครื่อง — บันทึกแล้วไปเครื่องถัดไปอัตโนมัติ */
export function MeterEntrySheet({ queue }: { queue: string[] }) {
  const { t, d, closeSheet, notify } = useApp();
  const idx = useDemoIndex();
  const meters = useDemoStore((s) => s.meters);
  const recordMeter = useDemoStore((s) => s.recordMeter);
  const [pos, setPos] = useState(0);
  const [saved, setSaved] = useState(0);
  const meter = meters.find((m) => m.id === queue[pos]);
  const [input, setInput] = useState(() => (meter?.current != null ? String(meter.current) : ""));
  const [photo, setPhoto] = useState(() => meter?.photo ?? false);
  const [error, setError] = useState("");

  if (!meter) {
    return (
      <SheetFrame title={t("จดครบทุกรายการแล้ว")} icon={CheckCircle2} iconTone="green">
        <div className="flex flex-col items-center py-10 text-center">
          <span className="grid size-20 animate-pop place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-11" />
          </span>
          <div className="mt-4 text-[18px] font-extrabold">{t("จดครบทุกรายการแล้ว")}</div>
          <div className="text-[13px] text-slate-500">{t("ครบ {count} รายการตามตัวกรองที่เลือก", { count: saved })}</div>
          <div className="mt-1 text-[12px] text-slate-400">{t("ข้อมูลส่งเข้าระบบหลังบ้านแล้ว — เว็บแอดมินเห็นทันที")}</div>
          <Button className="mt-6 w-48" onClick={closeSheet}>
            {t("เสร็จ")}
          </Button>
        </div>
      </SheetFrame>
    );
  }

  const area = idx.areaById.get(meter.areaId)!;
  const customer = idx.customerById.get(meter.customerId);
  const isWater = meter.type === "water";
  const value = input ? Number(input) : null;
  const usage = value !== null ? value - meter.previous : null;
  const typical = isWater ? 20 : 350;
  const last = pos === queue.length - 1;

  function press(key: string) {
    setError("");
    if (key === "back") return setInput((v) => v.slice(0, -1));
    if (key === "clear") return setInput("");
    setInput((v) => (v === "0" ? key : (v + key).slice(0, 7)));
  }

  function goTo(next: number) {
    const m = meters.find((x) => x.id === queue[next]);
    setPos(next);
    setInput(m?.current != null ? String(m.current) : "");
    setPhoto(m?.photo ?? false);
    setError("");
  }

  function save() {
    if (value === null || value <= 0) return setError(t("เลขมิเตอร์ต้องมากกว่า 0"));
    if (value < meter!.previous) return setError(t("ต้องไม่น้อยกว่าเลขครั้งก่อน ({prev})", { prev: int(meter!.previous) }));
    recordMeter(meter!.id, value, { channel: "handheld", photo });
    setSaved((n) => n + 1);
    notify(t("บันทึกสำเร็จ"), `${t("ล็อค {ln}", { ln: area.name })} · ${t("{usage} หน่วย", { usage: int(value - meter!.previous) })}`, "success");
    goTo(pos + 1);
  }

  return (
    <SheetFrame
      title={`${t("ล็อค {ln}", { ln: area.name })} · ${customer ? d(customer.shop) : ""}`}
      subtitle={`${isWater ? t("มิเตอร์น้ำ") : t("มิเตอร์ไฟ")} · ${t("เครื่อง {no}", { no: meter.meterNo })} · ${pos + 1}/${queue.length}`}
      icon={isWater ? Droplets : Zap}
      iconTone={isWater ? "cyan" : "amber"}
      bodyClass="pb-2"
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
          <div className="text-[11px] font-semibold text-slate-500">{t("ครั้งก่อน")}</div>
          <div className="font-mono text-[20px] font-bold tracking-wider text-slate-600">{int(meter.previous)}</div>
        </div>
        <div className={cn("rounded-2xl border-2 px-3 py-2.5", error ? "border-red-400 bg-red-50" : "border-[#0F52BA] bg-[#F5F9FF]")}>
          <div className="text-[11px] font-semibold text-[#0F52BA]">{t("ครั้งนี้")}</div>
          <div className="flex h-[30px] items-center font-mono text-[22px] font-extrabold tracking-wider text-slate-900">
            {input ? int(Number(input)) : <span className="text-[13px] font-medium tracking-normal text-slate-400">{t("กดเลข")}</span>}
            <span className="ml-0.5 h-6 w-0.5 animate-pulse bg-[#0F52BA]" />
          </div>
        </div>
      </div>

      <div className="mt-2 flex min-h-[22px] items-center justify-between text-[12.5px]">
        {error ? (
          <span className="flex items-center gap-1 font-semibold text-red-600">
            <TriangleAlert className="size-4" /> {error}
          </span>
        ) : usage !== null && usage >= 0 ? (
          <span className={cn("font-bold", usage > typical ? "text-orange-600" : "text-emerald-700")}>
            {t("ใช้ {usage} หน่วย", { usage: int(usage) })}
            {usage > typical && <span className="ml-1 font-semibold">· {t("สูงผิดปกติ ตรวจเลขอีกครั้ง")}</span>}
          </span>
        ) : (
          <span className="text-slate-400">{t("กดเลขตามหน้าปัดมิเตอร์ ไม่ต้องใส่ 0 ข้างหน้า")}</span>
        )}
      </div>

      <button type="button" onClick={() => setPhoto(!photo)} className={cn("mt-2 flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left", photo ? "border-emerald-200 bg-emerald-50" : "border-dashed border-slate-300 bg-white")}>
        {photo ? <MeterDial value={value ?? meter.previous} water={isWater} /> : <span className="grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-500"><Camera className="size-6" /></span>}
        <span className="flex-1">
          <span className="block text-[13px] font-bold text-slate-800">{photo ? t("มีรูปมิเตอร์แล้ว · แตะรูปเพื่อดู") : t("ยังไม่มีรูปหน้าปัด")}</span>
          <span className="text-[11.5px] text-slate-500">{photo ? t("ถ่ายใหม่") : t("ถ่ายรูป")}</span>
        </span>
      </button>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className={cn("flex h-12 items-center justify-center rounded-2xl text-[20px] font-bold transition active:scale-95", k === "clear" || k === "back" ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-900 active:bg-slate-200")}
          >
            {k === "back" ? <Delete className="size-6" /> : k === "clear" ? <span className="text-[14px]">C</span> : k}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2 pb-1">
        <Button variant="outline" className="w-[34%]" onClick={() => goTo(pos + 1)}>
          {t("ข้าม")}
        </Button>
        <Button className="flex-1" onClick={save} disabled={!input}>
          {last ? t("ยืนยันบันทึก") : t("บันทึก → ถัดไป")}
        </Button>
      </div>
    </SheetFrame>
  );
}

/** "รูปถ่าย" หน้าปัดมิเตอร์ — วาดตัวเลขแบบล้อหมุน */
function MeterDial({ value, water }: { value: number; water: boolean }) {
  const digits = String(Math.round(value)).padStart(6, "0").split("");
  return (
    <span className="relative grid h-12 w-[74px] shrink-0 place-items-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_30%_30%,#475569,#0F172A)]">
      <span className="flex gap-px rounded bg-black/60 px-1 py-0.5">
        {digits.map((dg, i) => (
          <span key={i} className={cn("w-[9px] rounded-[2px] text-center font-mono text-[10px] font-bold leading-[14px]", i >= 5 ? (water ? "bg-sky-500 text-white" : "bg-red-500 text-white") : "bg-white text-slate-900")}>
            {dg}
          </span>
        ))}
      </span>
      <span className="absolute bottom-0.5 text-[7px] font-bold tracking-wider text-white/60">{water ? "m³" : "kWh"}</span>
    </span>
  );
}
