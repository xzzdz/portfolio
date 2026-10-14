import type { AreaStatus } from "../data/types";

/**
 * สีประจำสถานะ — ชุดเดียวกันทั้งเว็บแอดมินและเครื่อง Handheld
 * เช่าอยู่ = แดง / ใกล้หมดสัญญา = ส้ม / หมดสัญญา = เทา /
 * เสนอราคา = ฟ้า / เสนอราคา(มัดจำ) = ม่วง / ว่าง = เขียว
 * ไล่ความสว่างเท่ากันทุกสี (bg 100 / border 300 / fg 600 / strong 800)
 */
export const statusPalette: Record<AreaStatus, { fg: string; bg: string; border: string; strong: string }> = {
  active: { fg: "#DC2626", bg: "#FEE2E2", border: "#FCA5A5", strong: "#991B1B" },
  nearExpire: { fg: "#EA580C", bg: "#FFEDD5", border: "#FDBA74", strong: "#9A3412" },
  expired: { fg: "#64748B", bg: "#E2E8F0", border: "#CBD5E1", strong: "#334155" },
  quote: { fg: "#2563EB", bg: "#DBEAFE", border: "#93C5FD", strong: "#1E40AF" },
  quoteDeposit: { fg: "#7C3AED", bg: "#EDE9FE", border: "#C4B5FD", strong: "#5B21B6" },
  vacant: { fg: "#059669", bg: "#D1FAE5", border: "#6EE7B7", strong: "#065F46" },
};

/** ป้ายสถานะภาษาไทย — คำเดียวกับระบบจริง (ใช้เป็นคีย์แปลภาษาด้วย) */
export const statusLabelTh: Record<AreaStatus, string> = {
  active: "เช่าอยู่",
  nearExpire: "ใกล้หมดสัญญา",
  expired: "หมดสัญญา",
  quote: "เสนอราคา",
  quoteDeposit: "เสนอราคา(มัดจำ)",
  vacant: "ว่าง",
};

export const bankStyle: Record<string, { bg: string; fg: string; short: string }> = {
  CASH: { bg: "#16A34A", fg: "#FFFFFF", short: "฿" },
  KBANK: { bg: "#138F2D", fg: "#FFFFFF", short: "K" },
  SCB: { bg: "#4E2A84", fg: "#FFFFFF", short: "SCB" },
  BBL: { bg: "#1E4598", fg: "#FFFFFF", short: "BBL" },
  KTB: { bg: "#1BA5E1", fg: "#FFFFFF", short: "KTB" },
  PROMPTPAY: { bg: "#0B3D6E", fg: "#FFFFFF", short: "PP" },
};
