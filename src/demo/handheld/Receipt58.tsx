"use client";

import { QRCodeSVG } from "qrcode.react";
import type { ReactNode } from "react";
import { englishAmountText, money, slashDate, thaiBahtText, time } from "@/lib/format";
import { COMMON_FEE } from "../data/seed";
import { invoiceAmount, invoiceSubtotal } from "../selectors";
import { useDemoStore } from "../store";
import { useDemoIndex } from "../useIndex";
import { dataText, type HLang } from "./i18n";
import type { PrintJob } from "./types";

/** ป้ายบนเอกสารพิมพ์ — แอปภาษาลาวพิมพ์ป้ายลาว ภาษาอื่นที่ไม่ใช่ไทยพิมพ์ป้ายอังกฤษ */
const docLabels = {
  th: {
    receipt: "ใบเสร็จรับเงิน",
    invoice: "ใบวางบิล/ใบแจ้งหนี้",
    notice: "ใบแจ้งค่าเช่า",
    test: "ทดสอบหัวพิมพ์",
    no: "เลขที่",
    paidAt: "วันที่รับชำระ",
    issued: "วันที่ออกใบวางบิล",
    due: "ครบกำหนดชำระ",
    printed: "วันที่พิมพ์",
    customer: "นามลูกค้า",
    zone: "โซน",
    area: "ชื่อพื้นที่",
    code: "รหัสพื้นที่",
    staff: "พนักงาน",
    ref: "อ้างอิงเลขที่",
    item: "รายการ",
    total: "รวม",
    sum: "รวมรายการ",
    discount: "ส่วนลด/Discount",
    fine: "ค่าปรับ",
    grand: "รวมเป็นเงินทั้งสิ้น",
    method: "รูปแบบชำระ",
    cash: "เงินสด",
    transfer: "เงินโอน",
    qr: "QR พร้อมเพย์",
    contract: "สัญญาเลขที่",
    term: "งวด",
    pleasePay: "กรุณาชำระเงินภายในกำหนด",
    notReceipt: "** เอกสารนี้ไม่ใช่ใบเสร็จรับเงิน **",
    thanks: "ขอบคุณที่ใช้บริการ",
    tel: "โทร",
    tax: "เลขผู้เสียภาษี",
    slip: "หลักฐานการแนบสลิป",
    intentNo: "เลขที่รายการ",
    slipNo: "เลขที่แนบสลิป",
    transferRef: "เลขอ้างอิงการโอน",
    attachedAt: "วันที่แนบสลิป",
    bills: "ใบวางบิล",
    tenant: "ผู้เช่า",
    custNo: "รหัสลูกค้า",
    payTo: "โอนเข้าบัญชี",
    bank: "ธนาคาร",
    accNo: "เลขบัญชี",
    accName: "ชื่อบัญชี",
    amountDue: "ยอดเงินที่ต้องชำระ",
    waitReview: "รอฝ่ายบัญชีตรวจสอบ",
  },
  lo: {
    receipt: "ໃບຮັບເງິນ",
    invoice: "ໃບວາງບິນ/ໃບແຈ້ງໜີ້",
    notice: "ໃບແຈ້ງຄ່າເຊົ່າ",
    test: "ທົດສອບຫົວພິມ",
    no: "ເລກທີ",
    paidAt: "ວັນທີຮັບຊຳລະ",
    issued: "ວັນທີອອກໃບວາງບິນ",
    due: "ຄົບກຳນົດຊຳລະ",
    printed: "ວັນທີພິມ",
    customer: "ນາມລູກຄ້າ",
    zone: "ໂຊນ",
    area: "ຊື່ພື້ນທີ່",
    code: "ລະຫັດພື້ນທີ່",
    staff: "ພະນັກງານ",
    ref: "ອ້າງອີງເລກທີ",
    item: "ລາຍການ",
    total: "ລວມ",
    sum: "ລວມລາຍການ",
    discount: "ສ່ວນຫຼຸດ/Discount",
    fine: "ຄ່າປັບໃໝ",
    grand: "ລວມເປັນເງິນທັງໝົດ",
    method: "ຮູບແບບຊຳລະ",
    cash: "ເງິນສົດ",
    transfer: "ເງິນໂອນ",
    qr: "QR PromptPay",
    contract: "ສັນຍາເລກທີ",
    term: "ງວດ",
    pleasePay: "ກະລຸນາຊຳລະເງິນພາຍໃນກຳນົດ",
    notReceipt: "** ເອກະສານນີ້ບໍ່ແມ່ນໃບຮັບເງິນ **",
    thanks: "ຂອບໃຈທີ່ໃຊ້ບໍລິການ",
    tel: "ໂທ",
    tax: "ເລກຜູ້ເສຍອາກອນ",
    slip: "ຫຼັກຖານການແນບສະລິບ",
    intentNo: "ເລກທີລາຍການ",
    slipNo: "ເລກທີແນບສະລິບ",
    transferRef: "ເລກອ້າງອີງການໂອນ",
    attachedAt: "ວັນທີແນບສະລິບ",
    bills: "ໃບວາງບິນ",
    tenant: "ຜູ້ເຊົ່າ",
    custNo: "ລະຫັດລູກຄ້າ",
    payTo: "ໂອນເຂົ້າບັນຊີ",
    bank: "ທະນາຄານ",
    accNo: "ເລກບັນຊີ",
    accName: "ຊື່ບັນຊີ",
    amountDue: "ຍອດເງິນທີ່ຕ້ອງຊຳລະ",
    waitReview: "ລໍຖ້າຝ່າຍບັນຊີກວດສອບ",
  },
  en: {
    receipt: "RECEIPT",
    invoice: "INVOICE",
    notice: "RENT NOTICE",
    test: "PRINTER TEST",
    no: "No.",
    paidAt: "Paid at",
    issued: "Issued",
    due: "Due date",
    printed: "Printed",
    customer: "Customer",
    zone: "Zone",
    area: "Area",
    code: "Area code",
    staff: "Staff",
    ref: "Reference",
    item: "Item",
    total: "Total",
    sum: "Subtotal",
    discount: "Discount",
    fine: "Late fee",
    grand: "Grand total",
    method: "Payment",
    cash: "Cash",
    transfer: "Bank transfer",
    qr: "PromptPay QR",
    contract: "Contract",
    term: "Term",
    pleasePay: "Please pay before the due date",
    notReceipt: "** This is not a receipt **",
    thanks: "Thank you",
    tel: "Tel",
    tax: "Tax ID",
    slip: "SLIP RECORD",
    intentNo: "Payment no.",
    slipNo: "Slip no.",
    transferRef: "Transfer ref.",
    attachedAt: "Attached",
    bills: "Invoices",
    tenant: "Tenant",
    custNo: "Customer no.",
    payTo: "Paid to account",
    bank: "Bank",
    accNo: "Account no.",
    accName: "Account name",
    amountDue: "Amount due",
    waitReview: "Awaiting accounting review",
  },
};

export function docLang(lang: HLang): "th" | "lo" | "en" {
  return lang === "th" ? "th" : lang === "lo" ? "lo" : "en";
}

const Rule = () => <div className="my-1.5 border-t border-dashed border-black" />;

function Line({ k, v, bold, big }: { k: ReactNode; v: ReactNode; bold?: boolean; big?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-2 ${bold ? "font-bold" : ""} ${big ? "text-[14px]" : ""}`}>
      <span className="shrink-0">{k}</span>
      <span className="min-w-0 text-right">{v}</span>
    </div>
  );
}

/** เอกสารบนกระดาษความร้อน 58 mm (พื้นที่พิมพ์จริง 48 mm) */
export function Receipt58({ job, lang }: { job: PrintJob; lang: HLang }) {
  const idx = useDemoIndex();
  const market = useDemoStore((s) => s.market);
  const approvals = useDemoStore((s) => s.approvals);
  const today = useDemoStore((s) => s.today);
  const dl = docLang(lang);
  const L = docLabels[dl];
  const dateLang = dl === "th" ? "th" : "en";
  const dt = (iso: string) => slashDate(iso, dateLang);
  const text = (v: { th: string; en: string }) => (dl === "en" ? v.en : dataText(lang, v));
  const amountWords = (n: number) => (dl === "th" ? thaiBahtText(n) : englishAmountText(n));

  const header = (
    <div className="text-center leading-tight">
      <div className="mx-auto mb-1 grid size-9 place-items-center rounded-full border-2 border-black text-[15px] font-black">S</div>
      <div className="text-[14px] font-bold">{text(market.name)}</div>
      <div className="text-[10.5px]">{text(market.branch)}</div>
      <div className="text-[10px]">
        {L.tel} {market.phone} · {L.tax} {market.taxId}
      </div>
    </div>
  );

  if (job.kind === "test") {
    return (
      <div>
        {header}
        <Rule />
        <div className="text-center text-[15px] font-bold">{L.test}</div>
        <div className="mt-1 h-3 w-full bg-black" />
        <div className="mt-1 grid grid-cols-8 gap-px">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="h-2.5 bg-black" style={{ opacity: (i + 1) / 8 }} />
          ))}
        </div>
        <div className="mt-2 text-[12px] leading-snug">
          <div>ไทย: ปั้น ปู่ ญี่ปุ่น น้ำ ฟ้า ฤๅษี ฃ ฅ</div>
          <div>ລາວ: ສະບາຍດີ ພາສາລາວ ໃບຮັບເງິນ</div>
          <div>EN: The quick brown fox 0123456789</div>
          <div className="font-bold">฿1,234.50 = {thaiBahtText(1234.5)}</div>
        </div>
        <div className="mt-2 flex justify-center">
          <QRCodeSVG value="CHAOPERTY-PRINTER-TEST" size={84} marginSize={0} />
        </div>
        <div className="mt-1 h-3 w-full bg-black" />
        <div className="mt-1 text-center text-[10px]">384 dots · 58 mm · {dt(today)}</div>
      </div>
    );
  }

  if (job.kind === "slip") {
    // หลักฐานการแนบสลิป : ให้ผู้เช่าถือไว้ว่าโอนแล้ว แนบสลิปแล้ว รอฝ่ายบัญชีตรวจ (ไม่ใช่ใบเสร็จ)
    const ap = approvals.find((a) => a.id === job.approvalId);
    if (!ap) return null;
    const intent = idx.intentById.get(ap.intentId);
    const customer = idx.customerById.get(ap.customerId)!;
    const account = idx.accountById.get(ap.accountId)!;
    const bills = (intent?.invoiceIds ?? []).map((id) => idx.invoiceById.get(id)?.no).filter(Boolean).join(", ");
    return (
      <div>
        {header}
        <Rule />
        <div className="text-center text-[15px] font-bold">{L.slip}</div>
        <Line k={L.intentNo} v={intent?.no ?? "-"} />
        <Line k={L.slipNo} v={ap.slip.no} />
        <Line k={L.transferRef} v={<span className="break-all text-[10.5px]">{ap.slip.ref}</span>} />
        <Line k={L.attachedAt} v={`${dt(ap.createdAt)} ${time(ap.createdAt)}`} />
        <Line k={L.bills} v={bills} />
        <Line k={L.tenant} v={text(customer.shop)} />
        <Line k={L.custNo} v={customer.custNo} />
        <Rule />
        <div className="font-bold">{L.payTo}</div>
        <Line k={L.bank} v={text(account.name)} />
        <Line k={L.accNo} v={account.accountNo} />
        <Line k={L.accName} v={text(account.accountName)} />
        <Rule />
        <Line k={L.amountDue} v={money(ap.amount)} bold big />
        <div className="text-center text-[10.5px]">({amountWords(ap.amount)})</div>
        <Rule />
        <div className="text-center text-[11px]">{L.waitReview}</div>
        <div className="text-center text-[11px] font-bold">{L.notReceipt}</div>
        <div className="flex justify-center py-1.5">
          <QRCodeSVG value={`CHAO|${ap.slip.no}|${ap.amount.toFixed(2)}`} size={64} marginSize={0} />
        </div>
        <div className="text-center text-[9.5px]">Chaoperty Handheld · DEMO</div>
      </div>
    );
  }

  if (job.kind === "notice") {
    const contract = idx.contractById.get(job.contractId)!;
    const customer = idx.customerById.get(contract.customerId)!;
    const area = idx.areaById.get(contract.areaIds[0])!;
    const zone = idx.zoneById.get(area.zoneId)!;
    const unpaid = (idx.invoicesByContract.get(contract.id) ?? []).filter((iv) => !iv.receiptId);
    // ไม่มียอดค้าง → แจ้งค่าเช่างวดถัดไปแทน (ใบแจ้งใช้ก่อนรับเงิน)
    const next = new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 1);
    const nextPeriod = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`;
    const upcoming = contract.term === "monthly" ? contract.rate + COMMON_FEE : contract.rate;
    const total = unpaid.length ? unpaid.reduce((s, iv) => s + invoiceAmount(iv), 0) : upcoming;
    return (
      <div>
        {header}
        <Rule />
        <div className="text-center text-[15px] font-bold">{L.notice}</div>
        <Line k={L.printed} v={dt(today)} />
        <Line k={L.customer} v={text(customer.name)} />
        <Line k={L.contract} v={contract.no} />
        <Line k={L.zone} v={text(zone.name)} />
        <Line k={L.area} v={idx.areaNames(contract.areaIds)} />
        <Line k={L.tel} v={customer.phone} />
        <Rule />
        <Line k={<b>{L.item}</b>} v={<b>{L.total}</b>} />
        {unpaid.length === 0 && (
          <div className="py-0.5">
            <Line k={`${L.term} ${slashDate(nextPeriod, dateLang).slice(3)}`} v={money(upcoming)} />
            <div className="pl-2 text-[10.5px]">{dl === "en" ? "Area rent, common area fee" : dl === "lo" ? "ຄ່າເຊົ່າພື້ນທີ່, ຄ່າບໍລິການສ່ວນກາງ" : "ค่าเช่าพื้นที่, ค่าบริการส่วนกลาง"}</div>
          </div>
        )}
        {unpaid.map((iv) => (
          <div key={iv.id} className="py-0.5">
            <Line k={`${L.term} ${slashDate(iv.period, dateLang).slice(3)}`} v={money(invoiceAmount(iv))} />
            <div className="pl-2 text-[10.5px]">{iv.items.map((it) => text(it.label)).join(", ")}</div>
          </div>
        ))}
        <Rule />
        <Line k={L.grand} v={money(total)} bold big />
        <div className="text-center text-[10.5px]">({amountWords(total)})</div>
        <Rule />
        <div className="text-center text-[11px]">{L.pleasePay}</div>
        <div className="text-center text-[11px] font-bold">{L.notReceipt}</div>
      </div>
    );
  }

  const receipt = job.kind === "receipt" ? idx.receiptById.get(job.receiptId) : undefined;
  const invoices = job.kind === "invoice" ? [idx.invoiceById.get(job.invoiceId)!] : (receipt?.invoiceIds ?? []).map((id) => idx.invoiceById.get(id)!).filter(Boolean);
  const first = invoices[0];
  if (!first) return null;
  const customer = idx.customerById.get(first.customerId)!;
  const area = idx.areaById.get(first.areaIds[0])!;
  const zone = idx.zoneById.get(area.zoneId)!;
  const subtotal = invoices.reduce((s, iv) => s + invoiceSubtotal(iv), 0);
  const discount = invoices.reduce((s, iv) => s + iv.discount, 0);
  const fine = receipt?.fine ?? 0;
  const grand = subtotal - discount + fine;
  const account = receipt ? idx.accountById.get(receipt.accountId) : undefined;

  return (
    <div>
      {header}
      <Rule />
      <div className="text-center text-[15px] font-bold">{receipt ? L.receipt : L.invoice}</div>
      <Line k={L.no} v={receipt?.no ?? first.no} />
      {receipt ? (
        <Line k={L.paidAt} v={`${dt(receipt.paidAt)} ${time(receipt.paidAt)}`} />
      ) : (
        <>
          <Line k={L.issued} v={dt(first.issueDate)} />
          <Line k={L.due} v={dt(first.dueDate)} />
        </>
      )}
      <Rule />
      <Line k={L.customer} v={text(customer.shop)} />
      <Line k={L.zone} v={text(zone.name)} />
      <Line k={L.area} v={idx.areaNames(first.areaIds)} />
      <Line k={L.code} v={first.areaIds.map((id) => idx.areaById.get(id)?.code).join(", ")} />
      {receipt && <Line k={L.staff} v={receipt.staff} />}
      {receipt && <Line k={L.ref} v={invoices.map((iv) => iv.no).join(", ")} />}
      <Rule />
      <Line k={<b>{L.item}</b>} v={<b>{L.total}</b>} />
      {invoices.flatMap((iv) =>
        iv.items.map((it, i) => (
          <Line key={`${iv.id}-${i}`} k={it.kind === "water" || it.kind === "electric" ? `${text(it.label)} (${it.qty})` : text(it.label)} v={money(it.amount)} />
        )),
      )}
      <Rule />
      <Line k={L.sum} v={money(subtotal)} />
      {discount > 0 && <Line k={L.discount} v={`-${money(discount)}`} />}
      {fine > 0 && <Line k={L.fine} v={money(fine)} />}
      <Line k={L.grand} v={money(grand)} bold big />
      <div className="text-center text-[10.5px]">({amountWords(grand)})</div>
      {receipt && (
        <>
          <Rule />
          <Line k={L.method} v={`${receipt.method === "cash" ? L.cash : receipt.method === "qr" ? L.qr : L.transfer}${account && account.kind === "bank" ? ` · ${account.bank}` : ""}`} />
        </>
      )}
      <Rule />
      <div className="flex justify-center py-1">
        <QRCodeSVG value={`CHAO|${receipt?.no ?? first.no}|${grand.toFixed(2)}`} size={74} marginSize={0} />
      </div>
      <div className="text-center text-[11px]">{L.thanks}</div>
      <div className="text-center text-[9.5px]">Chaoperty Handheld · DEMO</div>
    </div>
  );
}
