import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // ภาพทั้งหมดเป็น webp ที่บีบอัดมาแล้ว (scripts/screenshots.mjs) — ไม่ต้องผ่านตัว optimize
  // ทำให้ deploy เป็นเว็บ static ที่ไหนก็ได้
  images: { unoptimized: true },
  // หน้า 404 กลาง — root layout อยู่ใต้ /[lang] จึงประกอบ 404 จาก layout ไม่ได้
  experimental: { globalNotFound: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
