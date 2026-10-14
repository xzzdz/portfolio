// ตรรกะที่อ่านจากข้อมูลล้วนๆ (ไม่มี UI) — ใช้ร่วมกันทั้ง Handheld และเว็บแอดมิน
// สถานะพื้นที่ยึดกติกาเดียวกับระบบจริง : สัญญา → เช่าอยู่/ใกล้หมด/หมดสัญญา,
// ใบเสนอราคา → เสนอราคา/เสนอราคา(มัดจำ), ไม่มีอะไรผูก → ว่าง

import { daysBetween } from "@/lib/format";
import type { Area, AreaStatus, Contract, DemoData, Invoice, MeterReading } from "./data/types";

export const invoiceSubtotal = (iv: Invoice) => iv.items.reduce((sum, it) => sum + it.amount, 0);
export const invoiceAmount = (iv: Invoice) => invoiceSubtotal(iv) - iv.discount;

/** ค่าปรับชำระล่าช้า : วันละ 20 บาท สูงสุด 300 (เฉพาะบิลรายเดือน) */
export function fineOf(iv: Invoice, today: string) {
  if (iv.receiptId || iv.issueDate === iv.dueDate) return 0;
  const late = daysBetween(iv.dueDate, today);
  return late > 0 ? Math.min(300, late * 20) : 0;
}

/** review = แนบสลิปแล้ว รอฝ่ายบัญชีตรวจ */
export type InvoiceState = "paid" | "review" | "pending" | "overdue" | "unpaid";

export function invoiceState(iv: Invoice, today: string): InvoiceState {
  if (iv.receiptId) return "paid";
  if (iv.approvalId) return "review";
  if (iv.intentId) return "pending";
  if (iv.dueDate < today) return "overdue";
  return "unpaid";
}

export function contractStatus(contract: Contract, today: string, nearDays: number): AreaStatus {
  if (contract.kind === "quote") return "quote";
  if (contract.kind === "quoteDeposit") return "quoteDeposit";
  if (contract.end < today) return "expired";
  if (daysBetween(today, contract.end) <= nearDays) return "nearExpire";
  return "active";
}

export type DemoIndex = ReturnType<typeof buildIndex>;

/** ดัชนีค้นหาเร็ว สร้างใหม่เมื่อข้อมูลเปลี่ยน (ใช้คู่กับ useMemo) */
export function buildIndex(data: Pick<DemoData, "areas" | "zones" | "customers" | "contracts" | "invoices" | "receipts" | "accounts" | "meters" | "intents" | "market" | "today">) {
  const areaById = new Map(data.areas.map((a) => [a.id, a]));
  const zoneById = new Map(data.zones.map((z) => [z.id, z]));
  const customerById = new Map(data.customers.map((c) => [c.id, c]));
  const contractById = new Map(data.contracts.map((c) => [c.id, c]));
  const accountById = new Map(data.accounts.map((a) => [a.id, a]));
  const receiptById = new Map(data.receipts.map((r) => [r.id, r]));
  const invoiceById = new Map(data.invoices.map((iv) => [iv.id, iv]));
  const intentById = new Map(data.intents.map((it) => [it.id, it]));

  // สัญญาจริงมาก่อนใบเสนอราคาเสมอ
  const contractByArea = new Map<string, Contract>();
  for (const c of data.contracts) {
    for (const id of c.areaIds) {
      const existing = contractByArea.get(id);
      if (!existing || (existing.kind !== "contract" && c.kind === "contract")) contractByArea.set(id, c);
    }
  }

  const statusOfArea = (area: Area): AreaStatus => {
    const c = contractByArea.get(area.id);
    return c ? contractStatus(c, data.today, data.market.nearExpireDays) : "vacant";
  };

  const invoicesByCustomer = new Map<string, Invoice[]>();
  const invoicesByContract = new Map<string, Invoice[]>();
  for (const iv of data.invoices) {
    if (!invoicesByCustomer.has(iv.customerId)) invoicesByCustomer.set(iv.customerId, []);
    invoicesByCustomer.get(iv.customerId)!.push(iv);
    if (!invoicesByContract.has(iv.contractId)) invoicesByContract.set(iv.contractId, []);
    invoicesByContract.get(iv.contractId)!.push(iv);
  }

  return {
    areaById,
    zoneById,
    customerById,
    contractById,
    accountById,
    receiptById,
    invoiceById,
    intentById,
    contractByArea,
    invoicesByCustomer,
    invoicesByContract,
    statusOfArea,
    areaNames: (ids: string[]) => ids.map((id) => areaById.get(id)?.name ?? id).join(", "),
  };
}

/** ยอดใช้สูงผิดปกติ (เช่น กดเลขเกินหนึ่งหลัก) — สูงกว่าค่าใช้ปกติของแผงราว 2 เท่า */
export const isSuspiciousReading = (m: MeterReading) => m.current !== null && m.current - m.previous > (m.type === "water" ? 40 : 400);

export const statusOrder: AreaStatus[] = ["active", "nearExpire", "expired", "quote", "quoteDeposit", "vacant"];
