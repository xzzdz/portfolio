// เนื้อหาเคสสตัดี้ของทั้งสองโปรเจค
import type { L } from "@/lib/i18n";

export type ProjectSlug = "chaoperty-handheld" | "chaoperty-web-admin";

export type Highlight = { title: L; problem: L; solution: L; result?: L };

export type Project = {
  slug: ProjectSlug;
  index: string;
  name: string;
  tagline: L;
  summary: L;
  role: L;
  period: L;
  platform: L;
  accent: "sapphire" | "leaf";
  stack: string[];
  cover: { src: string; alt: L; w: number; h: number };
  overview: L[];
  contributions: L[];
  features: { icon: string; title: L; text: L }[];
  highlights: Highlight[];
  tour: L[];
};

export const projects: Project[] = [
  {
    slug: "chaoperty-handheld",
    index: "01",
    name: "Chaoperty Handheld V2",
    tagline: { th: "แอป POS พกพาสำหรับเก็บค่าเช่าและจดมิเตอร์หน้าแผง", en: "A handheld POS app for collecting rent and reading meters at the stall" },
    summary: {
      th: "แอป Flutter บนเครื่อง Sunmi V2 ให้พนักงานเดินเก็บเงินในตลาด : ดูผังล็อก รับชำระผ่าน QR พร้อมเพย์ที่ตัดยอดอัตโนมัติ พิมพ์ใบเสร็จจากหัวพิมพ์ในตัว และจดมิเตอร์น้ำ-ไฟพร้อมรูป — ใช้ backend เดียวกับเว็บแอดมิน",
      en: "A Flutter app on Sunmi V2 terminals for staff walking the market: browse the stall map, take PromptPay QR payments that reconcile automatically, print receipts on the built-in printer and record water/electric meters with photos — all on the same backend as the web admin.",
    },
    role: { th: "พัฒนาเองทั้งหมด (คนเดียว)", en: "Sole developer" },
    period: { th: "2567 – ปัจจุบัน", en: "2024 – present" },
    platform: { th: "Android 7.1 · Sunmi V2 (32-bit ARM, RAM 800 MB)", en: "Android 7.1 · Sunmi V2 (32-bit ARM, 800 MB RAM)" },
    accent: "sapphire",
    stack: ["Flutter", "Dart", "Riverpod", "go_router", "Dio", "MVVM + Repository", "package:pdf", "Sunmi Printer", "mobile_scanner", "flutter_test", "Docker"],
    cover: { src: "/shots/handheld-screens.webp", alt: { th: "หน้าจอแอป Chaoperty Handheld", en: "Chaoperty Handheld screens" }, w: 1200, h: 844 },
    overview: [
      {
        th: "ตลาดและพื้นที่เช่าขนาดใหญ่มีผู้เช่าหลายร้อยแผง พนักงานต้องเดินเก็บค่าเช่า ค่าน้ำ-ไฟ และออกใบเสร็จหน้าแผง เดิมงานส่วนนี้ต้องกลับไปทำที่เคาน์เตอร์หรือเว็บแอดมิน",
        en: "Large markets have hundreds of stalls. Staff walk around collecting rent and utilities and issuing receipts on the spot — work that used to mean walking back to a counter or the web admin.",
      },
      {
        th: "Handheld V2 ย้ายงานเหล่านั้นมาไว้บนเครื่อง POS แบบพกพา โดยไม่มี API ของตัวเอง — ยิง backend ตัวเดียวกับเว็บแอดมินทั้งหมด ฟีเจอร์ใหม่จึงต้องตามพฤติกรรมของเว็บให้ตรงทุกจุด ตั้งแต่สูตรสถานะสัญญาไปจนถึงสีของผังล็อก",
        en: "Handheld V2 moves that work onto a portable POS. It has no API of its own — it talks to the same backend as the web admin, so every feature has to match the web's behavior exactly, from contract-status rules to the colors on the stall map.",
      },
    ],
    contributions: [
      { th: "พัฒนาเองทั้งแอปคนเดียว — วางโครงสร้าง MVVM + Repository (Riverpod, go_router, Dio) และทำทุกหน้าจอ : ผังล็อกแยกโซน, ผู้เช่า/สัญญา, ชำระบิล 3 ขั้น, ประวัติวางบิล/ชำระ, จดมิเตอร์, ตั้งค่าเครื่องพิมพ์", en: "Built the whole app solo — MVVM + Repository architecture (Riverpod, go_router, Dio) and every screen: zone stall map, tenants & contracts, 3-step bill payment, billing/payment history, meter reading, printer settings" },
      { th: "เชื่อมระบบ Payment Intents : สร้างรายการรอชำระ → ออก QR → ตัดยอดอัตโนมัติ หรือแนบสลิปส่งให้ฝ่ายบัญชีตรวจพร้อมพิมพ์หลักฐานการแนบสลิป และสำรองระบบตะกร้าเดิมไว้ให้สาขาที่ยังไม่เปิด", en: "Integrated Payment Intents: create a pending payment → show QR → auto-reconcile, or send a slip to accounting and print a slip record — with the legacy basket flow kept for branches not yet migrated" },
      { th: "ทำเอกสารพิมพ์บนกระดาษ 58 mm (ใบเสร็จ ใบวางบิล ใบแจ้งค่าเช่า หลักฐานการแนบสลิป) ที่รองรับไทย/ลาว และเปิดพรีวิวแทนเมื่อเครื่องไม่มีหัวพิมพ์", en: "Made 58 mm print documents (receipts, invoices, rent notices, slip records) supporting Thai/Lao, with a preview fallback on devices without a printer" },
      { th: "ปรับประสิทธิภาพสำหรับเครื่อง RAM 800 MB, เขียนเทสต์ครอบส่วนที่พังแล้วเงียบ (QR, วันที่, ตัวอักษรลาวบน PDF) และทำ build APK ผ่าน Docker", en: "Tuned performance for 800 MB RAM, wrote tests for the parts that fail silently (QR strings, dates, Lao glyphs on PDF) and set up Docker APK builds" },
    ],
    features: [
      { icon: "LayoutGrid", title: { th: "ผังล็อกรายโซน", en: "Zone stall map" }, text: { th: "สีบอกสถานะ 6 แบบชุดเดียวกับเว็บ กรอง/ค้นหาได้ทันที", en: "Six status colors shared with the web; instant filter and search" } },
      { icon: "QrCode", title: { th: "QR พร้อมเพย์ตัดยอดเอง", en: "Self-reconciling QR" }, text: { th: "ออก QR ตามมาตรฐาน EMVCo นับถอยหลัง และรับยืนยันจากระบบ", en: "EMVCo-standard QR with countdown and server confirmation" } },
      { icon: "Printer", title: { th: "พิมพ์ใบเสร็จ 58 mm", en: "58 mm receipts" }, text: { th: "หัวพิมพ์ความร้อนในตัว ภาษาไทยและลาวไม่ทับซ้อน", en: "Built-in thermal printer; Thai and Lao render cleanly" } },
      { icon: "Gauge", title: { th: "จดมิเตอร์น้ำ-ไฟ", en: "Meter reading" }, text: { th: "แป้นตัวเลข ตรวจค่าผิดปกติ ถ่ายรูปหน้าปัด ไปเครื่องถัดไปอัตโนมัติ", en: "Keypad entry, anomaly check, dial photo, auto-advance" } },
      { icon: "ScanLine", title: { th: "สแกน QR หน้าล็อก", en: "Scan stall QR" }, text: { th: "สแกนแล้วข้ามไปหน้าชำระเงินด่วน กล้องปิดเองเมื่อสลับแท็บ", en: "Scan to jump to quick pay; camera stops when switching tabs" } },
      { icon: "Languages", title: { th: "4 ภาษา", en: "4 languages" }, text: { th: "ไทย อังกฤษ จีน ลาว — เอกสารพิมพ์เปลี่ยนภาษาและปี พ.ศ./ค.ศ. ตาม", en: "Thai, English, Chinese, Lao — print documents switch language and BE/CE year" } },
    ],
    highlights: [
      {
        title: { th: "ลื่นบนเครื่อง RAM 800 MB", en: "Smooth on 800 MB of RAM" },
        problem: { th: "Sunmi V2 เหลือ RAM ว่างจริงราว 300 MB และใช้ GPU Mali-400 — image cache ค่าเริ่มต้นกับ blur ทำให้แอปโดนปิดหรือเฟรมตกต่ำกว่า 15 FPS", en: "Sunmi V2 has ~300 MB of free RAM and a Mali-400 GPU — the default image cache and blur effects got the app killed or dropped it below 15 FPS" },
        solution: { th: "จำกัด image cache ที่ 10 MB, ตัด BackdropFilter ทั้งหมด, สั่งกล้องหยุดเมื่อออกจากแท็บ, เปลี่ยน await ในลูปเป็น Future.wait, เปิด R8 และบิลด์ --split-per-abi", en: "Capped the image cache at 10 MB, removed every BackdropFilter, stopped the camera off-tab, replaced awaits-in-loops with Future.wait, enabled R8 and --split-per-abi builds" },
        result: { th: "APK จาก 50 MB+ เหลือ ~15 MB และไม่ติดคอขวดการยิง API ทีละเส้น", en: "APK went from 50 MB+ to ~15 MB, and no more one-by-one API bottlenecks" },
      },
      {
        title: { th: "ภาษาไทยและลาวบนกระดาษความร้อน", en: "Thai and Lao on thermal paper" },
        problem: { th: "ฟอนต์ทั่วไปกับ package:pdf ไม่มี OpenType shaping วรรณยุกต์ไทยทับสระบน ส่วนตัวอักษรลาวออกมาเป็นกล่องสี่เหลี่ยม", en: "Generic fonts with package:pdf lack OpenType shaping: Thai tone marks collide with vowels, and Lao comes out as empty boxes" },
        solution: { th: "ใช้ TH Sarabun New สำหรับไทย, Phetsarath OT สำหรับลาว และให้ข้อความทุกก้อนผ่านฟังก์ชันกลางที่ยกวรรณยุกต์ลาวเอง แปลงป้ายบนเอกสารเป็นลาวตามภาษาแอป", en: "TH Sarabun New for Thai, Phetsarath OT for Lao, and every text run goes through one helper that repositions Lao tone marks; document labels switch to Lao with the app language" },
        result: { th: "มีเทสต์ครอบข้อความไทย/ลาวปนกันบน PDF", en: "Covered by tests for mixed Thai/Lao text on PDF" },
      },
      {
        title: { th: "ข้อมูลจาก API เดิมที่ไม่สม่ำเสมอ", en: "Taming an inconsistent legacy API" },
        problem: { th: "ค่าว่างมาได้หลายทรง (null, '', 'null', '0000-00-00'), เส้นเขียนตอบเป็นสตริง \"true\"/\"false\" และวันที่มีทั้ง พ.ศ. กับ ค.ศ.", en: "Empty values arrive in many shapes (null, '', 'null', '0000-00-00'), write endpoints answer with the strings \"true\"/\"false\", and dates mix Buddhist and Gregorian years" },
        solution: { th: "รวมการอ่านค่าไว้ใน helper กลาง (apiText / parseAnyDate / parseMoney) และให้ repository เป็นที่เดียวที่รู้ชื่อพารามิเตอร์ของ backend", en: "Centralized parsing in helpers (apiText / parseAnyDate / parseMoney) and made repositories the only layer that knows backend parameter names" },
      },
      {
        title: { th: "สองระบบรับชำระในจอเดียว", en: "Two payment systems, one screen" },
        problem: { th: "บางสาขาเปิด Payment Intents บางสาขายังใช้ระบบตะกร้าเดิม — ถ้าเดาผิดระหว่างที่ token ยังโหลดไม่เสร็จ จอเดิมจะไปอ่านตะกร้าของอีกระบบ", en: "Some branches run Payment Intents, others the legacy basket — guessing wrong while the token is still loading makes the legacy screen read the other system's basket" },
        solution: { th: "รอให้รู้สถานะ token ก่อนเลือกเส้นทาง และเก็บรายการที่ติ๊กค้างฝั่งเซิร์ฟเวอร์มาแสดงทุกครั้งที่เปิดจอ", en: "Wait for the token state before choosing a path, and always show server-side pending selections when the screen opens" },
      },
    ],
    tour: [
      { th: "แตะ \"พื้นที่เช่า\" ดูผังล็อก แล้วแตะล็อกสีแดงสักช่อง", en: "Tap “Rental areas” and open any red stall" },
      { th: "กด \"ไปที่รับชำระเงิน\" → เลือกใบ → ช่องทาง → \"ยืนยัน · สร้าง QR\"", en: "Hit “Go to payment” → pick invoices → channel → “Confirm · Create QR”" },
      { th: "รอราว 8 วินาที ระบบตัดยอดเอง แล้วกด \"พิมพ์ใบเสร็จ\" — กระดาษจะออกจากหัวเครื่อง", en: "Wait ~8 s for auto-reconciliation, then “Print receipt” — paper feeds out of the top" },
      { th: "หรือกด \"ถัดไป : แนบสลิป\" → ส่งสลิป + พิมพ์ใบ — เครื่องพิมพ์หลักฐานการแนบสลิปให้ผู้เช่าถือไว้", en: "Or “Next: attach slip” → send + print — the device prints a slip record for the tenant to keep" },
      { th: "เปิดเมนู → \"มิเตอร์น้ำไฟฟ้า\" ลองจดเลขด้วยแป้นตัวเลข", en: "Menu → “Water & electric meters”, try the keypad" },
      { th: "เปลี่ยนภาษาที่ป้ายมุมขวาบนเป็น 中文 หรือ ລາວ", en: "Switch the language pill to 中文 or ລາວ" },
    ],
  },
  {
    slug: "chaoperty-web-admin",
    index: "02",
    name: "Chaoperty Web Admin",
    tagline: { th: "ระบบหลังบ้านบริหารพื้นที่เช่า สำหรับตลาด มอลล์ และอาคาร", en: "The back office for rental spaces — markets, malls and buildings" },
    summary: {
      th: "เว็บแอปพลิเคชัน Flutter Web ที่สาขาใช้บริหารพื้นที่เช่าครบวงจร : ผังพื้นที่ สัญญา ตั้งหนี้/วางบิล รับชำระและตรวจสอบสลิป มิเตอร์ รายงาน และสิทธิ์ผู้ใช้ — ส่วนที่ผมดูแลคือฝั่งหน้าบ้าน : ระบบรับชำระแบบใหม่ หน้าตรวจสอบการชำระเงินที่เช็คสลิปอัตโนมัติ รายงาน Excel เอกสาร/สัญญา PDF และแม่แบบเอกสาร",
      en: "A Flutter Web application branches use to run rental spaces end to end: floor plans, contracts, billing, payments and slip verification, meters, reports and user permissions. My part is the front end: the new payment flow, the payment-verification page with automatic slip checks, Excel reports, document/contract PDFs and document templates.",
    },
    role: { th: "นักพัฒนาหน้าบ้าน — ฟีเจอร์ใหม่ รายงาน เอกสาร และซัพพอร์ตลูกค้า", en: "Front-end developer — features, reports, documents, customer support" },
    period: { th: "2567 – ปัจจุบัน", en: "2024 – present" },
    platform: { th: "Flutter Web · เบราว์เซอร์เดสก์ท็อป", en: "Flutter Web · desktop browsers" },
    accent: "leaf",
    stack: ["Flutter Web", "Dart", "Provider", "MVVM + services", "REST API", "PHP", "Payment Intents · Reconcile", "Syncfusion XlsIO", "package:pdf"],
    cover: { src: "/shots/webadmin-dashboard.webp", alt: { th: "หน้าหลักของเว็บแอดมิน Chaoperty", en: "Chaoperty web admin dashboard" }, w: 1594, h: 1042 },
    overview: [
      {
        th: "Chaoperty เป็นระบบบริหารพื้นที่เช่าของบริษัทที่ให้บริการลูกค้าภาคเหนือและอีสาน ตั้งแต่ตลาดสด คอมมูนิตี้มอลล์ ไปจนถึงอาคารสำนักงาน ที่มีพื้นที่ตั้งแต่ไม่กี่ห้องถึงพันกว่าแผง",
        en: "Chaoperty is the company's rental-space management system serving clients across northern and north-eastern Thailand — from fresh markets and community malls to office buildings, with anywhere from a few units to over a thousand stalls.",
      },
      {
        th: "โค้ดเบสสะสมมาหลายปี (900+ ไฟล์ Dart) ลูกค้าแต่ละรายมีเอกสารและรายงานเฉพาะตัว งานหลักของผมอยู่ฝั่งหน้าบ้าน : รับความต้องการ ออกแบบหน้าตาเอง แล้วต่อยอดฟีเจอร์หรือแก้บัคโดยไม่ทำให้สาขาอื่นพัง — ชิ้นใหญ่ที่สุดคือระบบรับชำระแบบใหม่กับหน้าตรวจสอบการชำระเงินที่เช็คสลิปอัตโนมัติ นอกจากนี้ยังคอยช่วยทีม Implement ที่คุยกับลูกค้าแก้ปัญหาหน้างานให้ทันที และทยอยจัดโครงสร้างโมดูลให้ดูแลง่ายขึ้น",
        en: "The codebase grew over years (900+ Dart files) and every client has its own documents and reports. My work is mostly front end: take requests, design the UI myself, and ship features or bug fixes without breaking other branches — the biggest being the new payment flow and the payment-verification page with automatic slip checks. I also back up the implementation team so customer issues get fixed on the spot, and restructure modules along the way so they're easier to maintain.",
      },
    ],
    contributions: [
      { th: "หน้ารับชำระแบบใหม่ (Payment Intents) : บิลจัดกลุ่มตามผู้เช่า → ธนาคาร, ออก QR พร้อมนับถอยหลังและต่ออายุ, แนบสลิป, ตัวช่วยคำนวณ VAT / หัก ณ ที่จ่าย 3 โหมด และเลือกวันที่รับชำระเองหรืออิงตามสลิป", en: "New payment screen (Payment Intents): invoices grouped by tenant → bank, QR with countdown and renewal, slip upload, a 3-mode VAT / withholding-tax calculator, and a paid date that's either picked or taken from the slip" },
      { th: "หน้า \"ตรวจสอบการชำระเงิน\" (ตรวจสลิปอัตโนมัติ) : อัปโหลด Bank Statement ตามรูปแบบไฟล์ของแต่ละธนาคาร ระบบจับคู่สลิปกับรายการเดินบัญชีพร้อมคะแนนความมั่นใจ ดูสลิปแบบซูม/หมุน และอนุมัติหรือปฏิเสธทีละหลายรายการ", en: "“Payment verification” page (automatic slip checks): upload a bank statement in each bank's file format, let the system match slips to bank transactions with a confidence score, zoom/rotate the slip, and approve or reject in bulk" },
      { th: "รายงาน Excel : รายรับ / ประจำวัน / ความเคลื่อนไหวธนาคาร พร้อมชีตสรุป 3 ชีต (ตามรายการ, ตามบัญชีรับเงิน, ตามผู้ทำรายการ) แถวรวมเป็นสูตร =SUM และหน้า \"เรียกดู\" บนเว็บที่ใช้สูตรเดียวกับไฟล์", en: "Excel reports: income, daily and bank-movement reports with three summary sheets (by item, by receiving account, by operator), =SUM formula totals, and an on-screen “View” dialog that uses the same formulas as the file" },
      { th: "เอกสาร PDF : สัญญาเช่าภาษาลาวที่จัดหน้า A4 อัตโนมัติ และใบเสร็จ/ใบแจ้งหนี้หลายแม่แบบทั้ง A4 และกระดาษความร้อน 58/80 mm พร้อมแถวตัดมัดจำ/VAT ท้ายบิล", en: "PDF documents: a Lao lease contract that paginates itself onto A4, and multi-template receipts/invoices for A4 and 58/80 mm thermal paper with deposit and VAT rows" },
      { th: "หลังบ้านเท่าที่จำเป็น : แก้หรือเพิ่มส่วนใน API ฝั่ง PHP ที่ฟีเจอร์ต้องใช้ และเชื่อมหน้าเว็บกับ Payment API ชุดใหม่ (Payment Intents / Reconcile)", en: "Backend where needed: small changes and additions to the PHP API a feature depends on, and wiring the web to the new Payment API (Payment Intents / Reconcile)" },
      { th: "ฟีเจอร์ใหม่และแก้บัค โดยออกแบบหน้าตาเอง : จัดลำดับพื้นที่ทุกโซน, กำหนดขนาดพื้นที่ และหน้าเลือกแม่แบบเอกสาร", en: "New features and bug fixes with UI I designed myself: area ordering across zones, area dimensions, and the document-template picker" },
      { th: "ซัพพอร์ตทีม Implement : รับปัญหาที่ลูกค้าแจ้งผ่านทีมหน้างาน ตรวจหาสาเหตุ แล้วแก้และส่งขึ้นให้ได้ทันที", en: "Implementation support: take issues customers raise through the implementation team, find the cause, and ship a fix right away" },
      { th: "คลีนโค้ด : ทยอยแยกไฟล์หลายพันบรรทัดเป็น model / view / viewmodel / services ยุบหน้าที่เป็นสำเนากัน 4 หน้าให้เหลือไฟล์เดียว และใช้ shim บางๆ รักษาคลาสเดิมไว้ไม่ให้หน้าที่เรียกใช้พัง", en: "Clean code: gradually split multi-thousand-line files into model / view / viewmodel / services, collapsed four near-duplicate pages into one, and kept thin shims so existing callers don't break" },
    ],
    features: [
      { icon: "BadgeCheck", title: { th: "ตรวจสอบการชำระเงิน", en: "Payment verification" }, text: { th: "จับคู่สลิปกับ Bank Statement อัตโนมัติ มีคะแนนความมั่นใจ อนุมัติทีละหลายรายการ", en: "Slips matched to bank statements automatically, with a confidence score and bulk approval" } },
      { icon: "QrCode", title: { th: "Payment Intents", en: "Payment Intents" }, text: { th: "QR พร้อมเพย์ที่ตัดยอดอัตโนมัติ เห็นรายการเดียวกันบนเครื่อง Handheld", en: "Self-reconciling PromptPay QR, shared with the handheld" } },
      { icon: "FileSpreadsheet", title: { th: "รายงาน Excel", en: "Excel reports" }, text: { th: "ส่งออกพร้อมชีตสรุปและสูตรรวม ตัวเลขตรงกับหน้าเรียกดูบนเว็บ", en: "Exports with summary sheets and formula totals that match the on-screen view" } },
      { icon: "FileText", title: { th: "เอกสาร & สัญญา PDF", en: "Documents & contracts" }, text: { th: "ใบวางบิล/ใบเสร็จ/ใบกำกับภาษี และสัญญาเช่า เลือกหัวกระดาษตามสาขา รวมภาษาลาว", en: "Invoices, receipts, tax invoices and lease contracts with per-branch letterheads, including Lao" } },
      { icon: "LayoutDashboard", title: { th: "ภาพรวม & ผังพื้นที่", en: "Dashboard & floor plans" }, text: { th: "รายรับ Cash/Bank ค้างชำระ อัตราการเช่า และผังทั้งตลาดสีตามสถานะสัญญา", en: "Cash/bank income, outstanding, occupancy, and a market-wide plan colored by contract status" } },
      { icon: "ShieldCheck", title: { th: "สิทธิ์ผู้ใช้งาน", en: "User permissions" }, text: { th: "กำหนดเมนูที่แต่ละผู้ใช้เข้าถึงได้ และดูผู้ใช้งานขณะนี้", en: "Per-user menu permissions and a live online-users list" } },
    ],
    highlights: [
      {
        title: { th: "ตรวจสลิปอัตโนมัติ แทนการไล่เทียบทีละใบ", en: "Automatic slip checks instead of one-by-one matching" },
        problem: { th: "ผู้เช่าจำนวนมากโอนเงินเองแล้วส่งสลิป ฝ่ายบัญชีต้องเทียบสลิปกับรายการเดินบัญชีธนาคารทีละใบ ซึ่งช้าและพลาดง่าย ทั้งยอดขาด สลิปซ้ำ และโอนผิดบัญชี", en: "Many tenants transfer on their own and send a slip; accounting had to match each slip against bank transactions by hand — slow, and easy to miss short payments, reused slips or transfers to the wrong account" },
        solution: { th: "อัปโหลด Bank Statement ตามรูปแบบไฟล์ของแต่ละธนาคาร → ระบบอ่านสลิปแล้วจับคู่กับรายการเดินบัญชี ตรวจบัญชีผู้รับ/ยอดเงิน/วันที่ และให้คะแนนความมั่นใจ (ตรงกันยืนยันแล้ว / แนะนำให้ตรวจสอบ / ต้องตรวจสอบ) คนตรวจดูละเอียดเฉพาะรายการที่คะแนนต่ำ", en: "Upload a bank statement in the bank's own format → the system reads each slip, matches it to a bank transaction, checks receiver account / amount / date and scores its confidence (verified / review recommended / needs inspection), so people only look closely at low scores" },
        result: { th: "รายการที่ตรงกันเลือกแล้วอนุมัติพร้อมกันได้ในคลิกเดียว ใบเสร็จออกทันทีที่อนุมัติ", en: "Matched payments can be approved together in one click, and receipts are issued the moment they're approved" },
      },
      {
        title: { th: "จาก 4 หน้าซ้ำ เหลือไฟล์เดียว", en: "From four duplicate pages to one" },
        problem: { th: "หน้าตรวจสอบการชำระเงินเดิมมี 4 แท็บแยกเป็น 4 ไฟล์ที่เป็นสำเนากันแทบทั้งไฟล์ และหน้ารับชำระหลักยาวหลายพันบรรทัด แก้จุดเดียวต้องตามแก้หลายที่", en: "The old verification screen had four tabs in four files that were near copies of each other, and the main payment screen ran to thousands of lines — one fix meant edits in several places" },
        solution: { th: "ทุกแท็บยิง endpoint เดียวกันต่างกันแค่ status จึงรวมเป็นหน้าเดียวที่รับ status เป็นพารามิเตอร์ ส่วนหน้ารับชำระแยกเป็น model / view / viewmodel / services และคงคลาสเดิมไว้เป็น shim บางๆ ให้หน้าที่เรียกใช้ไม่พัง", en: "All four tabs hit the same endpoint with a different status, so they became one page that takes the status as a parameter; the payment screen was split into model / view / viewmodel / services, with the old classes kept as thin shims so callers keep working" },
      },
      {
        title: { th: "รายงาน Excel ที่ตัวเลขตรงกับหน้าจอ", en: "Excel reports that match the screen" },
        problem: { th: "บิลหนึ่งใบมีหลายรายการ ยอดระดับบิล (ส่วนลดทั้งบิล ตัดมัดจำ ยอดสุทธิ) จึงถูกนับซ้ำได้ง่ายเมื่อแตกเป็นแถว และรายงานแต่ละตัวจัดรูปแบบไม่เหมือนกัน", en: "One bill has many line items, so bill-level amounts (bill discount, deposit deduction, net total) are easy to double-count once split into rows — and every report was formatted differently" },
        solution: { th: "นับยอดระดับบิลเฉพาะแถวแรกของบิล ต่อชีตสรุป 3 ชีตท้ายไฟล์โดยแถวรวมเป็นสูตร =SUM ใช้ฟอนต์และหัวรายงานกลางชุดเดียว และให้หน้า \"เรียกดู\" บนเว็บใช้สูตรเดียวกับ Excel", en: "Bill-level amounts count only on a bill's first row, three summary sheets are appended with =SUM totals, one shared font/header helper formats every report, and the on-screen “View” dialog uses the same formulas as the file" },
      },
      {
        title: { th: "สัญญาเช่าภาษาลาวบน PDF", en: "A Lao lease contract on PDF" },
        problem: { th: "package:pdf จัดรูปอักษรลาวไม่ได้ (ไม่มี OpenType shaping) สระและวรรณยุกต์ลาวบนสัญญาจึงเพี้ยน", en: "package:pdf can't shape Lao script (no OpenType shaping), so Lao vowels and tone marks came out wrong on the contract" },
        solution: { th: "วาดสัญญาเป็น widget ของ Flutter ที่เรนเดอร์ลาวได้ถูกต้อง วัดความสูงทีละบล็อกแล้วจัดลงหน้า A4 แบบ greedy (ช่องลงนามขึ้นหน้าใหม่เสมอ) จากนั้นจับภาพแต่ละหน้าเป็น PDF", en: "Render the contract as Flutter widgets (which shape Lao correctly), measure each block, greedily pack blocks onto A4 pages (signatures always start a new page), then capture each page into the PDF" },
      },
    ],
    tour: [
      { th: "เมนู \"ตรวจสอบการชำระเงิน\" : เปิดสลิปที่ขึ้น \"ต้องตรวจสอบ\" ดูผลตรวจรายข้อ แล้วลองซูม/หมุนสลิป", en: "“Payment verification”: open a slip marked “Needs inspection”, read the per-check results, then zoom/rotate the slip" },
      { th: "กด \"อัปโหลด Statement\" แล้วเลือกไฟล์ .xlsx / .csv — สลิปที่รอจับคู่จะขึ้น \"ตรงกันยืนยันแล้ว\"", en: "Hit “Upload statement” and choose an .xlsx / .csv file — slips waiting for a match turn “Verified”" },
      { th: "ติ๊กรายการที่ตรงกัน → \"อนุมัติที่เลือก\" ใบเสร็จออกทันที", en: "Tick the verified rows → “Approve selected” and the receipts are issued" },
      { th: "พื้นที่เช่า : แตะล็อกบนผัง → \"รับชำระ\" → เลือกพร้อมเพย์ → สร้าง QR", en: "Rental areas: tap a stall → “Receive payment” → PromptPay → create QR" },
      { th: "รายงาน : เลือกรายงานแล้วกด \"ส่งออก Excel\"", en: "Reports: pick one and “Export Excel”" },
    ],
  },
];

export const getProject = (slug: ProjectSlug) => projects.find((p) => p.slug === slug)!;
