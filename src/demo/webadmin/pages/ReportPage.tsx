"use client";

import { ChartColumn, Download, FileSpreadsheet } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { daysBetween, money, monthYear, shortDate, time } from "@/lib/format";
import { firstOfMonth } from "../../data/seed";
import { invoiceAmount, invoiceState } from "../../selectors";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useAdmin } from "../AdminContext";
import { Btn, PageHeader, Panel } from "../ui/kit";

/** ส่งออก CSV (มี BOM ให้ Excel อ่านภาษาไทยถูก) */
export function downloadCsv(filename: string, head: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type ReportId = "daily" | "outstanding" | "meter" | "receipts" | "staff";

export function ReportPage() {
  const { t, d, lang, toast } = useAdmin();
  const idx = useDemoIndex();
  const receipts = useDemoStore((s) => s.receipts);
  const invoices = useDemoStore((s) => s.invoices);
  const meters = useDemoStore((s) => s.meters);
  const today = useDemoStore((s) => s.today);
  const [report, setReport] = useState<ReportId>("daily");
  const month = firstOfMonth(today);
  const ym = month.slice(0, 7);

  const reports: { id: ReportId; title: string; desc: string }[] = [
    { id: "daily", title: t("รายงานรายรับประจำวัน"), desc: t("แยกตามช่องทางชำระ เดือนนี้") },
    { id: "outstanding", title: t("รายงานค้างชำระ"), desc: t("รายผู้เช่า + จำนวนวันที่เกินกำหนด") },
    { id: "meter", title: t("รายงานมิเตอร์น้ำ-ไฟ"), desc: t("หน่วยที่ใช้และยอดเงิน รอบบิลนี้") },
    { id: "receipts", title: t("ทะเบียนใบเสร็จรับเงิน"), desc: t("ใบเสร็จทั้งหมดของเดือนนี้") },
    { id: "staff", title: t("สรุปการรับชำระรายพนักงาน"), desc: t("เว็บ vs เครื่อง Handheld") },
  ];

  const table = useMemo((): { head: string[]; rows: (string | number)[][]; numeric: number[]; total?: (string | number)[] } => {
    if (report === "daily") {
      const days = new Map<string, { n: number; cash: number; transfer: number; qr: number }>();
      receipts
        .filter((r) => r.paidAt.startsWith(ym))
        .forEach((r) => {
          const k = r.paidAt.slice(0, 10);
          const v = days.get(k) ?? { n: 0, cash: 0, transfer: 0, qr: 0 };
          v.n++;
          v[r.method] += r.total;
          days.set(k, v);
        });
      const rows = [...days.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => [shortDate(k, lang), v.n, money(v.cash), money(v.transfer), money(v.qr), money(v.cash + v.transfer + v.qr)]);
      const sum = [...days.values()].reduce((s, v) => ({ n: s.n + v.n, cash: s.cash + v.cash, transfer: s.transfer + v.transfer, qr: s.qr + v.qr }), { n: 0, cash: 0, transfer: 0, qr: 0 });
      return { head: [t("วันที่"), t("ใบเสร็จ"), t("เงินสด"), t("เงินโอน"), t("QR พร้อมเพย์"), t("รวมรายรับ")], rows, numeric: [1, 2, 3, 4, 5], total: [t("รวม"), sum.n, money(sum.cash), money(sum.transfer), money(sum.qr), money(sum.cash + sum.transfer + sum.qr)] };
    }
    if (report === "outstanding") {
      const map = new Map<string, { n: number; amount: number; maxLate: number }>();
      invoices
        .filter((iv) => invoiceState(iv, today) !== "paid")
        .forEach((iv) => {
          const v = map.get(iv.customerId) ?? { n: 0, amount: 0, maxLate: 0 };
          v.n++;
          v.amount += invoiceAmount(iv);
          v.maxLate = Math.max(v.maxLate, daysBetween(iv.dueDate, today));
          map.set(iv.customerId, v);
        });
      const rows = [...map.entries()]
        .sort((a, b) => b[1].amount - a[1].amount)
        .map(([cid, v]) => {
          const c = idx.customerById.get(cid)!;
          const ivs = idx.invoicesByCustomer.get(cid) ?? [];
          return [d(c.shop), idx.areaNames(ivs[0]?.areaIds ?? []), v.n, v.maxLate > 0 ? v.maxLate : "-", money(v.amount)];
        });
      const total = [...map.values()].reduce((s, v) => s + v.amount, 0);
      return { head: [t("ผู้เช่า"), t("ล็อก"), t("ใบค้าง"), t("เกินกำหนด (วัน)"), t("ยอดค้าง")], rows, numeric: [2, 3, 4], total: [t("รวม"), "", rows.reduce((s, r) => s + Number(r[2]), 0), "", money(total)] };
    }
    if (report === "meter") {
      const rows = meters
        .filter((m) => m.period === month)
        .map((m) => {
          const usage = m.current !== null ? m.current - m.previous : null;
          return [idx.areaById.get(m.areaId)!.name, d(idx.customerById.get(m.customerId)!.shop), m.type === "water" ? t("น้ำ") : t("ไฟ"), m.meterNo, m.previous, m.current ?? "-", usage ?? "-", usage !== null ? money(usage * m.unitPrice) : "-"];
        });
      return { head: [t("ล็อก"), t("ผู้เช่า"), t("ประเภท"), t("เลขเครื่อง"), t("เลขครั้งก่อน"), t("เลขปัจจุบัน"), t("หน่วยที่ใช้"), t("ยอดชำระ")], rows, numeric: [4, 5, 6, 7] };
    }
    if (report === "receipts") {
      const rows = receipts
        .filter((r) => r.paidAt.startsWith(ym))
        .sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1))
        .map((r) => [r.no, `${shortDate(r.paidAt, lang)} ${time(r.paidAt)}`, d(idx.customerById.get(r.customerId)!.shop), t(r.method === "cash" ? "เงินสด" : r.method === "qr" ? "QR พร้อมเพย์" : "เงินโอน"), r.channel === "handheld" ? "Handheld" : "Web", r.staff, money(r.total)]);
      return { head: [t("เลขที่"), t("วันที่"), t("ผู้เช่า"), t("ช่องทาง"), t("ระบบ"), t("พนักงาน"), t("ยอดชำระ")], rows, numeric: [6] };
    }
    const map = new Map<string, { channel: string; n: number; amount: number }>();
    receipts
      .filter((r) => r.paidAt.startsWith(ym))
      .forEach((r) => {
        const k = `${r.staff}|${r.channel}`;
        const v = map.get(k) ?? { channel: r.channel, n: 0, amount: 0 };
        v.n++;
        v.amount += r.total;
        map.set(k, v);
      });
    const rows = [...map.entries()].sort((a, b) => b[1].amount - a[1].amount).map(([k, v]) => [k.split("|")[0], v.channel === "handheld" ? "Handheld" : "Web", v.n, money(v.amount)]);
    return { head: [t("พนักงาน"), t("ระบบ"), t("ใบเสร็จ"), t("ยอดรวม")], rows, numeric: [2, 3] };
  }, [report, receipts, invoices, meters, idx, d, t, lang, today, month, ym]);

  const current = reports.find((r) => r.id === report)!;

  return (
    <div className="space-y-4">
      <PageHeader title={t("รายงาน")} subtitle={t("รอบบิล {m}", { m: monthYear(month, lang, true) })} icon={ChartColumn} />
      <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-4">
        <div className="space-y-2">
          {reports.map((r) => (
            <button key={r.id} type="button" onClick={() => setReport(r.id)} className={cn("flex w-full items-start gap-3 rounded-xl border p-3 text-left transition", r.id === report ? "border-leaf-500 bg-white shadow-sm ring-1 ring-leaf-500" : "border-slate-200 bg-white/70 hover:bg-white")}>
              <FileSpreadsheet className={cn("mt-0.5 size-5 shrink-0", r.id === report ? "text-leaf-700" : "text-slate-400")} />
              <span>
                <span className="block text-[13px] font-semibold text-slate-800">{r.title}</span>
                <span className="block text-[11.5px] text-slate-500">{r.desc}</span>
              </span>
            </button>
          ))}
        </div>
        <Panel
          title={current.title}
          subtitle={t("{n} แถว", { n: table.rows.length })}
          actions={
            <Btn
              icon={Download}
              onClick={() => {
                downloadCsv(`${report}-${today}.csv`, table.head, table.total ? [...table.rows, table.total] : table.rows);
                toast(t("ส่งออกไฟล์ Excel (CSV) แล้ว"), "success");
              }}
            >
              {t("ส่งออก Excel")}
            </Btn>
          }
          bodyClass="p-0"
        >
          <div className="thin-scroll max-h-[520px] overflow-auto">
            <table className="w-full text-[12.5px] tabular-nums">
              <thead className="sticky top-0 bg-[#F4F4EC] text-left text-[11.5px] uppercase tracking-wide text-slate-500">
                <tr>
                  {table.head.map((h, i) => (
                    <th key={h} className={cn("whitespace-nowrap px-4 py-2.5 font-semibold", table.numeric.includes(i) && "text-right")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {r.map((c, j) => (
                      <td key={j} className={cn("whitespace-nowrap px-4 py-2", table.numeric.includes(j) && "text-right", j === 0 && "font-semibold text-slate-800")}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.rows.length === 0 && (
                  <tr>
                    <td colSpan={table.head.length} className="py-10 text-center text-slate-500">
                      {t("ไม่พบข้อมูล")}
                    </td>
                  </tr>
                )}
              </tbody>
              {table.total && (
                <tfoot className="sticky bottom-0 bg-leaf-50 font-bold text-slate-900">
                  <tr>
                    {table.total.map((c, j) => (
                      <td key={j} className={cn("px-4 py-2.5", table.numeric.includes(j) && "text-right")}>
                        {c}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
