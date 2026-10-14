// ข้อความของหน้าเว็บ portfolio (ไทย / อังกฤษ)
import type { L } from "@/lib/i18n";

export const nav: { id: string; label: L }[] = [
  { id: "work", label: { th: "ผลงาน", en: "Work" } },
  { id: "about", label: { th: "เกี่ยวกับ", en: "About" } },
  { id: "skills", label: { th: "ทักษะ", en: "Skills" } },
  { id: "experience", label: { th: "ประสบการณ์", en: "Experience" } },
  { id: "contact", label: { th: "ติดต่อ", en: "Contact" } },
];

export const ui = {
  liveDemo: { th: "ลองเดโม่สด", en: "Try live demo" },
  seeWork: { th: "ดูผลงาน", en: "See my work" },
  caseStudy: { th: "อ่านเคสสตัดี้", en: "Read case study" },
  openDemo: { th: "เปิดเดโม่", en: "Open demo" },
  fullscreen: { th: "เปิดเต็มจอ", en: "Open full screen" },
  backToWork: { th: "ผลงานทั้งหมด", en: "All work" },
  nextProject: { th: "โปรเจคถัดไป", en: "Next project" },
  role: { th: "บทบาท", en: "Role" },
  period: { th: "ช่วงเวลา", en: "Period" },
  platform: { th: "แพลตฟอร์ม", en: "Platform" },
  stack: { th: "เทคโนโลยี", en: "Stack" },
  learning: { th: "กำลังศึกษา", en: "Learning" },
  present: { th: "ปัจจุบัน", en: "Present" },
  download: { th: "ดาวน์โหลด Resume", en: "Download résumé" },
  builtWith: { th: "เว็บนี้สร้างด้วย Next.js 16 · TypeScript · Tailwind CSS 4", en: "This site is built with Next.js 16 · TypeScript · Tailwind CSS 4" },
  demoBadge: { th: "Demo", en: "Demo" },
  copy: { th: "คัดลอก", en: "Copy" },
  copied: { th: "คัดลอกแล้ว", en: "Copied" },
};

export const hero = {
  kicker: { th: "Flutter & Web Developer · Chiang Mai", en: "Flutter & Web Developer · Chiang Mai" },
  title: {
    th: "สร้างระบบที่คนใช้งานจริงทุกวัน — ตั้งแต่เครื่อง POS หน้าแผง ถึงเว็บหลังบ้าน",
    en: "I build software people use every day — from the handheld POS at the stall to the back-office web.",
  },
  intro: {
    th: "มีประสบการณ์พัฒนาโปรเจกต์ที่ใช้งานจริง เชื่อมต่อ API และใช้ GitHub ทำงานร่วมกับทีม พัฒนาแอปตามแบบจาก UX/UI Design (เช่น Figma) ได้ ปัจจุบันกำลังต่อยอดด้าน TypeScript, Node.js และ Next.js เพื่อขยายความสามารถด้าน Web และ Backend",
    en: "I ship production projects, integrate APIs and collaborate through GitHub. I turn UX/UI designs (e.g. Figma) into working apps, and I'm currently growing into TypeScript, Node.js and Next.js to widen my web and backend skills.",
  },
};

export const facts: { value: L; label: L }[] = [
  { value: { th: "ต.ค. 2567", en: "Oct 2024" }, label: { th: "เริ่มงานที่ Dzentric — ถึงปัจจุบัน", en: "joined Dzentric — still there" } },
  { value: { th: "2 ระบบ", en: "2 systems" }, label: { th: "แอป Handheld ที่พัฒนาเองทั้งแอป + เว็บแอดมิน บน backend เดียวกัน", en: "a handheld app I built solo + the web admin, on one backend" } },
  { value: { th: "4 ภาษา", en: "4 languages" }, label: { th: "ไทย · English · 中文 · ລາວ ในแอปเดียว", en: "Thai · English · Chinese · Lao in one app" } },
  { value: { th: "800 MB", en: "800 MB" }, label: { th: "RAM ของเครื่อง POS ที่แอปต้องลื่นให้ได้", en: "of RAM on the POS the app must run smoothly on" } },
];

export const about = {
  title: { th: "เกี่ยวกับผม", en: "About me" },
  body: [
    {
      th: "ผมเป็นนักพัฒนาสาย Flutter ที่บริษัท ดีเซ็นทริค จำกัด (เชียงใหม่) ดูแลระบบบริหารพื้นที่เช่า Chaoperty — ระบบที่ตลาด คอมมูนิตี้มอลล์ และอาคารให้เช่าใช้ทำสัญญา ออกใบวางบิล รับชำระ และจดมิเตอร์น้ำ-ไฟทุกวัน",
      en: "I'm a Flutter developer at Dzentric Co., Ltd. in Chiang Mai, working on Chaoperty — a rental-space management system that markets, community malls and office buildings use every day for contracts, billing, payments and utility meters.",
    },
    {
      th: "แอป Handheld POS ผมพัฒนาเองทั้งหมด ตั้งแต่วางโครงสร้าง หน้าจอ การเชื่อม API จนถึงการพิมพ์ใบเสร็จบนเครื่อง ส่วนเว็บแอดมินผมดูแลฝั่งหน้าบ้านเป็นหลัก — ออกแบบหน้าตาและพัฒนาฟีเจอร์ใหม่เอง แก้บัค ทำรายงาน Excel สัญญาและแม่แบบเอกสาร PDF แก้หรือเพิ่ม API หลังบ้านบ้างเท่าที่ฟีเจอร์ต้องใช้ และคอยช่วยทีม Implement ที่คุยกับลูกค้าแก้ปัญหาให้ได้ทันที",
      en: "I built the handheld POS app on my own — architecture, screens, API integration and on-device printing. On the web admin I focus on the front end — I design and build new features myself, fix bugs, and make Excel reports, contracts and document templates; I make small backend API changes when a feature needs them, and back up the implementation team so customer issues get fixed on the spot.",
    },
    {
      th: "ตอนนี้กำลังต่อยอดด้าน TypeScript, Node.js และ Next.js (เว็บนี้คือผลลัพธ์ส่วนหนึ่ง) และพร้อมเรียนรู้เทคโนโลยีใหม่กับทีมพัฒนา",
      en: "Right now I'm leveling up in TypeScript, Node.js and Next.js — this site is part of that — and I'm eager to keep learning alongside a development team.",
    },
  ] as L[],
  points: [
    { title: { th: "ทำตามแบบได้จริง", en: "Design to code" }, text: { th: "แปลง UX/UI จาก Figma เป็นหน้าจอที่ใช้งานได้ ทั้งมือถือและเว็บ", en: "Turn Figma UX/UI into working screens on mobile and web" } },
    { title: { th: "ออกแบบเอง & ซัพพอร์ต", en: "Own design & support" }, text: { th: "ออกแบบหน้าตาฟีเจอร์ใหม่เอง และช่วยทีม Implement แก้ปัญหาให้ลูกค้าได้ทันที", en: "Design new features myself and help the implementation team fix customer issues on the spot" } },
    { title: { th: "คลีนโค้ด & ทีม", en: "Clean code & team" }, text: { th: "แยกไฟล์ใหญ่เป็น MVVM · GitHub · Pull Request · code review", en: "Split monoliths into MVVM · GitHub · pull requests · code review" } },
  ],
};

export type SkillGroup = { title: L; items: { name: string; learning?: boolean }[] };

export const skills: SkillGroup[] = [
  {
    title: { th: "Mobile & Cross-platform", en: "Mobile & cross-platform" },
    items: [{ name: "Flutter" }, { name: "Dart" }, { name: "Riverpod" }, { name: "Provider" }, { name: "go_router" }, { name: "MVVM + Repository" }, { name: "Android · Sunmi POS" }],
  },
  {
    title: { th: "Web & Frontend", en: "Web & frontend" },
    items: [{ name: "Flutter Web" }, { name: "HTML / CSS" }, { name: "Figma → UI" }, { name: "Responsive layout" }, { name: "TypeScript", learning: true }, { name: "React / Next.js", learning: true }, { name: "Tailwind CSS", learning: true }],
  },
  {
    title: { th: "API & Backend", en: "API & backend" },
    items: [{ name: "REST API (Dio / http)" }, { name: "PHP (API tweaks)" }, { name: "JSON & data mapping" }, { name: "Payment Intents · Reconcile" }, { name: "Slip verification" }, { name: "PromptPay (EMVCo)" }, { name: "Node.js", learning: true }],
  },
  {
    title: { th: "เอกสาร & การพิมพ์", en: "Documents & printing" },
    items: [{ name: "Excel (Syncfusion XlsIO)" }, { name: "PDF (package:pdf)" }, { name: "Contract & receipt templates" }, { name: "Thermal printer 58 mm" }, { name: "Thai / Lao fonts" }],
  },
  {
    title: { th: "เครื่องมือ & การทำงาน", en: "Tools & workflow" },
    items: [{ name: "Git / GitHub" }, { name: "Pull Request & review" }, { name: "Conventional Commits" }, { name: "Refactoring → MVVM" }, { name: "Docker (APK build)" }, { name: "flutter_test" }, { name: "Android Studio / VS Code" }],
  },
];

export const experience = {
  title: { th: "ประสบการณ์ทำงาน", en: "Experience" },
  company: { th: "บริษัท ดีเซ็นทริค จำกัด", en: "Dzentric Co., Ltd." },
  // ชื่อตำแหน่ง — แก้ให้ตรงกับตำแหน่งจริงในบริษัท
  position: { th: "Software Developer (Flutter)", en: "Software Developer (Flutter)" },
  period: { th: "ตุลาคม 2567 – ปัจจุบัน", en: "Oct 2024 – Present" },
  place: { th: "เชียงใหม่", en: "Chiang Mai" },
  summary: {
    th: "ดูแลในส่วนของระบบจัดการพื้นที่เช่า Chaoperty ทำตามความต้องการของลูกค้า และพัฒนาระบบทั้งในส่วนเว็บและแอปพลิเคชัน",
    en: "Responsible for the Chaoperty rental-space management system — turning customer requirements into features across both the web admin and the mobile app.",
  },
  bullets: [
    { th: "พัฒนาแอป Chaoperty Handheld V2 (Flutter) เองทั้งหมดสำหรับเครื่อง POS Sunmi V2 — วางโครงสร้าง MVVM + Repository และทำทุกหน้าจอ : ผังล็อก ทะเบียนผู้เช่า รับชำระพร้อม QR แนบสลิป พิมพ์ใบเสร็จ จดมิเตอร์ และ 4 ภาษา", en: "Built Chaoperty Handheld V2 (Flutter) for Sunmi V2 POS terminals single-handedly — MVVM + Repository architecture and every screen: stall map, tenant records, QR payments, slip upload, receipt printing, meter readings and 4 languages" },
    { th: "ปรับแอป Handheld ให้ลื่นบนเครื่อง RAM 800 MB : จำกัด image cache, ตัด blur, ยิง API แบบขนาน และลด APK จาก 50 MB+ เหลือ ~15 MB", en: "Tuned the handheld app for 800 MB of RAM: capped the image cache, removed blur, parallelized API calls and cut the APK from 50 MB+ to ~15 MB" },
    { th: "พัฒนาหน้ารับชำระแบบใหม่ของเว็บแอดมิน (Payment Intents) : บิลจัดกลุ่มตามผู้เช่า/ธนาคาร ออก QR พร้อมนับถอยหลังและต่ออายุ แนบสลิป และคำนวณ VAT / หัก ณ ที่จ่าย", en: "Built the web admin's new payment screen (Payment Intents): invoices grouped by tenant and bank, QR with countdown and renewal, slip upload, and VAT / withholding-tax calculation" },
    { th: "ทำหน้า \"ตรวจสอบการชำระเงิน\" ที่ตรวจสลิปอัตโนมัติ : อัปโหลด Bank Statement (Excel) ให้ระบบจับคู่กับสลิปพร้อมคะแนนความมั่นใจ แล้วอนุมัติหรือปฏิเสธได้ทีละหลายรายการ", en: "Built the \"Payment verification\" page with automatic slip checks: upload a bank statement (Excel), let the system match it to slips with a confidence score, then approve or reject in bulk" },
    { th: "ทำรายงาน Excel (Syncfusion XlsIO) พร้อมชีตสรุปและแถวรวมเป็นสูตร และเอกสาร PDF : สัญญาเช่า (รวมภาษาลาว) ใบเสร็จ/ใบแจ้งหนี้หลายแม่แบบ ทั้ง A4 และกระดาษความร้อน", en: "Built Excel reports (Syncfusion XlsIO) with summary sheets and formula totals, plus PDFs: lease contracts (including Lao) and multi-template receipts/invoices for A4 and thermal paper" },
    { th: "ดูแลงานหน้าบ้านของเว็บแอดมินเป็นหลัก : ออกแบบหน้าตาและพัฒนาฟีเจอร์ใหม่เอง แก้บัค และทำแม่แบบเอกสาร เช่น จัดลำดับพื้นที่ หน้าเลือกแม่แบบเอกสาร — ฝั่งหลังบ้านแก้หรือเพิ่ม API (PHP) เท่าที่ฟีเจอร์ต้องใช้", en: "Own the web admin's front end: design and build new features myself, fix bugs and add document templates (e.g. area ordering, a template picker) — with small PHP API changes when a feature needs them" },
    { th: "ซัพพอร์ตทีม Implement ที่ดูแลลูกค้า : รับปัญหาจากหน้างาน ตรวจหาสาเหตุ แล้วแก้ให้ได้ทันที", en: "Back up the implementation team that works with customers: take issues from the field, find the cause and fix them right away" },
    { th: "คลีนโค้ด : ทยอยแยกหน้าจอไฟล์ใหญ่หลายพันบรรทัดเป็น MVVM + service layer ยุบหน้าที่เป็นสำเนากัน 4 หน้าให้เหลือไฟล์เดียว และลบโค้ดที่ไม่ได้ใช้ โดยไม่ทำให้หน้าที่เรียกใช้เดิมพัง", en: "Clean code: gradually split multi-thousand-line screens into MVVM + a service layer, collapsed four near-duplicate pages into one and removed dead code — without breaking existing callers" },
    { th: "ทำงานร่วมกับทีมผ่าน GitHub : feature branch, Pull Request พร้อมคำอธิบายละเอียด, code review และ tag เวอร์ชันแบบ SemVer", en: "Collaborated through GitHub: feature branches, detailed pull requests, code review and SemVer release tags" },
  ] as L[],
  tags: ["Flutter", "Dart", "Riverpod", "Provider", "go_router", "Dio", "REST API", "PHP", "Payment Intents", "Excel (XlsIO)", "PDF", "Sunmi Printer", "MVVM", "GitHub"],
};

export const education = {
  title: { th: "การศึกษา", en: "Education" },
  school: { th: "มหาวิทยาลัยราชภัฏเชียงใหม่", en: "Chiang Mai Rajabhat University" },
  degree: { th: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)", en: "Bachelor of Science in Computer Science" },
  period: { th: "2564 – 2568", en: "2021 – 2025" },
};

export const contact = {
  title: { th: "มาร่วมงานกัน", en: "Let's work together" },
  text: {
    th: "เปิดรับโอกาสงานด้าน Flutter, Web และ Full-stack — ยินดีคุยเรื่องงาน ส่งโจทย์ หรือนัดสัมภาษณ์ได้เลยครับ",
    en: "Open to Flutter, web and full-stack roles — happy to chat, take on a task, or set up an interview.",
  },
  email: { th: "อีเมล", en: "Email" },
  phone: { th: "โทรศัพท์", en: "Phone" },
  location: { th: "ที่อยู่", en: "Location" },
};

export const playground = {
  title: { th: "ลองใช้ทั้งสองระบบพร้อมกัน", en: "Try both systems side by side" },
  text: {
    th: "เครื่อง Handheld กับเว็บแอดมินในเดโม่ใช้ข้อมูลชุดเดียวกัน — ชำระบิลหรือจดมิเตอร์บนเครื่อง แล้วดูตัวเลขเปลี่ยนบนเว็บได้ทันที เหมือนระบบจริงที่ใช้ backend ตัวเดียวกัน",
    en: "The handheld and the web admin in this demo share one dataset — collect a payment or record a meter on the device and watch the web admin update, just like the real system running on one backend.",
  },
  reset: { th: "รีเซ็ตข้อมูลเดโม่", en: "Reset demo data" },
  resetDone: { th: "รีเซ็ตแล้ว", en: "Reset" },
  tryThis: { th: "ลองทำตามนี้", en: "Try this" },
  steps: [
    { th: "บนเครื่อง Handheld แตะ \"ชำระบิล\" แล้วเลือกผู้เช่าที่มีป้าย \"เกินกำหนด\"", en: "On the handheld, tap “Pay bill” and pick a tenant marked “Overdue”" },
    { th: "เลือกใบวางบิล → ช่องทาง พร้อมเพย์ → \"ยืนยัน · สร้าง QR\"", en: "Select invoices → choose PromptPay → “Confirm · Create QR”" },
    { th: "รอราว 8 วินาที ระบบตัดยอดอัตโนมัติ — ใบเสร็จพิมพ์ออกจากหัวเครื่อง และยอดบนหน้าหลักของเว็บเพิ่มขึ้น", en: "After ~8 seconds it reconciles automatically — a receipt prints from the device and the web dashboard total goes up" },
    { th: "หรือกด \"ถัดไป : แนบสลิป\" แล้วส่งสลิป — รายการจะไปรอที่เว็บแอดมินเมนู \"ตรวจสอบการชำระเงิน\"", en: "Or tap “Next: attach slip” and send it — the payment lands in “Payment verification” on the web admin" },
    { th: "บนเว็บแอดมิน เปิดสลิปนั้น ดูผลตรวจรายข้อ แล้วกด \"อนุมัติ\" — ใบเสร็จออก และเครื่อง Handheld เห็นว่าชำระแล้ว", en: "On the web admin, open that slip, review the checks and hit “Approve” — the receipt is issued and the handheld shows it as paid" },
  ] as L[],
};
