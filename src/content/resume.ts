// เนื้อหา Resume (สั้นกว่าหน้าเว็บ ให้จบใน A4 หน้าเดียว)
// ข้อมูลส่วนตัว/ติดต่อดึงจาก profile.ts — แก้ที่นั่นที่เดียว
import type { L } from "@/lib/i18n";
import type { ProjectSlug } from "./projects";

export const resume = {
  headings: {
    summary: { th: "สรุปโปรไฟล์", en: "Profile" },
    experience: { th: "ประสบการณ์ทำงาน", en: "Experience" },
    projects: { th: "ผลงานเด่น", en: "Selected projects" },
    skills: { th: "ทักษะ", en: "Skills" },
    education: { th: "การศึกษา", en: "Education" },
    portfolio: { th: "ดูผลงาน + เดโม่", en: "Portfolio + live demos" },
  },
  summary: {
    th: "นักพัฒนา Flutter ที่มีประสบการณ์พัฒนาโปรเจกต์ใช้งานจริง — พัฒนาแอป Handheld POS เองทั้งแอป และพัฒนาเว็บแอดมินส่วนรับชำระ/ตรวจสลิปอัตโนมัติ รายงาน Excel และเอกสาร PDF เชื่อมต่อ API (REST / PHP) และใช้ GitHub ในการทำงานร่วมกับทีม สามารถพัฒนาแอปตามแบบจาก UX/UI Design (เช่น Figma) ได้ ปัจจุบันกำลังศึกษาต่อยอดด้าน TypeScript, Node.js และ Next.js เพื่อขยายความสามารถด้าน Web และ Backend Development",
    en: "Flutter developer with hands-on production experience — built a handheld POS app end to end and develops the web admin's payment and automatic slip-verification flow, Excel reports and PDF documents. Integrates APIs (REST / PHP), collaborates through GitHub and builds apps from UX/UI designs (e.g. Figma). Currently expanding into TypeScript, Node.js and Next.js to grow in web and backend development.",
  } satisfies L,
  experienceBullets: [
    { th: "พัฒนาแอป Chaoperty Handheld V2 (Flutter) เองทั้งหมดสำหรับเครื่อง POS Sunmi V2 : ผังล็อก รับชำระพร้อม QR แนบสลิป พิมพ์ใบเสร็จ 58 mm จดมิเตอร์ 4 ภาษา และลด APK จาก 50 MB+ เหลือ ~15 MB", en: "Built Chaoperty Handheld V2 (Flutter) for Sunmi V2 POS terminals single-handedly: stall map, QR payments, slip upload, 58 mm receipts, meter readings, 4 languages — and cut the APK from 50 MB+ to ~15 MB" },
    { th: "พัฒนาหน้ารับชำระแบบใหม่ (Payment Intents) และหน้าตรวจสอบการชำระเงินที่ตรวจสลิปอัตโนมัติ : จับคู่สลิปกับ Bank Statement พร้อมคะแนนความมั่นใจ แล้วอนุมัติทีละหลายรายการ", en: "Built the new payment screen (Payment Intents) and a payment-verification page with automatic slip checks: slips matched to bank statements with a confidence score, then approved in bulk" },
    { th: "ทำรายงาน Excel (Syncfusion XlsIO) พร้อมชีตสรุปและแถวรวมเป็นสูตร และเอกสาร PDF : สัญญาเช่า (รวมภาษาลาว) ใบเสร็จ/ใบแจ้งหนี้หลายแม่แบบ", en: "Built Excel reports (Syncfusion XlsIO) with summary sheets and formula totals, plus PDFs: lease contracts (including Lao) and multi-template receipts/invoices" },
    { th: "พัฒนาและดูแล API ฝั่ง PHP และเชื่อม Payment API (Payment Intents / Reconcile) ที่เว็บกับแอปใช้ร่วมกัน", en: "Developed and maintained PHP endpoints and integrated the Payment Intents / Reconcile API shared by the web and the app" },
    { th: "ทำ widget/ฟีเจอร์ใหม่ตามที่ได้รับมอบหมาย (สิทธิ์ผู้ใช้ จัดลำดับพื้นที่ แม่แบบเอกสาร) และคลีนโค้ด — แยกไฟล์หลายพันบรรทัดเป็น MVVM + service ยุบหน้าที่ซ้ำกันเหลือไฟล์เดียว", en: "Shipped assigned widgets/features (user permissions, area ordering, document templates) and cleaned up code — split multi-thousand-line files into MVVM + services and merged duplicate pages" },
    { th: "ทำงานร่วมกับทีมผ่าน GitHub : feature branch, Pull Request, code review และ tag เวอร์ชันแบบ SemVer", en: "Work through GitHub with the team: feature branches, pull requests, code review and SemVer tags" },
  ] as L[],
  projects: [
    {
      slug: "chaoperty-handheld",
      name: "Chaoperty Handheld V2",
      stack: "Flutter · Riverpod · go_router · Dio · package:pdf · Sunmi Printer",
      text: { th: "แอป POS พกพาสำหรับพนักงานเก็บเงินในตลาด (พัฒนาเองทั้งแอป) : ผังล็อก รับชำระ 3 ขั้นพร้อม QR/แนบสลิป พิมพ์ใบเสร็จ จดมิเตอร์ และรองรับ 4 ภาษา (ไทย/อังกฤษ/จีน/ลาว)", en: "Handheld POS app for market collectors, built solo: stall map, 3-step payment with QR or slip, receipt printing, meter reading, and 4 languages (Thai/English/Chinese/Lao)" },
    },
    {
      slug: "chaoperty-web-admin",
      name: "Chaoperty Web Admin",
      stack: "Flutter Web · Provider · MVVM · PHP API · Payment Intents · XlsIO · PDF",
      text: { th: "ระบบหลังบ้านบริหารพื้นที่เช่า — ส่วนที่พัฒนา : หน้ารับชำระแบบใหม่ ตรวจสอบการชำระเงิน (ตรวจสลิปอัตโนมัติ) รายงาน Excel สัญญา/ใบเสร็จ PDF สิทธิ์ผู้ใช้ และ API", en: "Rental-space back office — my part: the new payment screen, payment verification with automatic slip checks, Excel reports, contract/receipt PDFs, user permissions and APIs" },
    },
  ] as { slug: ProjectSlug; name: string; stack: string; text: L }[],
  skills: [
    { k: { th: "Mobile", en: "Mobile" }, v: "Flutter, Dart, Riverpod, Provider, go_router, MVVM + Repository, Android (Sunmi POS)" },
    { k: { th: "Web", en: "Web" }, v: "Flutter Web, HTML/CSS, Figma → UI · TypeScript, React/Next.js, Tailwind CSS (learning)" },
    { k: { th: "API / Backend", en: "API / Backend" }, v: "REST API (Dio/http), PHP API, JSON, Payment Intents / Reconcile, PromptPay EMVCo QR · Node.js (learning)" },
    { k: { th: "เอกสาร", en: "Documents" }, v: "Excel (Syncfusion XlsIO), PDF (package:pdf), contract & receipt templates, 58 mm thermal printing, Thai/Lao fonts" },
    { k: { th: "เครื่องมือ", en: "Tools" }, v: "Git/GitHub, Pull Request & review, Conventional Commits, refactoring to MVVM, Docker, flutter_test" },
  ] as { k: L; v: string }[],
};
