// แปลงหน้า /th/resume และ /en/resume เป็น PDF ขนาด A4 → public/resume-th.pdf, public/resume-en.pdf
//
//   npm run dev                (หรือ npm run build && npm start)
//   npm run resume             (ค่าเริ่มต้นยิง http://localhost:3000)
//   BASE=http://localhost:3100 npm run resume

import { existsSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
if (!executablePath) throw new Error("ไม่พบ Chrome — ตั้งค่า CHROME_PATH ก่อน");

const browser = await puppeteer.launch({ executablePath, headless: true });
for (const lang of ["th", "en"]) {
  const page = await browser.newPage();
  await page.goto(`${BASE}/${lang}/resume`, { waitUntil: "networkidle0", timeout: 90_000 });
  await page.evaluate(() => document.fonts.ready);
  // กรอบ A4 ตัดส่วนเกินทิ้ง (overflow-hidden) — ถ้าเนื้อหายาวเกินให้เตือน ไม่งั้นท้ายหน้าหายเงียบ ๆ
  const overflowMM = await page.evaluate(() => {
    const a = document.querySelector("article");
    return ((a.scrollHeight - a.clientHeight) / a.clientHeight) * 297;
  });
  if (overflowMM > 0.5) {
    console.warn(`⚠ resume-${lang}: เนื้อหาเกิน A4 ราว ${overflowMM.toFixed(1)} mm — ตัดข้อความใน src/content/resume.ts ให้สั้นลง`);
    process.exitCode = 1;
  }
  await page.emulateMediaType("print");
  const file = path.resolve(`public/resume-${lang}.pdf`);
  await page.pdf({ path: file, format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: true });
  console.log(`✓ ${path.relative(process.cwd(), file)}`);
  await page.close();
}
await browser.close();
