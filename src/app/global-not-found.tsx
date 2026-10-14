import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 · Not found",
  icons: { icon: "/favicon.svg" },
};

export default function GlobalNotFound() {
  return (
    <html lang="th">
      <body className="grid min-h-dvh place-items-center bg-paper p-6 text-ink">
        <main className="max-w-md text-center">
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-mute">Error 404</div>
          <h1 className="mt-3 text-[34px] font-semibold tracking-tight">ไม่พบหน้านี้ · Page not found</h1>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">ลิงก์อาจเปลี่ยนไปแล้ว — กลับไปหน้าแรกได้เลย / The link may have changed.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/th" className="flex h-11 items-center rounded-full bg-ink px-5 text-[14.5px] font-medium text-white">หน้าแรก (ไทย)</Link>
            <Link href="/en" className="flex h-11 items-center rounded-full border border-ink/15 bg-white px-5 text-[14.5px] font-medium">Home (English)</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
