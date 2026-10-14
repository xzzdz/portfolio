"use client";

import { Grid2x2X, Printer, Store, Wallet, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { daysBetween, money, shortDate } from "@/lib/format";
import type { Area, AreaStatus } from "../../data/types";
import { statusOrder } from "../../selectors";
import { statusLabelTh, statusPalette } from "../../shared/status";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useApp } from "../AppContext";
import { FilterBar } from "../ui/FilterBar";
import { SheetFrame } from "../ui/Overlays";
import { Button, DetailRow, EmptyState, SectionLabel, StatusChip, StatusTag, SubHeader } from "../ui/parts";

export function AreaScreen() {
  const { t, d, back, route, openSheet, scan } = useApp();
  const zones = useDemoStore((s) => s.zones);
  const areas = useDemoStore((s) => s.areas);
  const idx = useDemoIndex();
  const [zoneId, setZoneId] = useState("all");
  const [query, setQuery] = useState(() => (scan ? idx.areaById.get(scan.areaId)?.name ?? "" : ""));
  const [status, setStatus] = useState<AreaStatus | "all">("all");

  const q = query.trim().toLowerCase();
  const scoped = useMemo(
    () =>
      areas.filter((a) => {
        if (zoneId !== "all" && a.zoneId !== zoneId) return false;
        if (!q) return true;
        const c = idx.contractByArea.get(a.id);
        const cust = c ? idx.customerById.get(c.customerId) : undefined;
        return [a.name, a.code, cust?.shop.th, cust?.shop.en, cust?.name.th, cust?.name.en].some((v) => v?.toLowerCase().includes(q));
      }),
    [areas, zoneId, q, idx],
  );
  const visible = status === "all" ? scoped : scoped.filter((a) => idx.statusOfArea(a) === status);
  const sections = zones.map((z) => ({ zone: z, items: visible.filter((a) => a.zoneId === z.id) })).filter((s) => s.items.length);

  return (
    <div className="flex h-full flex-col bg-[#F1F5F9]">
      <SubHeader title={t("พื้นที่เช่า")} onBack={route.params.from === "home" ? back : undefined} />
      <div className="shrink-0 space-y-2 px-3 pb-2 pt-3">
        <FilterBar zoneId={zoneId} onZone={setZoneId} query={query} onQuery={setQuery} placeholder={t("ค้นหาล็อก / ผู้เช่า / ร้าน")} />
        <div className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3">
          <StatusChip label={t("ทั้งหมด")} count={scoped.length} selected={status === "all"} onClick={() => setStatus("all")} />
          {statusOrder.map((s) => (
            <StatusChip key={s} label={t(statusLabelTh[s])} status={s} count={scoped.filter((a) => idx.statusOfArea(a) === s).length} selected={status === s} onClick={() => setStatus(s)} />
          ))}
        </div>
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto pb-24">
        {sections.length === 0 ? (
          <EmptyState
            icon={Grid2x2X}
            title={status === "all" ? t("ไม่พบข้อมูล") : t("ไม่มีล็อกสถานะ \"{v}\"", { v: t(statusLabelTh[status]) })}
            subtitle={q ? t("ไม่มีล็อกที่ตรงกับคำค้น \"{searchCtrl}\"", { searchCtrl: query }) : t("ลองเลือกสถานะอื่น หรือกดชิป \"ทั้งหมด\" เพื่อดูทุกล็อก")}
          />
        ) : (
          sections.map(({ zone, items }) => {
            const vacant = items.filter((a) => idx.statusOfArea(a) === "vacant").length;
            return (
              <section key={zone.id}>
                <div className="flex items-center gap-2 px-4 pb-2 pt-3.5">
                  <span className="h-[18px] w-1 rounded-sm bg-[#0F52BA]" />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-slate-900">{d(zone.name)}</span>
                  <span className="text-[12px] text-slate-500">{t("{s} ล็อก", { s: items.length })}</span>
                  {vacant > 0 && (
                    <span className="rounded-[10px] border px-1.5 py-px text-[11px] font-bold" style={{ background: statusPalette.vacant.bg, borderColor: statusPalette.vacant.border, color: statusPalette.vacant.fg }}>
                      {t("ว่าง {vacant}", { vacant })}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2 px-3 pb-1.5">
                  {items.map((a) => (
                    <LockTile key={a.id} area={a} onClick={() => openSheet(<StallSheet areaId={a.id} />)} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * ช่องล็อกหนึ่งช่อง — สถานะบอกด้วย "สี" อย่างเดียว (พื้นอ่อน + แถบเข้ม)
 * ตัวหนังสือทุกช่องใช้สีกลางชุดเดียว ผังทั้งจอจะได้ไม่ลายตา
 */
function LockTile({ area, onClick }: { area: Area; onClick: () => void }) {
  const idx = useDemoIndex();
  const status = idx.statusOfArea(area);
  const p = statusPalette[status];
  const contract = idx.contractByArea.get(area.id);
  const cancelled = Boolean(contract?.cancelDate);
  return (
    <div className="relative">
      <button type="button" onClick={onClick} className="flex aspect-square w-full flex-col overflow-hidden rounded-xl transition active:scale-95" style={{ background: p.bg }}>
        <span className="flex flex-1 flex-col items-center justify-center px-1">
          <span className="text-[18px] font-extrabold leading-tight text-slate-900">{area.name}</span>
          <span className="text-[11px] font-semibold text-slate-500">{area.code}</span>
        </span>
        <span className="h-[5px] w-full" style={{ background: p.fg }} />
      </button>
      {(cancelled || area.maintenance > 0) && (
        <span className="absolute -right-1.5 -top-1.5 flex gap-0.5">
          {cancelled && <span className="grid size-[22px] place-items-center rounded-full border-2 border-white bg-slate-700 text-[8.5px] font-black text-white">CC</span>}
          {area.maintenance > 0 && (
            <span className="grid size-[22px] place-items-center rounded-full border-2 border-white bg-red-600 text-white">
              <Wrench className="size-[11px]" />
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export function StallSheet({ areaId }: { areaId: string }) {
  const { t, d, lang, go, print, closeSheet, notify } = useApp();
  const idx = useDemoIndex();
  const today = useDemoStore((s) => s.today);
  const tickets = useDemoStore((s) => s.tickets);
  const area = idx.areaById.get(areaId)!;
  const zone = idx.zoneById.get(area.zoneId)!;
  const status = idx.statusOfArea(area);
  const contract = idx.contractByArea.get(area.id);
  const customer = contract ? idx.customerById.get(contract.customerId) : undefined;
  const ticket = tickets.find((tk) => tk.areaId === area.id && tk.status !== "done");
  const isContract = contract?.kind === "contract";
  const daysLeft = contract ? daysBetween(today, contract.end) : 0;

  const unit = area.term === "daily" ? t("วัน") : t("เดือน");

  return (
    <SheetFrame
      title={t("ล็อค {lockName}", { lockName: area.name })}
      subtitle={`${d(zone.name)} · ${t("รหัสพื้นที่")} ${area.code}`}
      icon={Store}
      iconTone="green"
      headerRight={<StatusTag status={status} label={t(statusLabelTh[status])} />}
      footer={
        isContract && customer ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={Printer}
              className="flex-1 whitespace-nowrap px-2 text-[12.5px]"
              onClick={() => {
                print({ kind: "notice", contractId: contract.id });
                notify(t("กำลังพิมพ์ใบแจ้งค่าเช่า"), t("{tenantName} — กรุณารอสักครู่", { tenantName: d(customer.shop) }), "info");
              }}
            >
              {t("พิมพ์ใบแจ้งค่าเช่า")}
            </Button>
            <Button
              icon={Wallet}
              className="flex-1 whitespace-nowrap px-2 text-[12.5px]"
              onClick={() => {
                closeSheet();
                go("invoices", { customerId: customer.id });
              }}
            >
              {t("ไปที่รับชำระเงิน")}
            </Button>
          </div>
        ) : undefined
      }
    >
      {ticket && (
        <div className="mb-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-800">
          <Wrench className="mt-0.5 size-4 shrink-0" />
          <div>
            <b>{t("แจ้งซ่อม")}: {d(ticket.title)}</b> · {ticket.status === "inProgress" ? t("กำลังดำเนินการ") : t("รอดำเนินการ")}
            <div className="text-red-700/80">{d(ticket.detail)}</div>
          </div>
        </div>
      )}

      <SectionLabel>{t("ข้อมูลพื้นที่แผงค้า")}</SectionLabel>
      <div className="rounded-2xl bg-slate-50 px-3.5 py-1.5">
        <DetailRow label={t("โซนพื้นที่")} value={d(zone.name)} />
        <DetailRow label={t("ขนาดพื้นที่:")} value={`${area.sizeSqm} ${t("ตร.ม.")}`} />
        <DetailRow label={t("อัตราค่าเช่า")} value={`฿${money(area.rate)} / ${unit}`} />
        <DetailRow label={t("น้ำ / ไฟ")} value={[area.hasWater && t("น้ำประปา"), area.hasElectric && t("ไฟฟ้า")].filter(Boolean).join(" · ") || "-"} />
      </div>

      {customer && contract ? (
        <>
          <div className="mt-4">
            <SectionLabel>{isContract ? t("ผู้เช่าปัจจุบัน:") : t("ผู้สนใจ (ใบเสนอราคา)")}</SectionLabel>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3.5 py-1.5">
            <DetailRow label={t("ชื่อร้านค้า:")} value={d(customer.shop)} />
            <DetailRow label={t("ผู้ติดต่อ")} value={d(customer.name)} />
            <DetailRow label={isContract ? t("เลขที่สัญญา") : t("เลขที่ใบเสนอราคา")} value={contract.no} />
            <DetailRow label={t("ระยะเวลาสัญญา:")} value={t("{sDate} ถึง {lDate}", { sDate: shortDate(contract.start, lang), lDate: shortDate(contract.end, lang) })} />
            {isContract && (
              <DetailRow
                label={t("คงเหลือ")}
                value={daysLeft < 0 ? t("เลยกำหนด {n} วัน", { n: -daysLeft }) : t("{n} วัน", { n: daysLeft })}
                valueClass={daysLeft < 0 ? "text-slate-500" : daysLeft <= 30 ? "text-orange-600" : "text-emerald-700"}
              />
            )}
            {contract.cancelDate && <DetailRow label={t("แจ้งยกเลิกล่วงหน้า")} value={shortDate(contract.cancelDate, lang)} valueClass="text-red-600" />}
          </div>

          <div className="mt-4">
            <SectionLabel>{t("ข้อมูลการติดต่อและเอกสาร")}</SectionLabel>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3.5 py-1.5">
            <DetailRow label={t("เบอร์โทรศัพท์:")} value={customer.phone} />
            <DetailRow label={t("อีเมล:")} value={customer.email} />
            <DetailRow label={t("เลขประจำตัว/บัตร:")} value={customer.idCard.replace(/\d(?=.{4})/g, "x")} />
          </div>
          {!isContract && (
            <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-[12px] leading-relaxed text-blue-800">{t("อยู่ระหว่างเสนอราคา — รอลูกค้าตอบรับและทำสัญญาที่หน้าเคาน์เตอร์")}</p>
          )}
        </>
      ) : (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12.5px] leading-relaxed text-emerald-800">
          <b>{t("ล็อกนี้ว่าง พร้อมให้เช่า")}</b>
          <div>{t("การจองและทำสัญญาทำที่เครื่อง POS / เว็บแอดมิน")}</div>
        </div>
      )}
    </SheetFrame>
  );
}
