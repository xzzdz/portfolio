import type { L } from "@/lib/i18n";

export type Channel = "web" | "handheld";

export type AreaStatus =
  | "active" // เช่าอยู่
  | "nearExpire" // ใกล้หมดสัญญา
  | "expired" // หมดสัญญา
  | "quote" // เสนอราคา
  | "quoteDeposit" // เสนอราคา(มัดจำ)
  | "vacant"; // ว่าง

export interface Market {
  name: L;
  branch: L;
  address: L;
  taxId: string;
  phone: string;
  /** วันเริ่มเตือน "ใกล้หมดสัญญา" ก่อนวันสิ้นสุด */
  nearExpireDays: number;
}

export interface Zone {
  id: string;
  code: string;
  name: L;
  /** ใช้วาดผังพื้นที่ในเว็บแอดมิน */
  plan: { x: number; y: number; w: number; h: number };
}

export interface Area {
  id: string;
  zoneId: string;
  /** ชื่อล็อก (ln) — ตัวใหญ่บนผัง */
  name: string;
  /** รหัสพื้นที่ (lncode) */
  code: string;
  sizeSqm: number;
  rate: number;
  term: "monthly" | "daily";
  /** 0 = ปกติ, 1 = แจ้งซ่อม, 2 = กำลังซ่อม */
  maintenance: 0 | 1 | 2;
  hasWater: boolean;
  hasElectric: boolean;
  /** ตำแหน่งในผังของโซน (หน่วยช่อง) */
  slot: { col: number; row: number };
}

export interface Customer {
  id: string;
  custNo: string;
  name: L;
  shop: L;
  phone: string;
  email: string;
  idCard: string;
  type: "person" | "company";
  address: L;
  since: string;
}

export interface Contract {
  id: string;
  no: string;
  kind: "contract" | "quote" | "quoteDeposit";
  customerId: string;
  areaIds: string[];
  start: string;
  end: string;
  rate: number;
  term: "monthly" | "daily";
  deposit: number;
  /** วันที่แจ้งยกเลิกสัญญาล่วงหน้า */
  cancelDate?: string;
}

export type InvoiceItemKind = "rent" | "common" | "water" | "electric" | "trash" | "fine";

export interface InvoiceItem {
  kind: InvoiceItemKind;
  label: L;
  qty: number;
  unit: L;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  no: string;
  contractId: string;
  customerId: string;
  areaIds: string[];
  /** รอบบิล yyyy-MM-01 */
  period: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  /** ส่วนลดท้ายบิล */
  discount: number;
  /** บัญชีที่ออกใบวางบิล (payser) — ระบบเลือกช่องทางรับเงินให้ตามนี้ */
  accountId: string;
  receiptId?: string;
  /** ผูกกับรายการรอชำระ (Payment Intent) ที่ยังไม่จบ */
  intentId?: string;
  /** แนบสลิปแล้ว รอฝ่ายบัญชีตรวจ (หน้า "ตรวจสอบการชำระเงิน") */
  approvalId?: string;
}

export type PayMethod = "cash" | "transfer" | "qr";

export interface PaymentAccount {
  id: string;
  kind: "cash" | "bank" | "promptpay";
  bank: BankCode;
  name: L;
  accountName: L;
  accountNo: string;
}

export type BankCode = "CASH" | "KBANK" | "SCB" | "BBL" | "KTB" | "PROMPTPAY";

export interface Receipt {
  id: string;
  no: string;
  invoiceIds: string[];
  customerId: string;
  paidAt: string;
  method: PayMethod;
  accountId: string;
  subtotal: number;
  discount: number;
  fine: number;
  total: number;
  channel: Channel;
  staff: string;
  slipAttached: boolean;
}

export interface PaymentIntent {
  id: string;
  no: string;
  invoiceIds: string[];
  customerId: string;
  accountId: string;
  amount: number;
  fine: number;
  createdAt: string;
  expiresAt: string;
  /** review = ผู้เช่าโอนเองแล้วแนบสลิป รอตรวจ */
  status: "pending" | "review" | "paid" | "expired" | "cancelled";
  channel: Channel;
  receiptId?: string;
  approvalId?: string;
}

/** ผลตรวจรายข้อของสลิป — ค่าเดียวกับ API จริง (match / mismatch / unknown) */
export type CheckResult = "match" | "mismatch" | "unknown";

/** ระดับความมั่นใจของการจับคู่ (confidence_status) */
export type ConfidenceStatus = "verified_match" | "review_recommended" | "needs_inspection" | "pending";

/** ผลอ่านสลิปจากผู้ให้บริการตรวจสลิป */
export interface SlipInfo {
  /** เลขที่แนบสลิป */
  no: string;
  /** เลขอ้างอิงการโอนตามสลิป */
  ref: string;
  /** วันเวลาที่โอนตามสลิป */
  at: string;
  amount: number;
  senderName: L;
  senderBank: BankCode;
  senderAccount: string;
  /** บัญชีปลายทางที่อ่านได้จากสลิป */
  receiverName: L;
  receiverBank: BankCode;
  receiverAccount: string;
}

/** รายการเดินบัญชีจากไฟล์ Bank Statement ที่จับคู่กับสลิปได้ */
export interface BankTransaction {
  id: string;
  uploadId: string;
  accountId: string;
  at: string;
  amount: number;
  detail: L;
}

/** ประวัติอัปโหลดไฟล์ Bank Statement */
export interface StatementUpload {
  id: string;
  at: string;
  accountId: string;
  /** รูปแบบไฟล์ของธนาคาร (pattern) */
  pattern: string;
  fileName: string;
  rows: number;
  matched: number;
  by: string;
}

/** รายการรออนุมัติ : สลิป 1 ใบ ↔ รายการรอชำระ 1 รายการ ↔ รายการเดินบัญชี (ถ้าจับคู่ได้) */
export interface Approval {
  id: string;
  no: string;
  intentId: string;
  customerId: string;
  accountId: string;
  /** ยอดที่ต้องชำระตามบิล (intent_total) */
  amount: number;
  slip: SlipInfo;
  createdAt: string;
  channel: Channel;
  /** เวลาที่ระบบจะอ่านสลิปเสร็จ — มีค่าเฉพาะตอนที่ยังประมวลผลอยู่ */
  estimatedAt?: string;
  checks: { account: CheckResult; amount: CheckResult; date: CheckResult };
  confidence: number | null;
  confidenceStatus: ConfidenceStatus;
  bankTxnId?: string;
  /** สลิปใบนี้เคยใช้กับรายการอื่นแล้ว (เลขที่รายการเดิม) */
  duplicateOf?: string;
  status: "pending" | "completed" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  /** เหตุผลที่ปฏิเสธ */
  note?: string;
  receiptId?: string;
}

export interface MeterReading {
  id: string;
  areaId: string;
  contractId: string;
  customerId: string;
  type: "water" | "electric";
  meterNo: string;
  /** รอบบิล yyyy-MM-01 */
  period: string;
  previous: number;
  current: number | null;
  unitPrice: number;
  photo: boolean;
  recordedAt?: string;
  recordedVia?: Channel;
  /** ออกใบวางบิลค่าน้ำ-ไฟจากเลขนี้แล้ว */
  billed?: boolean;
}

export interface MaintenanceTicket {
  id: string;
  areaId: string;
  title: L;
  detail: L;
  status: "pending" | "inProgress" | "done";
  reportedAt: string;
  updatedAt: string;
}

export interface StaffUser {
  id: string;
  name: L;
  role: L;
  email: string;
  /** นาทีที่แล้วที่มีการใช้งาน — ใช้กับแถบ "ผู้ใช้งานระบบขณะนี้" */
  lastSeenMinutes: number;
  device: Channel;
}

export interface ActivityItem {
  id: string;
  at: string;
  channel: Channel;
  actor: string;
  text: L;
  amount?: number;
}

export interface DemoData {
  version: number;
  /** วันที่สร้างชุดข้อมูล — เปลี่ยนวันแล้วสร้างใหม่ให้วันที่สัมพันธ์กับวันนี้เสมอ */
  seededOn: string;
  today: string;
  market: Market;
  zones: Zone[];
  areas: Area[];
  customers: Customer[];
  contracts: Contract[];
  invoices: Invoice[];
  receipts: Receipt[];
  accounts: PaymentAccount[];
  intents: PaymentIntent[];
  approvals: Approval[];
  bankTxns: BankTransaction[];
  uploads: StatementUpload[];
  meters: MeterReading[];
  tickets: MaintenanceTicket[];
  staff: StaffUser[];
  activity: ActivityItem[];
  /** รายรับย้อนหลัง 12 เดือน (ก่อนช่วงที่มีใบเสร็จละเอียด) ใช้วาดกราฟ */
  revenueHistory: { period: string; total: number }[];
  counters: Record<string, number>;
}
