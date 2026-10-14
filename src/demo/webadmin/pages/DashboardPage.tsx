"use client";

import { ArrowDownRight, ArrowUpRight, BadgeCheck, CalendarClock, ChevronRight, Gauge, LayoutDashboard, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { addDays, daysBetween, int, money, monthShort, parseISODate, shortDate, time } from "@/lib/format";
import { firstOfMonth } from "../../data/seed";
import type { AreaStatus } from "../../data/types";
import { contractStatus, invoiceAmount, invoiceState, statusOrder } from "../../selectors";
import { statusLabelTh, statusPalette } from "../../shared/status";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useAdmin } from "../AdminContext";
import { categorical, ChartCard, ColumnChart, HBars, Sparkline, StackedBar } from "../ui/charts";
import { Badge, ChannelBadge, PageHeader, Panel } from "../ui/kit";

type Period = "mtd" | "last" | "q";

export function DashboardPage() {
  const { t, d, lang, go } = useAdmin();
  const idx = useDemoIndex();
  const today = useDemoStore((s) => s.today);
  const receipts = useDemoStore((s) => s.receipts);
  const invoices = useDemoStore((s) => s.invoices);
  const areas = useDemoStore((s) => s.areas);
  const zones = useDemoStore((s) => s.zones);
  const contracts = useDemoStore((s) => s.contracts);
  const meters = useDemoStore((s) => s.meters);
  const history = useDemoStore((s) => s.revenueHistory);
  const market = useDemoStore((s) => s.market);
  const slipsWaiting = useDemoStore((s) => s.approvals.filter((a) => a.status === "pending").length);
  const [period, setPeriod] = useState<Period>("mtd");

  const day = parseISODate(today).getDate();
  const range = useMemo(() => {
    const m0 = firstOfMonth(today);
    if (period === "mtd") return { from: m0, to: today, prevFrom: firstOfMonth(today, -1), prevTo: addDays(firstOfMonth(today, -1), day - 1) };
    if (period === "last") {
      const from = firstOfMonth(today, -1);
      return { from, to: addDays(m0, -1), prevFrom: firstOfMonth(today, -2), prevTo: addDays(from, -1) };
    }
    return { from: firstOfMonth(today, -2), to: today, prevFrom: null, prevTo: null };
  }, [period, today, day]);

  const inRange = (iso: string, from: string, to: string) => iso.slice(0, 10) >= from && iso.slice(0, 10) <= to;
  const periodReceipts = receipts.filter((r) => inRange(r.paidAt, range.from, range.to));
  const revenue = periodReceipts.reduce((s, r) => s + r.total, 0);
  const prevRevenue = range.prevFrom && range.prevTo ? receipts.filter((r) => inRange(r.paidAt, range.prevFrom!, range.prevTo!)).reduce((s, r) => s + r.total, 0) : null;
  const delta = prevRevenue ? (revenue - prevRevenue) / prevRevenue : null;
  const handheldShare = periodReceipts.length ? periodReceipts.filter((r) => r.channel === "handheld").reduce((s, r) => s + r.total, 0) / (revenue || 1) : 0;

  const unpaid = invoices.filter((iv) => invoiceState(iv, today) !== "paid");
  const overdue = unpaid.filter((iv) => invoiceState(iv, today) === "overdue");
  const outstanding = unpaid.reduce((s, iv) => s + invoiceAmount(iv), 0);

  const statusCount = useMemo(() => {
    const c: Record<AreaStatus, number> = { active: 0, nearExpire: 0, expired: 0, quote: 0, quoteDeposit: 0, vacant: 0 };
    areas.forEach((a) => c[idx.statusOfArea(a)]++);
    return c;
  }, [areas, idx]);
  const occupied = statusCount.active + statusCount.nearExpire + statusCount.expired;
  const occupancy = occupied / areas.length;

  const expiring = contracts
    .filter((c) => contractStatus(c, today, market.nearExpireDays) === "nearExpire")
    .sort((a, b) => (a.end < b.end ? -1 : 1));

  // รายรับ 12 เดือน : 9 เดือนแรกจากสรุปย้อนหลัง + 3 เดือนล่าสุดจากใบเสร็จจริง
  const months = useMemo(() => {
    const list = history.map((h) => ({ period: h.period, total: h.total }));
    for (let i = -2; i <= 0; i++) {
      const p = firstOfMonth(today, i);
      list.push({ period: p, total: receipts.filter((r) => r.paidAt.startsWith(p.slice(0, 7))).reduce((s, r) => s + r.total, 0) });
    }
    return list;
  }, [history, receipts, today]);
  const emphasized = (p: string) => p >= firstOfMonth(range.from) && p <= range.to;

  const methods = [
    { key: "cash", label: t("เงินสด"), value: periodReceipts.filter((r) => r.method === "cash").reduce((s, r) => s + r.total, 0), color: categorical[0] },
    { key: "transfer", label: t("เงินโอน"), value: periodReceipts.filter((r) => r.method === "transfer").reduce((s, r) => s + r.total, 0), color: categorical[1] },
    { key: "qr", label: t("QR พร้อมเพย์"), value: periodReceipts.filter((r) => r.method === "qr").reduce((s, r) => s + r.total, 0), color: categorical[2] },
  ];

  const zoneRows = zones.map((z) => {
    const za = areas.filter((a) => a.zoneId === z.id);
    const occ = za.filter((a) => ["active", "nearExpire", "expired"].includes(idx.statusOfArea(a))).length;
    return { key: z.id, label: d(z.name), ratio: occ / za.length, value: `${Math.round((occ / za.length) * 100)}%`, tip: <span><b>{occ}/{za.length}</b> <span className="text-slate-500">{t("ล็อกมีผู้เช่า")}</span></span> };
  });

  const recent = receipts.slice().sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1)).slice(0, 7);
  const cycle = meters.filter((m) => m.period === firstOfMonth(today));
  const meterDone = cycle.filter((m) => m.current !== null).length;
  const sparkVals = months.map((m) => m.total);

  const periodLabel = { mtd: t("เดือนนี้"), last: t("เดือนที่แล้ว"), q: t("3 เดือนล่าสุด") };

  return (
    <div className="space-y-4">
      <PageHeader title={t("ภาพรวมการดำเนินการ")} subtitle={t("ข้อมูล ณ {date} · ซิงก์กับเครื่อง Handheld ผ่าน backend เดียวกัน", { date: shortDate(today, lang) })} icon={LayoutDashboard} />

      {/* ตัวกรองแถวเดียว อยู่เหนือทุกอย่างที่มันกรอง */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
          {(Object.keys(periodLabel) as Period[]).map((p) => (
            <button key={p} type="button" onClick={() => setPeriod(p)} className={cn("h-8 rounded-lg px-3 text-[12.5px] font-semibold transition", period === p ? "bg-leaf-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100")}>
              {periodLabel[p]}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-slate-500">
          {shortDate(range.from, lang)} – {shortDate(range.to, lang)}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[13px] font-semibold text-slate-500">{t("รวมรายรับ (ชำระแล้ว Cash/Bank)")}</div>
              <div className="mt-1 text-[48px] font-bold leading-none tracking-tight text-slate-900">฿{int(revenue)}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px]">
                {delta !== null && (
                  <span className={cn("inline-flex items-center gap-0.5 font-semibold", delta >= 0 ? "text-[#006300]" : "text-red-700")}>
                    {delta >= 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                    {(Math.abs(delta) * 100).toFixed(1)}%
                  </span>
                )}
                {delta !== null && <span className="text-slate-500">{period === "mtd" ? t("เทียบช่วงเดียวกันเดือนที่แล้ว") : t("เทียบเดือนก่อนหน้า")}</span>}
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">{t("{n} ใบเสร็จ", { n: periodReceipts.length })}</span>
              </div>
            </div>
            <div className="text-right">
              <Sparkline values={sparkVals} color="#6E9B3E" width={120} height={36} />
              <div className="mt-1 text-[10.5px] text-slate-400">{t("12 เดือน")}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-[12px] text-violet-900">
            <Smartphone className="size-4 text-violet-600" />
            {t("{p}% ของรายรับช่วงนี้เก็บผ่านเครื่อง Handheld", { p: Math.round(handheldShare * 100) })}
          </div>
        </div>

        <StatTile label={t("ยอดค้างชำระ")} value={`฿${int(outstanding)}`} foot={t("{n} ใบ · เกินกำหนด {m} ใบ", { n: unpaid.length, m: overdue.length })} tone={overdue.length ? "red" : "slate"} onClick={() => go("account", { tab: "invoice" })} />
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="text-[12.5px] font-semibold text-slate-500">{t("อัตราการเช่า")}</div>
          <div className="mt-1 text-[28px] font-bold leading-tight text-slate-900">{Math.round(occupancy * 100)}%</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-leaf-100">
            <div className="h-full rounded-full bg-leaf-600" style={{ width: `${occupancy * 100}%` }} />
          </div>
          <div className="mt-2 text-[11.5px] text-slate-500">{t("{a}/{b} ล็อกมีผู้เช่า", { a: occupied, b: areas.length })}</div>
          <button type="button" onClick={() => go("manage")} className="mt-3 flex w-full items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-left text-[11.5px] text-slate-600 hover:bg-slate-100">
            <Gauge className="size-3.5 text-cyan-600" />
            {t("มิเตอร์รอบนี้ จดแล้ว {a}/{b}", { a: meterDone, b: cycle.length })}
          </button>
        </div>
      </div>

      {/* สถานะพื้นที่ทั้งหมด — กดเพื่อไปผังพื้นที่ที่กรองไว้ */}
      <div className="grid grid-cols-7 gap-2">
        <StatusCell label={t("ทั้งหมด")} count={areas.length} pct={1} onClick={() => go("area")} />
        {statusOrder.map((s) => (
          <StatusCell key={s} status={s} label={t(statusLabelTh[s])} count={statusCount[s]} pct={statusCount[s] / areas.length} onClick={() => go("area", { status: s })} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <ChartCard
            title={t("รายรับย้อนหลัง 12 เดือน")}
            subtitle={t("แท่งสีเข้ม = ช่วงที่เลือก ({p})", { p: periodLabel[period] })}
            tableLabel={t("ตาราง")}
            table={{ head: [t("เดือน"), t("รายรับ (บาท)")], rows: months.map((m) => [`${monthShort(parseISODate(m.period).getMonth(), lang)} ${lang === "th" ? String(parseISODate(m.period).getFullYear() + 543).slice(2) : String(parseISODate(m.period).getFullYear()).slice(2)}`, money(m.total)]) }}
          >
            <ColumnChart
              height={230}
              color="#557A2F"
              muted="#CFE6B0"
              format={(n) => `฿${int(n)}`}
              data={months.map((m) => {
                const dt = parseISODate(m.period);
                return {
                  key: m.period,
                  label: monthShort(dt.getMonth(), lang),
                  value: m.total,
                  emphasis: emphasized(m.period),
                  tip: (
                    <span>
                      <b className="tabular-nums">฿{money(m.total)}</b> <span className="text-slate-500">· {monthShort(dt.getMonth(), lang)} {lang === "th" ? dt.getFullYear() + 543 : dt.getFullYear()}</span>
                    </span>
                  ),
                };
              })}
            />
          </ChartCard>
        </div>
        <ChartCard
          title={t("ช่องทางรับชำระ")}
          subtitle={periodLabel[period]}
          tableLabel={t("ตาราง")}
          table={{ head: [t("ช่องทาง"), t("ยอด (บาท)")], rows: methods.map((m) => [m.label, money(m.value)]) }}
        >
          <div className="pt-2">
            <StackedBar segments={methods} format={(n) => `฿${int(n)}`} />
            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-[11.5px] leading-relaxed text-slate-500">{t("QR พร้อมเพย์ตัดยอดอัตโนมัติผ่านระบบ Payment Intents — ไม่ต้องรอตรวจสลิป")}</p>
            {slipsWaiting > 0 && (
              <button type="button" onClick={() => go("verify")} className="mt-2 flex w-full items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-left text-[12px] font-semibold text-violet-900 hover:bg-violet-100">
                <BadgeCheck className="size-4 text-violet-600" />
                {t("สลิปที่ผู้เช่าโอนเองรอตรวจสอบ {n} รายการ", { n: slipsWaiting })}
                <ChevronRight className="ml-auto size-4" />
              </button>
            )}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ChartCard title={t("อัตราการเช่ารายโซน")} subtitle={t("สัดส่วนล็อกที่มีสัญญาเช่า")} tableLabel={t("ตาราง")} table={{ head: [t("โซน"), t("อัตราการเช่า")], rows: zoneRows.map((z) => [z.label, z.value]) }}>
          <div className="pt-2">
            <HBars rows={zoneRows} color="#6E9B3E" track="#E6F2D6" />
          </div>
        </ChartCard>

        <Panel
          className="col-span-2"
          title={t("รับชำระล่าสุด")}
          subtitle={t("รวมรายการจากเครื่อง Handheld แบบเรียลไทม์")}
          actions={
            <button type="button" onClick={() => go("account", { tab: "receipt" })} className="text-[12px] font-semibold text-leaf-700 hover:underline">
              {t("ดูทั้งหมด")}
            </button>
          }
          bodyClass="p-0"
        >
          <table className="w-full text-[12.5px]">
            <tbody className="tabular-nums">
              {recent.map((r) => {
                const c = idx.customerById.get(r.customerId);
                const isNew = r.paidAt.startsWith(today);
                return (
                  <tr key={r.id} className={cn("border-t border-slate-100 first:border-0", isNew && "bg-leaf-50/60")}>
                    <td className="py-2.5 pl-4 pr-2">
                      <div className="font-semibold text-slate-800">{r.no}</div>
                      <div className="text-[11px] text-slate-500">
                        {shortDate(r.paidAt, lang)} {time(r.paidAt)}
                      </div>
                    </td>
                    <td className="px-2">
                      <div className="max-w-[220px] truncate font-medium text-slate-700">{c ? d(c.shop) : "-"}</div>
                      <div className="text-[11px] text-slate-500">{idx.areaNames(idx.invoiceById.get(r.invoiceIds[0])?.areaIds ?? [])}</div>
                    </td>
                    <td className="px-2">
                      <ChannelBadge channel={r.channel} />
                    </td>
                    <td className="px-2 text-slate-500">{t(r.method === "cash" ? "เงินสด" : r.method === "qr" ? "QR พร้อมเพย์" : "เงินโอน")}</td>
                    <td className="py-2.5 pl-2 pr-4 text-right">
                      <div className="font-bold text-slate-900">฿{money(r.total)}</div>
                      {isNew && <Badge tone="leaf">{t("วันนี้")}</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </div>

      <Panel title={t("ใกล้หมดสัญญา")} subtitle={t("ภายใน {n} วัน", { n: market.nearExpireDays })} actions={<CalendarClock className="size-4 text-orange-500" />}>
        <div className="grid grid-cols-5 gap-3">
          {expiring.map((c) => {
            const cust = idx.customerById.get(c.customerId)!;
            const left = daysBetween(today, c.end);
            return (
              <button key={c.id} type="button" onClick={() => go("tenant", { contract: c.id })} className="rounded-xl border border-orange-200 bg-orange-50/60 p-3 text-left transition hover:border-orange-300 hover:bg-orange-50">
                <div className="truncate text-[12.5px] font-bold text-slate-800">{d(cust.shop)}</div>
                <div className="text-[11px] text-slate-500">
                  {c.no} · {idx.areaNames(c.areaIds)}
                </div>
                <div className="mt-2 text-[12px] font-semibold text-orange-800">{t("เหลือ {n} วัน", { n: left })}</div>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function StatTile({ label, value, foot, tone, onClick }: { label: string; value: string; foot: string; tone: "red" | "slate"; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col justify-start rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition hover:border-slate-300">
      <div className="text-[12.5px] font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-[28px] font-bold leading-tight text-slate-900">{value}</div>
      <div className={cn("mt-2 text-[11.5px]", tone === "red" ? "font-semibold text-red-700" : "text-slate-500")}>{foot}</div>
    </button>
  );
}

function StatusCell({ status, label, count, pct, onClick }: { status?: AreaStatus; label: string; count: number; pct: number; onClick: () => void }) {
  const p = status ? statusPalette[status] : null;
  return (
    <button type="button" onClick={onClick} className="flex flex-col rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-slate-300">
      <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500">
        {p ? <span className="size-2.5 rounded-full" style={{ background: p.fg }} /> : <span className="size-2.5 rounded-full border-2 border-slate-400" />}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[20px] font-bold text-slate-900">{count}</span>
        <span className="text-[11px] text-slate-400">[{Math.round(pct * 100)}%]</span>
      </div>
    </button>
  );
}
