"use client";

import { FileText, History, Printer, ReceiptText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { money, monthYear, shortDate, time } from "@/lib/format";
import { firstOfMonth } from "../../data/seed";
import { invoiceAmount, invoiceState, invoiceSubtotal } from "../../selectors";
import { BankLogo } from "../../shared/BankLogo";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useApp } from "../AppContext";
import { SheetFrame } from "../ui/Overlays";
import { Button, Card, EmptyState, Pill, Segment, SubHeader } from "../ui/parts";

type Tab = "billing" | "payment";

export function HistoryScreen() {
  const { t, d, lang, route, openSheet } = useApp();
  const idx = useDemoIndex();
  const invoices = useDemoStore((s) => s.invoices);
  const receipts = useDemoStore((s) => s.receipts);
  const today = useDemoStore((s) => s.today);
  const [tab, setTab] = useState<Tab>(route.params.tab === "payment" ? "payment" : "billing");
  const months = [0, -1, -2].map((n) => firstOfMonth(today, n));
  const [month, setMonth] = useState(months[0]);
  const ym = month.slice(0, 7);

  const monthInvoices = invoices.filter((iv) => iv.issueDate.startsWith(ym)).sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1));
  const monthReceipts = receipts.filter((r) => r.paidAt.startsWith(ym)).sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));
  const total = tab === "billing" ? monthInvoices.reduce((s, iv) => s + invoiceAmount(iv), 0) : monthReceipts.reduce((s, r) => s + r.total, 0);
  const list = tab === "billing" ? monthInvoices : monthReceipts;

  return (
    <div className="flex h-full flex-col bg-[#F1F5F9]">
      <SubHeader title={t("ประวัติวางบิล / ชำระ")} />
      <div className="shrink-0 space-y-2.5 px-3 pb-2 pt-3">
        <Segment
          value={tab}
          onChange={setTab}
          options={[
            { value: "billing", label: t("ประวัติวางบิล"), icon: FileText },
            { value: "payment", label: t("ประวัติชำระ"), icon: ReceiptText },
          ]}
        />
        <div className="flex gap-1.5">
          {months.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonth(m)}
              className={cn("h-8 flex-1 rounded-xl border text-[12px] font-bold", m === month ? "border-[#0F52BA] bg-[#EFF6FF] text-[#0F52BA]" : "border-slate-200 bg-white text-slate-600")}
            >
              {monthYear(m, lang)}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white px-3.5 py-2.5 shadow-sm">
          <span className="text-[12px] text-slate-500">
            {tab === "billing" ? t("ใบวางบิล {n} ใบ", { n: list.length }) : t("ใบเสร็จ {n} ใบ", { n: list.length })}
          </span>
          <span className={cn("text-[16px] font-extrabold", tab === "payment" ? "text-emerald-700" : "text-slate-900")}>฿{money(total)}</span>
        </div>
      </div>

      <div className="thin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-24 pt-1">
        {list.length === 0 && <EmptyState icon={History} title={t("ไม่มีรายการในเดือนนี้")} />}
        {tab === "billing"
          ? monthInvoices.slice(0, 60).map((iv) => {
              const c = idx.customerById.get(iv.customerId)!;
              const st = invoiceState(iv, today);
              return (
                <Card key={iv.id} className="flex items-center gap-3 p-3" onClick={() => openSheet(<DocSheet kind="invoice" id={iv.id} />)}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900">
                      <span className="truncate">{iv.no}</span>
                      <StatePill state={st} />
                    </div>
                    <div className="truncate text-[11.5px] text-slate-500">
                      {d(c.shop)} · {t("ล็อค {ln}", { ln: idx.areaNames(iv.areaIds) })}
                    </div>
                    <div className="text-[11px] text-slate-400">{t("ครบกำหนด {v}", { v: shortDate(iv.dueDate, lang) })}</div>
                  </div>
                  <div className="text-[14px] font-extrabold text-slate-900">฿{money(invoiceAmount(iv))}</div>
                </Card>
              );
            })
          : monthReceipts.slice(0, 60).map((r) => {
              const c = idx.customerById.get(r.customerId)!;
              const acc = idx.accountById.get(r.accountId);
              return (
                <Card key={r.id} className="flex items-center gap-3 p-3" onClick={() => openSheet(<DocSheet kind="receipt" id={r.id} />)}>
                  <BankLogo bank={acc?.bank ?? "CASH"} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900">
                      <span className="truncate">{r.no}</span>
                      <Pill tone={r.channel === "handheld" ? "violet" : "slate"}>{r.channel === "handheld" ? "Handheld" : "Web"}</Pill>
                    </div>
                    <div className="truncate text-[11.5px] text-slate-500">{d(c.shop)}</div>
                    <div className="text-[11px] text-slate-400">
                      {shortDate(r.paidAt, lang)} {time(r.paidAt)} · {t(r.method === "cash" ? "เงินสด" : r.method === "qr" ? "QR พร้อมเพย์" : "เงินโอน")}
                    </div>
                  </div>
                  <div className="text-[14px] font-extrabold text-emerald-700">฿{money(r.total)}</div>
                </Card>
              );
            })}
      </div>
    </div>
  );
}

function StatePill({ state }: { state: ReturnType<typeof invoiceState> }) {
  const { t } = useApp();
  if (state === "paid") return <Pill tone="green">{t("ชำระแล้ว")}</Pill>;
  if (state === "overdue") return <Pill tone="red">{t("เกินกำหนด")}</Pill>;
  if (state === "review") return <Pill tone="violet">{t("รอตรวจสอบ")}</Pill>;
  if (state === "pending") return <Pill tone="amber">{t("รอชำระ (QR)")}</Pill>;
  return <Pill tone="slate">{t("ค้างชำระ")}</Pill>;
}

/** รายละเอียดเอกสาร + สั่งพิมพ์ซ้ำ */
export function DocSheet({ kind, id }: { kind: "invoice" | "receipt"; id: string }) {
  const { t, d, lang, print, notify, closeSheet } = useApp();
  const idx = useDemoIndex();
  const today = useDemoStore((s) => s.today);
  const receipt = kind === "receipt" ? idx.receiptById.get(id) : undefined;
  const invoices = kind === "invoice" ? [idx.invoiceById.get(id)!] : (receipt?.invoiceIds ?? []).map((x) => idx.invoiceById.get(x)!).filter(Boolean);
  const first = invoices[0];
  const customer = idx.customerById.get(first?.customerId ?? receipt?.customerId ?? "")!;
  const no = receipt?.no ?? first?.no;
  const total = receipt?.total ?? (first ? invoiceAmount(first) : 0);

  return (
    <SheetFrame
      title={kind === "receipt" ? t("ใบเสร็จรับเงิน") : t("ใบวางบิล/ใบแจ้งหนี้")}
      subtitle={`${no} · ${d(customer.shop)}`}
      icon={kind === "receipt" ? ReceiptText : FileText}
      iconTone={kind === "receipt" ? "green" : "cyan"}
      footer={
        <Button
          className="w-full"
          icon={Printer}
          onClick={() => {
            print(kind === "receipt" ? { kind: "receipt", receiptId: id } : { kind: "invoice", invoiceId: id });
            notify(t("กำลังพิมพ์..."), no, "info");
            closeSheet();
          }}
        >
          {t("พิมพ์ซ้ำ")}
        </Button>
      }
    >
      <div className="rounded-2xl bg-slate-50 p-3.5 text-[12.5px]">
        <div className="flex justify-between py-0.5">
          <span className="text-slate-500">{kind === "receipt" ? t("วันที่รับชำระ") : t("วันที่ออกใบวางบิล")}</span>
          <b>{receipt ? `${shortDate(receipt.paidAt, lang)} ${time(receipt.paidAt)}` : shortDate(first.issueDate, lang)}</b>
        </div>
        {!receipt && (
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500">{t("ครบกำหนดชำระ")}</span>
            <b>{shortDate(first.dueDate, lang)}</b>
          </div>
        )}
        <div className="flex justify-between py-0.5">
          <span className="text-slate-500">{t("ล็อค")}</span>
          <b>{idx.areaNames(first?.areaIds ?? [])}</b>
        </div>
        {receipt && (
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500">{t("พนักงาน")}</span>
            <b>{receipt.staff}</b>
          </div>
        )}
        {!receipt && first && (
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500">{t("สถานะ")}</span>
            <StatePill state={invoiceState(first, today)} />
          </div>
        )}
      </div>
      <div className="mt-3 divide-y divide-dashed divide-slate-200 rounded-2xl border border-slate-200 px-3.5">
        {invoices.flatMap((iv) =>
          iv.items.map((it, i) => (
            <div key={`${iv.id}-${i}`} className="flex items-center justify-between py-2 text-[12.5px]">
              <span>
                <span className="font-semibold text-slate-800">{d(it.label)}</span>
                {it.kind === "water" || it.kind === "electric" ? (
                  <span className="block text-[11px] text-slate-500">
                    {it.qty} {d(it.unit)} × {money(it.unitPrice)}
                  </span>
                ) : null}
              </span>
              <span className="font-bold">฿{money(it.amount)}</span>
            </div>
          )),
        )}
        {invoices.some((iv) => iv.discount) && (
          <div className="flex justify-between py-2 text-[12.5px] text-emerald-700">
            <span>{t("ส่วนลด/Discount")}</span>
            <b>-฿{money(invoices.reduce((s, iv) => s + iv.discount, 0))}</b>
          </div>
        )}
        {receipt && receipt.fine > 0 && (
          <div className="flex justify-between py-2 text-[12.5px] text-red-600">
            <span>{t("ค่าปรับ")}</span>
            <b>+฿{money(receipt.fine)}</b>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between px-1">
        <span className="text-[13px] font-bold text-slate-600">{t("รวมเป็นเงินทั้งสิ้น")}</span>
        <span className="text-[20px] font-extrabold text-slate-900">฿{money(total || invoices.reduce((s, iv) => s + invoiceSubtotal(iv), 0))}</span>
      </div>
    </SheetFrame>
  );
}
