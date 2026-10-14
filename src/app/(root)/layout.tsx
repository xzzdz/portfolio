import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Portfolio",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "32x32" }], apple: "/apple-touch-icon.png" },
};

/** หน้า `/` แค่ส่งต่อไปภาษาที่เหมาะ — มี root layout ของตัวเองเพราะ /[lang] เป็น root layout อีกชุด */
export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-paper">{children}</body>
    </html>
  );
}
