// PromptPay (Thai QR Payment) payload ตามมาตรฐาน EMVCo
// แต่ละช่องเป็น TLV : [id 2 หลัก][ความยาว 2 หลัก][ค่า] และปิดท้ายด้วย CRC-16

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) — ท้าย payload EMVCo ทุกใบ */
export function crc16(data: string): number {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc;
}

export const tlv = (id: string, value: string) =>
  `${id}${String(value.length).padStart(2, "0")}${value}`;

export type PromptPayField = { id: string; label: string; value: string };

/**
 * ประกอบ payload — ความยาวของ id บอกชนิดปลายทาง
 * เบอร์มือถือ 10 หลัก (tag 01 แปลงเป็น 0066 + ตัด 0 หน้า) /
 * เลขประจำตัว 13 หลัก (tag 02) / e-Wallet 15 หลัก (tag 03)
 */
export function promptPayFields(id: string, amount = 0): PromptPayField[] | null {
  const clean = id.replace(/\D/g, "");
  let target: string;
  if (clean.length === 10) target = tlv("01", `0066${clean.slice(1)}`);
  else if (clean.length === 13) target = tlv("02", clean);
  else if (clean.length === 15) target = tlv("03", clean);
  else return null;

  const fields: PromptPayField[] = [
    { id: "00", label: "Payload Format Indicator", value: "01" },
    { id: "01", label: amount > 0 ? "Point of Initiation · Dynamic" : "Point of Initiation · Static", value: amount > 0 ? "12" : "11" },
    { id: "29", label: "Merchant Account · PromptPay AID + target", value: `${tlv("00", "A000000677010111")}${target}` },
    { id: "53", label: "Currency · THB (764)", value: "764" },
    { id: "58", label: "Country Code", value: "TH" },
  ];
  if (amount > 0) fields.push({ id: "54", label: "Transaction Amount", value: amount.toFixed(2) });
  return fields;
}

export function promptPayPayload(id: string, amount = 0): string {
  const fields = promptPayFields(id, amount);
  if (!fields) return "";
  const body = fields.map((f) => tlv(f.id, f.value)).join("") + "6304";
  return body + crc16(body).toString(16).toUpperCase().padStart(4, "0");
}

/**
 * เลขพร้อมเพย์ที่ใช้ในเดโม่ — ไม่ใช่บัญชีจริง (ไม่มีเบอร์มือถือขึ้นต้น 00)
 * แอปธนาคารจะสแกนแล้วขึ้นว่าไม่พบบัญชี ไม่มีทางโอนเงินไปหาใครได้จริง
 */
export const DEMO_PROMPTPAY_ID = "0000000000";
