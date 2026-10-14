"use client";

import { ChevronRight, Phone, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { money, shortDate } from "@/lib/format";
import type { AreaStatus } from "../../data/types";
import { contractStatus, invoiceAmount, invoiceState, statusOrder } from "../../selectors";
import { statusLabelTh } from "../../shared/status";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useApp } from "../AppContext";
import { FilterBar } from "../ui/FilterBar";
import { Card, EmptyState, Pill, StatusChip, StatusTag, SubHeader } from "../ui/parts";

export function TenantScreen() {
  const { t, d, lang, go } = useApp();
  const contracts = useDemoStore((s) => s.contracts);
  const market = useDemoStore((s) => s.market);
  const today = useDemoStore((s) => s.today);
  const idx = useDemoIndex();
  const [zoneId, setZoneId] = useState("all");
  const [query, setQuery] = useState("");
  // เปิดมาที่ "เช่าอยู่" เหมือนเว็บ
  const [status, setStatus] = useState<AreaStatus | "all">("active");

  const q = query.trim().toLowerCase();
  const rows = useMemo(
    () =>
      contracts
        .map((c) => ({ c, s: contractStatus(c, today, market.nearExpireDays), cust: idx.customerById.get(c.customerId)! }))
        .filter(({ c, cust }) => {
          if (zoneId !== "all" && !c.areaIds.some((id) => idx.areaById.get(id)?.zoneId === zoneId)) return false;
          if (!q) return true;
          return [cust.shop.th, cust.shop.en, cust.name.th, cust.name.en, c.no, idx.areaNames(c.areaIds)].some((v) => v.toLowerCase().includes(q));
        }),
    [contracts, today, market.nearExpireDays, idx, zoneId, q],
  );
  const visible = status === "all" ? rows : rows.filter((r) => r.s === status);
  const statuses = statusOrder.filter((s) => s !== "vacant");

  return (
    <div className="flex h-full flex-col bg-[#F1F5F9]">
      <SubHeader title={t("ผู้เช่า")} />
      <div className="shrink-0 space-y-2 px-3 pb-2 pt-3">
        <FilterBar zoneId={zoneId} onZone={setZoneId} query={query} onQuery={setQuery} placeholder={t("ค้นหาร้าน / ผู้ติดต่อ / ล็อก / สัญญา")} />
        <div className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3">
          <StatusChip label={t("ทั้งหมด")} count={rows.length} selected={status === "all"} onClick={() => setStatus("all")} />
          {statuses.map((s) => (
            <StatusChip key={s} label={t(statusLabelTh[s])} status={s} count={rows.filter((r) => r.s === s).length} selected={status === s} onClick={() => setStatus(s)} />
          ))}
        </div>
      </div>

      <div className="thin-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 pb-24 pt-1">
        {visible.length === 0 ? (
          <EmptyState icon={UserX} title={t("ไม่พบข้อมูล")} subtitle={q ? t("ไม่มีผู้เช่าที่ตรงกับคำค้น \"{searchCtrl}\"", { searchCtrl: query }) : t("ไม่มีผู้เช่าสถานะนี้ในโซนที่เลือก ลองเปลี่ยนชิปสถานะหรือโซนดู")} />
        ) : (
          visible.map(({ c, s, cust }) => {
            const owing = (idx.invoicesByContract.get(c.id) ?? []).filter((iv) => invoiceState(iv, today) !== "paid");
            const owingTotal = owing.reduce((sum, iv) => sum + invoiceAmount(iv), 0);
            const [first, ...more] = c.areaIds;
            return (
              <Card key={c.id} className="p-3.5" onClick={() => go("contract", { contractId: c.id })}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14.5px] font-extrabold text-slate-900">{d(cust.shop)}</div>
                    <div className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-slate-500">
                      {d(cust.name)} <span className="text-slate-300">·</span> <Phone className="size-3" /> {cust.phone}
                    </div>
                  </div>
                  <StatusTag status={s} label={t(statusLabelTh[s])} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Pill tone="blue">{t("ล็อค {ln}", { ln: idx.areaById.get(first)?.name ?? "" })}</Pill>
                  {more.length > 0 && <Pill tone="blue">{t("+{more} ล็อก", { more: more.length })}</Pill>}
                  <span className="text-[11.5px] font-medium text-slate-500">{c.no}</span>
                  {owing.length > 0 && <Pill tone="red" className="ml-auto">{t("ค้าง ฿{v}", { v: money(owingTotal) })}</Pill>}
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-dashed border-slate-200 pt-2 text-[11.5px] text-slate-500">
                  <span>
                    {shortDate(c.start, lang)} – {shortDate(c.end, lang)}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    ฿{money(c.rate)}/{c.term === "daily" ? t("วัน") : t("เดือน")}
                    <ChevronRight className="size-4 text-slate-400" />
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
