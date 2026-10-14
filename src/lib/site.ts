import { profile } from "@/content/profile";

const trim = (url: string) => url.replace(/\/+$/, "");

/** โดเมนที่ประกาศไว้ใน profile.ts — ว่างแปลว่ายังไม่ได้ตั้ง (Resume จะไม่พิมพ์ QR/ลิงก์ผลงาน) */
export const publicSiteUrl = trim(profile.siteUrl);

/**
 * URL หลักสำหรับ metadata / sitemap : โดเมนใน profile ก่อน → NEXT_PUBLIC_SITE_URL →
 * URL production ที่ Vercel ตั้งให้ตอน build → localhost ตอนพัฒนา
 */
export const siteUrl =
  publicSiteUrl ||
  trim(process.env.NEXT_PUBLIC_SITE_URL ?? "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
