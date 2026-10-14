"use client";

import { FileText, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { englishAmountText, money, slashDate, thaiBahtText, time } from "@/lib/format";
import type { L, Locale } from "@/lib/i18n";
import { DEMO_PROMPTPAY_ID, promptPayPayload } from "@/lib/promptpay";
import type { Invoice } from "../../data/types";
import { invoiceAmount, invoiceSubtotal } from "../../selectors";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useAdmin } from "../AdminContext";
import { Btn, ModalFrame } from "./kit";

export type DocTemplate = "classic" | "tax" | "bilingual";

const templates: { id: DocTemplate; label: L }[] = [
  { id: "classic", label: { th: "แบบที่ 1 · บิลธรรมดา", en: "Template 1 · Standard bill" } },
  { id: "tax", label: { th: "แบบที่ 2 · ใบกำกับภาษี", en: "Template 2 · Tax invoice" } },
  { id: "bilingual", label: { th: "แบบที่ 3 · สองภาษา", en: "Template 3 · Bilingual" } },
];

/** หน้าต่างดูเอกสาร A4 + เลือกรูปแบบเอกสาร + สั่งพิมพ์/บันทึกเป็น PDF */
export function DocumentModal({ kind, id }: { kind: "invoice" | "receipt"; id: string }) {
  const { t, d, lang } = useAdmin();
  const [template, setTemplate] = useState<DocTemplate>("classic");
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener("afterprint", done);
    const timer = window.setTimeout(() => window.print(), 80);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", done);
    };
  }, [printing]);

  return (
    <ModalFrame
      title={kind === "invoice" ? t("ใบวางบิล/ใบแจ้งหนี้") : t("ใบเสร็จรับเงิน")}
      subtitle={t("ตัวอย่างก่อนพิมพ์ (A4)")}
      icon={FileText}
      footer={
        <>
          <div className="mr-auto flex flex-wrap gap-1.5">
            {templates.map((tp) => (
              <button
                key={tp.id}
                type="button"
                onClick={() => setTemplate(tp.id)}
                className={cn("h-8 rounded-lg border px-2.5 text-[12px] font-semibold", template === tp.id ? "border-leaf-600 bg-leaf-50 text-leaf-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
              >
                {d(tp.label)}
              </button>
            ))}
          </div>
          <Btn icon={Printer} onClick={() => setPrinting(true)}>
            {t("พิมพ์ / บันทึก PDF")}
          </Btn>
        </>
      }
    >
      <div className="rounded-xl bg-slate-200/70 p-5">
        <div className="mx-auto w-fit shadow-xl" style={{ zoom: 0.92 }}>
          <A4Doc kind={kind} id={id} template={template} lang={lang} />
        </div>
      </div>
      {printing &&
        createPortal(
          <div id="chao-print-root">
            <A4Doc kind={kind} id={id} template={template} lang={lang} />
          </div>,
          document.body,
        )}
    </ModalFrame>
  );
}

const labels = {
  th: {
    invoice: "ใบแจ้งหนี้ / ใบวางบิล",
    receipt: "ใบเสร็จรับเงิน",
    taxInvoice: "ใบเสร็จรับเงิน / ใบกำกับภาษี",
    original: "ต้นฉบับ",
    no: "เลขที่",
    date: "วันที่",
    due: "ครบกำหนดชำระ",
    customer: "ลูกค้า",
    shop: "ร้านค้า",
    area: "พื้นที่",
    contract: "สัญญาเลขที่",
    taxId: "เลขประจำตัวผู้เสียภาษี",
    idx: "ลำดับ",
    item: "รายการ",
    qty: "จำนวน",
    unit: "หน่วย",
    price: "ราคา/หน่วย",
    amount: "จำนวนเงิน",
    subtotal: "รวมเงิน",
    discount: "ส่วนลด",
    fine: "ค่าปรับชำระล่าช้า",
    beforeVat: "มูลค่าก่อนภาษี",
    vat: "ภาษีมูลค่าเพิ่ม 7%",
    grand: "จำนวนเงินรวมทั้งสิ้น",
    payBy: "ชำระโดย",
    scan: "สแกนเพื่อชำระผ่าน Thai QR / พร้อมเพย์",
    transferTo: "หรือโอนเข้าบัญชี",
    receiver: "ผู้รับเงิน",
    issuer: "ผู้ออกเอกสาร",
    cash: "เงินสด",
    transfer: "เงินโอน",
    qr: "QR พร้อมเพย์",
    note: "หมายเหตุ: กรุณาชำระภายในวันครบกำหนด หากเกินกำหนดมีค่าปรับวันละ 20 บาท",
    staff: "พนักงาน",
  },
  en: {
    invoice: "INVOICE",
    receipt: "RECEIPT",
    taxInvoice: "RECEIPT / TAX INVOICE",
    original: "ORIGINAL",
    no: "No.",
    date: "Date",
    due: "Due date",
    customer: "Customer",
    shop: "Shop",
    area: "Area",
    contract: "Contract",
    taxId: "Tax ID",
    idx: "#",
    item: "Description",
    qty: "Qty",
    unit: "Unit",
    price: "Unit price",
    amount: "Amount",
    subtotal: "Subtotal",
    discount: "Discount",
    fine: "Late fee",
    beforeVat: "Amount before VAT",
    vat: "VAT 7%",
    grand: "Grand total",
    payBy: "Paid by",
    scan: "Scan to pay with Thai QR / PromptPay",
    transferTo: "or transfer to",
    receiver: "Received by",
    issuer: "Issued by",
    cash: "Cash",
    transfer: "Bank transfer",
    qr: "PromptPay QR",
    note: "Note: please pay by the due date. Late payments incur a ฿20/day fee.",
    staff: "Staff",
  },
};

/** เอกสาร A4 (794 × 1123 px) — ใช้ทั้งพรีวิวและตอนสั่งพิมพ์ */
export function A4Doc({ kind, id, template, lang }: { kind: "invoice" | "receipt"; id: string; template: DocTemplate; lang: Locale }) {
  const idx = useDemoIndex();
  const market = useDemoStore((s) => s.market);
  const accounts = useDemoStore((s) => s.accounts);
  const receipt = kind === "receipt" ? idx.receiptById.get(id) : undefined;
  const invoices: Invoice[] = kind === "invoice" ? [idx.invoiceById.get(id)!].filter(Boolean) : (receipt?.invoiceIds ?? []).map((x) => idx.invoiceById.get(x)!).filter(Boolean);
  const first = invoices[0];
  if (!first) return null;
  const customer = idx.customerById.get(first.customerId)!;
  const contract = idx.contractById.get(first.contractId);
  const zone = idx.zoneById.get(idx.areaById.get(first.areaIds[0])!.zoneId)!;

  const bi = template === "bilingual";
  const docLang: Locale = bi ? "th" : lang;
  const Lb = labels[docLang];
  const En = labels.en;
  const tx = (k: keyof typeof labels.th) => (bi ? (
    <>
      {labels.th[k]}
      <span className="block text-[9.5px] font-normal opacity-70">{En[k]}</span>
    </>
  ) : Lb[k]);
  const dt = (iso: string) => slashDate(iso, docLang === "th" ? "th" : "en");
  const name = (v: L) => v[docLang];

  const subtotal = invoices.reduce((s, iv) => s + invoiceSubtotal(iv), 0);
  const discount = invoices.reduce((s, iv) => s + iv.discount, 0);
  const fine = receipt?.fine ?? 0;
  const grand = subtotal - discount + fine;
  const beforeVat = grand / 1.07;
  const vat = grand - beforeVat;
  const isTax = template === "tax";
  const title = kind === "invoice" ? Lb.invoice : isTax ? Lb.taxInvoice : Lb.receipt;
  const bank = accounts.filter((a) => a.kind === "bank");
  const items = invoices.flatMap((iv) => iv.items);
  const accent = isTax ? "#2E4219" : "#111827";

  return (
    <div className="relative flex h-[1123px] w-[794px] flex-col bg-white px-[56px] py-[52px] font-receipt text-[13px] leading-snug text-slate-900">
      {/* หัวเอกสาร */}
      <div className={cn("flex items-start justify-between gap-6", isTax && "-mx-[56px] -mt-[52px] mb-6 bg-[#2E4219] px-[56px] pb-6 pt-[44px] text-white")}>
        <div className="flex gap-3">
          <span className={cn("grid size-14 place-items-center rounded-xl text-[24px] font-bold", isTax ? "bg-white text-[#2E4219]" : "bg-slate-900 text-white")}>S</span>
          <div>
            <div className="text-[19px] font-bold">{name(market.name)}</div>
            <div className={cn("text-[12px]", isTax ? "text-white/80" : "text-slate-600")}>{name(market.address)}</div>
            <div className={cn("text-[12px]", isTax ? "text-white/80" : "text-slate-600")}>
              {Lb.taxId} {market.taxId} · {market.phone}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[22px] font-bold leading-tight">{title}</div>
          {bi && <div className="text-[13px] opacity-70">{kind === "invoice" ? En.invoice : En.receipt}</div>}
          <div className={cn("mt-2 inline-block rounded border px-2 py-0.5 text-[11px] font-bold tracking-wider", isTax ? "border-white/60" : "border-slate-400 text-slate-600")}>{Lb.original}</div>
        </div>
      </div>

      {/* ลูกค้า + เลขที่ */}
      <div className="mt-6 grid grid-cols-[1.5fr_1fr] gap-4">
        <Box title={tx("customer")}>
          <div className="text-[14px] font-bold">{name(customer.name)}</div>
          <div>
            {tx("shop")}: {name(customer.shop)}
          </div>
          <div className="text-slate-600">{name(customer.address)}</div>
          <div className="text-slate-600">{customer.phone}</div>
        </Box>
        <Box>
          <Row k={tx("no")} v={receipt?.no ?? first.no} />
          <Row k={tx("date")} v={receipt ? `${dt(receipt.paidAt)} ${time(receipt.paidAt)}` : dt(first.issueDate)} />
          {!receipt && <Row k={tx("due")} v={dt(first.dueDate)} />}
          <Row k={tx("area")} v={`${idx.areaNames(first.areaIds)} · ${name(zone.name)}`} />
          {contract && <Row k={tx("contract")} v={contract.no} />}
        </Box>
      </div>

      {/* รายการ */}
      <table className="mt-5 w-full border-collapse text-[12.5px]">
        <thead>
          <tr style={{ background: isTax ? "#E6F2D6" : "#F1F5F9" }}>
            {(["idx", "item", "qty", "unit", "price", "amount"] as const).map((k, i) => (
              <th key={k} className={cn("border border-slate-300 px-2 py-1.5 font-bold", i >= 2 ? "text-right" : "text-left", i === 0 && "w-10 text-center")}>
                {tx(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td className="border border-slate-300 px-2 py-1.5 text-center">{i + 1}</td>
              <td className="border border-slate-300 px-2 py-1.5">
                {name(it.label)}
                {(it.kind === "water" || it.kind === "electric") && <span className="text-slate-500"> ({name(zone.name).split(" ")[0]} {idx.areaNames(first.areaIds)})</span>}
              </td>
              <td className="border border-slate-300 px-2 py-1.5 text-right tabular-nums">{it.qty}</td>
              <td className="border border-slate-300 px-2 py-1.5 text-right">{name(it.unit)}</td>
              <td className="border border-slate-300 px-2 py-1.5 text-right tabular-nums">{money(it.unitPrice)}</td>
              <td className="border border-slate-300 px-2 py-1.5 text-right tabular-nums">{money(it.amount)}</td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, 8 - items.length) }, (_, i) => (
            <tr key={`pad-${i}`}>
              {Array.from({ length: 6 }, (_, j) => (
                <td key={j} className="h-[30px] border border-slate-300" />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ยอดรวม */}
      <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded border border-slate-300 px-3 py-2 text-[12.5px]">
          <div className="font-bold">({docLang === "th" ? thaiBahtText(grand) : englishAmountText(grand)})</div>
          {receipt && (
            <div className="mt-1 text-slate-600">
              {Lb.payBy}: {receipt.method === "cash" ? Lb.cash : receipt.method === "qr" ? Lb.qr : Lb.transfer} · {Lb.staff} {receipt.staff}
            </div>
          )}
        </div>
        <div className="text-[12.5px]">
          <Row k={tx("subtotal")} v={money(subtotal)} />
          {discount > 0 && <Row k={tx("discount")} v={`-${money(discount)}`} />}
          {fine > 0 && <Row k={tx("fine")} v={money(fine)} />}
          {isTax && <Row k={tx("beforeVat")} v={money(beforeVat)} />}
          {isTax && <Row k={tx("vat")} v={money(vat)} />}
          <div className="mt-1 flex justify-between rounded px-2 py-1.5 text-[14px] font-bold text-white" style={{ background: accent }}>
            <span>{Lb.grand}</span>
            <span className="tabular-nums">{money(grand)}</span>
          </div>
        </div>
      </div>

      {/* ชำระเงิน (เฉพาะใบแจ้งหนี้) */}
      {kind === "invoice" && (
        <div className="mt-5 flex gap-5 rounded-lg border border-dashed border-slate-400 p-4">
          <div className="rounded bg-white p-1.5 ring-1 ring-slate-200">
            <QRCodeSVG value={promptPayPayload(DEMO_PROMPTPAY_ID, invoiceAmount(first))} size={104} marginSize={0} />
          </div>
          <div className="text-[12.5px]">
            <div className="font-bold">{Lb.scan}</div>
            <div className="mt-1 text-slate-600">{Lb.transferTo}</div>
            {bank.map((b) => (
              <div key={b.id}>
                {name(b.name)} {b.accountNo} · {name(b.accountName)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <p className="mb-8 text-[11.5px] text-slate-500">{Lb.note}</p>
        <div className="grid grid-cols-2 gap-16 text-center text-[12.5px]">
          {[Lb.receiver, Lb.issuer].map((s) => (
            <div key={s}>
              <div className="mx-auto mb-1 h-px w-[70%] bg-slate-400" />
              {s}
              <div className="text-[11px] text-slate-500">{Lb.date} ____/____/______</div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center text-[10px] tracking-wider text-slate-400">Chaoperty · Property Manager · DEMO</div>
      </div>
    </div>
  );
}

function Box({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded border border-slate-300 px-3 py-2">
      {title && <div className="mb-1 text-[11.5px] font-bold text-slate-500">{title}</div>}
      {children}
    </div>
  );
}

function Row({ k, v }: { k: ReactNode; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span className="text-slate-600">{k}</span>
      <span className="text-right font-semibold tabular-nums">{v}</span>
    </div>
  );
}
