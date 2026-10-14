// ถ่ายภาพหน้าจอเดโม่สำหรับใช้ในหน้าเว็บ → public/shots/*.webp
//
//   npm run dev            (หรือ npm run build && npm start)
//   npm run shots          (ค่าเริ่มต้นยิง http://localhost:3000)
//   BASE=http://localhost:3100 npm run shots
//
// ใช้ Chrome ที่ติดตั้งในเครื่อง (puppeteer-core ไม่ดาวน์โหลดเบราว์เซอร์เอง)
// กำหนดเองได้ด้วย CHROME_PATH

import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = path.resolve("public/shots");
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--hide-scrollbars"] });

async function capture(url, { width, height, scale, selector, file, transparent = false, prepare }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: scale });
  await page.goto(BASE + url, { waitUntil: "networkidle0", timeout: 90_000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    localStorage.removeItem("chaoperty-demo");
  });
  await page.reload({ waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  // ซ่อนปุ่มของ dev overlay
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  if (transparent) {
    await page.addStyleTag({ content: "html,body{background:transparent!important}" });
  }
  await sleep(1600);
  if (prepare) await prepare(page);
  const el = await page.waitForSelector(selector);
  const box = await el.boundingBox();
  const type = file.endsWith(".png") ? "png" : "webp";
  await el.screenshot({ path: path.join(OUT, file), type, ...(type === "webp" ? { quality: 86 } : {}), omitBackground: transparent });
  console.log(`✓ ${file}  ${Math.round(box.width * scale)}×${Math.round(box.height * scale)}`);
  await page.close();
}

// ภาษาไทยใช้ชื่อไฟล์ปกติ ภาษาอังกฤษต่อท้ายด้วย -en
for (const lang of ["th", "en"]) {
  const sfx = lang === "th" ? "" : "-en";
  await capture(`/${lang}/shots/handheld-device`, { width: 640, height: 1200, scale: 2, selector: "[data-device-body]", file: `handheld-device${sfx}.webp`, transparent: true });
  await capture(`/${lang}/shots/handheld-screens`, { width: 1260, height: 1000, scale: 1, selector: "#shot", file: `handheld-screens${sfx}.webp`, transparent: true });
  await capture(`/${lang}/shots/webadmin`, { width: 1400, height: 1000, scale: 1.2, selector: "#shot", file: `webadmin-dashboard${sfx}.webp`, transparent: true });
}

// ภาพ Open Graph ใช้ภาพด้านบน — ถ่ายเป็นลำดับสุดท้าย
await capture("/th/shots/og", { width: 1200, height: 630, scale: 1, selector: "#shot", file: "../og.png" });
await capture("/en/shots/og", { width: 1200, height: 630, scale: 1, selector: "#shot", file: "../og-en.png" });

await browser.close();
