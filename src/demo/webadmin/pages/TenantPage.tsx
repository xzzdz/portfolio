"use client";

import { Download, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { money, shortDate } from "@/lib/format";
import type { AreaStatus } from "../../data/types";
import { contractStatus, invoiceAmount } from "../../selectors";
import { statusLabelTh } from "../../shared/status";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useAdmin } from "../AdminContext";
import { Btn, DataTable, PageHeader, Panel, SearchInput, Select, StatusBadge, Tabs, type Column } from "../ui/kit";
import { TenantDrawer } from "./shared";
import { downloadCsv } from "./ReportPage";

type Row = { id: string; no: string; shop: string; contact: string; phone: string; zone: string; areas: string; start: string; end: string; rate: number; owing: number; status: AreaStatus };

export function TenantPage() {
  const { t, d, lang, params, openDrawer, toast } = useAdmin();
  const idx = useDemoIndex();
  const contracts = useDemoStore((s) => s.contracts);
  const zones = useDemoStore((s) => s.zones);
  const today = useDemoStore((s) => s.today);
  const market = useDemoStore((s) => s.market);
  const [tab, setTab] = useState<AreaStatus | "all">("active");
  const [zoneId, setZoneId] = useState("all");
  const [query, setQuery] = useState("");

  // เปิดจากหน้าอื่นพร้อมสัญญาที่เลือก (เช่น การ์ด "ใกล้หมดสัญญา" บนหน้าหลัก)
  useEffect(() => {
    if (params.contract) openDrawer(<TenantDrawer contractId={params.contract} />);
  }, [params.contract, openDrawer]);

  const rows = useMemo<Row[]>(
    () =>
      contracts.map((c) => {
        const cust = idx.customerById.get(c.customerId)!;
        const area = idx.areaById.get(c.areaIds[0])!;
        return {
          id: c.id,
          no: c.no,
          shop: d(cust.shop),
          contact: d(cust.name),
          phone: cust.phone,
          zone: d(idx.zoneById.get(area.zoneId)!.name),
          areas: idx.areaNames(c.areaIds),
          start: c.start,
          end: c.end,
          rate: c.rate,
          owing: (idx.invoicesByContract.get(c.id) ?? []).filter((iv) => !iv.receiptId).reduce((s, iv) => s + invoiceAmount(iv), 0),
          status: contractStatus(c, today, market.nearExpireDays),
        };
      }),
    [contracts, idx, d, today, market.nearExpireDays],
  );

  const q = query.trim().toLowerCase();
  const scoped = rows.filter((r) => (zoneId === "all" || contracts.find((c) => c.id === r.id)!.areaIds.some((id) => idx.areaById.get(id)?.zoneId === zoneId)) && (!q || [r.no, r.shop, r.contact, r.areas, r.phone].some((v) => v.toLowerCase().includes(q))));
  const visible = tab === "all" ? scoped : scoped.filter((r) => r.status === tab);
  const count = (s: AreaStatus) => scoped.filter((r) => r.status === s).length;

  const columns: Column<Row>[] = [
    { key: "no", header: t("เลขที่สัญญา/เสนอราคา"), render: (r) => <span className="font-semibold text-slate-800">{r.no}</span>, sort: (r) => r.no },
    {
      key: "shop",
      header: t("ชื่อร้านค้า"),
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.shop}</div>
          <div className="text-[11px] text-slate-500">
            {r.contact} · {r.phone}
          </div>
        </div>
      ),
      sort: (r) => r.shop,
    },
    { key: "areas", header: t("รหัสพื้นที่"), render: (r) => r.areas, sort: (r) => r.areas },
    { key: "zone", header: t("โซนพื้นที่"), render: (r) => <span className="text-slate-500">{r.zone}</span>, sort: (r) => r.zone },
    { key: "period", header: t("ระยะเวลาการเช่า"), render: (r) => <span className="whitespace-nowrap">{shortDate(r.start, lang)} – {shortDate(r.end, lang)}</span>, sort: (r) => r.end },
    { key: "rate", header: t("ยอด/งวด"), align: "right", render: (r) => `฿${money(r.rate)}`, sort: (r) => r.rate },
    { key: "owing", header: t("ค้างชำระ"), align: "right", render: (r) => (r.owing ? <span className="font-semibold text-red-700">฿{money(r.owing)}</span> : <span className="text-slate-400">-</span>), sort: (r) => r.owing },
    { key: "status", header: t("สถานะ"), render: (r) => <StatusBadge status={r.status} />, sort: (r) => r.status },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("ผู้เช่า")}
        subtitle={t("สัญญาเช่าและใบเสนอราคาทั้งหมดของสาขา")}
        icon={Users}
        actions={
          <Btn
            variant="outline"
            icon={Download}
            onClick={() => {
              downloadCsv(
                `tenants-${today}.csv`,
                [t("เลขที่สัญญา/เสนอราคา"), t("ชื่อร้านค้า"), t("ชื่อผู้ติดต่อ"), t("รหัสพื้นที่"), t("วันเริ่มสัญญา"), t("วันสิ้นสุดสัญญา"), t("ยอด/งวด"), t("ค้างชำระ"), t("สถานะ")],
                visible.map((r) => [r.no, r.shop, r.contact, r.areas, r.start, r.end, r.rate, r.owing, t(statusLabelTh[r.status])]),
              );
              toast(t("ส่งออกไฟล์ Excel (CSV) แล้ว"), "success");
            }}
          >
            {t("ส่งออก Excel")}
          </Btn>
        }
      />
      <Panel bodyClass="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            className="flex-1"
            value={tab}
            onChange={setTab}
            items={[
              { value: "active", label: t("เช่าอยู่"), count: count("active") },
              { value: "nearExpire", label: t("ใกล้หมดสัญญา"), count: count("nearExpire") },
              { value: "expired", label: t("หมดสัญญา"), count: count("expired") },
              { value: "quote", label: t("เสนอราคา"), count: count("quote") },
              { value: "quoteDeposit", label: t("เสนอราคา(มัดจำ)"), count: count("quoteDeposit") },
              { value: "all", label: t("ทั้งหมด"), count: scoped.length },
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={zoneId} onChange={setZoneId} label={t("โซน:")} options={[{ value: "all", label: t("ทั้งหมด") }, ...zones.map((z) => ({ value: z.id, label: d(z.name) }))]} />
          <SearchInput value={query} onChange={setQuery} placeholder={t("ค้นหา: ชื่อร้าน / ผู้ติดต่อ / เลขสัญญา / ล็อก")} className="w-80" />
        </div>
        <DataTable key={`${tab}-${zoneId}-${q}`} rows={visible} columns={columns} rowKey={(r) => r.id} onRowClick={(r) => openDrawer(<TenantDrawer contractId={r.id} />)} initialSort={{ key: "areas", dir: "asc" }} />
      </Panel>
    </div>
  );
}
