// ตรรกะของหน้า "ตรวจสอบการชำระเงิน" (ไม่มี UI) — ใช้ร่วมกันทั้ง seed, store และหน้าจอ
// กติกาเดียวกับระบบจริง : ผู้เช่าโอนเองแล้วแนบสลิป → ระบบอ่านสลิปแล้วตรวจบัญชีผู้รับ / ยอดเงิน / วันที่
// → จับคู่กับรายการเดินบัญชีจากไฟล์ Bank Statement → ให้คะแนนความมั่นใจ → ฝ่ายบัญชีอนุมัติหรือปฏิเสธ

import type { L } from "@/lib/i18n";
import type { Approval, BankCode, PaymentAccount, SlipInfo } from "./data/types";

/** ธนาคารต้นทางของผู้เช่าที่โอนเข้ามา */
export const senderBanks: BankCode[] = ["KBANK", "SCB", "BBL", "KTB"];

/** ใช้เวลาอ่านสลิปราว 15 วินาที (ระบบจริงส่ง estimated_time มาให้นับถอยหลัง) */
export const SLIP_READ_MS = 15_000;

/** รูปแบบไฟล์ Statement ของแต่ละธนาคาร (pattern) — ตัวแรกของแต่ละธนาคารคือค่าเริ่มต้น */
export const statementPatterns: { id: string; bank: BankCode; name: string; code: string; ext: string }[] = [
  { id: "kbank-kbiz", bank: "KBANK", name: "K-BIZ · Statement", code: "KBANK-KBIZ-XLSX", ext: ".xlsx" },
  { id: "kbank-kcash", bank: "KBANK", name: "K-Cash Connect Plus", code: "KBANK-KCC-CSV", ext: ".csv" },
  { id: "scb-bnet", bank: "SCB", name: "SCB Business Net", code: "SCB-BNET-XLS", ext: ".xls" },
  { id: "scb-anywhere", bank: "SCB", name: "SCB Anywhere", code: "SCB-ANY-CSV", ext: ".csv" },
  { id: "pp-kbiz-qr", bank: "PROMPTPAY", name: "K-BIZ · QR Payment", code: "PP-KBIZ-QR-XLSX", ext: ".xlsx" },
];

/** ไฟล์ที่ระบบอ่านได้ */
export const STATEMENT_ACCEPT = ".xlsx,.xls,.csv";

/** ปิดเลขบัญชีเหลือ 4 หลักท้าย แบบที่สลิปธนาคารแสดง */
export function maskAccount(account: Pick<PaymentAccount, "kind" | "accountNo">) {
  const digits = account.accountNo.replace(/\D/g, "");
  return account.kind === "promptpay" ? `xxx-xxx-${digits.slice(-4)}` : `xxx-x-x${digits.slice(-5, -1)}-x`;
}

/** เลขอ้างอิงการโอนรูปแบบเดียวกับสลิปธนาคาร (เวลาโอน + รหัสช่องทาง + เลขลำดับ) */
export function slipRef(at: Date, seed: number) {
  const p = (n: number, len = 2) => String(n).padStart(len, "0");
  const stamp = `${p(at.getFullYear() % 100)}${p(at.getMonth() + 1)}${p(at.getDate())}${p(at.getHours())}${p(at.getMinutes())}${p(at.getSeconds())}`;
  return `0${stamp}${["APM", "BTF", "ATF", "MOB"][seed % 4]}${p(seed % 10_000, 4)}`;
}

/** คำอธิบายรายการเดินบัญชีตามไฟล์ธนาคาร */
export function bankTxnDetail(slip: SlipInfo): L {
  const last4 = slip.senderAccount.replace(/\D/g, "").slice(-4);
  return {
    th: `รับโอนเงิน ${slip.senderBank} X${last4} ${slip.senderName.th}`,
    en: `Incoming transfer ${slip.senderBank} X${last4} ${slip.senderName.en}`,
  };
}

/** ตัวเลขคงที่จาก id — คะแนนของแต่ละรายการต่างกันเล็กน้อย แต่คำนวณซ้ำได้ค่าเดิม */
const jitter = (id: string, range: number) => [...id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % range;

/** คิดคะแนนความมั่นใจจากผลตรวจรายข้อ + การจับคู่กับรายการเดินบัญชี */
export function scoreApproval(a: Approval): Approval {
  const { account, amount, date } = a.checks;
  let confidence: number;
  let confidenceStatus: Approval["confidenceStatus"];
  if (a.duplicateOf) [confidence, confidenceStatus] = [12 + jitter(a.id, 8), "needs_inspection"];
  else if (account === "mismatch") [confidence, confidenceStatus] = [20 + jitter(a.id, 6), "needs_inspection"];
  else if (amount === "mismatch") [confidence, confidenceStatus] = [(a.bankTxnId ? 44 : 38) + jitter(a.id, 5), "needs_inspection"];
  else if (a.bankTxnId) [confidence, confidenceStatus] = [96 + jitter(a.id, 4), "verified_match"];
  else [confidence, confidenceStatus] = [(date === "match" ? 74 : 66) + jitter(a.id, 6), "review_recommended"];
  return { ...a, confidence, confidenceStatus };
}

/** ยังอ่านสลิปไม่เสร็จ (ระหว่างนับถอยหลัง) */
export const isProcessing = (a: Approval) => a.status === "pending" && Boolean(a.estimatedAt);

/** ส่วนต่างระหว่างยอดจากสลิปกับยอดตามบิล (ติดลบ = จ่ายขาด) */
export const amountDiff = (a: Approval) => a.slip.amount - a.amount;
