// ภาษาของเว็บแอดมินเดโม่ — คีย์คือข้อความไทย ค่าคือภาษาอังกฤษ
import { fill, type L, type Locale } from "@/lib/i18n";
import { adminDict } from "./dict";

export function adminTranslate(lang: Locale, th: string, vars?: Record<string, string | number>) {
  if (lang === "th") return fill(th, vars);
  return fill(adminDict[th] ?? th, vars);
}

export const adminData = (lang: Locale, text: L) => text[lang];
