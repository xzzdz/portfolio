// ข้อมูลส่วนตัว — แก้ที่ไฟล์นี้ไฟล์เดียว ทั้งหน้าเว็บและ Resume จะเปลี่ยนตาม

import type { L } from "@/lib/i18n";

export const profile = {
  name: { th: "กิตติกร อสุนี ณ อยุธยา", en: "Kittikorn Asunee na Ayutthaya" } satisfies L,
  /** ชื่อสั้นสำหรับที่แคบ (หัวเว็บบนจอมือถือ) */
  shortName: { th: "กิตติกร", en: "Kittikorn" } satisfies L,
  role: { th: "Flutter & Web Developer", en: "Flutter & Web Developer" } satisfies L,
  tagline: {
    th: "นักพัฒนา Flutter ผู้พัฒนาแอป Handheld POS ของระบบ Chaoperty เองทั้งแอป และพัฒนาเว็บแอดมินส่วนรับชำระ/ตรวจสลิปอัตโนมัติ รายงาน Excel สัญญา PDF และ API",
    en: "Flutter developer who built the Chaoperty handheld POS app end to end and develops its web admin — payments with automatic slip checks, Excel reports, contract PDFs and APIs.",
  } satisfies L,
  location: { th: "เชียงใหม่ ประเทศไทย", en: "Chiang Mai, Thailand" } satisfies L,
  availability: { th: "เปิดรับโอกาสงานใหม่", en: "Open to new opportunities" } satisfies L,

  email: "kttikon160@gmail.com",
  phone: "095-146-6990",
  github: "https://github.com/xzzdz",
  /** เว้นว่างไว้ได้ — ลิงก์ LinkedIn ทั้งเว็บและ Resume จะซ่อนเองจนกว่าจะใส่ */
  linkedin: "" as string,
  /**
   * โดเมนที่ deploy จริง เช่น https://kittikorn.vercel.app — ใส่แล้ว Resume จะมี QR + ลิงก์ผลงาน
   * ระหว่างที่ยังว่าง metadata ใช้ URL production ของ Vercel ให้อัตโนมัติ (ดู src/lib/site.ts)
   */
  siteUrl: "" as string,
} as const;
