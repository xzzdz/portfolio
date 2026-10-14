// ตัวช่วยจัดรูปเงิน / วันที่ / ตัวเลขเป็นข้อความไทย
// วันที่ทั้งหมดในเดโม่เก็บเป็น ISO `yyyy-MM-dd` (หรือ ISO datetime) แล้วแปลงตอนแสดงผล

export type DateLang = "th" | "en" | "zh" | "lo";

const moneyFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const intFmt = new Intl.NumberFormat("en-US");

/** 1250 → "1,250.00" */
export const money = (n: number) => moneyFmt.format(n);
/** 1250 → "1,250" */
export const int = (n: number) => intFmt.format(Math.round(n));
/** 1250 → "฿1,250" (ตัดทศนิยมถ้าเป็นจำนวนเต็ม) */
export const baht = (n: number) =>
  `฿${Number.isInteger(n) ? intFmt.format(n) : moneyFmt.format(n)}`;

const thMonthsShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const thMonthsLong = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const enMonthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const enMonthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const loMonthsShort = ["ມ.ກ.", "ກ.ພ.", "ມ.ນ.", "ມ.ສ.", "ພ.ພ.", "ມິ.ຖ.", "ກ.ລ.", "ສ.ຫ.", "ກ.ຍ.", "ຕ.ລ.", "ພ.ຈ.", "ທ.ວ."];
const loMonthsLong = ["ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ", "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ"];

/** อ่าน `yyyy-MM-dd` เป็นวันที่ท้องถิ่น (ไม่ให้ timezone เลื่อนวัน) */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (iso.length > 10) {
    const t = new Date(iso);
    date.setHours(t.getHours(), t.getMinutes(), t.getSeconds());
  }
  return date;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** วันเวลาท้องถิ่นแบบไม่มี timezone `yyyy-MM-ddTHH:mm:ss` (รูปแบบเดียวกับข้อมูลจาก API) */
export function toLocalISO(date: Date): string {
  return `${toISODate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * วันที่แบบสั้นตามภาษา — ไทยใช้ พ.ศ. ภาษาอื่นใช้ ค.ศ.
 * (กติกาเดียวกับเอกสารพิมพ์ของแอปจริง : แอปภาษาไทย = พ.ศ.)
 */
export function shortDate(iso: string, lang: DateLang = "th") {
  const d = parseISODate(iso);
  const day = d.getDate();
  const m = d.getMonth();
  const y = d.getFullYear();
  switch (lang) {
    case "th":
      return `${day} ${thMonthsShort[m]} ${String(y + 543).slice(2)}`;
    case "lo":
      return `${day} ${loMonthsShort[m]} ${y}`;
    case "zh":
      return `${y}/${pad(m + 1)}/${pad(day)}`;
    default:
      return `${day} ${enMonthsShort[m]} ${y}`;
  }
}

/** 13 ตุลาคม 2569 / 13 October 2026 */
export function longDate(iso: string, lang: DateLang = "th") {
  const d = parseISODate(iso);
  const day = d.getDate();
  const m = d.getMonth();
  const y = d.getFullYear();
  switch (lang) {
    case "th":
      return `${day} ${thMonthsLong[m]} ${y + 543}`;
    case "lo":
      return `${day} ${loMonthsLong[m]} ${y}`;
    case "zh":
      return `${y}年${m + 1}月${day}日`;
    default:
      return `${day} ${enMonthsLong[m]} ${y}`;
  }
}

/** dd/MM/yyyy — เอกสารไทยใช้ปี พ.ศ. */
export function slashDate(iso: string, lang: DateLang = "th") {
  const d = parseISODate(iso);
  const y = lang === "th" ? d.getFullYear() + 543 : d.getFullYear();
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${y}`;
}

/** ต.ค. 2569 / Oct 2026 — ใช้กับรอบบิล */
export function monthYear(iso: string, lang: DateLang = "th", long = false) {
  const d = parseISODate(iso);
  const m = d.getMonth();
  const y = d.getFullYear();
  switch (lang) {
    case "th":
      return `${long ? thMonthsLong[m] : thMonthsShort[m]} ${y + 543}`;
    case "lo":
      return `${long ? loMonthsLong[m] : loMonthsShort[m]} ${y}`;
    case "zh":
      return `${y}年${m + 1}月`;
    default:
      return `${long ? enMonthsLong[m] : enMonthsShort[m]} ${y}`;
  }
}

export function monthShort(monthIndex: number, lang: DateLang = "th") {
  if (lang === "th") return thMonthsShort[monthIndex];
  if (lang === "lo") return loMonthsShort[monthIndex];
  if (lang === "zh") return `${monthIndex + 1}月`;
  return enMonthsShort[monthIndex];
}

export function time(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function addDays(iso: string, days: number) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function daysBetween(fromIso: string, toIso: string) {
  const a = parseISODate(fromIso).getTime();
  const b = parseISODate(toIso).getTime();
  return Math.round((b - a) / 86_400_000);
}

// ─────────────────────────── ตัวเลขเป็นข้อความไทย ───────────────────────────

const digitWords = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const unitWords = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];

/** อ่านเลขไม่เกิน 6 หลัก ตามกติกา "เอ็ด" / "ยี่สิบ" */
function readUnderMillion(n: number): string {
  const digits = String(n).split("").map(Number);
  const len = digits.length;
  let out = "";
  digits.forEach((d, i) => {
    const pos = len - i - 1;
    if (d === 0) return;
    if (pos === 1 && d === 1) out += "สิบ";
    else if (pos === 1 && d === 2) out += "ยี่สิบ";
    else if (pos === 0 && d === 1 && len > 1) out += "เอ็ด";
    else out += digitWords[d] + unitWords[pos];
  });
  return out;
}

function readNumber(n: number): string {
  if (n === 0) return "";
  if (n < 1_000_000) return readUnderMillion(n);
  const millions = Math.floor(n / 1_000_000);
  const rest = n % 1_000_000;
  return `${readNumber(millions)}ล้าน${rest ? readUnderMillion(rest) : ""}`;
}

/** 1234.5 → "หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์" */
export function thaiBahtText(amount: number) {
  const satangTotal = Math.round(amount * 100);
  const bahtPart = Math.floor(satangTotal / 100);
  const satang = satangTotal % 100;
  if (bahtPart === 0 && satang === 0) return "ศูนย์บาทถ้วน";
  const head = bahtPart ? `${readNumber(bahtPart)}บาท` : "";
  return satang ? `${head}${readNumber(satang)}สตางค์` : `${head}ถ้วน`;
}

/** ข้อความจำนวนเงินภาษาอังกฤษ ใช้บนเอกสารเวอร์ชันอังกฤษ */
export function englishAmountText(amount: number) {
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const below1000 = (n: number): string => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    const parts: string[] = [];
    if (h) parts.push(`${ones[h]} hundred`);
    if (r) parts.push(r < 20 ? ones[r] : `${tens[Math.floor(r / 10)]}${r % 10 ? `-${ones[r % 10]}` : ""}`);
    return parts.join(" ");
  };
  const words = (n: number): string => {
    if (n === 0) return "zero";
    const scales: [number, string][] = [[1_000_000, "million"], [1_000, "thousand"]];
    let rest = n;
    const out: string[] = [];
    for (const [value, name] of scales) {
      if (rest >= value) {
        out.push(`${below1000(Math.floor(rest / value))} ${name}`);
        rest %= value;
      }
    }
    if (rest) out.push(below1000(rest));
    return out.join(" ");
  };
  const satangTotal = Math.round(amount * 100);
  const b = Math.floor(satangTotal / 100);
  const s = satangTotal % 100;
  const text = `${words(b)} baht${s ? ` and ${words(s)} satang` : " only"}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
