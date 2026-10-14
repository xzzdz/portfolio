"use client";

import { BadgeCheck, Eye, QrCode, Wallet, XCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { money, monthYear, shortDate, time } from "@/lib/format";
import { firstOfMonth } from "../../data/seed";
import type { Invoice, PaymentIntent, Receipt } from "../../data/types";
import { invoiceAmount, invoiceState } from "../../selectors";
import { BankLogo } from "../../shared/BankLogo";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useAdmin } from "../AdminContext";
import { DocumentModal } from "../ui/Document";
import { Badge, Btn, ChannelBadge, DataTable, InvoiceBadge, PageHeader, Panel, SearchInput, Select, Tabs, type Column } from "../ui/kit";
import { IntentModal, PaymentModal } from "./shared";
import { SlipReviewModal } from "./VerifyParts";

type Tab = "invoice" | "receipt" | "intent";

export function AccountPage() {
  const { t, d, lang, params, openModal, toast, go } = useAdmin();
  const idx = useDemoIndex();
  const invoices = useDemoStore((s) => s.invoices);
  const receipts = useDemoStore((s) => s.receipts);
  const intents = useDemoStore((s) => s.intents);
  const today = useDemoStore((s) => s.today);
  const cancelIntent = useDemoStore((s) => s.cancelIntent);
  const [tab, setTab] = useState<Tab>((params.tab as Tab) ?? "invoice");
  const months = [0, -1, -2].map((n) => firstOfMonth(today, n));
  const [month, setMonth] = useState(months[0]);
  const [query, setQuery] = useState("");
  const [billType, setBillType] = useState<"monthly" | "daily" | "all">("monthly");
  const ym = month.slice(0, 7);
  const q = query.trim().toLowerCase();

  const shopOf = (customerId: string) => idx.customerById.get(customerId);
  const matchText = (customerId: string, no: string) => {
    if (!q) return true;
    const c = shopOf(customerId);
    return [no, c?.shop.th, c?.shop.en, c?.name.th, c?.name.en].some((v) => v?.toLowerCase().includes(q));
  };

  const isDaily = (iv: Invoice) => iv.issueDate === iv.dueDate;
  const monthInvoices = invoices.filter((iv) => iv.issueDate.startsWith(ym));
  const listedInvoices = monthInvoices.filter((iv) => billType === "all" || (billType === "daily" ? isDaily(iv) : !isDaily(iv)));
  const billed = monthInvoices.reduce((s, iv) => s + invoiceAmount(iv), 0);
  const paid = monthInvoices.filter((iv) => iv.receiptId).reduce((s, iv) => s + invoiceAmount(iv), 0);
  const overdueAmt = monthInvoices.filter((iv) => invoiceState(iv, today) === "overdue").reduce((s, iv) => s + invoiceAmount(iv), 0);
  const unpaidAmt = billed - paid;

  const invoiceCols: Column<Invoice>[] = [
    { key: "no", header: t("เลขที่"), render: (iv) => <span className="font-semibold text-slate-800">{iv.no}</span>, sort: (iv) => iv.no },
    { key: "date", header: t("วันที่"), render: (iv) => shortDate(iv.issueDate, lang), sort: (iv) => iv.issueDate },
    { key: "shop", header: t("ผู้เช่า"), render: (iv) => <span className="font-medium">{d(shopOf(iv.customerId)!.shop)}</span>, sort: (iv) => d(shopOf(iv.customerId)!.shop) },
    { key: "area", header: t("ล็อก"), render: (iv) => idx.areaNames(iv.areaIds), sort: (iv) => idx.areaNames(iv.areaIds) },
    { key: "due", header: t("ครบกำหนด"), render: (iv) => shortDate(iv.dueDate, lang), sort: (iv) => iv.dueDate },
    { key: "bank", header: t("ธนาคาร"), render: (iv) => <BankLogo bank={idx.accountById.get(iv.accountId)!.bank} size={22} /> },
    { key: "amount", header: t("ยอดรวม"), align: "right", render: (iv) => <b>฿{money(invoiceAmount(iv))}</b>, sort: (iv) => invoiceAmount(iv) },
    { key: "status", header: t("สถานะ"), render: (iv) => <InvoiceBadge state={invoiceState(iv, today)} />, sort: (iv) => invoiceState(iv, today) },
    {
      key: "act",
      header: "",
      align: "right",
      render: (iv) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Btn size="sm" variant="ghost" icon={Eye} onClick={() => openModal(<DocumentModal kind="invoice" id={iv.id} />, { wide: true })} title={t("ดู/พิมพ์")} />
          {!iv.receiptId && !iv.intentId && (
            <Btn size="sm" variant="outline" icon={Wallet} onClick={() => openModal(<PaymentModal customerId={iv.customerId} />)}>
              {t("รับชำระ")}
            </Btn>
          )}
        </div>
      ),
    },
  ];

  const receiptCols: Column<Receipt>[] = [
    { key: "no", header: t("เลขที่"), render: (r) => <span className="font-semibold text-slate-800">{r.no}</span>, sort: (r) => r.no },
    { key: "date", header: t("วันที่รับชำระ"), render: (r) => `${shortDate(r.paidAt, lang)} ${time(r.paidAt)}`, sort: (r) => r.paidAt },
    { key: "shop", header: t("ผู้เช่า"), render: (r) => <span className="font-medium">{d(shopOf(r.customerId)!.shop)}</span>, sort: (r) => d(shopOf(r.customerId)!.shop) },
    { key: "method", header: t("รูปแบบชำระ"), render: (r) => <span className="flex items-center gap-1.5"><BankLogo bank={idx.accountById.get(r.accountId)!.bank} size={20} />{t(r.method === "cash" ? "เงินสด" : r.method === "qr" ? "QR พร้อมเพย์" : "เงินโอน")}</span>, sort: (r) => r.method },
    { key: "channel", header: t("ระบบ"), render: (r) => <ChannelBadge channel={r.channel} />, sort: (r) => r.channel },
    { key: "staff", header: t("พนักงาน"), render: (r) => <span className="text-slate-500">{r.staff}</span>, sort: (r) => r.staff },
    { key: "total", header: t("ยอดชำระ"), align: "right", render: (r) => <b className="text-emerald-700">฿{money(r.total)}</b>, sort: (r) => r.total },
    { key: "act", header: "", align: "right", render: (r) => <Btn size="sm" variant="ghost" icon={Eye} onClick={() => openModal(<DocumentModal kind="receipt" id={r.id} />, { wide: true })} title={t("ดู/พิมพ์")} /> },
  ];

  const intentCols: Column<PaymentIntent>[] = [
    { key: "no", header: t("เลขที่"), render: (it) => <span className="font-semibold text-slate-800">{it.no}</span>, sort: (it) => it.no },
    { key: "created", header: t("สร้างเมื่อ"), render: (it) => `${shortDate(it.createdAt, lang)} ${time(it.createdAt)}`, sort: (it) => it.createdAt },
    { key: "shop", header: t("ผู้เช่า"), render: (it) => d(shopOf(it.customerId)!.shop) },
    { key: "invoices", header: t("ใบวางบิล"), render: (it) => <span className="text-slate-500">{it.invoiceIds.map((id) => idx.invoiceById.get(id)?.no).join(", ")}</span> },
    { key: "channel", header: t("สร้างจาก"), render: (it) => <ChannelBadge channel={it.channel} /> },
    { key: "amount", header: t("ยอด"), align: "right", render: (it) => <b>฿{money(it.amount)}</b>, sort: (it) => it.amount },
    {
      key: "status",
      header: t("สถานะ"),
      render: (it) =>
        it.status === "paid" ? <Badge tone="green">{t("ชำระแล้ว")}</Badge> : it.status === "cancelled" ? <Badge tone="slate">{t("ยกเลิก")}</Badge> : it.status === "review" ? <Badge tone="violet">{t("รอตรวจสอบสลิป")}</Badge> : new Date(it.expiresAt).getTime() < Date.now() ? <Badge tone="red">{t("QR หมดอายุ")}</Badge> : <Badge tone="amber">{t("รอชำระ")}</Badge>,
    },
    {
      key: "act",
      header: "",
      align: "right",
      render: (it) =>
        it.status === "review" && it.approvalId ? (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Btn
              size="sm"
              variant="outline"
              icon={BadgeCheck}
              onClick={() => {
                go("verify");
                openModal(<SlipReviewModal approvalId={it.approvalId!} />, { xl: true });
              }}
            >
              {t("ตรวจสอบสลิป")}
            </Btn>
          </div>
        ) : it.status === "pending" ? (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Btn size="sm" variant="outline" icon={QrCode} onClick={() => openModal(<IntentModal intentId={it.id} />)}>
              QR
            </Btn>
            <Btn
              size="sm"
              variant="ghost"
              icon={XCircle}
              onClick={() => {
                cancelIntent(it.id);
                toast(t("ยกเลิกรายการรอชำระแล้ว"), "warning");
              }}
              title={t("ยกเลิกรายการ")}
            />
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("บัญชี")}
        subtitle={t("ใบวางบิล ใบเสร็จ และรายการรอชำระ (Payment Intents)")}
        icon={Wallet}
        actions={<Select value={month} onChange={setMonth} label={t("รอบบิล")} options={months.map((m) => ({ value: m, label: monthYear(m, lang, true) }))} />}
      />

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t("รวมยอดตั้งหนี้"), value: billed, tone: "text-slate-900" },
          { label: t("ใบวางบิล (ชำระแล้ว)"), value: paid, tone: "text-emerald-700" },
          { label: t("ค้างชำระ"), value: unpaidAmt, tone: "text-slate-900" },
          { label: t("เกินกำหนด"), value: overdueAmt, tone: overdueAmt ? "text-red-700" : "text-slate-900" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="text-[12px] font-semibold text-slate-500">{k.label}</div>
            <div className={cn("mt-1 text-[24px] font-bold tracking-tight", k.tone)}>฿{money(k.value)}</div>
            {k.label === t("ใบวางบิล (ชำระแล้ว)") && billed > 0 && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(paid / billed) * 100}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <Panel bodyClass="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: "invoice", label: t("ใบวางบิล"), count: monthInvoices.length },
              { value: "receipt", label: t("ใบเสร็จรับเงิน"), count: receipts.filter((r) => r.paidAt.startsWith(ym)).length },
              { value: "intent", label: t("รายการรอชำระ"), count: intents.filter((i) => i.status === "pending" || i.status === "review").length },
            ]}
          />
          <div className="flex gap-2">
            {tab === "invoice" && (
              <Select
                value={billType}
                onChange={setBillType}
                label={t("ประเภท")}
                options={[
                  { value: "monthly", label: t("รายเดือน") },
                  { value: "daily", label: t("รายวัน (ลาน E)") },
                  { value: "all", label: t("ทั้งหมด") },
                ]}
              />
            )}
            <SearchInput value={query} onChange={setQuery} placeholder={t("ค้นหา: เลขที่ / ผู้เช่า")} className="w-64" />
          </div>
        </div>
        {tab === "invoice" && (
          <DataTable key={`iv-${ym}-${q}-${billType}`} rows={listedInvoices.filter((iv) => matchText(iv.customerId, iv.no))} columns={invoiceCols} rowKey={(iv) => iv.id} onRowClick={(iv) => openModal(<DocumentModal kind="invoice" id={iv.id} />, { wide: true })} initialSort={{ key: "no", dir: "desc" }} />
        )}
        {tab === "receipt" && (
          <DataTable key={`re-${ym}-${q}`} rows={receipts.filter((r) => r.paidAt.startsWith(ym) && matchText(r.customerId, r.no))} columns={receiptCols} rowKey={(r) => r.id} onRowClick={(r) => openModal(<DocumentModal kind="receipt" id={r.id} />, { wide: true })} initialSort={{ key: "date", dir: "desc" }} />
        )}
        {tab === "intent" && (
          <DataTable
            key={`pi-${q}`}
            rows={intents.filter((it) => matchText(it.customerId, it.no))}
            columns={intentCols}
            rowKey={(it) => it.id}
            empty={t("ยังไม่มีรายการรอชำระ — ลองสร้าง QR จากเครื่อง Handheld หรือปุ่มรับชำระ")}
            initialSort={{ key: "created", dir: "desc" }}
          />
        )}
      </Panel>
    </div>
  );
}
