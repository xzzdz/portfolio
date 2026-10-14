// ภาษาของแอป Handheld — ไทย / อังกฤษ / จีน / ลาว
// คีย์คือข้อความไทย ค่าคือ [อังกฤษ, จีน, ลาว] (แนวเดียวกับ `tr('ไทย')` ของแอปจริง)
// ข้อความที่ไม่มีในตารางจะแสดงเป็นไทยตามเดิม

import { fill, type L } from "@/lib/i18n";
import { dict } from "./dict";

export type HLang = "th" | "en" | "zh" | "lo";

export const hLanguages: { code: HLang; label: string; short: string }[] = [
  { code: "th", label: "ไทย", short: "TH" },
  { code: "en", label: "English", short: "EN" },
  { code: "zh", label: "中文", short: "ZH" },
  { code: "lo", label: "ພາສາລາວ", short: "LO" },
];

const column: Record<Exclude<HLang, "th">, number> = { en: 0, zh: 1, lo: 2 };

export function translate(lang: HLang, th: string, vars?: Record<string, string | number>) {
  if (lang === "th") return fill(th, vars);
  const row = dict[th];
  const text = row?.[column[lang]] || th;
  return fill(text, vars);
}

/**
 * ข้อมูลที่ผู้ใช้กรอก (ชื่อร้าน/ชื่อโซน) ไม่ได้แปลตามภาษาแอป — ไทย/ลาวเห็นข้อมูลภาษาไทย
 * ส่วนอังกฤษ/จีนใช้ชุดภาษาอังกฤษ ให้คนที่อ่านไทยไม่ออกยังดูเดโม่รู้เรื่อง
 */
export const dataText = (lang: HLang, text: L) => (lang === "th" || lang === "lo" ? text.th : text.en);

/** ภาษาเอกสารพิมพ์ : ไทยใช้ พ.ศ. ภาษาอื่นใช้ ค.ศ. */
export const dateLang = (lang: HLang) => lang;
